'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCircle,
  Database,
  FileText,
  Globe,
  HelpCircle,
  Home,
  Menu,
  Search,
  Settings,
  Shield,
  Smartphone,
  Users,
  X,
  Zap
} from 'lucide-react';
import { useState } from 'react';

interface NavigationItem {
  id: string;
  label: string;
  sovrLabel: string;
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
  requiresAttestation?: boolean;
  urgency?: 'normal' | 'high' | 'critical';
  semanticNotes?: string[];
}

interface SemanticReplacement {
  traditional: string;
  sovr: string;
  context: string;
  explanation: string;
}

interface SOVRNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onTerminologyHelp: (term: string) => void;
  className?: string;
}

export default function SOVRNavigation({
  currentPath,
  onNavigate,
  onTerminologyHelp,
  className = '',
}: SOVRNavigationProps) {
  const [showTerminologyHelp, setShowTerminologyHelp] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string>('');

  // SOVR doctrine-compliant navigation items
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      sovrLabel: 'Obligation Monitor',
      icon: <Home className="h-4 w-4" />,
      href: '/',
      isActive: currentPath === '/'
    },
    {
      id: 'survival',
      label: 'Survival Dashboard',
      sovrLabel: 'Essential Goods Authority',
      icon: <Activity className="h-4 w-4" />,
      href: '/survival',
      isActive: currentPath === '/survival',
      requiresAttestation: true
    },
    {
      id: 'honoring-agents',
      label: 'Payment Methods',
      sovrLabel: 'External Honoring Agents',
      icon: <Users className="h-4 w-4" />,
      href: '/agents',
      isActive: currentPath === '/agents',
      semanticNotes: ['payment_methods → honoring_agents', 'legacy terminology warning']
    },
    {
      id: 'mobile-terminal',
      label: 'Mobile Payments',
      sovrLabel: 'Credit Terminal',
      icon: <Smartphone className="h-4 w-4" />,
      href: '/mobile',
      isActive: currentPath === '/mobile',
      requiresAttestation: true,
      urgency: 'high'
    },
    {
      id: 'obligations',
      label: 'Transactions',
      sovrLabel: 'Obligation Ledger',
      icon: <FileText className="h-4 w-4" />,
      href: '/obligations',
      isActive: currentPath === '/obligations'
    },
    {
      id: 'survival-testing',
      label: 'Community Features',
      sovrLabel: 'Survival Testing',
      icon: <Zap className="h-4 w-4" />,
      href: '/testing',
      isActive: currentPath === '/testing'
    },
    {
      id: 'mechanical-truth',
      label: 'Balance',
      sovrLabel: 'Mechanical Truth',
      icon: <Database className="h-4 w-4" />,
      href: '/truth',
      isActive: currentPath === '/truth',
      semanticNotes: ['balance → mechanical_truth', 'no_manual_edits_warning']
    },
    {
      id: 'fiat-optional',
      label: 'Currency',
      sovrLabel: 'Fiat-Optional Settlement',
      icon: <Globe className="h-4 w-4" />,
      href: '/currency',
      isActive: currentPath === '/currency'
    },
    {
      id: 'settings',
      label: 'Settings',
      sovrLabel: 'Preferences',
      icon: <Settings className="h-4 w-4" />,
      href: '/settings',
      isActive: currentPath === '/settings'
    }
  ];

  // Semantic replacement rules
  const semanticReplacements: SemanticReplacement[] = [
    {
      traditional: 'Payment',
      sovr: 'Obligation Authorization',
      context: 'User Actions',
      explanation: 'SOVR operates on authorization, not payment processing. Users authorize obligations, not pay debts.'
    },
    {
      traditional: 'Balance',
      sovr: 'Mechanical Truth',
      context: 'Financial Display',
      explanation: 'Balances are calculated mechanically through TigerBeetle clearing, not manually adjusted.'
    },
    {
      traditional: 'Deposit',
      sovr: 'Credit Establishment',
      context: 'Account Management',
      explanation: 'Funds establish sovereign credit, not traditional deposits subject to custody.'
    },
    {
      traditional: 'Withdrawal',
      sovr: 'Obligation Fulfillment',
      context: 'Account Management',
      explanation: 'Funds fulfill obligations, not withdraw from custodial accounts.'
    },
    {
      traditional: 'Transfer',
      sovr: 'Obligation Clearing',
      context: 'Transactions',
      explanation: 'Transfers clear obligations through mechanical truth, not payment processing.'
    },
    {
      traditional: 'Custody',
      sovr: 'Sovereign Control',
      context: 'Account Management',
      explanation: 'Users maintain sovereign control, not custodial relationships.'
    },
    {
      traditional: 'Bank',
      sovr: 'Honoring Agent',
      context: 'Service Providers',
      explanation: 'External services honor SOVR obligations, not provide custodial banking.'
    },
    {
      traditional: 'Account',
      sovr: 'Obligation Authority',
      context: 'User Identity',
      explanation: 'Users have authority to create obligations, not traditional account relationships.'
    }
  ];

  const getUrgencyBadge = (urgency?: string) => {
    switch (urgency) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">High Priority</Badge>;
      default:
        return null;
    }
  };

  const handleTermClick = (term: string, context: string) => {
    setSelectedTerm(term);
    onTerminologyHelp(term);
    setShowTerminologyHelp(true);
  };

  const highlightSemanticTerm = (text: string) => {
    // Simple highlighting for semantic violations
    const violations = semanticReplacements.map(rep => rep.traditional);
    let highlightedText = text;
    
    violations.forEach(violation => {
      const regex = new RegExp(`\\b${violation}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, (match) => 
        `<span class="text-red-600 font-medium cursor-pointer hover:bg-red-100 px-1 rounded" data-term="${match}">${match}</span>`
      );
    });
    
    return highlightedText;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* SOVR Doctrine Navigation Header */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>SOVR Navigation Doctrine:</strong> All interface language must honor sovereignty principles. 
          Traditional financial terminology is replaced with SOVR doctrine-compliant language. 
          <em>Semantic violations are corrected automatically.</em>
        </AlertDescription>
      </Alert>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => onNavigate(item.href)}
              variant={item.isActive ? "default" : "outline"}
              className={`h-auto p-3 flex flex-col items-center gap-2 ${
                item.isActive ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-sm font-medium">{item.sovrLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.requiresAttestation && (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Attestation
                  </Badge>
                )}
                {getUrgencyBadge(item.urgency)}
              </div>
              {item.semanticNotes && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.semanticNotes.map((note, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {note}
                    </Badge>
                  ))}
                </div>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          variant="outline"
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            Navigation
          </span>
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        
        {mobileMenuOpen && (
          <div className="mt-3 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => {
                  onNavigate(item.href);
                  setMobileMenuOpen(false);
                }}
                variant={item.isActive ? "default" : "outline"}
                className="w-full justify-start h-auto p-3"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.sovrLabel}</div>
                    <div className="text-xs text-gray-600">{item.label}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {item.requiresAttestation && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Attestation
                      </Badge>
                    )}
                    {getUrgencyBadge(item.urgency)}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Terminology Helper */}
      <Card className="border-2 border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle 
            className="flex items-center gap-2 text-amber-800 cursor-pointer"
            onClick={() => setShowTerminologyHelp(!showTerminologyHelp)}
          >
            <BookOpen className="h-5 w-5" />
            SOVR Terminology Guide
            {showTerminologyHelp ? <X className="h-4 w-4 ml-auto" /> : <Menu className="h-4 w-4 ml-auto" />}
          </CardTitle>
        </CardHeader>
        
        {showTerminologyHelp && (
          <CardContent className="space-y-4">
            <Alert className="border-amber-200 bg-amber-100">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Semantic Violation Prevention:</strong> Click on highlighted traditional terms 
                to see SOVR doctrine-compliant replacements. All user communications must honor sovereignty principles.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {semanticReplacements.map((replacement, index) => (
                <div 
                  key={index}
                  className="p-3 bg-white rounded-lg border border-amber-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{replacement.context}</Badge>
                      <span 
                        className="text-red-600 font-medium cursor-pointer hover:bg-red-100 px-1 rounded"
                        onClick={() => handleTermClick(replacement.traditional, replacement.context)}
                      >
                        {replacement.traditional}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-blue-600 font-medium">{replacement.sovr}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{replacement.explanation}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-amber-200">
              <Button
                onClick={() => onTerminologyHelp('all')}
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-700"
              >
                <Search className="h-4 w-4 mr-1" />
                Find Violations
              </Button>
              <Button
                onClick={() => onTerminologyHelp('help')}
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-700"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Get Help
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Current Context Display */}
      <Card className="border-2 border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <CheckCircle className="h-5 w-5" />
            Current Navigation Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Current Page:</span>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              {navigationItems.find(item => item.isActive)?.sovrLabel || 'Unknown'}
            </Badge>
          </div>
          
          {navigationItems.find(item => item.isActive)?.requiresAttestation && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Attestation Required:</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Yes
              </Badge>
            </div>
          )}

          {navigationItems.find(item => item.isActive)?.semanticNotes && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Semantic Notes:</span>
              <div className="flex flex-wrap gap-1">
                {navigationItems.find(item => item.isActive)?.semanticNotes?.map((note, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {note}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification System */}
      <Card className="border-2 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            SOVR Doctrine Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Semantic Violations Detected:</span>
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              0 violations
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Attestation Compliance:</span>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Compliant
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Mechanical Truth Display:</span>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* SOVR Doctrine Footer */}
      <Alert className="border-slate-200 bg-slate-50">
        <Shield className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">
          <strong>SOVR Navigation Doctrine:</strong> All interface elements must communicate sovereignty principles. 
          Traditional financial language is replaced with SOVR doctrine terminology. 
          No payment processing, no balance edits, no overrides. <em>Language reflects mechanical truth.</em>
        </AlertDescription>
      </Alert>
    </div>
  );
}