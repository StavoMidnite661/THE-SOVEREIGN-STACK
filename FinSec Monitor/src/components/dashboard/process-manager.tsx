"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
    RefreshCw,
    Activity,
    Square,
    Circle,
    Terminal,
    Cpu,
    XCircle
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMonitoringStore } from '@/store/monitoring-store';

interface ProcessInfo {
    pid: string;
    name: string;
    port: number | null;
    status: 'running' | 'stopped';
    command?: string;
}

export function ProcessManager() {
    const [processes, setProcesses] = useState<ProcessInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const { toast } = useToast();
    const { servers } = useMonitoringStore();

    // Helper to get stats for a process
    const getProcessStats = (procName: string, procPort: number | null) => {
        const server = servers.find(s => s.name === procName || (procPort && s.port === procPort));
        return server ? { cpu: server.cpu, memory: server.memory } : null;
    };

    const fetchProcesses = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/processes');
            const data = await res.json();
            setProcesses(data.processes || []);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch processes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProcesses();
        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchProcesses, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleKillProcess = async (pid: string, name: string) => {
        try {
            const res = await fetch('/api/processes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'kill', pid })
            });
            const data = await res.json();

            if (res.ok) {
                toast({
                    title: "Process Terminated",
                    description: `Killed ${name} (PID: ${pid})`,
                });
                // Refresh the list
                setTimeout(fetchProcesses, 500);
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to kill process",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to terminate process",
                variant: "destructive"
            });
        }
    };

    const runningCount = processes.filter(p => p.status === 'running').length;
    const stoppedCount = processes.filter(p => p.status === 'stopped').length;

    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                            <Terminal className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Process Manager</CardTitle>
                            <CardDescription className="text-xs">
                                Monitor running services • {runningCount} active, {stoppedCount} stopped
                            </CardDescription>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchProcesses}
                        disabled={isLoading}
                        className="border-white/20"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
                {lastUpdated && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px]">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10">
                                <TableHead className="text-white/70">Status</TableHead>
                                <TableHead className="text-white/70">Name</TableHead>
                                <TableHead className="text-white/70">Port</TableHead>
                                <TableHead className="text-white/70">CPU</TableHead>
                                <TableHead className="text-white/70">Memory</TableHead>
                                <TableHead className="text-white/70">PID</TableHead>
                                <TableHead className="text-white/70">Process</TableHead>
                                <TableHead className="text-white/70 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processes.map((proc, idx) => (
                                <TableRow key={`${proc.pid}-${idx}`} className="border-white/5 hover:bg-white/5">
                                    <TableCell>
                                        {proc.status === 'running' ? (
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 box-shadow-green-glow"></span>
                                                </div>
                                                <span className="text-xs font-bold text-green-400 uppercase tracking-wider">LIVE</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex h-3 w-3">
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500/50"></span>
                                                </div>
                                                <span className="text-xs font-bold text-red-500/70 uppercase tracking-wider">OFFLINE</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium text-white/90">{proc.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-xs">
                                            :{proc.port}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-white/80">
                                        {(() => {
                                            const stats = getProcessStats(proc.name, proc.port);
                                            return stats ? `${stats.cpu}%` : '-';
                                        })()}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-white/80">
                                        {(() => {
                                            const stats = getProcessStats(proc.name, proc.port);
                                            return stats ? `${stats.memory}%` : '-';
                                        })()}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-white/60">{proc.pid}</TableCell>
                                    <TableCell className="text-xs text-white/50 max-w-[150px] truncate">
                                        {proc.command}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {proc.status === 'running' && proc.pid !== '-' && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Kill
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Kill Process?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to terminate <strong>{proc.name}</strong> (PID: {proc.pid})?
                                                            This will forcefully stop the process.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleKillProcess(proc.pid, proc.name)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Kill Process
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {processes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        No processes to display
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
