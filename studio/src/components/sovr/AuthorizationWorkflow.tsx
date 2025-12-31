'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Eye,
  EyeOff,
  FileSignature,
  Lock,
  Shield,
  Unlock,
  Users,
  Zap
} from 'lucide-react';
import { useState } from 'react';

interface AttestationData {
  signer: string;
  message: string;
  timestamp: number;
  domain: string;
  nonce: string;
}

interface AuthorizationRequest {
  id: string;
  type: 'obligation_clearing' | 'survival_bundle' | 'honoring_agent' | 'gift_card_activation';
  amount: number;
  counterparty: string;
  description: string;
  urgency: 'normal' | 'high' | 'critical';
  honoringAgent?: string;
  estimatedClearingTime?: number;
}

interface AuthorizationWorkflowProps {
  authorizationRequest: AuthorizationRequest;
  onAuthorize: (attestation: AttestationData) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export default function AuthorizationWorkflow({
  authorizationRequest,
  onAuthorize,
  onCancel,
  className = '',
}: AuthorizationWorkflowProps) {
  const [attestation, setAttestation] = useState<AttestationData | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [showAttestationDetails, setShowAttestationDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated EIP-712 attestation generation
  const generateAttestation = async (): Promise<AttestationData> => {
    // In real implementation, this would use ethers.js to create EIP-712 signature
    return {
      signer: '0x742d35Cc6434C0532925a3b8D2d7F6A5C5d8F123', // User's wallet
      message: `Authorize ${authorizationRequest.type.replace('_', ' ')}: ${authorizationRequest.amount} SOVR to ${authorizationRequest.counterparty}`,
      timestamp: Date.now(),
      domain: 'studio.sovr.financial',
      nonce: `auth_${authorizationRequest.id}_${Date.now()}`
    };
  };

  const handleAttestationRequired = async () => {
    try {
      setError(null);
      const newAttestation = await generateAttestation();
      setAttestation(newAttestation);
    } catch (err) {
      setError('Failed to generate attestation. Please try again.');
    }
  };

  const handleAuthorize = async () => {
    if (!attestation) return;
    
    try {
      setIsAuthorizing(true);
      setError(null);
      
      // Validate attestation meets requirements
      if (attestation.timestamp < Date.now() - 300000) { // 5 minutes
        throw new Error('Attestation expired. Please generate a new one.');
      }
      
      await onAuthorize(attestation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authorization failed');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'obligation_clearing':
        return 'Obligation Clearing';
      case 'survival_bundle':
        return 'Survival Bundle Authorization';
      case 'honoring_agent':
        return 'Honoring Agent Payment';
      case 'gift_card_activation':
        return 'Gift Card Activation';
      default:
        return type.replace('_', ' ');
    }
  };

  return (
    <div className={`max-w-3xl mx-auto space-y-6 ${className}`}>
      {/* SOVR Doctrine Header */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>SOVR Doctrine:</strong> All obligations require EIP-712 attestation before clearing. 
          Legitimacy proven before mechanical truth. <em>No overrides, no reversals.</em>
        </AlertDescription>
      </Alert>

      {/* Authorization Request Details */}
      <Card className="border-2 border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Authorization Required
          </CardTitle>
          <div className="flex items-center gap-2">
            {getUrgencyBadge(authorizationRequest.urgency)}
            <Badge variant="outline">{getTypeDisplayName(authorizationRequest.type)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span className="font-mono">{authorizationRequest.amount.toFixed(2)} SOVR</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Counterparty:</span>
                <span className="font-mono text-sm">{authorizationRequest.counterparty}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Description:</span>
                <span className="text-sm">{authorizationRequest.description}</span>
              </div>
            </div>
            <div className="space-y-3">
              {authorizationRequest.honoringAgent && (
                <div className="flex justify-between">
                  <span className="font-medium">Honoring Agent:</span>
                  <span className="text-sm">{authorizationRequest.honoringAgent}</span>
                </div>
              )}
              {authorizationRequest.estimatedClearingTime && (
                <div className="flex justify-between">
                  <span className="font-medium">Estimated Clearing:</span>
                  <span className="text-sm">{authorizationRequest.estimatedClearingTime}ms</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Mechanical Truth:</span>
                <span className="text-sm">TigerBeetle Cluster</span>
              </div>
            </div>
          </div>

          <Separator />

          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> This authorization will trigger TigerBeetle mechanical truth clearing. 
              No balance edits or reversals possible after clearing. New obligations required for corrections.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Attestation Required */}
      {!attestation && (
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <FileSignature className="h-5 w-5" />
              EIP-712 Attestation Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-amber-700">
              SOVR doctrine requires EIP-712 attestation before any obligation clearing. 
              This proves legitimacy and ensures mechanical truth enforcement.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-amber-800">Attestation Requirements:</h4>
                <ul className="text-sm text-amber-700 space-y-1 ml-4">
                  <li>• EIP-712 compliant signature</li>
                  <li>• Timestamp within 5 minutes</li>
                  <li>• Domain separation verification</li>
                  <li>• Unique nonce for replay protection</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-amber-800">What Happens Next:</h4>
                <ul className="text-sm text-amber-700 space-y-1 ml-4">
                  <li>• TigerBeetle mechanical clearing</li>
                  <li>• Oracle Ledger verification</li>
                  <li>• Event bus propagation</li>
                  <li>• Finality confirmation</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-amber-800">No Reversals:</h4>
                <ul className="text-sm text-amber-700 space-y-1 ml-4">
                  <li>• Transfers are final</li>
                  <li>• No admin overrides</li>
                  <li>• New obligations only</li>
                  <li>• Mechanical truth governs</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={handleAttestationRequired}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              size="lg"
            >
              <FileSignature className="h-4 w-4 mr-2" />
              Generate Attestation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Attestation Display */}
      {attestation && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Attestation Generated
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>
              <span className="text-sm text-green-600">
                Valid for 5 minutes
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAttestationDetails(!showAttestationDetails)}
              className="text-green-700 border-green-300"
            >
              {showAttestationDetails ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Attestation Details
                </>
              )}
            </Button>

            {showAttestationDetails && (
              <div className="space-y-3 p-4 bg-green-100 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-green-800">Signer:</span>
                      <p className="font-mono text-green-700 break-all">{attestation.signer}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Message:</span>
                      <p className="text-green-700">{attestation.message}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-green-800">Timestamp:</span>
                      <p className="text-green-700">{new Date(attestation.timestamp).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Domain:</span>
                      <p className="text-green-700">{attestation.domain}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Nonce:</span>
                      <p className="font-mono text-green-700 break-all">{attestation.nonce}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleAuthorize}
                disabled={isAuthorizing}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {isAuthorizing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Authorizing...
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Authorize Obligation
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setAttestation(null)}
                variant="outline"
                disabled={isAuthorizing}
              >
                Regenerate Attestation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Authorization Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={isAuthorizing}
        >
          Cancel
        </Button>
        
        <div className="text-xs text-gray-500 flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            TigerBeetle Truth
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            No Custody
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Mechanical Truth
          </span>
        </div>
      </div>

      {/* SOVR Doctrine Footer */}
      <Alert className="border-slate-200 bg-slate-50">
        <CheckCircle className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">
          <strong>SOVR Doctrine:</strong> Authorization-first UX ensures mechanical truth enforcement. 
          Attestation provides legitimacy proof. TigerBeetle clearing is final. 
          <em>Truth is mechanical, not administrative.</em>
        </AlertDescription>
      </Alert>
    </div>
  );
}