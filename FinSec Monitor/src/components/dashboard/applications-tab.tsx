"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Globe,
    Activity,
    AlertTriangle,
    Play,
    RotateCw,
    GitBranch,
    Layers,
    CheckCircle,
    XCircle,
    Plus
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useMonitoringStore } from '@/store/monitoring-store';
import { useToast } from '@/hooks/use-toast';

interface ApplicationsTabProps {
    onAddApp: () => void;
}

export function ApplicationsTab({ onAddApp }: ApplicationsTabProps) {
    const { applications } = useMonitoringStore();
    const { toast } = useToast();

    const handleRestart = async (id: string) => {
        try {
            await fetch('/api/applications/restart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            toast({
                title: "Restart Initiated",
                description: "Signal sent to restart application.",
            });
        } catch (error) {
            toast({ title: "Error", description: "Failed to restart.", variant: "destructive" });
        }
    };

    const handleLogs = async (id: string) => {
        try {
            const res = await fetch(`/api/applications/logs?id=${id}`);
            if (res.ok) {
                toast({ title: "Logs Fetched", description: "Logs checking logic initiated." });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch logs.", variant: "destructive" });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'HEALTHY': return 'text-green-500';
            case 'CRITICAL': return 'text-red-500';
            case 'WARNING': return 'text-yellow-500';
            default: return 'text-slate-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'HEALTHY': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'CRITICAL': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default: return <Activity className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Applications & Services</h3>
                <Button
                    onClick={onAddApp}
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Application
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applications.map((app) => (
                    <Card key={app.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${getStatusColor(app.status)}`}>
                                        {getStatusIcon(app.status)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{app.name}</CardTitle>
                                        <CardDescription className="text-xs">{app.endpoint}</CardDescription>
                                    </div>
                                </div>
                                <Badge variant={app.status === 'HEALTHY' ? 'default' : 'destructive'}>
                                    {app.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Globe className="w-4 h-4" />
                                        <span>Response Time</span>
                                    </div>
                                    <span className="font-semibold">{app.responseTime}ms</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Activity className="w-4 h-4" />
                                        <span>Uptime</span>
                                    </div>
                                    <span className="font-semibold">{app.uptime}%</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Layers className="w-4 h-4" />
                                        <span>Server</span>
                                    </div>
                                    <span className="font-medium">{app.serverName}</span>
                                </div>
                                <div className="h-[60px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[]}>
                                            <defs>
                                                <linearGradient id={`colorLat-${app.id}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={app.status === 'CRITICAL' ? '#ef4444' : '#10b981'} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={app.status === 'CRITICAL' ? '#ef4444' : '#10b981'} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke={app.status === 'CRITICAL' ? '#ef4444' : '#10b981'}
                                                strokeWidth={2}
                                                fill={`url(#colorLat-${app.id})`}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="pt-2 border-t dark:border-slate-800 flex justify-between items-center">
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <GitBranch className="w-3 h-3" />
                                        v{app.version}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs"
                                            onClick={() => handleLogs(app.id)}
                                        >
                                            Logs
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs"
                                            onClick={() => handleRestart(app.id)}
                                        >
                                            Restart
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
