"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    GitBranch,
    Play,
    RotateCw,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Plus
} from 'lucide-react';
import { useMonitoringStore } from '@/store/monitoring-store';
import { useToast } from '@/hooks/use-toast';

interface WorkflowsTabProps {
    onAddWorkflow: () => void;
}

export function WorkflowsTab({ onAddWorkflow }: WorkflowsTabProps) {
    const { toast } = useToast();
    const { workflows } = useMonitoringStore();

    const handleViewLogs = (workflowId: string) => {
        toast({
            title: "System Logs",
            description: `Fetching logs for workflow ${workflowId}...`,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-500';
            case 'failed': return 'text-red-500';
            case 'running': return 'text-blue-500';
            default: return 'text-slate-500';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Automated Workflows</h3>
                <Button
                    onClick={onAddWorkflow}
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Workflow
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflows.map((workflow) => (
                    <Card key={workflow.id}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${getStatusColor(workflow.status)}`}>
                                        <GitBranch className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                                        <CardDescription className="text-xs">
                                            Started: {new Date(workflow.startedAt).toLocaleString()}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant={workflow.status === 'running' ? 'default' : 'secondary'}>
                                    {workflow.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600 dark:text-slate-400">Progress</span>
                                        <span>{workflow.progress}%</span>
                                    </div>
                                    <Progress value={workflow.progress} className="h-2" />
                                </div>
                                <div className="space-y-2">
                                    {workflow.steps.map((step, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                {step.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-500" />}
                                                {step.status === 'running' && <RotateCw className="w-3 h-3 text-blue-500 animate-spin" />}
                                                {step.status === 'failed' && <XCircle className="w-3 h-3 text-red-500" />}
                                                {step.status === 'pending' && <Clock className="w-3 h-3 text-slate-400" />}
                                                <span className={step.status === 'running' ? 'font-medium' : ''}>{step.name}</span>
                                            </div>
                                            <span className="text-xs text-slate-500">{step.duration}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button size="sm" variant="outline" onClick={() => handleViewLogs(workflow.id)}>
                                        View Logs
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {workflows.length === 0 && (
                    <div className="col-span-full text-center py-8 text-slate-500">
                        No workflows defined
                    </div>
                )}
            </div>
        </div>
    );
}
