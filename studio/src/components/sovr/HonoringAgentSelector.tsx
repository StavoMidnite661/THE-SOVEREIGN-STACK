'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Car,
  CheckCircle,
  Clock,
  CreditCard,
  Filter,
  Gamepad2,
  Globe,
  Heart,
  Home,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Shield,
  Star,
  Store,
  Truck,
  Users,
  Zap
} from 'lucide-react';
import { useState } from 'react';

interface HonoringAgent {
  id: string;
  name: string;
  category: 'utilities' | 'grocery' | 'delivery' | 'retail' | 'entertainment' | 'transport' | 'emergency';
  type: string;
  rating: number;
  reviews: number;
  location: string;
  distance: number; // miles
  isOnline: boolean;
  reliability: number; // 0-100
  processingTime: number; // minutes
  fees: {
    type: 'percentage' | 'fixed' | 'none';
    amount: number;
  };
  specialFeatures: string[];
  availability: {
    hours: string;
    emergencyService: boolean;
    mobileApp: boolean;
    webPlatform: boolean;
  };
  description: string;
  supportedCurrencies: string[];
  attestationRequired: boolean;
  contact: {
    phone: string;
    website: string;
    email: string;
  };
}

interface HonoringAgentSelectorProps {
  agents: HonoringAgent[];
  onSelectAgent: (agentId: string, serviceType: string) => void;
  onViewAgentDetails: (agentId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

export default function HonoringAgentSelector({
  agents,
  onSelectAgent,
  onViewAgentDetails,
  searchQuery = '',
  onSearchChange,
  className = '',
}: HonoringAgentSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'reliability' | 'speed'>('rating');
  const [filterOnline, setFilterOnline] = useState(false);

  const categoryIcons = {
    utilities: <Home className="h-4 w-4" />,
    grocery: <Store className="h-4 w-4" />,
    delivery: <Truck className="h-4 w-4" />,
    retail: <CreditCard className="h-4 w-4" />,
    entertainment: <Gamepad2 className="h-4 w-4" />,
    transport: <Car className="h-4 w-4" />,
    emergency: <Heart className="h-4 w-4" />
  };

  const filteredAgents = agents
    .filter(agent => {
      if (selectedCategory !== 'all' && agent.category !== selectedCategory) return false;
      if (filterOnline && !agent.isOnline) return false;
      if (searchQuery && !agent.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !agent.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'reliability':
          return b.reliability - a.reliability;
        case 'speed':
          return a.processingTime - b.processingTime;
        default:
          return b.rating - a.rating;
      }
    });

  const categories = [
    { id: 'all', name: 'All Agents', count: agents.length },
    { id: 'utilities', name: 'Utilities', count: agents.filter(a => a.category === 'utilities').length },
    { id: 'grocery', name: 'Grocery', count: agents.filter(a => a.category === 'grocery').length },
    { id: 'delivery', name: 'Delivery', count: agents.filter(a => a.category === 'delivery').length },
    { id: 'retail', name: 'Retail', count: agents.filter(a => a.category === 'retail').length },
    { id: 'entertainment', name: 'Entertainment', count: agents.filter(a => a.category === 'entertainment').length },
    { id: 'transport', name: 'Transport', count: agents.filter(a => a.category === 'transport').length },
    { id: 'emergency', name: 'Emergency', count: agents.filter(a => a.category === 'emergency').length }
  ];

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 95) return 'text-green-600';
    if (reliability >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProcessingTimeColor = (time: number) => {
    if (time <= 30) return 'text-green-600';
    if (time <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFeeDisplay = (fees: { type: string; amount: number }) => {
    switch (fees.type) {
      case 'percentage':
        return `${fees.amount}% fee`;
      case 'fixed':
        return `${fees.amount.toFixed(2)} SOVR fee`;
      default:
        return 'No fees';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* SOVR Doctrine Header */}
      <Alert className="border-blue-200 bg-blue-50">
        <Users className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>SOVR Doctrine:</strong> External honoring agents are optional choices that honor SOVR obligations. 
          No USD privilege, mechanical truth governs all transactions. <em>Agents are guests, not authorities.</em>
        </AlertDescription>
      </Alert>

      {/* Search and Filters */}
      <Card className="border-2 border-slate-200">
        <CardContent className="p-4 space-y-4">
          {/* Search Bar */}
          {onSearchChange && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search honoring agents..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="rating">Rating</option>
                <option value="distance">Distance</option>
                <option value="reliability">Reliability</option>
                <option value="speed">Speed</option>
              </select>
            </div>

            <Button
              variant={filterOnline ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterOnline(!filterOnline)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Online Only
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('all');
                setFilterOnline(false);
                if (onSearchChange) onSearchChange('');
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="text-xs"
            >
              <div className="flex items-center gap-1">
                {category.id !== 'all' && categoryIcons[category.id as keyof typeof categoryIcons]}
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.name.slice(0, 3)}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredAgents.length === 0 ? (
            <Card className="border-2 border-gray-200">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Found</h3>
                <p className="text-gray-600">
                  No honoring agents match your current filters. Try adjusting your search criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className={`border-2 ${agent.isOnline ? 'border-green-200' : 'border-gray-200'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {categoryIcons[agent.category]}
                          {agent.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {agent.isOnline ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>
                        ) : (
                          <Badge variant="secondary">Offline</Badge>
                        )}
                        {agent.availability.emergencyService && (
                          <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                            Emergency
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{agent.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-600">({agent.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{agent.distance}mi</span>
                      </div>
                    </div>

                    {/* Reliability and Speed */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Reliability:</span>
                        <div className={`font-medium ${getReliabilityColor(agent.reliability)}`}>
                          {agent.reliability}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Processing:</span>
                        <div className={`font-medium ${getProcessingTimeColor(agent.processingTime)}`}>
                          {agent.processingTime}min
                        </div>
                      </div>
                    </div>

                    {/* Fees */}
                    <div className="text-sm">
                      <span className="text-gray-600">Fees: </span>
                      <span className="font-medium">{getFeeDisplay(agent.fees)}</span>
                    </div>

                    {/* Special Features */}
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-gray-700">Features:</span>
                      <div className="flex flex-wrap gap-1">
                        {agent.specialFeatures.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {agent.specialFeatures.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.specialFeatures.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{agent.availability.hours}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        {agent.availability.mobileApp && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> Mobile
                          </span>
                        )}
                        {agent.availability.webPlatform && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" /> Web
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => onSelectAgent(agent.id, agent.category)}
                        disabled={!agent.isOnline}
                        className="flex-1"
                        size="sm"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Honor Obligation
                      </Button>
                      <Button
                        onClick={() => onViewAgentDetails(agent.id)}
                        variant="outline"
                        size="sm"
                      >
                        Details
                      </Button>
                    </div>

                    {!agent.isOnline && (
                      <p className="text-xs text-red-600 text-center">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        Agent currently offline
                      </p>
                    )}

                    {agent.attestationRequired && (
                      <p className="text-xs text-blue-600 text-center">
                        <Shield className="h-3 w-3 inline mr-1" />
                        EIP-712 attestation required
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* SOVR Doctrine Footer */}
      <Alert className="border-slate-200 bg-slate-50">
        <CheckCircle className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">
          <strong>SOVR Honoring Agent Principles:</strong> External agents honor SOVR obligations voluntarily. 
          No USD privilege enforced. Mechanical truth validates all transactions. Agents are optional, not required. 
          <em>Truth is mechanical, not administrative.</em>
        </AlertDescription>
      </Alert>
    </div>
  );
}