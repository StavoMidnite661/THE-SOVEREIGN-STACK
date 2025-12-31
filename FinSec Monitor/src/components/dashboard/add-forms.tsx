"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMonitoringStore } from '@/store/monitoring-store';
import { useToast } from '@/hooks/use-toast';
import { Server, Globe, Webhook, Users, Zap } from 'lucide-react';

// ============ ADD SERVER FORM ============
interface AddServerFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddServerForm({ open, onOpenChange }: AddServerFormProps) {
    const { addServer } = useMonitoringStore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        host: '',
        port: '80',
        type: 'HTTP',
        description: '',
        tags: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const success = await addServer({
                name: formData.name,
                host: formData.host,
                port: parseInt(formData.port),
                type: formData.type as any,
                description: formData.description,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            });

            if (success) {
                toast({ title: "Server Added", description: `${formData.name} has been added to monitoring.` });
                onOpenChange(false);
                setFormData({ name: '', host: '', port: '80', type: 'HTTP', description: '', tags: '' });
            } else {
                toast({ title: "Error", description: "Failed to add server.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-blue-500" />
                        Add New Server
                    </DialogTitle>
                    <DialogDescription>Configure a new server for monitoring.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Server Name</Label>
                            <Input
                                id="name"
                                placeholder="Production API"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HTTP">HTTP</SelectItem>
                                    <SelectItem value="HTTPS">HTTPS</SelectItem>
                                    <SelectItem value="TCP">TCP</SelectItem>
                                    <SelectItem value="UDP">UDP</SelectItem>
                                    <SelectItem value="SSH">SSH</SelectItem>
                                    <SelectItem value="DATABASE">Database</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="host">Host</Label>
                            <Input
                                id="host"
                                placeholder="api.example.com"
                                value={formData.host}
                                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="port">Port</Label>
                            <Input
                                id="port"
                                type="number"
                                placeholder="80"
                                value={formData.port}
                                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Brief description of this server..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                            id="tags"
                            placeholder="production, api, critical"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-500 to-cyan-400">
                            {isSubmitting ? 'Adding...' : 'Add Server'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ============ ADD APPLICATION FORM ============
interface AddAppFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddAppForm({ open, onOpenChange }: AddAppFormProps) {
    const { servers, fetchApplications } = useMonitoringStore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'WEB',
        endpoint: '',
        serverId: '',
        description: '',
        tags: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    type: formData.type,
                    endpoint: formData.endpoint,
                    serverId: formData.serverId,
                    description: formData.description,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
                })
            });

            if (response.ok) {
                await fetchApplications();
                toast({ title: "Application Added", description: `${formData.name} has been added.` });
                onOpenChange(false);
                setFormData({ name: '', type: 'WEB', endpoint: '', serverId: '', description: '', tags: '' });
            } else {
                toast({ title: "Error", description: "Failed to add application.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-500" />
                        Add New Application
                    </DialogTitle>
                    <DialogDescription>Add an application to monitor.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="app-name">Application Name</Label>
                            <Input
                                id="app-name"
                                placeholder="User Service"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="app-type">Type</Label>
                            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WEB">Web App</SelectItem>
                                    <SelectItem value="API">API Service</SelectItem>
                                    <SelectItem value="DATABASE">Database</SelectItem>
                                    <SelectItem value="MICROSERVICE">Microservice</SelectItem>
                                    <SelectItem value="WEBHOOK">Webhook Handler</SelectItem>
                                    <SelectItem value="CRON">Cron Job</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endpoint">Endpoint URL</Label>
                        <Input
                            id="endpoint"
                            placeholder="https://api.example.com/health"
                            value={formData.endpoint}
                            onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="server">Parent Server</Label>
                        <Select value={formData.serverId} onValueChange={(v) => setFormData({ ...formData, serverId: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select server" />
                            </SelectTrigger>
                            <SelectContent>
                                {servers.map((server) => (
                                    <SelectItem key={server.id} value={server.id}>{server.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="app-tags">Tags (comma-separated)</Label>
                        <Input
                            id="app-tags"
                            placeholder="backend, nodejs, critical"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || !formData.serverId} className="bg-gradient-to-r from-purple-500 to-pink-400">
                            {isSubmitting ? 'Adding...' : 'Add Application'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ============ ADD ENDPOINT FORM ============
interface AddEndpointFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddEndpointForm({ open, onOpenChange }: AddEndpointFormProps) {
    const { applications, fetchApiEndpoints } = useMonitoringStore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        url: '',
        method: 'GET',
        applicationId: '',
        expectedStatus: '200',
        timeout: '30000',
        interval: '60000'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/api-endpoints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    url: formData.url,
                    method: formData.method,
                    applicationId: formData.applicationId,
                    expectedStatus: parseInt(formData.expectedStatus),
                    timeout: parseInt(formData.timeout),
                    interval: parseInt(formData.interval)
                })
            });

            if (response.ok) {
                await fetchApiEndpoints();
                toast({ title: "Endpoint Added", description: `${formData.name} is now being monitored.` });
                onOpenChange(false);
                setFormData({ name: '', url: '', method: 'GET', applicationId: '', expectedStatus: '200', timeout: '30000', interval: '60000' });
            } else {
                toast({ title: "Error", description: "Failed to add endpoint.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Add API Endpoint
                    </DialogTitle>
                    <DialogDescription>Configure an API endpoint to monitor.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ep-name">Endpoint Name</Label>
                            <Input
                                id="ep-name"
                                placeholder="Health Check"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="method">Method</Label>
                            <Select value={formData.method} onValueChange={(v) => setFormData({ ...formData, method: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                    <SelectItem value="PATCH">PATCH</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                            id="url"
                            placeholder="https://api.example.com/v1/health"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="app">Application</Label>
                        <Select value={formData.applicationId} onValueChange={(v) => setFormData({ ...formData, applicationId: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select application" />
                            </SelectTrigger>
                            <SelectContent>
                                {applications.map((app) => (
                                    <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Expected Status</Label>
                            <Input
                                id="status"
                                type="number"
                                value={formData.expectedStatus}
                                onChange={(e) => setFormData({ ...formData, expectedStatus: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timeout">Timeout (ms)</Label>
                            <Input
                                id="timeout"
                                type="number"
                                value={formData.timeout}
                                onChange={(e) => setFormData({ ...formData, timeout: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="interval">Interval (ms)</Label>
                            <Input
                                id="interval"
                                type="number"
                                value={formData.interval}
                                onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || !formData.applicationId} className="bg-gradient-to-r from-yellow-500 to-orange-400">
                            {isSubmitting ? 'Adding...' : 'Add Endpoint'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ============ ADD WEBHOOK FORM ============
interface AddWebhookFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddWebhookForm({ open, onOpenChange }: AddWebhookFormProps) {
    const { applications, fetchWebhooks } = useMonitoringStore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        url: '',
        applicationId: '',
        events: '',
        secret: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    url: formData.url,
                    applicationId: formData.applicationId,
                    events: formData.events.split(',').map(t => t.trim()).filter(Boolean),
                    secret: formData.secret || undefined
                })
            });

            if (response.ok) {
                await fetchWebhooks();
                toast({ title: "Webhook Added", description: `${formData.name} webhook configured.` });
                onOpenChange(false);
                setFormData({ name: '', url: '', applicationId: '', events: '', secret: '' });
            } else {
                toast({ title: "Error", description: "Failed to add webhook.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Webhook className="w-5 h-5 text-green-500" />
                        Add Webhook
                    </DialogTitle>
                    <DialogDescription>Configure a webhook endpoint.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="wh-name">Webhook Name</Label>
                        <Input
                            id="wh-name"
                            placeholder="Deployment Notification"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wh-url">Webhook URL</Label>
                        <Input
                            id="wh-url"
                            placeholder="https://hooks.slack.com/..."
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wh-app">Application</Label>
                        <Select value={formData.applicationId} onValueChange={(v) => setFormData({ ...formData, applicationId: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select application" />
                            </SelectTrigger>
                            <SelectContent>
                                {applications.map((app) => (
                                    <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="events">Events (comma-separated)</Label>
                        <Input
                            id="events"
                            placeholder="push, deployment, alert"
                            value={formData.events}
                            onChange={(e) => setFormData({ ...formData, events: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="secret">Secret (optional)</Label>
                        <Input
                            id="secret"
                            type="password"
                            placeholder="Optional signing secret"
                            value={formData.secret}
                            onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || !formData.applicationId} className="bg-gradient-to-r from-green-500 to-emerald-400">
                            {isSubmitting ? 'Adding...' : 'Add Webhook'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ============ ADD TEAM MEMBER FORM ============
interface AddTeamMemberFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddTeamMemberForm({ open, onOpenChange }: AddTeamMemberFormProps) {
    const { fetchTeamMembers } = useMonitoringStore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'viewer'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchTeamMembers();
                toast({ title: "Team Member Added", description: `${formData.name} has been invited.` });
                onOpenChange(false);
                setFormData({ name: '', email: '', role: 'viewer' });
            } else {
                toast({ title: "Error", description: "Failed to add team member.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" />
                        Add Team Member
                    </DialogTitle>
                    <DialogDescription>Invite someone to the team.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="member-name">Name</Label>
                        <Input
                            id="member-name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="member-email">Email</Label>
                        <Input
                            id="member-email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-indigo-500 to-purple-400">
                            {isSubmitting ? 'Adding...' : 'Add Member'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
