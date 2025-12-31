"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Webhook,
    Activity,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Play,
    RotateCw,
    Plus
} from 'lucide-react';
import { useMonitoringStore } from '@/store/monitoring-store';

import { useToast } from '@/hooks/use-toast';

interface WebhooksTabProps {
    onAddWebhook: () => void;
}

export function WebhooksTab({ onAddWebhook }: WebhooksTabProps) {
    const { webhooks } = useMonitoringStore();
    const { toast } = useToast();

    const handleTest = async (id: string) => {
        try {
            await fetch('/api/webhooks/manual-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            toast({ title: "Tested", description: "Webhook test event sent." });
        } catch (e) {
            toast({ title: "Error", description: "Failed to test webhook.", variant: "destructive" });
        }
    };

    const handleLogs = (id: string) => {
        toast({ title: "Logs", description: "Viewing webhook delivery logs..." });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-500';
            case 'inactive': return 'text-slate-500';
            case 'error': return 'text-red-500';
            default: return 'text-slate-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'inactive': return <Activity className="w-4 h-4 text-slate-500" />;
            case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Webhook className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Webhook Integrations</h3>
                <Button
                    onClick={onAddWebhook}
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Webhook
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {webhooks.map((webhook) => (
                    <Card key={webhook.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${getStatusColor(webhook.status)}`}>
                                        {getStatusIcon(webhook.status)}
                                    </div>
                                    <CardTitle className="text-lg">{webhook.name}</CardTitle>
                                </div>
                                <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                                    {webhook.status}
                                </Badge>
                            </div>
                            <CardDescription className="truncate">{webhook.url}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Success Rate</span>
                                    <span className="font-medium">{webhook.successRate}%</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Total Deliveries</span>
                                    <span className="font-medium">{webhook.deliveries}</span>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                    Last trigger: {new Date(webhook.lastTrigger).toLocaleString()}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {webhook.events.map((event, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                            {event}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-3 pt-3 border-t dark:border-slate-800">
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleTest(webhook.id)}>
                                        <Play className="w-3 h-3 mr-1" /> Test
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleLogs(webhook.id)}>
                                        <RotateCw className="w-3 h-3 mr-1" /> Logs
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
