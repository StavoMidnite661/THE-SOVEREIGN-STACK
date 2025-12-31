"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Server,
    Globe,
    Webhook,
    GitBranch
} from 'lucide-react';
import { useMonitoringStore } from '@/store/monitoring-store';

export function SummaryCards() {
    const { servers, applications, webhooks, workflows } = useMonitoringStore();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-morphism glass-morphism-hover gradient-border">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                <Server className="w-4 h-4 text-white" />
                            </div>
                            <CardTitle className="text-sm font-medium">Servers</CardTitle>
                        </div>
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs">
                            {servers.filter(s => s.status === 'HEALTHY').length}/{servers.length}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{servers.length}</div>
                    <p className="text-xs text-slate-300 mt-1">Total Systems</p>
                </CardContent>
            </Card>

            <Card className="glass-morphism glass-morphism-hover gradient-border">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                                <Globe className="w-4 h-4 text-white" />
                            </div>
                            <CardTitle className="text-sm font-medium">Applications</CardTitle>
                        </div>
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs">
                            {applications.filter(a => a.status === 'HEALTHY').length}/{applications.length}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{applications.length}</div>
                    <p className="text-xs text-slate-300 mt-1">Active Applications</p>
                </CardContent>
            </Card>

            <Card className="glass-morphism glass-morphism-hover gradient-border">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                                <Webhook className="w-4 h-4 text-white" />
                            </div>
                            <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
                        </div>
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs">
                            {webhooks.filter(w => w.status === 'active').length}/{webhooks.length}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{webhooks.length}</div>
                    <p className="text-xs text-slate-300 mt-1">Active Webhooks</p>
                </CardContent>
            </Card>

            <Card className="glass-morphism glass-morphism-hover gradient-border">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                                <GitBranch className="w-4 h-4 text-white" />
                            </div>
                            <CardTitle className="text-sm font-medium">Workflows</CardTitle>
                        </div>
                        <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-xs">
                            {workflows.filter(w => w.status === 'running').length} Running
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{workflows.length}</div>
                    <p className="text-xs text-slate-300 mt-1">Active Workflows</p>
                </CardContent>
            </Card>
        </div>
    );
}
