'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Database,
  FileX,
  HelpCircle,
  Info,
  Lock,
  Network,
  RefreshCw,
  Shield,
  TrendingDown,
  Users,
  XCircle
} from 'lucide-react';
import { useState } from 'react';

interface ErrorScenario {
  id: string;
  title: string;
  category: 'mechanical_truth' | 'attestation' | 'external_agent' | 'network' | 'validation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  sovMessage: string;
  recoveryOptions: RecoveryOption[];
  noOverridesNote: string;
  exampleCode?: string;
}

interface RecoveryOption {
  id: string;
  label: string;
  description: string;
  action: () => void;
  isRecommended?: boolean;
  requiresNewObligation?: boolean;
}

interface ErrorHandlingWithoutOverridesProps {
  onCreateNewObligation: () => void;
  onContactAgent: (agentId: string) => void;
  onRetryAttestation: () => void;
  className?: string;
}

export default function ErrorHandlingWithoutOverrides({
  onCreateNewObligation,
  onContactAgent,
  onRetryAttestation,
  className = '',
}: ErrorHandlingWithoutOverridesProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>('tigerbeetle-failure');
  const [isProcessing, setIsProcessing] = useState(false);

  const errorScenarios: ErrorScenario[] = [
    {
      id: 'tigerbeetle-failure',
      title: 'TigerBeetle Mechanical Truth Failure',
      category: 'mechanical_truth',
      severity: 'critical',
      description: 'TigerBeetle cluster fails to clear obligation, preventing mechanical truth validation.',
      sovMessage: 'TigerBeetle mechanical truth clearing failed. This obligation was not fulfilled.',
      recoveryOptions: [
        {
          id: 'retry-clearing',
          label: 'Retry Mechanical Clearing',
          description: 'Attempt to clear the obligation again through TigerBeetle',
          action: () => console.log('Retrying mechanical clearing'),
          isRecommended: true
        },
        {
          id: 'new-obligation',
          label: 'Create New Obligation',
          description: 'Start fresh with a new obligation for the same purpose',
          action: onCreateNewObligation,
          requiresNewObligation: true
        },
        {
          id: 'contact-agent',
          label: 'Contact Honoring Agent',
          description: 'Reach out to the external agent for status updates',
          action: () => onContactAgent('agent-id')
        }
      ],
      noOverridesNote: 'SOVR operates on mechanical truth. No manual corrections or balance edits are possible. TigerBeetle clearing is the source of truth.',
      exampleCode: `// TigerBeetle failure response
{
  "status": "mechanical_truth_failed",
  "error": "TigerBeetle cluster unavailable",
  "message": "Obligation clearing requires mechanical validation",
  "recovery": "Create new obligation or retry clearing"
}`
    },
    {
      id: 'attestation-failure',
      title: 'EIP-712 Attestation Validation Failed',
      category: 'attestation',
      severity: 'high',
      description: 'User-provided attestation fails cryptographic validation or has expired.',
      sovMessage: 'Attestation validation failed. Obligation authorization requires valid cryptographic proof.',
      recoveryOptions: [
        {
          id: 'regenerate-attestation',
          label: 'Generate New Attestation',
          description: 'Create a fresh EIP-712 attestation with current timestamp',
          action: onRetryAttestation,
          isRecommended: true
        },
        {
          id: 'check-wallet',
          label: 'Verify Wallet Connection',
          description: 'Ensure wallet is connected and has sufficient balance',
          action: () => console.log('Checking wallet connection')
        },
        {
          id: 'new-obligation',
          label: 'Create New Obligation',
          description: 'Start the authorization process from the beginning',
          action: onCreateNewObligation,
          requiresNewObligation: true
        }
      ],
      noOverridesNote: 'Attestation is cryptographic proof, not administrative permission. No manual overrides are possible.',
      exampleCode: `// Attestation failure response
{
  "status": "attestation_invalid",
  "error": "EIP-712 signature verification failed",
  "message": "Cryptographic proof required for authorization",
  "recovery": "Generate new attestation with valid signature"
}`
    },
    {
      id: 'agent-offline',
      title: 'External Honoring Agent Unavailable',
      category: 'external_agent',
      severity: 'medium',
      description: 'Selected honoring agent is offline or experiencing service disruptions.',
      sovMessage: 'Honoring agent unavailable. External services are optional and not guaranteed.',
      recoveryOptions: [
        {
          id: 'try-alternative-agent',
          label: 'Select Alternative Agent',
          description: 'Choose a different honoring agent for this obligation',
          action: () => console.log('Opening agent selector'),
          isRecommended: true
        },
        {
          id: 'retry-later',
          label: 'Retry Later',
          description: 'Wait and attempt to honor the obligation when agent is available',
          action: () => console.log('Scheduling retry')
        },
        {
          id: 'direct-sovr',
          label: 'Use Direct SOVR Settlement',
          description: 'Process obligation through SOVR native settlement',
          action: onCreateNewObligation
        }
      ],
      noOverridesNote: 'Honoring agents are optional guests, not authorities. Their availability is not guaranteed.',
      exampleCode: `// Agent offline response
{
  "status": "agent_unavailable",
  "error": "Honoring agent offline",
  "message": "External service temporarily unavailable",
  "recovery": "Select alternative agent or use direct SOVR settlement"
}`
    },
    {
      id: 'network-timeout',
      title: 'Network Timeout During Clearing',
      category: 'network',
      severity: 'medium',
      description: 'Network timeout occurs during TigerBeetle clearing or attestation process.',
      sovMessage: 'Network timeout during mechanical truth validation. Obligation status is pending.',
      recoveryOptions: [
        {
          id: 'check-status',
          label: 'Check Obligation Status',
          description: 'Verify if the obligation was actually processed despite timeout',
          action: () => console.log('Checking obligation status'),
          isRecommended: true
        },
        {
          id: 'retry-clearing',
          label: 'Retry Clearing',
          description: 'Attempt to clear the obligation again',
          action: () => console.log('Retrying clearing')
        },
        {
          id: 'new-obligation',
          label: 'Create New Obligation',
          description: 'Start fresh if status check shows failure',
          action: onCreateNewObligation,
          requiresNewObligation: true
        }
      ],
      noOverridesNote: 'Network issues are external factors. SOVR cannot override network timeouts.',
      exampleCode: `// Network timeout response
{
  "status": "network_timeout",
  "error": "Connection timeout during clearing",
  "message": "Obligation status uncertain - check status",
  "recovery": "Verify status or create new obligation"
}`
    },
    {
      id: 'validation-error',
      title: 'Input Validation Error',
      category: 'validation',
      severity: 'low',
      description: 'User input fails validation requirements for obligation creation.',
      sovMessage: 'Invalid input provided. Obligation authorization requires valid data.',
      recoveryOptions: [
        {
          id: 'correct-input',
          label: 'Correct Input',
          description: 'Fix the invalid fields and resubmit',
          action: () => console.log('Opening form for correction'),
          isRecommended: true
        },
        {
          id: 'view-requirements',
          label: 'View Requirements',
          description: 'See detailed input requirements and validation rules',
          action: () => console.log('Showing requirements')
        }
      ],
      noOverridesNote: 'Validation errors require correct input. No administrative overrides are possible.',
      exampleCode: `// Validation error response
{
  "status": "validation_failed",
  "error": "Invalid wallet address format",
  "message": "Authorization requires valid EVM address",
  "recovery": "Provide valid wallet address for attestation"
}`
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mechanical_truth': return <Database className="h-4 w-4" />;
      case 'attestation': return <Shield className="h-4 w-4" />;
      case 'external_agent': return <Users className="h-4 w-4" />;
      case 'network': return <Network className="h-4 w-4" />;
      case 'validation': return <FileX className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleRecoveryAction = async (option: RecoveryOption) => {
    setIsProcessing(true);
    try {
      await option.action();
    } catch (error) {
      console.error('Recovery action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentScenario = errorScenarios.find(s => s.id === selectedScenario);

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* SOVR Doctrine Header */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>SOVR Error Handling Doctrine:</strong> All errors respect mechanical truth and sovereignty principles. 
          No overrides, no manual corrections, no administrative fixes. <em>New obligations, not edits.</em>
        </AlertDescription>
      </Alert>

      {/* Error Scenarios Overview */}
      <Card className="border-2 border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Error Scenarios & Recovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {errorScenarios.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedScenario === scenario.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(scenario.category)}
                    <span className="text-sm font-medium">{scenario.title}</span>
                  </div>
                  {getSeverityBadge(scenario.severity)}
                </div>
                <p className="text-xs text-gray-600">{scenario.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Scenario Details */}
      {currentScenario && (
        <Card className="border-2 border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(currentScenario.category)}
              {currentScenario.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getSeverityBadge(currentScenario.severity)}
              <Badge variant="outline" className="text-xs">
                {currentScenario.category.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* SOVR Error Message */}
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>SOVR Error Message:</strong> {currentScenario.sovMessage}
              </AlertDescription>
            </Alert>

            {/* Recovery Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recovery Options:</h4>
              <div className="space-y-2">
                {currentScenario.recoveryOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg border ${
                      option.isRecommended ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{option.label}</span>
                          {option.isRecommended && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              Recommended
                            </Badge>
                          )}
                          {option.requiresNewObligation && (
                            <Badge variant="outline" className="text-xs">
                              New Obligation Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <Button
                        onClick={() => handleRecoveryAction(option)}
                        disabled={isProcessing}
                        size="sm"
                        variant={option.isRecommended ? "default" : "outline"}
                      >
                        {isProcessing ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          'Execute'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* No Overrides Note */}
            <Alert className="border-amber-200 bg-amber-50">
              <Lock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>No Overrides Policy:</strong> {currentScenario.noOverridesNote}
              </AlertDescription>
            </Alert>

            {/* Example Code */}
            {currentScenario.exampleCode && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">API Response Example:</h4>
                <pre className="p-3 bg-gray-100 rounded-lg text-sm overflow-x-auto">
                  <code>{currentScenario.exampleCode}</code>
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* General Error Handling Principles */}
      <Tabs defaultValue="principles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="principles">Principles</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="principles" className="mt-6">
          <Card className="border-2 border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                SOVR Error Handling Principles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Mechanical Truth Only</h4>
                      <p className="text-sm text-gray-600">All balances and states are determined by TigerBeetle clearing, not manual adjustments.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">No Administrative Overrides</h4>
                      <p className="text-sm text-gray-600">No user, admin, or system can override mechanical truth or reverse transactions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">New Obligations, Not Edits</h4>
                      <p className="text-sm text-gray-600">Corrections require creating new obligations, never editing existing ones.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">External Agent Optionality</h4>
                      <p className="text-sm text-gray-600">Honoring agents are optional guests, not authorities. Their failures are expected.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Attestation Requirements</h4>
                      <p className="text-sm text-gray-600">All obligations require cryptographic proof. No manual authorizations.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Transparent Error Messaging</h4>
                      <p className="text-sm text-gray-600">Errors clearly explain limitations without promising fixes that violate sovereignty.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="mt-6">
          <Card className="border-2 border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Error Response Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Mechanical Truth Failure</h4>
                  <pre className="text-xs bg-gray-50 p-2 rounded">
{`{
  "status": "mechanical_truth_failed",
  "error": "TigerBeetle clearing unavailable",
  "message": "Obligation not fulfilled - no manual correction possible",
  "recovery": ["retry_clearing", "new_obligation"],
  "sov_compliant": true
}`}
                  </pre>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Attestation Failure</h4>
                  <pre className="text-xs bg-gray-50 p-2 rounded">
{`{
  "status": "attestation_invalid",
  "error": "EIP-712 signature verification failed",
  "message": "Cryptographic proof required for authorization",
  "recovery": ["regenerate_attestation", "new_obligation"],
  "sov_compliant": true
}`}
                  </pre>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">External Agent Unavailable</h4>
                  <pre className="text-xs bg-gray-50 p-2 rounded">
{`{
  "status": "agent_unavailable",
  "error": "Honoring agent offline",
  "message": "External service optional and not guaranteed",
  "recovery": ["alternative_agent", "direct_sovr"],
  "sov_compliant": true
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="mt-6">
          <Card className="border-2 border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Real-World Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Example 1:</strong> User attempts to pay for groceries but TigerBeetle is down. 
                    Error message: "TigerBeetle mechanical truth clearing failed. Create new obligation or try alternative honoring agent."
                  </AlertDescription>
                </Alert>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Example 2:</strong> User's attestation expires during mobile checkout. 
                    Error message: "Attestation expired. Generate new cryptographic proof or restart authorization."
                  </AlertDescription>
                </Alert>

                <Alert className="border-red-200 bg-red-50">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Example 3:</strong> Utility payment through Instacart fails. 
                    Error message: "Honoring agent unavailable. Select alternative agent or use direct SOVR settlement."
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SOVR Doctrine Footer */}
      <Alert className="border-slate-200 bg-slate-50">
        <Shield className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">
          <strong>SOVR Error Handling Doctrine:</strong> All errors respect mechanical truth principles. 
          No overrides, no manual corrections, no administrative fixes. Users create new obligations, never edit existing ones. 
          <em>Truth is mechanical, errors are educational, recovery is optional.</em>
        </AlertDescription>
      </Alert>
    </div>
  );
}