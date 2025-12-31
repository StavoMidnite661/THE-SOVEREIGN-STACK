'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  CheckCircle,
  Database,
  FileCheck,
  Globe,
  HardDrive,
  Lock,
  Network,
  RefreshCw,
  Server,
  Shield
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface TigerBeetleCluster {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'syncing';
  health: number; // 0-100
  lastUpdate: string;
  nodeCount: number;
  throughput: number; // transactions per second
  latency: number; // milliseconds
}

interface ObligationRecord {
  id: string;
  amount: number;
  counterparty: string;
  timestamp: string;
  status: 'pending' | 'clearing' | 'cleared' | 'failed';
  tigerbeetleId?: string;
  attestationHash: string;
  mechanicalProof: string;
  finalityLevel: number; // 0-6
  clusterProcessed: string;
}

interface OracleLedgerSync {
  id: string;
  lastSync: string;
  status: 'synced' | 'syncing' | 'delayed' | 'failed';
  blockHeight: number;
  syncLag: number; // seconds
  verificationStatus: 'verified' | 'pending' | 'failed';
  readOnly: boolean;
}

interface EventPropagation {
  id: string;
  eventType: string;
  timestamp: string;
  status: 'pending' | 'propagating' | 'confirmed' | 'failed';
  subscribers: number;
  confirmedBy: number;
  requiredConfirmations: number;
}

interface MechanicalTruthDisplayProps {
  obligations: ObligationRecord[];
  tigerBeetleClusters: TigerBeetleCluster[];
  oracleLedger: OracleLedgerSync;
  eventPropagation: EventPropagation[];
  onRefreshData: () => void;
  className?: string;
}

