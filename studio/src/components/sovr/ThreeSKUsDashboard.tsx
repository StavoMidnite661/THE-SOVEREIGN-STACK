'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Package, TrendingUp } from 'lucide-react';

interface SurvivalItem {
  id: string;
  name: string;
  unitCost: number;
  calories: number;
  description: string;
  inStock: boolean;
  deliveryRate: number;
  lastRestocked: string;
}

interface SurvivalStatus {
  currentCalories: number;
  dailyTarget: number;
  daysOfSurvival: number;
  riskLevel: 'safe' | 'caution' | 'critical';
  bundleCost: number;
}

interface ThreeSKUsProps {
  survivalItems: SurvivalItem[];
  survivalStatus: SurvivalStatus;
  onAuthorizeObligation: (itemId: string) => void;
  onBundlePurchase: () => void;
  className?: string;
}

export default function ThreeSKUsDashboard({
  survivalItems,
  survivalStatus,
  onAuthorizeObligation,
  onBundlePurchase,
  className = '',
}: ThreeSKUsProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-green-600';
      case 'caution': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'safe':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Safe</Badge>;
      case 'caution':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Caution</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const calculateBundleAvailability = () => {
    return survivalItems.filter(item => item.inStock && item.deliveryRate >= 80).length;
  };

  const bundleAvailable = calculateBundleAvailability() === 3;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* SOVR Doctrine Header */}
      <Alert className="border-blue-200 bg-blue-50">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>SOVR Doctrine:</strong> Essential goods are authorized for obligation clearing. 
          Delivery rates must meet ≥80% threshold for bundle authorization. 
          <em>No balance edits - mechanical truth governs survival.</em>
        </AlertDescription>
      </Alert>

      {/* Survival Status Dashboard */}
      <Card className="border-2 border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Survival Status Dashboard
          </CardTitle>
          <div className="flex items-center gap-4">
            {getRiskBadge(survivalStatus.riskLevel)}
            <span className="text-sm text-gray-600">
              Updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Current Calories</p>
              <p className="text-2xl font-bold">{survivalStatus.currentCalories.toLocaleString()}</p>
              <Progress value={(survivalStatus.currentCalories / survivalStatus.dailyTarget) * 100} className="h-2" />
              <p className="text-xs text-gray-500">Target: {survivalStatus.dailyTarget.toLocaleString()} kcal/day</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Days of Survival</p>
              <p className="text-2xl font-bold">{survivalStatus.daysOfSurvival}</p>
              <p className="text-xs text-gray-500">Based on current inventory</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Bundle Cost</p>
              <p className="text-2xl font-bold">{survivalStatus.bundleCost.toFixed(2)} SOVR</p>
              <p className="text-xs text-gray-500">Milk + Eggs + Bread (7.5 units)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bundle Authorization */}
      {bundleAvailable ? (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Package className="h-5 w-5" />
              Survival Bundle Available
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-700">
              All three essential goods meet delivery threshold (≥80%). Bundle authorization ready.
            </p>
            <div className="flex items-center gap-4">
              <Button 
                onClick={onBundlePurchase}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                Authorize Bundle Obligation
              </Button>
              <span className="text-sm text-green-600">
                {survivalStatus.bundleCost.toFixed(2)} SOVR • ~1,200 kcal
              </span>
            </div>
            <p className="text-xs text-green-600">
              <em>Note: Authorization triggers TigerBeetle mechanical truth clearing. No payment processing occurs.</em>
            </p>
          </CardContent>
        </Card>
      ) : (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Bundle unavailable: Not all essential goods meet delivery threshold. Individual authorization may be available.
          </AlertDescription>
        </Alert>
      )}

      {/* Individual SKUs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {survivalItems.map((item) => (
          <Card key={item.id} className={`relative ${item.inStock ? 'border-green-200' : 'border-red-200'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {item.inStock ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{item.unitCost} SOVR</Badge>
                <Badge variant="outline">{item.calories} kcal</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{item.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Delivery Rate</span>
                  <span className={item.deliveryRate >= 80 ? 'text-green-600' : 'text-red-600'}>
                    {item.deliveryRate}%
                  </span>
                </div>
                <Progress value={item.deliveryRate} className="h-2" />
                <p className="text-xs text-gray-500">
                  Threshold: 80% for authorization
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last restocked
                </span>
                <span>{new Date(item.lastRestocked).toLocaleDateString()}</span>
              </div>

              <Button
                onClick={() => onAuthorizeObligation(item.id)}
                disabled={!item.inStock || item.deliveryRate < 80}
                className="w-full"
                variant={item.inStock && item.deliveryRate >= 80 ? "default" : "secondary"}
              >
                {item.inStock && item.deliveryRate >= 80 ? 'Authorize Obligation' : 'Unavailable'}
              </Button>

              {item.deliveryRate < 80 && (
                <p className="text-xs text-red-600 text-center">
                  <em>Delivery rate below threshold - authorization blocked</em>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mechanical Truth Footer */}
      <Alert className="border-slate-200 bg-slate-50">
        <CheckCircle className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">
          <strong>Mechanical Truth:</strong> Survival status calculated from TigerBeetle cleared obligations only. 
          No manual balance adjustments. New obligations required for corrections. 
          <em>Truth is mechanical, not administrative.</em>
        </AlertDescription>
      </Alert>
    </div>
  );
}