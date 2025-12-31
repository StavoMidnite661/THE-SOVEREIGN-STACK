import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { 
  ServerMonitor, 
  Application, 
  ApiEndpoint, 
  WebhookMonitor, 
  WorkflowExecution, 
  AlertItem, 
  MetricData, 
  TeamMember 
} from '@/types/monitoring';

interface MonitoringState {
  // Data State
  servers: ServerMonitor[];
  applications: Application[];
  apiEndpoints: ApiEndpoint[];
  webhooks: WebhookMonitor[];
  workflows: WorkflowExecution[];
  alerts: AlertItem[];
  metrics: MetricData[];
  teamMembers: TeamMember[];
  
  // UI State
  isLoading: boolean;
  lastUpdated: Date | null;
  socket: Socket | null;
  isConnected: boolean;
  
  // Actions
  connectSocket: () => void;
  disconnectSocket: () => void;
  fetchServers: () => Promise<void>;
  fetchApplications: () => Promise<void>;
  fetchApiEndpoints: () => Promise<void>;
  fetchWebhooks: () => Promise<void>;
  fetchWorkflows: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchTeamMembers: () => Promise<void>;
  fetchAll: () => Promise<void>;
  
  // Modifiers
  addServer: (server: Partial<ServerMonitor>) => Promise<boolean>;
  updateServer: (id: string, data: Partial<ServerMonitor>) => Promise<boolean>;
  deleteServer: (id: string) => Promise<boolean>;
  addWorkflow: (workflow: any) => Promise<boolean>;
  acknowledgeAlert: (id: string) => Promise<void>;
}

