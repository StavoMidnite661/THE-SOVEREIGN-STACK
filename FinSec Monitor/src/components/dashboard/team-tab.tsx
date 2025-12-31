"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Users,
    Mail,
    MoreVertical,
    Plus
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMonitoringStore } from '@/store/monitoring-store';

import { useToast } from '@/hooks/use-toast';

interface TeamTabProps {
    onAddMember: () => void;
}

export function TeamTab({ onAddMember }: TeamTabProps) {
    const { teamMembers, fetchTeamMembers } = useMonitoringStore();
    const { toast } = useToast();

    const handleEditRole = (id: string) => {
        toast({ title: "Edit Role", description: "Role editing dialog would open here." });
    };

    const handleViewActivity = (id: string) => {
        toast({ title: "Activity", description: "Fetching user activity log..." });
    };

    const handleRemove = async (id: string) => {
        try {
            await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
            toast({ title: "Removed", description: "Team member removed." });
            fetchTeamMembers(); // Refresh list
        } catch (e) {
            toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Team Management</h3>
                <Button
                    onClick={onAddMember}
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                    <Card key={member.id}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base">{member.name}</CardTitle>
                                        <CardDescription className="text-xs">{member.role}</CardDescription>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditRole(member.id)}>Edit Role</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleViewActivity(member.id)}>View Activity</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleRemove(member.id)}>Remove</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Mail className="w-4 h-4" />
                                        <span>Email</span>
                                    </div>
                                    <span className="text-xs">{member.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Users className="w-4 h-4" />
                                        <span>Status</span>
                                    </div>
                                    <Badge variant={member.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                                        {member.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
