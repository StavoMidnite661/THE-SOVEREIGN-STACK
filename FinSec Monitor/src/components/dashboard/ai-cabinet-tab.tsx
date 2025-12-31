"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    FileText,
    Clipboard,
    CheckCircle2,
    Clock,
    AlertCircle,
    Sparkles,
    RefreshCw,
    Brain,
    Target,
    Shield,
    TrendingUp,
    Palette,
    BookOpen,
    Calculator,
    Scale,
    MessageSquare
} from 'lucide-react';

// Specialist definitions
const SPECIALISTS = [
    { id: 'chief-of-staff', name: 'Chief of Staff', role: 'Strategist & Conductor', icon: Users, color: 'bg-purple-500' },
    { id: 'growth-hacker', name: 'Growth Hacker', role: 'Virality Engineer', icon: TrendingUp, color: 'bg-green-500' },
    { id: 'product-manager', name: 'Product Manager', role: 'User Advocate', icon: Target, color: 'bg-blue-500' },
    { id: 'fintech-architect', name: 'FINTECH Architect', role: 'Digital Alchemist', icon: Brain, color: 'bg-cyan-500' },
    { id: 'code-quality', name: 'Code Quality Guardian', role: 'Integrity Enforcer', icon: Shield, color: 'bg-red-500' },
    { id: 'creative-officer', name: 'Creative Officer', role: 'Aesthetic Architect', icon: Palette, color: 'bg-pink-500' },
    { id: 'brand-storyteller', name: 'Brand Storyteller', role: 'Narrative Weaver', icon: BookOpen, color: 'bg-orange-500' },
    { id: 'financial-modeler', name: 'Financial Modeler', role: 'Quantitative Strategist', icon: Calculator, color: 'bg-yellow-500' },
    { id: 'legal-counsel', name: 'Legal Counsel', role: 'Sentinel of Compliance', icon: Scale, color: 'bg-indigo-500' },
    { id: 'articulator', name: 'The Articulator', role: 'Semantic Architect', icon: MessageSquare, color: 'bg-teal-500' },
];

// Task status data (would come from API in production)
const MOCK_TASKS = [
    { id: 'KILO_TASK_001', name: 'Terminology Sweep', status: 'complete', assignee: 'FINTECH Architect', completedAt: '2025-12-17' },
];

// Sprint data
const SPRINT_DATA = {
    name: 'Authority Inversion & Semantic Compliance',
    progress: 100,
    status: 'Active',
    lastUpdated: new Date().toISOString()
};

