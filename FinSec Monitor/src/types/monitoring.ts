export interface ServerMonitor {
  id: string;
  name: string;
  host: string;
  port: number;
  type: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  responseTime: number;
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  lastCheck: string;
  tags: string[];
  location?: string;
  os?: string;
  version?: string;
  healthCheckUrl?: string;
  healthCheckInterval?: number;
  responseTimeThreshold?: number;
  cpuThreshold?: number;
  memoryThreshold?: number;
  diskThreshold?: number;
  description?: string;
}

export interface Application {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  serverId: string;
  serverName: string;
  tags: string[];
  version?: string;
  framework?: string;
  description?: string;
  repository?: string;
  healthCheckUrl?: string;
  owner?: string;
  environment?: string;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  method: string;
  status: number;
  responseTime: number;
  lastChecked: string;
  success: boolean;
  applicationId: string;
  applicationName: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  checkInterval?: number;
  description?: string;
  expectedStatus?: number;
  alertThreshold?: number;
  authentication?: string;
}

export interface WebhookMonitor {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  lastTrigger: string;
  deliveries: number;
  successRate: number;
  applicationId: string;
  applicationName: string;
  secret?: string;
}

export interface MetricData {
  timestamp: string;
  value: number;
  label: string;
}

export interface WorkflowExecution {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startedAt: string;
  duration: string;
  progress: number;
  steps: Array<{
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    duration?: string;
  }>;
}

export interface AlertItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  source: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  avatar?: string;
}
