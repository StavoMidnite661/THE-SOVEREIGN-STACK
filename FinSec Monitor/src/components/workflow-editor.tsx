"use client";

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Play,
  Pause,
  Save,
  Plus,
  Trash2,
  Settings,
  GitBranch,
  Database,
  Webhook,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MoreHorizontal
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'webhook' | 'email' | 'api';
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  status: 'idle' | 'running' | 'completed' | 'failed';
}

interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  condition?: string;
}

interface WorkflowEditorProps {
  workflow?: {
    id: string;
    name: string;
    description?: string;
    definition?: string;
    isActive: boolean;
  };
  onSave?: (workflow: any) => void;
  onExecute?: (workflowId: string) => void;
}

const nodeTypes = [
  { type: 'trigger', label: 'Trigger', icon: Clock, color: 'bg-blue-500' },
  { type: 'action', label: 'Action', icon: Play, color: 'bg-green-500' },
  { type: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-yellow-500' },
  { type: 'delay', label: 'Delay', icon: Clock, color: 'bg-purple-500' },
  { type: 'webhook', label: 'Webhook', icon: Webhook, color: 'bg-indigo-500' },
  { type: 'email', label: 'Email', icon: Mail, color: 'bg-red-500' },
  { type: 'api', label: 'API Call', icon: Database, color: 'bg-orange-500' }
];

export default function WorkflowEditor({ workflow, onSave, onExecute }: WorkflowEditorProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(() => {
    if (workflow?.definition) {
      try {
        const def = JSON.parse(workflow.definition);
        return def.nodes || [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [connections, setConnections] = useState<WorkflowConnection[]>(() => {
    if (workflow?.definition) {
      try {
        const def = JSON.parse(workflow.definition);
        return def.connections || [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState(workflow?.name || '');
  const [workflowDescription, setWorkflowDescription] = useState(workflow?.description || '');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleAddNode = (type: string) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: type as any,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodes.length + 1}`,
      config: {},
      position: { x: 100 + (nodes.length % 4) * 150, y: 100 + Math.floor(nodes.length / 4) * 100 },
      status: 'idle'
    };
    setNodes([...nodes, newNode]);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleNodeDragStart = (nodeId: string) => {
    setIsDragging(true);
    setDraggedNode(nodeId);
  };

  const handleNodeDrag = (e: React.MouseEvent) => {
    if (!isDragging || !draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(nodes.map(node =>
      node.id === draggedNode
        ? { ...node, position: { x, y } }
        : node
    ));
  };

  const handleNodeDragEnd = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const handleNodeClick = (nodeId: string) => {
    if (connectingFrom) {
      if (connectingFrom !== nodeId) {
        const newConnection: WorkflowConnection = {
          id: `conn-${Date.now()}`,
          from: connectingFrom,
          to: nodeId
        };
        setConnections([...connections, newConnection]);
      }
      setConnectingFrom(null);
    } else {
      setSelectedNode(nodeId);
    }
  };

  const handleStartConnection = (nodeId: string) => {
    setConnectingFrom(nodeId);
    setSelectedNode(null);
  };

  const handleDeleteConnection = (connectionId: string) => {
    setConnections(connections.filter(c => c.id !== connectionId));
  };

  const handleSave = () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      definition: JSON.stringify({
        nodes,
        connections
      })
    };

    if (onSave) {
      onSave(workflowData);
    }
  };

  const handleExecute = () => {
    if (workflow?.id && onExecute) {
      onExecute(workflow.id);
    }
  };

  const updateNodeConfig = (nodeId: string, config: Record<string, any>) => {
    setNodes(nodes.map(node =>
      node.id === nodeId
        ? { ...node, config }
        : node
    ));
  };

  const getNodeIcon = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType ? nodeType.icon : Settings;
  };

  const getNodeColor = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType ? nodeType.color : 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-3 h-3 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'failed': return <XCircle className="w-3 h-3 text-red-600" />;
      default: return <Clock className="w-3 h-3 text-gray-600" />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Workflow Name"
                className="text-lg font-semibold border-none p-0 h-auto"
              />
              <Textarea
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Workflow Description"
                className="text-sm text-slate-600 border-none p-0 h-auto resize-none mt-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleExecute}
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <Play className="w-4 h-4 mr-2" />
              Execute
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r p-4">
          <h3 className="font-semibold mb-4">Node Types</h3>
          <div className="space-y-2">
            {nodeTypes.map((nodeType) => {
              const Icon = nodeType.icon;
              return (
                <Button
                  key={nodeType.type}
                  variant="outline"
                  className="w-full justify-start border-slate-300 bg-white text-slate-900 hover:bg-slate-100 mb-2 font-medium shadow-sm"
                  onClick={() => handleAddNode(nodeType.type)}
                >
                  <div className={`w-4 h-4 rounded ${nodeType.color} mr-2 ring-1 ring-slate-200`} />
                  <Icon className="w-4 h-4 mr-2 text-slate-700" />
                  {nodeType.label}
                </Button>
              );
            })}
          </div>

          {selectedNode && (
            <div className="mt-6">
              <h3 className="font-semibold mb-4">Node Configuration</h3>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {nodes.find(n => n.id === selectedNode)?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={nodes.find(n => n.id === selectedNode)?.name || ''}
                      onChange={(e) => {
                        const node = nodes.find(n => n.id === selectedNode);
                        if (node) {
                          updateNodeConfig(selectedNode, { ...node.config, name: e.target.value });
                          setNodes(nodes.map(n =>
                            n.id === selectedNode
                              ? { ...n, name: e.target.value }
                              : n
                          ));
                        }
                      }}
                    />
                  </div>

                  {/* Add more configuration options based on node type */}
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={nodes.find(n => n.id === selectedNode)?.type || ''}
                      onValueChange={(value) => {
                        setNodes(nodes.map(n =>
                          n.id === selectedNode
                            ? { ...n, type: value as any }
                            : n
                        ));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {nodeTypes.map((nt) => (
                          <SelectItem key={nt.type} value={nt.type}>
                            {nt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDeleteNode(selectedNode)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Node
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative bg-slate-100 overflow-hidden"
          onMouseMove={handleNodeDrag}
          onMouseUp={handleNodeDragEnd}
        >
          {/* Grid Background */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />

          {/* Connections */}
          <svg className="absolute inset-0 pointer-events-none">
            {connections.map((connection) => {
              const fromNode = nodes.find(n => n.id === connection.from);
              const toNode = nodes.find(n => n.id === connection.to);

              if (!fromNode || !toNode) return null;

              return (
                <g key={connection.id}>
                  <line
                    x1={fromNode.position.x + 60}
                    y1={fromNode.position.y + 30}
                    x2={toNode.position.x + 60}
                    y2={toNode.position.y + 30}
                    stroke="#64748b"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <circle
                    cx={(fromNode.position.x + toNode.position.x) / 2 + 60}
                    cy={(fromNode.position.y + toNode.position.y) / 2 + 30}
                    r="8"
                    fill="white"
                    stroke="#64748b"
                    strokeWidth="2"
                    className="pointer-events-auto cursor-pointer"
                    onClick={() => handleDeleteConnection(connection.id)}
                  />
                  <text
                    x={(fromNode.position.x + toNode.position.x) / 2 + 60}
                    y={(fromNode.position.y + toNode.position.y) / 2 + 35}
                    textAnchor="middle"
                    className="text-xs pointer-events-none"
                  >
                    ×
                  </text>
                </g>
              );
            })}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#64748b"
                />
              </marker>
            </defs>
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const Icon = getNodeIcon(node.type);
            return (
              <div
                key={node.id}
                className={`absolute cursor-move ${selectedNode === node.id ? 'ring-2 ring-blue-500' : ''} ${connectingFrom === node.id ? 'ring-2 ring-green-500' : ''}`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: '120px'
                }}
                onMouseDown={() => handleNodeDragStart(node.id)}
                onClick={() => handleNodeClick(node.id)}
              >
                <Card className="shadow-lg">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded ${getNodeColor(node.type)} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      {getStatusIcon(node.status)}
                    </div>
                    <div className="text-xs font-medium truncate">{node.name}</div>
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartConnection(node.id);
                        }}
                      >
                        <GitBranch className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(node.id);
                        }}
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {connectingFrom && (
            <div className="absolute top-4 left-4 bg-green-100 border border-green-300 rounded-lg p-3">
              <p className="text-sm text-green-800">
                Click on another node to create a connection, or press ESC to cancel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}