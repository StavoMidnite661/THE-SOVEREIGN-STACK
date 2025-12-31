"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Play,
    Eye,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Plus
} from 'lucide-react';
import { useMonitoringStore } from '@/store/monitoring-store';
import { useToast } from '@/hooks/use-toast';

interface ApisTabProps {
    onAddEndpoint: () => void;
}

export function ApisTab({ onAddEndpoint }: ApisTabProps) {
    const { apiEndpoints } = useMonitoringStore();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-500';
            case 'unhealthy': return 'text-red-500';
            case 'warning': return 'text-yellow-500';
            default: return 'text-slate-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'unhealthy': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default: return <Eye className="w-4 h-4 text-slate-500" />;
        }
    };

    const { toast } = useToast();

    const handleTestEndpoint = async (id: string) => {
        try {
            await fetch('/api/api-endpoints/manual-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            toast({
                title: "Test Initiated",
                description: "The endpoint test has been triggered.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to initiate test.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">API Endpoints Monitoring</h3>
                <Button
                    onClick={onAddEndpoint}
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Endpoint
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>API Endpoints Monitoring</CardTitle>
                    <CardDescription>Real-time API performance and status tracking</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {apiEndpoints.map((endpoint) => (
                            <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${getStatusColor(endpoint.success ? 'healthy' : 'unhealthy')}`}>
                                        {getStatusIcon(endpoint.success ? 'healthy' : 'unhealthy')}
                                    </div>
                                    <div>
                                        <div className="font-medium">{endpoint.name}</div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            {endpoint.method} {endpoint.url}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-500">
                                            {endpoint.applicationName}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 justify-end">
                                        <Badge variant={endpoint.success ? 'default' : 'destructive'}>
                                            {endpoint.status}
                                        </Badge>
                                        <span className="text-sm font-medium">{endpoint.responseTime}ms</span>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500">
                                        {new Date(endpoint.lastChecked).toLocaleTimeString()}
                                    </div>
                                    <div className="flex gap-2 mt-2 justify-end">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleTestEndpoint(endpoint.id)}
                                        >
                                            <Play className="w-3 h-3 mr-1" />
                                            Test
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => toast({ title: "View Details", description: `Navigating to ${endpoint.name} details` })}>
                                            <Eye className="w-3 h-3 mr-1" />
                                            View
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {apiEndpoints.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                No API endpoints configured
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