export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  servers: [],
  applications: [],
  apiEndpoints: [],
  webhooks: [],
  workflows: [],
  alerts: [],
  metrics: [],
  teamMembers: [],
  isLoading: false,
  lastUpdated: null,
  socket: null,
  isConnected: false,

  connectSocket: () => {
    const { socket } = get();
    if (socket?.connected) return;

    const newSocket = io({
      path: '/api/socketio',
      transports: ['websocket'],
      upgrade: false
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      set({ isConnected: true });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
    });

    newSocket.on('server-update', (data: any) => {
      set(state => ({
        servers: state.servers.map(s => 
          s.id === data.id ? { ...s, ...data, lastCheck: new Date().toISOString() } : s
        ),
        lastUpdated: new Date()
      }));
    });

    newSocket.on('alert-new', (alert: any) => {
      const newAlert: AlertItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: alert.title,
        severity: alert.severity,
        message: alert.message,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        source: alert.source
      };
      
      set(state => ({
        alerts: [newAlert, ...state.alerts],
        lastUpdated: new Date()
      }));
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  fetchServers: async () => {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch('/api/servers');
        if (!response.ok) throw new Error('Failed to fetch servers');
        const data = await response.json();
        
        // Transform logic (ported from page.tsx)
        const servers = data.map((server: any) => ({
          id: server.id,
          name: server.name,
          host: server.host,
          port: server.port,
          type: server.type,
          status: server.healthChecks?.[0]?.status || 'UNKNOWN',
          responseTime: server.healthChecks?.[0]?.responseTime || 0,
          cpu: server.metrics?.[0]?.cpu || Math.floor(Math.random() * 100),
          memory: server.metrics?.[0]?.memory || Math.floor(Math.random() * 100),
          disk: server.metrics?.[0]?.disk || Math.floor(Math.random() * 100),
          uptime: server.healthChecks?.[0]?.uptime || '0d 0h 0m',
          lastCheck: server.healthChecks?.[0]?.timestamp || new Date().toISOString(),
          tags: server.tags ? JSON.parse(server.tags) : [],
          location: server.description || 'Unknown',
          os: server.type,
          version: server.type,
          description: server.description
        }));
        
        set({ servers });
        return; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        console.error(`Error loading servers (attempt ${attempt + 1}/${maxRetries}):`, error);
        
        // Wait before retrying (exponential backoff: 100ms, 200ms, 400ms)
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        }
      }
    }
    
    // All retries failed
    console.error('Failed to load servers after', maxRetries, 'attempts:', lastError);
    set({ servers: [] });
  },

  fetchApplications: async () => {
    try {
      const response = await fetch('/api/applications');
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      
      const applications = data.map((app: any) => ({
        id: app.id,
        name: app.name,
        type: app.type,
        endpoint: app.endpoint,
        status: app.healthChecks?.[0]?.status || 'UNKNOWN',
        responseTime: app.healthChecks?.[0]?.responseTime || 0,
        uptime: app.healthChecks?.[0]?.uptime || 0,
        lastCheck: app.healthChecks?.[0]?.timestamp || new Date().toISOString(),
        serverId: app.serverId,
        serverName: app.server?.name || 'Unknown Server',
        tags: app.tags ? JSON.parse(app.tags) : [],
        version: app.version || '1.0.0',
        framework: app.type
      }));
      set({ applications });
    } catch (error) {
      console.error('Error loading applications:', error);
      set({ applications: [] });
    }
  },

  fetchApiEndpoints: async () => {
    try {
      const response = await fetch('/api/api-endpoints');
      if (!response.ok) throw new Error('Failed to fetch API endpoints');
      const data = await response.json();
      
      const apiEndpoints = data.map((endpoint: any) => ({
        id: endpoint.id,
        name: endpoint.name,
        url: endpoint.url,
        method: endpoint.method,
        status: endpoint.responses?.[0]?.status || 200,
        responseTime: endpoint.responses?.[0]?.responseTime || 0,
        lastChecked: endpoint.responses?.[0]?.timestamp || new Date().toISOString(),
        success: (endpoint.responses?.[0]?.status || 200) < 400,
        applicationId: endpoint.applicationId,
        applicationName: endpoint.application?.name || 'Unknown Application',
        headers: endpoint.headers ? JSON.parse(endpoint.headers) : {},
        body: endpoint.body
      }));
      set({ apiEndpoints });
    } catch (error) {
       console.error('Error loading endpoints:', error);
       set({ apiEndpoints: [] });
    }
  },

  fetchWebhooks: async () => {
    try {
      const response = await fetch('/api/webhooks');
      if (!response.ok) throw new Error('Failed to fetch webhooks');
      const data = await response.json();
      const webhooks = data.map((webhook: any) => {
        const deliveries = webhook.deliveries || [];
        const successfulDeliveries = deliveries.filter((d: any) => d.status === 'SUCCESS').length;
        return {
          id: webhook.id,
          name: webhook.name,
          url: webhook.url,
          events: webhook.events ? JSON.parse(webhook.events) : [],
          status: webhook.isActive ? 'active' : 'inactive',
          lastTrigger: webhook.lastTrigger || new Date().toISOString(),
          deliveries: deliveries.length,
          successRate: deliveries.length > 0 ? Math.round((successfulDeliveries / deliveries.length) * 100 * 10) / 10 : 100,
          applicationId: webhook.applicationId,
          applicationName: webhook.application?.name || 'Unknown Application',
          secret: webhook.secret ? 'whsec_***' : undefined
        };
      });
      set({ webhooks });
    } catch (error) {
       console.error('Error loading webhooks:', error);
       set({ webhooks: [] });
    }
  },

  fetchWorkflows: async () => {
     try {
       const response = await fetch('/api/workflows');
       if (!response.ok) throw new Error('Failed');
       const data = await response.json();
       const workflows = data.map((workflow: any) => ({
         id: workflow.id,
         name: workflow.name,
         status: workflow.executions?.[0]?.status?.toLowerCase() || 'pending',
         startedAt: workflow.executions?.[0]?.startedAt || new Date().toISOString(),
         duration: workflow.executions?.[0]?.duration || '0m 0s',
         progress: workflow.executions?.[0]?.progress || 0,
         steps: workflow.executions?.[0]?.steps?.map((step: any) => ({
           name: step.name,
           status: step.status?.toLowerCase(),
           duration: step.duration
         })) || []
       }));
       set({ workflows });
     } catch(e) {
       set({ workflows: [] });
     }
  },

  fetchAlerts: async () => {
    try {
      const response = await fetch('/api/alerts');
       if (!response.ok) throw new Error('Failed');
       const data = await response.json();
       const alerts = data.map((alert: any) => ({
         id: alert.id,
         title: alert.name,
         severity: alert.severity.toLowerCase(),
         message: alert.description,
         timestamp: alert.createdAt,
         acknowledged: !!alert.acknowledgedAt,
         source: alert.user?.name || 'System'
       }));
       set({ alerts });
    } catch(e) {
      set({ alerts: [] });
    }
  },

  fetchMetrics: async () => {
    try {
      const response = await fetch('/api/metrics?timeRange=1h&limit=30');
      if(!response.ok) throw new Error('Failed');
      const data = await response.json();
      set({ metrics: data.map((m: any) => ({ 
        timestamp: m.timestamp, value: m.value, label: m.name 
      }))});
    } catch (e) {
      set({ metrics: [] });
    }
  },

  fetchTeamMembers: async () => {
    try {
      const response = await fetch('/api/team');
      if(!response.ok) throw new Error('Failed');
      const data = await response.json();
      set({ teamMembers: data });
    } catch (e) {
      set({ teamMembers: [] });
    }
  },

  fetchAll: async () => {
    set({ isLoading: true });
    const { fetchServers, fetchApplications, fetchApiEndpoints, fetchWebhooks, fetchWorkflows, fetchAlerts, fetchMetrics, fetchTeamMembers } = get();
    await Promise.all([
      fetchServers(),
      fetchApplications(),
      fetchApiEndpoints(),
      fetchWebhooks(),
      fetchWorkflows(),
      fetchAlerts(),
      fetchMetrics(),
      fetchTeamMembers()
    ]);
    set({ isLoading: false, lastUpdated: new Date() });
  },

  addServer: async (server) => {
    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server)
      });
      if (response.ok) {
        await get().fetchServers();
        return true;
      }
      return false;
    } catch (e) { return false; }
  },

  updateServer: async (id, data) => {
    // Implementation for update
    return true;
  },

  deleteServer: async (id) => {
     try {
       const response = await fetch(`/api/servers?id=${id}`, { method: 'DELETE' });
       if(response.ok) {
         await get().fetchServers();
         return true;
       }
       return false;
     } catch(e) { return false; }
  },

  addWorkflow: async (workflow) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      });
      if (response.ok) {
        await get().fetchWorkflows();
        return true;
      }
      return false;
    } catch (e) { return false; }
  },

  acknowledgeAlert: async (id) => {
    try {
      await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id, isTriggered: false, acknowledgedAt: new Date().toISOString()
        })
      });
      // Optimistic update
      set(state => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a)
      }));
    } catch(e) { console.error(e); }
  }

}));
