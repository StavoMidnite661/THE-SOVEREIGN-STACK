'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Coffee,
  Database,
  Globe,
  GraduationCap,
  Heart,
  Home,
  Key,
  Lightbulb,
  Lock,
  RotateCcw,
  Shield,
  Target,
  Users,
  Wallet,
  XCircle,
  Zap
} from 'lucide-react';
import { useState } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  completed: boolean;
  required: boolean;
  estimatedTime: number; // minutes
}

interface EducationModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  steps: OnboardingStep[];
  category: 'doctrine' | 'technical' | 'practical' | 'safety';
}

interface UserOnboardingFlowsProps {
  onCompleteOnboarding: () => void;
  onSkipStep: (stepId: string) => void;
  onCompleteStep: (stepId: string) => void;
  className?: string;
}

export default function UserOnboardingFlows({
  onCompleteOnboarding,
  onSkipStep,
  onCompleteStep,
  className = '',
}: UserOnboardingFlowsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeModule, setActiveModule] = useState('doctrine-fundamentals');
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [attestationGenerated, setAttestationGenerated] = useState(false);

  const educationModules: EducationModule[] = [
    {
      id: 'doctrine-fundamentals',
      title: 'SOVR Doctrine Fundamentals',
      description: 'Core principles of sovereign financial operation',
      icon: <Shield className="h-5 w-5" />,
      category: 'doctrine',
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to SOVR',
          description: 'Understanding sovereign financial systems',
          content: (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">Welcome to Sovereign Finance</h3>
                <p className="text-gray-600">
                  You're entering a financial system that operates without traditional banking hierarchies, 
                  payment processors, or custodial relationships.
                </p>
              </div>
              
              <Alert className="border-blue-200 bg-blue-50">
                <Heart className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Key Difference:</strong> SOVR operates on mechanical truth, not administrative permission. 
                  Your obligations are validated through cryptographic proof, not bank approval.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium">No Custody</h4>
                  <p className="text-sm text-gray-600">You maintain sovereign control over your obligations</p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium">Mechanical Truth</h4>
                  <p className="text-sm text-gray-600">All balances calculated by TigerBeetle, not manually</p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium">Optional Agents</h4>
                  <p className="text-sm text-gray-600">External services honor obligations, not control them</p>
                </div>
              </div>
            </div>
          ),
          completed: false,
          required: true,
          estimatedTime: 3
        },
        {
          id: 'eight-rules',
          title: 'Eight Doctrine Rules',
          description: 'Core principles that govern all SOVR operations',
          content: (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">The Eight Doctrine Rules</h3>
              
              <div className="space-y-4">
                {[
                  { rule: 'Truth is Mechanical', description: 'If it didn\'t clear in TigerBeetle, it didn\'t happen', icon: <Database className="h-5 w-5" /> },
                  { rule: 'No Payment Processing', description: 'We "authorize" obligations, never "process payments"', icon: <Zap className="h-5 w-5" /> },
                  { rule: 'No Balance Edits', description: 'Users see mathematical results, never manual adjustments', icon: <Lock className="h-5 w-5" /> },
                  { rule: 'No Overrides', description: 'Admins observe system state but cannot correct it', icon: <Shield className="h-5 w-5" /> },
                  { rule: 'Attestation First', description: 'EIP-712 attestation visible and required before any action', icon: <Key className="h-5 w-5" /> },
                  { rule: 'Legacy Rails are Guests', description: 'External honoring agents as optional choices', icon: <Users className="h-5 w-5" /> },
                  { rule: 'Fiat is Optional', description: 'Multi-currency display, no USD privilege', icon: <Globe className="h-5 w-5" /> },
                  { rule: 'No Reversals', description: 'New transfers for corrections, never reversals', icon: <RotateCcw className="h-5 w-5" /> }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">{item.rule}</h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Remember:</strong> These rules aren't just guidelines—they're enforced mechanically. 
                  The system cannot violate these principles.
                </AlertDescription>
              </Alert>
            </div>
          ),
          completed: false,
          required: true,
          estimatedTime: 5
        },
        {
          id: 'terminology',
          title: 'SOVR Terminology Translation',
          description: 'Understanding the language of sovereign finance',
          content: (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Financial Terminology Translation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { traditional: 'Payment', sovr: 'Obligation Authorization', context: 'User Action' },
                  { traditional: 'Balance', sovr: 'Mechanical Truth', context: 'Financial Display' },
                  { traditional: 'Deposit', sovr: 'Credit Establishment', context: 'Account Management' },
                  { traditional: 'Withdrawal', sovr: 'Obligation Fulfillment', context: 'Account Management' },
                  { traditional: 'Transfer', sovr: 'Obligation Clearing', context: 'Transaction' },
                  { traditional: 'Custody', sovr: 'Sovereign Control', context: 'Account Management' },
                  { traditional: 'Bank', sovr: 'Honoring Agent', context: 'Service Provider' },
                  { traditional: 'Account', sovr: 'Obligation Authority', context: 'User Identity' }
                ].map((translation, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{translation.context}</Badge>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Traditional: </span>
                        <span className="font-medium text-red-600">{translation.traditional}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">SOVR: </span>
                        <span className="font-medium text-blue-600">{translation.sovr}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Semantic Compliance:</strong> All user communications must use SOVR terminology. 
                  Traditional financial language reinforces outdated power structures.
                </AlertDescription>
              </Alert>
            </div>
          ),
          completed: false,
          required: true,
          estimatedTime: 4
        }
      ]
    },
    {
      id: 'wallet-setup',
      title: 'Wallet Setup & Connection',
      description: 'Setting up your sovereign identity',
      icon: <Wallet className="h-5 w-5" />,
      category: 'technical',
      steps: [
        {
          id: 'wallet-intro',
          title: 'Wallet as Sovereign Identity',
          description: 'Understanding your wallet\'s role in SOVR',
          content: (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Your Wallet = Your Sovereign Authority</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">What Your Wallet Provides:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Cryptographic identity</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Attestation signing capability</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Obligation authorization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Transaction history</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">What Your Wallet Doesn't Provide:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Custodial control</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Administrative overrides</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Balance editing power</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Transaction reversal</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Important Security Note</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your wallet private key controls your sovereign authority. 
                      Lose it, lose your ability to create obligations. There's no recovery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ),
          completed: walletConnected,
          required: true,
          estimatedTime: 3
        },
        {
          id: 'connect-wallet',
          title: 'Connect Your Wallet',
          description: 'Establishing secure connection to SOVR',
          content: (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Wallet Connection</h3>
              
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Wallet className="h-12 w-12 text-blue-600" />
                </div>
                <p className="text-gray-600">
                  Connect your EVM-compatible wallet to establish your sovereign identity
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'MetaMask', popular: true },
                  { name: 'WalletConnect', popular: true },
                  { name: 'Coinbase Wallet', popular: false },
                  { name: 'Trust Wallet', popular: false },
                  { name: 'Phantom', popular: false },
                  { name: 'Other EVM Wallet', popular: false }
                ].map((wallet) => (
                  <Button
                    key={wallet.name}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setWalletConnected(true)}
                  >
                    <Wallet className="h-6 w-6" />
                    <span className="font-medium">{wallet.name}</span>
                    {wallet.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                  </Button>
                ))}
              </div>

              {walletConnected && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Wallet Connected!</strong> Your sovereign identity is now established. 
                    You can create obligations and authorize transactions.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ),
          completed: walletConnected,
          required: true,
          estimatedTime: 2
        }
      ]
    },
    {
      id: 'attestation-education',
      title: 'Understanding Attestation',
      description: 'Cryptographic proof in the SOVR system',
      icon: <Key className="h-5 w-5" />,
      category: 'technical',
      steps: [
        {
          id: 'what-is-attestation',
          title: 'What is EIP-712 Attestation?',
          description: 'Understanding cryptographic proof requirements',
          content: (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">EIP-712 Attestation Explained</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">What Attestation Proves:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>You authorize this specific obligation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>The obligation details are correct</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Timestamp prevents replay attacks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Domain separation ensures validity</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Attestation Structure:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-gray-100 rounded">
                      <strong>Signer:</strong> Your wallet address
                    </div>
                    <div className="p-2 bg-gray-100 rounded">
                      <strong>Message:</strong> Obligation details
                    </div>
                    <div className="p-2 bg-gray-100 rounded">
                      <strong>Timestamp:</strong> When created
                    </div>
                    <div className="p-2 bg-gray-100 rounded">
                      <strong>Domain:</strong> SOVR system identifier
                    </div>
                    <div className="p-2 bg-gray-100 rounded">
                      <strong>Signature:</strong> Cryptographic proof
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>No Administrative Permission:</strong> Attestation replaces traditional bank approval. 
                  Your cryptographic signature is the only authority needed.
                </AlertDescription>
              </Alert>
            </div>
          ),
          completed: attestationGenerated,
          required: true,
          estimatedTime: 4
        },
        {
          id: 'generate-attestation',
          title: 'Generate Your First Attestation',
          description: 'Hands-on experience with cryptographic authorization',
          content: (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Create Your First Attestation</h3>
              
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Key className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Demo Obligation</h4>
                    <p className="text-sm text-gray-600">Authorize 1 SOVR for onboarding completion</p>
                  </div>
                  <Button
                    onClick={() => setAttestationGenerated(true)}
                    disabled={!walletConnected}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Generate Attestation
                  </Button>
                </div>
              </div>

              {attestationGenerated && (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Attestation Generated!</strong> You've created your first cryptographic proof. 
                      This process happens automatically for all obligations.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <h4 className="font-medium mb-2">Generated Attestation (Demo):</h4>
                    <pre className="text-xs overflow-x-auto">
{`{
  "signer": "0x742d35Cc6434C0532925a3b8D2d7F6A5C5d8F123",
  "message": "Authorize onboarding completion: 1 SOVR",
  "timestamp": ${Date.now()},
  "domain": "studio.sovr.financial",
  "signature": "0xabc123..."
}`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ),
          completed: attestationGenerated,
          required: true,
          estimatedTime: 3
        }
      ]
    },
    {
      id: 'survival-goods',
      title: 'Essential Goods & Survival',
      description: 'Understanding the Three SKUs That Matter',
      icon: <Heart className="h-5 w-5" />,
      category: 'practical',
      steps: [
        {
          id: 'three-skus-intro',
          title: 'The Three SKUs That Matter',
          description: 'Milk, Eggs, Bread - survival essentials',
          content: (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Essential Goods for Survival Testing</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Milk', units: 3.5, calories: 210, description: 'Dairy protein and calcium' },
                  { name: 'Eggs', units: 2.5, calories: 156, description: 'Complete protein source' },
                  { name: 'Bread', units: 1.5, calories: 400, description: 'Carbohydrate energy' }
                ].map((item) => (
                  <Card key={item.name} className="border-2 border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Units:</span>
                          <span className="font-medium">{item.units} SOVR</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Calories:</span>
                          <span className="font-medium">{item.calories}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert className="border-green-200 bg-green-50">
                <Target className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Survival Bundle:</strong> All three items together (7.5 SOVR, ~766 calories) 
                  provide basic nutritional needs. Delivery rate must be ≥80% for authorization.
                </AlertDescription>
              </Alert>
            </div>
          ),
          completed: false,
          required: false,
          estimatedTime: 3
        },
        {
          id: 'honoring-agents',
          title: 'External Honoring Agents',
          description: 'How external services honor SOVR obligations',
          content: (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Honoring Agent Network</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Agent Categories:</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Grocery Stores', example: 'Instacart, Local Markets', icon: <Home className="h-4 w-4" /> },
                      { name: 'Delivery Services', example: 'DoorDash, Uber Eats', icon: <Coffee className="h-4 w-4" /> },
                      { name: 'Utilities', example: 'Electric, Water, Gas', icon: <Zap className="h-4 w-4" /> },
                      { name: 'Emergency Services', example: 'Medical, Crisis Response', icon: <AlertTriangle className="h-4 w-4" /> }
                    ].map((category) => (
                      <div key={category.name} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        {category.icon}
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-gray-600">{category.example}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Agent Selection Process:</h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge className="w-6 h-6 rounded-full flex items-center justify-center text-xs">1</Badge>
                      <span>Choose service type (grocery, utilities, etc.)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="w-6 h-6 rounded-full flex items-center justify-center text-xs">2</Badge>
                      <span>View available agents with ratings and reliability</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="w-6 h-6 rounded-full flex items-center justify-center text-xs">3</Badge>
                      <span>Select agent based on preferences</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="w-6 h-6 rounded-full flex items-center justify-center text-xs">4</Badge>
                      <span>Authorize obligation through chosen agent</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="w-6 h-6 rounded-full flex items-center justify-center text-xs">5</Badge>
                      <span>Agent honors obligation (optional, not required)</span>
                    </li>
                  </ol>
                </div>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <Users className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Optional Agents:</strong> Honoring agents are guests, not authorities. 
                  SOVR operates independently of their availability or cooperation.
                </AlertDescription>
              </Alert>
            </div>
          ),
          completed: false,
          required: false,
          estimatedTime: 4
        }
      ]
    },
    {
      id: 'safety-disclosure',
      title: 'Risk Disclosure & Safety',
      description: 'Understanding mechanical system risks',
      icon: <AlertTriangle className="h-5 w-5" />,
      category: 'safety',
      steps: [
        {
          id: 'mechanical-risks',
          title: 'Mechanical System Risks',
          description: 'Understanding what "mechanical truth" means for safety',
          content: (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Important Risk Disclosures</h3>
              
              <div className="space-y-4">
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>No FDIC Insurance:</strong> SOVR is not a bank. Your obligations are not insured 
                    or backed by any government or institution.
                  </AlertDescription>
                </Alert>

                <Alert className="border-orange-200 bg-orange-50">
                  <Lock className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>No Reversals Possible:</strong> Once an obligation clears through TigerBeetle, 
                    it cannot be reversed, edited, or overridden by anyone.
                  </AlertDescription>
                </Alert>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <Database className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Technical Dependencies:</strong> SOVR depends on TigerBeetle for mechanical truth, 
                    external honoring agents for services, and blockchain infrastructure.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-lg">System Risks:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>No customer support or dispute resolution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>No balance protection or insurance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>No recovery for lost private keys</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>External agent availability not guaranteed</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-lg">Your Responsibilities:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Secure your wallet private keys</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Verify all obligation details before authorizing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Understand no reversals are possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Accept mechanical system limitations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ),
          completed: false,
          required: true,
          estimatedTime: 5
        }
      ]
    }
  ];

  const getCurrentModule = () => educationModules.find(m => m.id === activeModule);
  const currentModule = getCurrentModule();
  const currentStepData = currentModule?.steps[currentStep];
  const progressPercentage = ((currentStep + 1) / (currentModule?.steps.length || 1)) * 100;

  const handleNext = () => {
    if (currentStep < (currentModule?.steps.length || 1) - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentModule) {
      // Move to next module
      const currentModuleIndex = educationModules.findIndex(m => m.id === activeModule);
      if (currentModuleIndex < educationModules.length - 1) {
        setActiveModule(educationModules[currentModuleIndex + 1].id);
        setCurrentStep(0);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      // Move to previous module
      const currentModuleIndex = educationModules.findIndex(m => m.id === activeModule);
      if (currentModuleIndex > 0) {
        setActiveModule(educationModules[currentModuleIndex - 1].id);
        setCurrentStep(educationModules[currentModuleIndex - 1].steps.length - 1);
      }
    }
  };

  const handleCompleteStep = () => {
    if (currentStepData) {
      onCompleteStep(currentStepData.id);
      handleNext();
    }
  };

  const handleSkipStep = () => {
    if (currentStepData) {
      onSkipStep(currentStepData.id);
      handleNext();
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* SOVR Doctrine Header */}
      <Alert className="border-blue-200 bg-blue-50">
        <GraduationCap className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>SOVR Onboarding:</strong> Education-first approach to sovereignty. 
          Understanding doctrine before authorization. <em>Knowledge enables safe operation.</em>
        </AlertDescription>
      </Alert>

      {/* Module Navigation */}
      <Card className="border-2 border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Education Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {educationModules.map((module) => (
              <Button
                key={module.id}
                onClick={() => {
                  setActiveModule(module.id);
                  setCurrentStep(0);
                }}
                variant={activeModule === module.id ? "default" : "outline"}
                className={`h-auto p-3 flex flex-col items-center gap-2 ${
                  activeModule === module.id ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'
                }`}
              >
                {module.icon}
                <span className="text-sm font-medium text-center">{module.title}</span>
                <Badge 
                  variant={module.steps.every(s => s.completed) ? "default" : "secondary"} 
                  className="text-xs"
                >
                  {module.steps.filter(s => s.completed).length}/{module.steps.length}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Display */}
      {currentModule && currentStepData && (
        <Card className="border-2 border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {currentModule.icon}
                {currentStepData.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {currentStepData.estimatedTime} min
                </Badge>
                {currentStepData.required && (
                  <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                    Required
                  </Badge>
                )}
                {currentStepData.completed && (
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-gray-600">{currentStepData.description}</p>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {currentModule.steps.length} in {currentModule.title}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStepData.content}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={activeModule === educationModules[0].id && currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {!currentStepData.completed && (
                  <Button
                    onClick={handleSkipStep}
                    variant="outline"
                    disabled={currentStepData.required}
                  >
                    Skip Step
                  </Button>
                )}
                <Button
                  onClick={handleCompleteStep}
                  disabled={currentStepData.completed}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {currentStepData.completed ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      Complete Step
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Summary */}
      {educationModules.every(module => module.steps.every(step => step.completed)) && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-800">Onboarding Complete!</h3>
            <p className="text-green-700">
              You've completed all required SOVR education modules. You now understand the principles 
              and can safely operate in the sovereign financial system.
            </p>
            <Button
              onClick={onCompleteOnboarding}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Enter SOVR Studio
            </Button>
          </CardContent>
        </Card>
      )}

      {/* SOVR Doctrine Footer */}
      <Alert className="border-slate-200 bg-slate-50">
        <Shield className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">
          <strong>SOVR Education Doctrine:</strong> Understanding precedes authorization. 
          Sovereign operation requires comprehension of mechanical truth principles. 
          <em>Education enables safe sovereignty.</em>
        </AlertDescription>
      </Alert>
    </div>
  );
}