export default function MechanicalTruthDisplay({
  obligations,
  tigerBeetleClusters,
  oracleLedger,
  eventPropagation,
  onRefreshData,
  className = '',
}: MechanicalTruthDisplayProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
        onRefreshData();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, onRefreshData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cleared': return 'text-green-600';
      case 'clearing': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'synced': return 'text-green-600';
      case 'syncing': return 'text-blue-600';
      case 'delayed': return 'text-orange-600';
      case 'confirmed': return 'text-green-600';
      case 'propagating': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const colorMap = {
      'cleared': 'bg-green-100 text-green-800 border-green-200',
      'clearing': 'bg-blue-100 text-blue-800 border-blue-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'failed': 'bg-red-100 text-red-800 border-red-200',
      'synced': 'bg-green-100 text-green-800 border-green-200',
      'syncing': 'bg-blue-100 text-blue-800 border-blue-200',
      'delayed': 'bg-orange-100 text-orange-800 border-orange-200',
      'confirmed': 'bg-green-100 text-green-800 border-green-200',
      'propagating': 'bg-blue-100 text-blue-800 border-blue-200',
      'online': 'bg-green-100 text-green-800 border-green-200',
      'offline': 'bg-red-100 text-red-800 border-red-200',
      'degraded': 'bg-orange-100 text-orange-800 border-orange-200'
    };

    return (
      <Badge className={colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {status}
      </Badge>
    );
  };

  const getFinalityLevel = (level: number) => {
    const levels = [
      { name: 'Local', color: 'text-red-600', description: 'Single node processing' },
      { name: 'Cluster', color: 'text-orange-600', description: 'TigerBeetle cluster consensus' },
      { name: 'Network', color: 'text-yellow-600', description: 'Network propagation' },
      { name: 'Oracle', color: 'text-blue-600', description: 'Oracle Ledger verification' },
      { name: 'Global', color: 'text-green-600', description: 'Global consensus achieved' },
      { name: 'Immutable', color: 'text-green-700', description: 'Mathematically immutable' },
      { name: 'Ultimate', color: 'text-green-800', description: 'Ultimate mechanical truth' }
    ];
    
    return levels[level] || levels[0];
  };

  const overallSystemHealth = tigerBeetleClusters.reduce((sum, cluster) => sum + cluster.health, 0) / tigerBeetleClusters.length;

  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* SOVR Doctrine Header */}
      <Alert className="border-blue-200 bg-blue-50">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Mechanical Truth Display:</strong> All financial state derived from TigerBeetle clearing, 
          Oracle Ledger synchronization, and event propagation. <em>No manual balance edits possible.</em>
        </AlertDescription>
      </Alert>

      {/* System Status Overview */}
      <Card className="border-2 border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Mechanical Truth System Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
              <Button onClick={onRefreshData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <span className="text-sm text-gray-600">
                Last: {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium">System Health</h4>
              <p className={`text-2xl font-bold ${getStatusColor(overallSystemHealth > 90 ? 'cleared' : 'degraded')}`}>
                {overallSystemHealth.toFixed(1)}%
              </p>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium">Active Clusters</h4>
              <p className="text-2xl font-bold text-green-600">
                {tigerBeetleClusters.filter(c => c.status === 'online').length}
              </p>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium">Oracle Sync</h4>
              <p className={`text-2xl font-bold ${getStatusColor(oracleLedger.status)}`}>
                {oracleLedger.status}
              </p>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Network className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-medium">Events</h4>
              <p className="text-2xl font-bold text-orange-600">
                {eventPropagation.filter(e => e.status === 'confirmed').length}
              </p>
            </div>
          </div>

          {/* Oracle Ledger Status */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Oracle Ledger Synchronization</h4>
              {getStatusBadge(oracleLedger.status)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Block Height:</span>
                <p className="font-medium">{oracleLedger.blockHeight.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Sync Lag:</span>
                <p className="font-medium">{oracleLedger.syncLag}s</p>
              </div>
              <div>
                <span className="text-gray-600">Read-Only:</span>
                <p className="font-medium">{oracleLedger.readOnly ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Views */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tigerbeetle">TigerBeetle</TabsTrigger>
          <TabsTrigger value="obligations">Obligations</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="finality">Finality</TabsTrigger>
        </TabsList>

        {/* System Overview */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TigerBeetle Clusters */}
            <Card className="border-2 border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  TigerBeetle Clusters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tigerBeetleClusters.map((cluster) => (
                  <div key={cluster.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{cluster.name}</h4>
                      {getStatusBadge(cluster.status)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Health:</span>
                        <span className="font-medium">{cluster.health}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nodes:</span>
                        <span className="font-medium">{cluster.nodeCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Throughput:</span>
                        <span className="font-medium">{cluster.throughput} TPS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Latency:</span>
                        <span className="font-medium">{cluster.latency}ms</span>
                      </div>
                    </div>
                    <Progress value={cluster.health} className="h-2 mt-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Obligations */}
            <Card className="border-2 border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Recent Obligations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {obligations.slice(0, 5).map((obligation) => {
                  const finality = getFinalityLevel(obligation.finalityLevel);
                  return (
                    <div key={obligation.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{obligation.amount} SOVR</span>
                        {getStatusBadge(obligation.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Counterparty: {obligation.counterparty}</div>
                        <div>Finality: <span className={finality.color}>{finality.name}</span></div>
                        <div>Time: {new Date(obligation.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TigerBeetle Detailed View */}
        <TabsContent value="tigerbeetle" className="mt-6">
          <Card className="border-2 border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                TigerBeetle Cluster Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {tigerBeetleClusters.map((cluster) => (
                <div key={cluster.id} className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{cluster.name}</h3>
                    {getStatusBadge(cluster.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{cluster.health}%</div>
                      <div className="text-sm text-gray-600">Health Score</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{cluster.nodeCount}</div>
                      <div className="text-sm text-gray-600">Active Nodes</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{cluster.throughput}</div>
                      <div className="text-sm text-gray-600">TPS Capacity</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{cluster.latency}ms</div>
                      <div className="text-sm text-gray-600">Avg Latency</div>
                    </div>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Mechanical Truth Source:</strong> All obligation clearing and balance calculations 
                      occur within this TigerBeetle cluster. No manual overrides or balance edits possible.
                    </AlertDescription>
                  </Alert>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Obligations Detail */}
        <TabsContent value="obligations" className="mt-6">
          <Card className="border-2 border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Obligation Records
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {obligations.map((obligation) => {
                  const finality = getFinalityLevel(obligation.finalityLevel);
                  return (
                    <div key={obligation.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-lg">{obligation.amount} SOVR</span>
                          {getStatusBadge(obligation.status)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(obligation.timestamp).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Counterparty:</span>
                            <span className="font-medium">{obligation.counterparty}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cluster:</span>
                            <span className="font-medium">{obligation.clusterProcessed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Finality Level:</span>
                            <span className={`font-medium ${finality.color}`}>{finality.name}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Attestation Hash:</span>
                            <span className="font-mono text-xs">{obligation.attestationHash.slice(0, 16)}...</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">TigerBeetle ID:</span>
                            <span className="font-mono text-xs">{obligation.tigerbeetleId?.slice(0, 16)}...</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mechanical Proof:</span>
                            <span className="font-mono text-xs">{obligation.mechanicalProof.slice(0, 16)}...</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-slate-50 rounded text-xs">
                        <strong>Finality Description:</strong> {finality.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event Propagation */}
        <TabsContent value="events" className="mt-6">
          <Card className="border-2 border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Event Propagation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {eventPropagation.map((event) => (
                  <div key={event.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{event.eventType}</span>
                        {getStatusBadge(event.status)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Subscribers:</span>
                        <p className="font-medium">{event.subscribers}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Confirmed By:</span>
                        <p className="font-medium">{event.confirmedBy}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Required:</span>
                        <p className="font-medium">{event.requiredConfirmations}</p>
                      </div>
                    </div>
                    
                    <Progress 
                      value={(event.confirmedBy / event.requiredConfirmations) * 100} 
                      className="h-2 mt-3" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finality Levels */}
        <TabsContent value="finality" className="mt-6">
          <Card className="border-2 border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Finality Levels & Mathematical Proof
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Ultimate Mechanical Truth:</strong> SOVR achieves ultimate finality through 
                  mathematical proof, not administrative authority. Higher finality levels provide stronger guarantees.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {[
                  { level: 0, name: 'Local', color: 'text-red-600', description: 'Single TigerBeetle node processing', guarantee: 'Process initiated' },
                  { level: 1, name: 'Cluster', color: 'text-orange-600', description: 'TigerBeetle cluster consensus', guarantee: 'Cluster agreement' },
                  { level: 2, name: 'Network', color: 'text-yellow-600', description: 'Network propagation', guarantee: 'Network awareness' },
                  { level: 3, name: 'Oracle', color: 'text-blue-600', description: 'Oracle Ledger verification', guarantee: 'External verification' },
                  { level: 4, name: 'Global', color: 'text-green-600', description: 'Global consensus achieved', guarantee: 'Global agreement' },
                  { level: 5, name: 'Immutable', color: 'text-green-700', description: 'Mathematically immutable', guarantee: 'Impossibility of reversal' },
                  { level: 6, name: 'Ultimate', color: 'text-green-800', description: 'Ultimate mechanical truth', guarantee: 'Perfect mathematical certainty' }
                ].map((level) => (
                  <div key={level.level} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold">{level.level}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-lg">{level.name}</h4>
                        <span className={`font-medium ${level.color}`}>Finality</span>
                      </div>
                      <p className="text-gray-600 mb-2">{level.description}</p>
                      <div className="text-sm">
                        <strong>Guarantee:</strong> {level.guarantee}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SOVR Doctrine Footer */}
      <Alert className="border-slate-200 bg-slate-50">
        <Database className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">
          <strong>Mechanical Truth Doctrine:</strong> All financial state derived from TigerBeetle mechanical clearing. 
          Oracle Ledger provides read-only synchronization. Event propagation ensures system-wide consistency. 
          <em>Truth is mathematical, not administrative.</em>
        </AlertDescription>
      </Alert>
    </div>
  );
}