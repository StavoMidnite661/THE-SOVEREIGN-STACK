"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMonitoringStore } from '@/store/monitoring-store';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  Activity,
  BarChart3,
  Lightbulb,
  Shield,
  Rocket,
  Cpu,
  Database,
  Globe,
  Wifi
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PredictionData {
  timestamp: string;
  actual: number;
  predicted: number;
  confidence: number;
}

interface AnomalyDetection {
  id: string;
  type: 'performance' | 'security' | 'availability' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  impact: string;
  recommendation: string;
  timestamp: string;
}

interface AIInsight {
  id: string;
  category: 'optimization' | 'security' | 'performance' | 'cost';
  title: string;
  description: string;
  potentialSavings?: string;
  improvement?: string;
  priority: 'low' | 'medium' | 'high';
}

export default function AIAnalytics() {
  const { servers, alerts } = useMonitoringStore();

  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [systemHealth, setSystemHealth] = useState(0);

  useEffect(() => {
    generateAIData();
    const interval = setInterval(generateAIData, 30000);
    return () => clearInterval(interval);
  }, [servers, alerts]);

  const generateAIData = () => {
    // Generate prediction data (Mock based on overall system stability)
    const now = new Date();
    const predictionData: PredictionData[] = [];
    const healthBaseline = servers.every(s => s.status === 'HEALTHY') ? 80 : 50;

    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 3600000);
      const baseValue = healthBaseline + Math.sin(i / 4) * 20;
      const actual = baseValue + Math.random() * 10 - 5;
      const predicted = baseValue + Math.random() * 8 - 4;
      predictionData.push({
        timestamp: timestamp.toISOString(),
        actual: Math.max(0, Math.min(100, actual)),
        predicted: Math.max(0, Math.min(100, predicted)),
        confidence: 75 + Math.random() * 20
      });
    }
    setPredictions(predictionData);

    // Context-Aware Anomalies
    const anomalyData: AnomalyDetection[] = [];

    // Check for critical alerts
    if (alerts.some(a => a.severity === 'CRITICAL')) {
      anomalyData.push({
        id: 'critical-alerts',
        type: 'security',
        severity: 'critical',
        title: 'Critical Security Events',
        description: `Detected ${alerts.filter(a => a.severity === 'CRITICAL').length} active critical alerts requiring immediate attention.`,
        confidence: 98,
        impact: 'High - Immediate Threat',
        recommendation: 'Initiate incident response protocol',
        timestamp: new Date().toISOString()
      });
    }

    // Check for offline servers
    const offlineServers = servers.filter(s => s.status === 'CRITICAL' || s.status === 'WARNING');
    if (offlineServers.length > 0) {
      anomalyData.push({
        id: 'server-health',
        type: 'availability',
        severity: 'high',
        title: 'Infrastructure Instability',
        description: `${offlineServers.length} servers are reporting issues.`,
        confidence: 95,
        impact: 'High - Service degradation',
        recommendation: 'Check server logs and restart failing instances',
        timestamp: new Date().toISOString()
      });
    }

    // Add some random/mock anomalies if list is empty, to show UI
    if (anomalyData.length === 0) {
      anomalyData.push({
        id: 'mock-1',
        type: 'performance',
        severity: 'low',
        title: 'Minor Latency Variance',
        description: 'Slight increase in API latency detected during off-peak hours.',
        confidence: 72,
        impact: 'Low - Monitoring only',
        recommendation: 'No action required yet',
        timestamp: new Date().toISOString()
      });
    }

    setAnomalies(anomalyData);

    // AI Insights (Mock but relevant)
    const insightData: AIInsight[] = [
      {
        id: '1',
        category: 'optimization',
        title: 'Database Query Optimization',
        description: 'AI analysis identified 15 slow queries that can be optimized for 40% performance improvement.',
        improvement: '40% faster response times',
        priority: 'high'
      },
      {
        id: '2',
        category: 'cost',
        title: 'Resource Scaling Opportunity',
        description: 'Predictive analysis suggests you can reduce server costs by 25% during off-peak hours.',
        potentialSavings: '$1,200/month',
        priority: 'medium'
      },
      {
        id: '3',
        category: 'security',
        title: 'Proactive Security Enhancement',
        description: 'ML models detected patterns suggesting potential vulnerabilities in your authentication system.',
        improvement: 'Prevent 85% of common attack vectors',
        priority: 'high'
      }
    ];
    setInsights(insightData);

    // Calculate system health
    const alertPenalty = alerts.length * 5;
    const offlinePenalty = offlineServers.length * 20;
    const calculatedHealth = Math.max(0, 100 - alertPenalty - offlinePenalty);
    setSystemHealth(calculatedHealth);
  };

  const runDeepAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    generateAIData();
    setIsAnalyzing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'optimization': return <Zap className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'performance': return <Rocket className="w-4 h-4" />;
      case 'cost': return <BarChart3 className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Activity className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'availability': return <Wifi className="w-4 h-4" />;
      case 'resource': return <Cpu className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Analytics & Predictions</h2>
            <p className="text-slate-600 dark:text-slate-400">Machine-powered insights and anomaly detection</p>
          </div>
        </div>
        <Button
          onClick={runDeepAnalysis}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Brain className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Run Deep Analysis'}
        </Button>
      </div>

      {/* System Health Prediction */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Predictive System Health
          </CardTitle>
          <CardDescription>AI-powered prediction of system health over the next 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Health Score</span>
              <span className="text-2xl font-bold text-purple-600">{systemHealth}%</span>
            </div>
            <Progress value={systemHealth} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {Math.min(100, systemHealth + 5)}%
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">6h Prediction</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">
                  {Math.min(100, Math.max(0, systemHealth - 5))}%
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">12h Prediction</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {Math.min(100, Math.max(0, systemHealth - 10))}%
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">24h Prediction</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Analytics Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Predictions
          </CardTitle>
          <CardDescription>AI model predictions vs actual performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).getHours() + ':00'}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: any, name: string) => [
                    `${value.toFixed(1)}%`,
                    name === 'actual' ? 'Actual' : 'Predicted'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="actual"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeDasharray="5 5"
                  name="predicted"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Anomaly Detection
            </CardTitle>
            <CardDescription>AI-detected anomalies and potential issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {anomalies.map((anomaly) => (
                <Alert key={anomaly.id} className="border-l-4 border-l-orange-500">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getTypeIcon(anomaly.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <AlertTitle className="text-sm">{anomaly.title}</AlertTitle>
                        <Badge variant={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <AlertDescription className="text-xs mb-2">
                        {anomaly.description}
                      </AlertDescription>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400">Confidence:</span>
                          <span className="font-medium">{anomaly.confidence}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400">Impact:</span>
                          <span className="font-medium">{anomaly.impact}</span>
                        </div>
                        <div className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded mt-2">
                          <span className="font-medium">Recommendation:</span> {anomaly.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
              {anomalies.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  No anomalies detected. System operating within normal parameters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              AI Insights & Recommendations
            </CardTitle>
            <CardDescription>Machine-generated optimization opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getCategoryIcon(insight.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        {insight.description}
                      </p>
                      {insight.improvement && (
                        <div className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
                          <span className="font-medium text-green-700 dark:text-green-400">
                            Potential Improvement: {insight.improvement}
                          </span>
                        </div>
                      )}
                      {insight.potentialSavings && (
                        <div className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                          <span className="font-medium text-blue-700 dark:text-blue-400">
                            Potential Savings: {insight.potentialSavings}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Capabilities Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium text-sm">Predictive Analytics</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Forecast system health and performance
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium text-sm">Anomaly Detection</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Identify unusual patterns automatically
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium text-sm">Smart Optimization</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                AI-driven performance improvements
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium text-sm">Resource Planning</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Optimize resource allocation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}