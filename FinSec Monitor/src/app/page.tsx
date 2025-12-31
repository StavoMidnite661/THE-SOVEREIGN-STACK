"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Search,
  RefreshCw,
  Moon,
  Sun,
  Laptop,
  Activity
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Store
import { useMonitoringStore } from '@/store/monitoring-store';

// Components
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { OverviewTab } from '@/components/dashboard/overview-tab';
import { ServersTab } from '@/components/dashboard/servers-tab';
import { ApplicationsTab } from '@/components/dashboard/applications-tab';
import { ApisTab } from '@/components/dashboard/apis-tab';
import { WebhooksTab } from '@/components/dashboard/webhooks-tab';
import { WorkflowsTab } from '@/components/dashboard/workflows-tab';
import { TeamTab } from '@/components/dashboard/team-tab';
import WorkflowEditor from '@/components/workflow-editor';
import AIAnalytics from '@/components/ai-analytics';
import { AddServerForm, AddAppForm, AddEndpointForm, AddWebhookForm, AddTeamMemberForm } from '@/components/dashboard/add-forms';
import { AICabinetTab } from '@/components/dashboard/ai-cabinet-tab';

export default function OperationsDashboard() {
  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Prevent SSR hydration mismatch with next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  // Modals state - ideally these would be handled by each tab component or a modal manager
  // For now we keep placeholders or basic mocks to ensure compilation
  const [showServerForm, setShowServerForm] = useState(false);
  const [showAppForm, setShowAppForm] = useState(false);
  const [showEndpointForm, setShowEndpointForm] = useState(false);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);

  const {
    fetchAll,
    isLoading,
    lastUpdated,
    alerts,
    isConnected,
    addWorkflow
  } = useMonitoringStore();

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;

  useEffect(() => {
    // Initial fetch
    fetchAll();

    // Polling interval (backup for WebSockets)
    const interval = setInterval(() => {
      fetchAll();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAll]);

  if (showWorkflowForm) {
    return (
      <WorkflowEditor
        onSave={async (workflow) => {
          await addWorkflow({
            ...workflow,
            isActive: true
          });
          setShowWorkflowForm(false);
          toast({
            title: "Workflow Created",
            description: "The workflow has been saved successfully."
          });
        }}
        onExecute={(id) => {
          console.log("Execute workflow", id);
        }}
      />
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAll();
    setTimeout(() => setIsRefreshing(false), 500);
    toast({
      title: "Refreshed",
      description: "Dashboard data updated successfully.",
    });
  };

  // Prevent SSR rendering - wait for client hydration
  if (!mounted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading FinSec Monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative text-white transition-colors duration-300">
      {/* Dark Horizon Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #000000 40%, #0d1a36 100%)",
        }}
      />
      <div className="relative z-10">
        <Toaster />

        {/* Top Navigation Bar */}
        <div className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-4 max-w-7xl mx-auto justify-between">
            <div className="flex items-center gap-2 font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Activity className="w-5 h-5" />
              </div>
              FinSec Monitor
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'}`}></span>
                System Status: {isConnected ? 'Live' : 'Connecting...'}
                <span className="mx-1">•</span>
                Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
              </div>

              <div className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  {criticalAlerts > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  )}
                </Button>
                {criticalAlerts > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 rounded-full text-[10px]">
                    {criticalAlerts}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex relative">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64 h-9 bg-slate-100 dark:bg-slate-800 border-none"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-9"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="mr-2 h-4 w-4" /> Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="mr-2 h-4 w-4" /> Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Laptop className="mr-2 h-4 w-4" /> System
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 space-y-6">
          {/* KPI Cards */}
          <SummaryCards />

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full h-auto p-1 grid grid-cols-5 md:grid-cols-10 bg-black/40 border border-white/10 backdrop-blur-sm">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="servers">Servers</TabsTrigger>
              <TabsTrigger value="applications">Apps</TabsTrigger>
              <TabsTrigger value="apis">APIs</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="ai-analytics">AI</TabsTrigger>
              <TabsTrigger value="ai-cabinet" className="bg-purple-500/20 border-purple-500/30">🤖 Cabinet</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="servers" className="space-y-4">
              <ServersTab onAddServer={() => setShowServerForm(true)} />
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              <ApplicationsTab onAddApp={() => setShowAppForm(true)} />
            </TabsContent>

            <TabsContent value="apis" className="space-y-4">
              <ApisTab onAddEndpoint={() => setShowEndpointForm(true)} />
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4">
              <WebhooksTab onAddWebhook={() => setShowWebhookForm(true)} />
            </TabsContent>

            <TabsContent value="workflows" className="space-y-4">
              <WorkflowsTab onAddWorkflow={() => setShowWorkflowForm(true)} />
            </TabsContent>

            <TabsContent value="ai-analytics" className="space-y-4">
              <AIAnalytics />
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <TeamTab onAddMember={() => setShowTeamForm(true)} />
            </TabsContent>

            <TabsContent value="ai-cabinet" className="space-y-4">
              <AICabinetTab />
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
                <div className="text-xl font-medium mb-2">Export Data</div>
                <p className="text-muted-foreground mb-4">Download system reports and logs</p>
                <div className="flex gap-4">
                  <Button variant="outline">Download PDF Report</Button>
                  <Button variant="outline">Export CSV Logs</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Form Dialogs */}
      <AddServerForm open={showServerForm} onOpenChange={setShowServerForm} />
      <AddAppForm open={showAppForm} onOpenChange={setShowAppForm} />
      <AddEndpointForm open={showEndpointForm} onOpenChange={setShowEndpointForm} />
      <AddWebhookForm open={showWebhookForm} onOpenChange={setShowWebhookForm} />
      <AddTeamMemberForm open={showTeamForm} onOpenChange={setShowTeamForm} />
    </div>
  );
}