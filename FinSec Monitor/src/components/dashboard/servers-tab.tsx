"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Server,
    Globe,
    Activity,
    AlertTriangle,
    Play,
    Pause,
    RotateCw,
    Trash2,
    HardDrive,
    Cpu,
    Wifi,
    MoreVertical,
    Plus
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMonitoringStore } from '@/store/monitoring-store';

import { useToast } from '@/hooks/use-toast';

interface ServersTabProps {
    onAddServer: () => void;
}

export function ServersTab({ onAddServer }: ServersTabProps) {
    const { servers, deleteServer } = useMonitoringStore();
    const { toast } = useToast();

    const handleStartServer = async (id: string, name: string) => {
        try {
            toast({ title: "Starting Server", description: `Launching ${name}...` });
            const res = await fetch('/api/servers/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start', serverId: id })
            });
            const data = await res.json();
            if (res.ok) {
                toast({
                    title: "Server Started",
                    description: data.message || `${name} is starting. URL: ${data.url}`,
                });
            } else {
                toast({ title: "Info", description: data.message || data.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to start server.", variant: "destructive" });
        }
    };

    const handleStopServer = async (id: string, name: string) => {
        try {
            const res = await fetch('/api/servers/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'stop', serverId: id })
            });
            const data = await res.json();
            toast({
                title: "Server Stopped",
                description: data.message || `${name} has been stopped.`,
            });
        } catch (error) {
            toast({ title: "Error", description: "Failed to stop server.", variant: "destructive" });
        }
    };

    const handleOpenApp = async (server: any) => {
        try {
            const res = await fetch('/api/servers/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'open', serverId: server.id, serverName: server.name })
            });

            if (!res.ok) {
                // If the backend returns an error (like 404 for no UI), show it
                const errorData = await res.json();
                toast({
                    title: "Cannot Open App",
                    description: errorData.error || "Failed to open application",
                    variant: "destructive"
                });
                return;
            }

            const data = await res.json();

            if (data.action === 'toast') {
                toast({
                    title: "No UI Available",
                    description: data.error,
                    variant: "default" // Orange/Warning style if available, or just default info
                });
            } else if (data.url) {
                window.open(data.url, '_blank');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to open application",
                variant: "destructive"
            });
        }
    };

    const handleCheckStatus = async (id: string) => {
        try {
            toast({ title: "Checking Status", description: "Pinging server..." });
            const res = await fetch('/api/servers/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'check', serverId: id })
            });
            const data = await res.json();
            if (data.status === 'running') {
                toast({
                    title: "✅ Server Online",
                    description: `Responding at ${data.url} (HTTP ${data.httpStatus})`,
                });
            } else {
                toast({
                    title: "❌ Server Offline",
                    description: `Not responding at ${data.url}`,
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to check status.", variant: "destructive" });
        }
    };

    const handleRestart = async (id: string) => {
        try {
            await fetch('/api/servers/restart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            toast({
                title: "Server Restart Initiated",
                description: "Signal sent to restart server service.",
            });
        } catch (error) {
            toast({ title: "Error", description: "Failed to restart server.", variant: "destructive" });
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
            case 'HEALTHY': return <Wifi className="w-4 h-4 text-green-500" />;
            case 'CRITICAL': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'WARNING': return <Activity className="w-4 h-4 text-yellow-500" />;
            default: return <Server className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Server Infrastructure</h3>
                <Button
                    onClick={onAddServer}
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Server
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servers.map((server) => (
                    <Card
                        key={server.id}
                        className={`hover:shadow-md transition-all duration-300 group ${server.status === 'HEALTHY'
                            ? 'border-green-500/40 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                            : 'border-red-500/40 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                            }`}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`relative p-2 rounded-lg ${server.status === 'HEALTHY' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                        {server.status === 'HEALTHY' && (
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                            </span>
                                        )}
                                        {server.status === 'CRITICAL' && (
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </span>
                                        )}
                                        {getStatusIcon(server.status)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{server.name}</CardTitle>
                                        <CardDescription className="text-xs">{server.host}:{server.port}</CardDescription>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleStartServer(server.id, server.name)}>
                                            <Play className="w-4 h-4 mr-2" /> Start Server
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleOpenApp(server.id)}>
                                            <Globe className="w-4 h-4 mr-2" /> Open App
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleCheckStatus(server.id)}>
                                            <Activity className="w-4 h-4 mr-2" /> Check Status
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleRestart(server.id)}>
                                            <RotateCw className="w-4 h-4 mr-2" /> Restart Service
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStopServer(server.id, server.name)}>
                                            <Pause className="w-4 h-4 mr-2" /> Stop Server
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600" onClick={() => deleteServer(server.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete Server
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <div className="flex justify-center mb-1">
                                            <Cpu className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div className="text-sm font-bold">{server.cpu}%</div>
                                        <div className="text-[10px] text-slate-500">CPU</div>
                                    </div>
                                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <div className="flex justify-center mb-1">
                                            <HardDrive className="w-4 h-4 text-purple-500" />
                                        </div>
                                        <div className="text-sm font-bold">{server.memory}%</div>
                                        <div className="text-[10px] text-slate-500">RAM</div>
                                    </div>
                                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <div className="flex justify-center mb-1">
                                            <Activity className="w-4 h-4 text-green-500" />
                                        </div>
                                        <div className="text-sm font-bold">{server.responseTime}ms</div>
                                        <div className="text-[10px] text-slate-500">Ping</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Activity className="w-3 h-3" />
                                        Uptime: {server.uptime}
                                    </div>
                                </div>
                                <div className="h-[60px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[]}>
                                            <defs>
                                                <linearGradient id={`colorCpu-${server.id}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={server.status === 'CRITICAL' ? '#ef4444' : '#3b82f6'} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={server.status === 'CRITICAL' ? '#ef4444' : '#3b82f6'} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke={server.status === 'CRITICAL' ? '#ef4444' : '#3b82f6'}
                                                strokeWidth={2}
                                                fill={`url(#colorCpu-${server.id})`}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {server.tags.map((tag, i) => (
                                        <Badge key={i} variant="outline" className="text-[10px] px-1 py-0 h-5">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div >
    );
}
