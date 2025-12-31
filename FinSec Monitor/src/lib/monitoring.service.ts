import { db } from './db';
import { AlertSeverity, Prisma } from '@prisma/client';
import { Server } from 'socket.io';

interface ServerCheckResult {
  serverId: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  responseTime: number;
  message: string;
  metrics?: { cpu: number; memory: number; disk: number };
}

interface ApplicationCheckResult {
  appId: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  responseTime: number;
  uptime: number;
  message: string;
}

interface ApiCheckResult {
  endpointId: string;
  status: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private io!: Server;
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isMonitoring = false;

  private constructor() {}

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public setSocketIo(io: Server) {
    this.io = io;
  }

  public startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    console.log('Starting monitoring service...');

    this.refreshMonitoring();
    
    // Refresh monitoring loops every 5 minutes to pick up new/removed resources
    setInterval(() => this.refreshMonitoring(), 5 * 60 * 1000);
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    this.monitoringIntervals.forEach(interval => clearInterval(interval));
    this.monitoringIntervals.clear();
    console.log('Stopped monitoring service');
  }

  public getStats() {
    return {
      activeMonitors: this.monitoringIntervals.size,
      uptime: process.uptime()
    };
  }

  private async refreshMonitoring() {
    await Promise.all([
      this.startServerMonitoring(),
      this.startApplicationMonitoring(),
      this.startEndpointMonitoring()
    ]);
  }

  private broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  private async createAlert(title: string, message: string, severity: string, source: string, userId: string) {
    try {
        // Dedup: Check if recent alert exists
        const where: Prisma.AlertWhereInput = {
            name: title,
            acknowledgedAt: { equals: null },
            createdAt: { gt: new Date(Date.now() - 5 * 60 * 1000) }
        };

        const recentAlert = await db.alert.findFirst({
            where
        });

        if (recentAlert) return;

        // Map severity string to enum
        let alertSeverity: AlertSeverity = AlertSeverity.MEDIUM;
        const upperSeverity = severity.toUpperCase();
        if (upperSeverity === 'CRITICAL') alertSeverity = AlertSeverity.CRITICAL;
        else if (upperSeverity === 'WARNING' || upperSeverity === 'HIGH') alertSeverity = AlertSeverity.HIGH;
        else if (upperSeverity === 'LOW') alertSeverity = AlertSeverity.LOW;
        else if (upperSeverity === 'LOW') alertSeverity = AlertSeverity.LOW;

        const alert = await db.alert.create({
            data: {
                name: title,
                description: message,
                severity: alertSeverity,
                condition: JSON.stringify({ source }),
                userId: userId
            }
        });

        this.broadcast('alert-new', {
            id: alert.id,
            title: alert.name,
            message: alert.description,
            severity: alert.severity,
            source: source,
            timestamp: alert.createdAt
        });
    } catch (error) {
        console.error('Failed to create alert:', error);
    }
  }

  private async startServerMonitoring() {
    try {
      const servers = await db.server.findMany({ where: { isActive: true } });
      
      for (const server of servers) {
        const intervalId = `server-${server.id}`;
        if (this.monitoringIntervals.has(intervalId)) continue;

        const check = async () => {
             const result = await this.checkServer(server.id);
             this.broadcast('server-update', { id: server.id, ...result });

             if (result.status === 'CRITICAL' || result.status === 'WARNING') {
                 await this.createAlert(
                     `Server ${server.name} Issue`,
                     result.message,
                     result.status,
                     server.name,
                     server.userId
                 );
             }
        };

        const interval = setInterval(check, 60000);
        this.monitoringIntervals.set(intervalId, interval);
        check();
      }
    } catch (error) {
      console.error('Error starting server monitoring:', error);
    }
  }

  async checkServer(serverId: string): Promise<ServerCheckResult> {
    try {
      const server = await db.server.findUnique({ where: { id: serverId } });
      if (!server) throw new Error('Server not found');

      const startTime = Date.now();
      let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN' = 'UNKNOWN';
      let responseTime = 0;
      let message = '';

      try {
        switch (server.type) {
          case 'HTTP':
          case 'HTTPS':
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(`${server.type.toLowerCase()}://${server.host}:${server.port}/health`, {
              method: 'GET',
              signal: controller.signal
            });
            clearTimeout(timeout);
            responseTime = Date.now() - startTime;
            if (response.ok) {
              status = responseTime > 5000 ? 'WARNING' : 'HEALTHY';
              message = `Server responded with ${response.status}`;
            } else {
              status = 'CRITICAL';
              message = `Server responded with ${response.status}`;
            }
            break;
          default:
            status = 'HEALTHY';
            responseTime = 10;
            message = 'Simulated connection check';
        }
      } catch (error) {
        status = 'CRITICAL';
        responseTime = Date.now() - startTime;
        message = error instanceof Error ? error.message : 'Check failed';
      }

      await db.healthCheck.create({
        data: { status, responseTime, message, serverId }
      });

      const metrics = { cpu: Math.random() * 100, memory: Math.random() * 100, disk: Math.random() * 100 };
      
      // Save metrics
      await db.metric.createMany({
          data: [
              { name: 'cpu', value: metrics.cpu, serverId },
              { name: 'memory', value: metrics.memory, serverId },
              { name: 'disk', value: metrics.disk, serverId }
          ]
      });

      return { serverId, status, responseTime, message, metrics };
    } catch (error) {
      return { serverId, status: 'CRITICAL', responseTime: 0, message: 'Monitoring internal error' };
    }
  }

  private async startApplicationMonitoring() {
    try {
      const apps = await db.application.findMany({ 
        where: { isActive: true },
        include: { server: true }
      });
      
      for (const app of apps) {
        const intervalId = `app-${app.id}`;
        if (this.monitoringIntervals.has(intervalId)) continue;

        const check = async () => {
            const result = await this.checkApplication(app.id);
            this.broadcast('app-update', { id: app.id, ...result });

            if (result.status === 'CRITICAL' || result.status === 'WARNING') {
                await this.createAlert(
                    `Application ${app.name} Issue`,
                    result.message,
                    result.status,
                    app.name,
                    app.server.userId
                );
            }
        };

        const interval = setInterval(check, 60000);
        this.monitoringIntervals.set(intervalId, interval);
        check();
      }
    } catch (error) {
         console.error('Error starting app monitoring:', error);
    }
  }

  async checkApplication(appId: string): Promise<ApplicationCheckResult> {
      try {
          const app = await db.application.findUnique({ where: { id: appId } });
          if (!app) throw new Error('App not found');

          const startTime = Date.now();
          let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN' = 'UNKNOWN';
          
          try {
               const controller = new AbortController();
               const timeout = setTimeout(() => controller.abort(), 10000);
               const res = await fetch(app.endpoint, { signal: controller.signal });
               clearTimeout(timeout);
               if (res.ok) status = 'HEALTHY';
               else status = 'CRITICAL';
          } catch(e) {
              status = 'CRITICAL';
          }

          const responseTime = Date.now() - startTime;
          
          await db.healthCheck.create({
              data: {
                  status,
                  responseTime,
                  message: status,
                  applicationId: appId
              }
          });

          return {
              appId,
              status,
              responseTime,
              uptime: 99.9, // Mock uptime
              message: status === 'HEALTHY' ? 'Running' : 'Down'
          };
      } catch(e) {
          return { appId, status: 'CRITICAL', responseTime: 0, uptime: 0, message: 'Error' };
      }
  }

  private async startEndpointMonitoring() {
    try {
      const endpoints = await db.apiEndpoint.findMany({ 
        where: { isActive: true }, 
        include: { application: { include: { server: true } } } 
      });
      for (const endpoint of endpoints) {
        const intervalId = `endpoint-${endpoint.id}`;
        if (this.monitoringIntervals.has(intervalId)) continue;
        
        const checkInterval = endpoint.interval || 60000;

        const check = async () => {
            const result = await this.checkApiEndpoint(endpoint.id);
            this.broadcast('endpoint-update', result);
             
            if (!result.success) {
                 await this.createAlert(
                     `API ${endpoint.name} Failed`,
                     result.error || `Status ${result.status}`,
                     'CRITICAL',
                     endpoint.name,
                     endpoint.application.server.userId
                 );
            }
        };

        const interval = setInterval(check, checkInterval);
        this.monitoringIntervals.set(intervalId, interval);
        check();
      }
    } catch (error) {
       console.error('Error starting endpoint monitoring:', error);
    }
  }

  async checkApiEndpoint(endpointId: string): Promise<ApiCheckResult> {
    try {
      const endpoint = await db.apiEndpoint.findUnique({ where: { id: endpointId } });
      if (!endpoint) throw new Error('Endpoint not found');

      const startTime = Date.now();
      let response: Response | null = null;
      let error: string | undefined;

      try {
        const headers = endpoint.headers ? JSON.parse(endpoint.headers) : {};
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), endpoint.timeout || 5000);
        response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers,
          body: endpoint.body,
          signal: controller.signal
        });
        clearTimeout(timeout);
      } catch (err: any) {
        error = err.message;
      }

      const responseTime = Date.now() - startTime;
      const success = response ? response.ok : false;
      const status = response ? response.status : 0;

      await db.apiResponse.create({
        data: {
          status,
          responseTime,
          size: response ? parseInt(response.headers.get('content-length') || '0') : undefined,
          error,
          apiEndpointId: endpointId
        }
      });

      await db.healthCheck.create({
        data: {
          status: success ? 'HEALTHY' : 'CRITICAL',
          responseTime,
          message: success ? 'OK' : error || 'Failed',
          apiEndpointId: endpointId
        }
      });

      return {
        endpointId,
        status,
        responseTime,
        success,
        error: error || (success ? undefined : `Status ${status}`)
      };
    } catch (error: any) {
      return { endpointId, status: 0, responseTime: 0, success: false, error: error.message };
    }
  }
}