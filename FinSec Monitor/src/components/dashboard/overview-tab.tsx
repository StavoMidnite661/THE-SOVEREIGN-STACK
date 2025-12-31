"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Activity,
    Bell,
    Radio,
    Download,
    Upload,
    Package,
    AlertTriangle,
    Info,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { useMonitoringStore } from '@/store/monitoring-store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProcessManager } from './process-manager';

export function OverviewTab() {
    const {
        servers,
        alerts,
        metrics,
        acknowledgeAlert
    } = useMonitoringStore();

    const overallHealth = Math.round(
        (servers.filter(s => s.status === 'HEALTHY').length / (servers.length || 1)) * 100
    );

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'destructive';
            case 'WARNING': return 'secondary';
            case 'INFO': return 'secondary';
            default: return 'outline';
        }
    };

    const getStatusColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'text-red-500';
            case 'WARNING': return 'text-yellow-500';
            case 'INFO': return 'text-blue-500';
            default: return 'text-slate-500';
        }
    };

    const getStatusIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return <XCircle className="w-4 h-4" />;
            case 'WARNING': return <AlertTriangle className="w-4 h-4" />;
            case 'INFO': return <Info className="w-4 h-4" />;
            default: return <Bell className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Mission Control - Process Manager (Moved to Top for Unified Command) */}
            <div className="w-full">
                <ProcessManager />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* System Health */}
                <Card className="lg:col-span-2 glass-morphism gradient-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            System Health Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Overall Health</span>
                                <span className="text-sm text-slate-300">{overallHealth}%</span>
                            </div>
                            <Progress value={overallHealth} className="h-2" />

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {servers.filter(s => s.status === 'HEALTHY').length}
                                    </div>
                                    <p className="text-xs text-slate-300">Online Servers</p>
                                </div>
                                <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {alerts.filter(a => !a.acknowledged).length}
                                    </div>
                                    <p className="text-xs text-slate-300">Active Alerts</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Alerts */}
                <Card className="glass-morphism gradient-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Recent Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-64">
                            <div className="space-y-3">
                                {alerts.slice(0, 5).map((alert) => (
                                    <div
                                        key={alert.id}
                                        className="flex items-start gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                                    >
                                        <div className={getStatusColor(alert.severity)}>
                                            {getStatusIcon(alert.severity)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{alert.title}</p>
                                            <p className="text-xs text-slate-400 truncate">{alert.message}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(alert.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                                                {alert.severity}
                                            </Badge>
                                            {!alert.acknowledged && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        acknowledgeAlert(alert.id);
                                                    }}
                                                >
                                                    Ack
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {alerts.length === 0 && (
                                    <div className="text-center py-8 text-slate-500 text-sm">
                                        No alerts found
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* System Metrics Overview */}
                <Card className="lg:col-span-3 glass-morphism gradient-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Radio className="w-5 h-5" />
                            System Metrics Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {metrics.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={metrics}>
                                        <defs>
                                            <linearGradient id="colorMetrics" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-white/10" />
                                        <XAxis
                                            dataKey="timestamp"
                                            className="text-xs fill-slate-400"
                                            tick={{ fill: '#94a3b8' }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => {
                                                const date = new Date(value);
                                                return date.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false
                                                });
                                            }}
                                        />
                                        <YAxis
                                            className="text-xs fill-slate-400"
                                            tick={{ fill: '#94a3b8' }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#fff'
                                            }}
                                            labelFormatter={(value) => {
                                                const date = new Date(value);
                                                return date.toLocaleString();
                                            }}
                                            formatter={(value, name) => [
                                                value,
                                                name === 'value' ? 'Metric Value' : name
                                            ]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#3b82f6"
                                            fillOpacity={1}
                                            fill="url(#colorMetrics)"
                                            name="Metric Value"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    <div className="text-center">
                                        <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No metrics data available</p>
                                        <p className="text-sm mt-2">Metrics will appear here once data is collected</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}