export function AICabinetTab() {
    const { toast } = useToast();
    const [selectedSpecialist, setSelectedSpecialist] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePrompt = () => {
        if (!selectedSpecialist || !taskDescription) {
            toast({
                title: "Missing Information",
                description: "Please select a specialist and enter a task description.",
                variant: "destructive"
            });
            return;
        }

        setIsGenerating(true);

        const specialist = SPECIALISTS.find(s => s.id === selectedSpecialist);

        const prompt = `### UNIVERSAL SPECIALIST PROMPT ###

**[ROLE_INVOCATION]** You are a world-class, specialized AI consultant. Your temporary role is **${specialist?.name} — The ${specialist?.role}**. You have been brought into this project mid-stream to execute a single, specific task based on your unique expertise.

**[CONTEXT]** I am providing you with the "Master State Document" (MSD) for this project. This document contains all the critical information, decisions, and context you need.

---

### Project Context

**Project:** SOVR Ecosystem (Sovereign Stack)
**Repository:** d:/SOVR_Development_Holdings_LLC/The Soverign Stack

**Key Doctrine - Sovereign Semantic Model:**
- TigerBeetle = Sole clearing authority (immutable)
- PostgreSQL = Narrative mirror (observation only)
- Stripe/ACH = Honoring adapters (no clearing authority)
- Clearing-First: All obligations clear in TigerBeetle BEFORE external systems
- No Reversals: Adjustments are NEW obligations, never reversals

---

**[TASK]** 
${taskDescription}

**[HANDOFF]**
When complete, update the Master State Document at \`.agent/MASTER_STATE_DOCUMENT.md\` with your session marker and completion status.

---

You will now state your specialization and execute to the best of your ability.`;

        setTimeout(() => {
            setGeneratedPrompt(prompt);
            setIsGenerating(false);
            toast({
                title: "Prompt Generated",
                description: "Click 'Copy to Clipboard' to use this prompt.",
            });
        }, 500);
    };

    const copyToClipboard = async () => {
        if (!generatedPrompt) return;

        try {
            await navigator.clipboard.writeText(generatedPrompt);
            toast({
                title: "Copied!",
                description: "Prompt copied to clipboard. Paste it into your AI chat.",
            });
        } catch (err) {
            toast({
                title: "Copy Failed",
                description: "Please select and copy the prompt manually.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Brain className="w-6 h-6 text-purple-500" />
                        AI Cabinet Console
                    </h2>
                    <p className="text-muted-foreground">Multi-agent orchestration and task delegation</p>
                </div>
                <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync MSD
                </Button>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            Current Sprint
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-semibold truncate">{SPRINT_DATA.name}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                                    style={{ width: `${SPRINT_DATA.progress}%` }}
                                />
                            </div>
                            <span className="text-sm text-muted-foreground">{SPRINT_DATA.progress}%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-400" />
                            Cabinet Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{SPECIALISTS.length}</div>
                        <p className="text-sm text-muted-foreground">Specialists Available</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <FileText className="w-4 h-4 text-cyan-400" />
                            Task Queue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{MOCK_TASKS.filter(t => t.status === 'complete').length}</div>
                        <p className="text-sm text-muted-foreground">Tasks Completed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Specialists Grid */}
            <Card className="border-white/10 bg-black/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Cabinet Specialists
                    </CardTitle>
                    <CardDescription>Select a specialist to generate a handoff prompt</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {SPECIALISTS.map((specialist) => {
                            const Icon = specialist.icon;
                            const isSelected = selectedSpecialist === specialist.id;
                            return (
                                <button
                                    key={specialist.id}
                                    onClick={() => setSelectedSpecialist(specialist.id)}
                                    className={`p-3 rounded-lg border transition-all text-left ${isSelected
                                            ? 'border-purple-500 bg-purple-500/20'
                                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg ${specialist.color} flex items-center justify-center mb-2`}>
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="font-medium text-sm truncate">{specialist.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{specialist.role}</div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Prompt Generator */}
            <Card className="border-white/10 bg-black/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        Prompt Generator
                    </CardTitle>
                    <CardDescription>Generate a Universal Specialist Prompt for cross-model handoffs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Selected Specialist</label>
                            <Select value={selectedSpecialist} onValueChange={setSelectedSpecialist}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a specialist..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {SPECIALISTS.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name} — {s.role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Task Description</label>
                            <Textarea
                                placeholder="Describe the task for this specialist..."
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                className="min-h-[80px] bg-black/30 border-white/10"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={generatePrompt}
                            disabled={isGenerating}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Prompt
                                </>
                            )}
                        </Button>
                        {generatedPrompt && (
                            <Button variant="outline" onClick={copyToClipboard}>
                                <Clipboard className="w-4 h-4 mr-2" />
                                Copy to Clipboard
                            </Button>
                        )}
                    </div>

                    {generatedPrompt && (
                        <div className="mt-4 p-4 bg-black/40 rounded-lg border border-white/10 max-h-64 overflow-y-auto">
                            <pre className="text-xs whitespace-pre-wrap font-mono text-slate-300">{generatedPrompt}</pre>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Task Queue */}
            <Card className="border-white/10 bg-black/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Task Queue
                    </CardTitle>
                    <CardDescription>Active and completed task delegations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {MOCK_TASKS.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No tasks in queue</p>
                            </div>
                        ) : (
                            MOCK_TASKS.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                                >
                                    <div className="flex items-center gap-3">
                                        {task.status === 'complete' ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : task.status === 'in-progress' ? (
                                            <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-slate-400" />
                                        )}
                                        <div>
                                            <div className="font-medium">{task.name}</div>
                                            <div className="text-xs text-muted-foreground">{task.id} • {task.assignee}</div>
                                        </div>
                                    </div>
                                    <Badge variant={task.status === 'complete' ? 'default' : 'secondary'}>
                                        {task.status}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                    <FileText className="w-5 h-5" />
                    <span className="text-xs">View MSD</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                    <Users className="w-5 h-5" />
                    <span className="text-xs">Specialist Profiles</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs">Constitution</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs">Handoff Protocol</span>
                </Button>
            </div>
        </div>
    );
}
