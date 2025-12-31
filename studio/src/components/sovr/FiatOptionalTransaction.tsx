'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertTriangle,
  ArrowUpDown,
  Bitcoin,
  Calculator,
  CheckCircle,
  Clock,
  DollarSign,
  Euro,
  Eye,
  EyeOff,
  Globe,
  PoundSterling,
  RefreshCw,
  Shield,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // SOVR units per 1 unit of currency
  icon: React.ReactNode;
  isFiat: boolean;
  stability: 'high' | 'medium' | 'low';
  adoptionRate: number; // 0-100
}

interface TransactionRequest {
  id: string;
  amount: number;
  description: string;
  counterparty: string;
  urgency: 'normal' | 'high' | 'critical';
}

interface FiatOptionalTransactionProps {
  transaction: TransactionRequest;
  onSettlementComplete: (settlementData: any) => void;
  className?: string;
}

export default function FiatOptionalTransaction({
  transaction,
  onSettlementComplete,
  className = '',
}: FiatOptionalTransactionProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('sovr');
  const [conversionRates, setConversionRates] = useState<Record<string, Currency>>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settlementMethod, setSettlementMethod] = useState<'sovr' | 'fiat' | 'mixed'>('sovr');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Mock conversion rates (in real implementation, this would fetch from API)
  const mockCurrencies: Record<string, Currency> = {
    sovr: {
      code: 'SOVR',
      name: 'SOVR',
      symbol: 'SOVR',
      rate: 1.0,
      icon: <Zap className="h-4 w-4" />,
      isFiat: false,
      stability: 'high',
      adoptionRate: 100
    },
    usd: {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      rate: 0.85,
      icon: <DollarSign className="h-4 w-4" />,
      isFiat: true,
      stability: 'medium',
      adoptionRate: 45
    },
    eur: {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      rate: 0.78,
      icon: <Euro className="h-4 w-4" />,
      isFiat: true,
      stability: 'high',
      adoptionRate: 32
    },
    gbp: {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      rate: 0.67,
      icon: <PoundSterling className="h-4 w-4" />,
      isFiat: true,
      stability: 'high',
      adoptionRate: 18
    },
    jpy: {
      code: 'JPY',
      name: 'Japanese Yen',
      symbol: '¥',
      rate: 125.50,
      icon: <CircleDollarSign className="h-4 w-4" />,
      isFiat: true,
      stability: 'medium',
      adoptionRate: 12
    },
    btc: {
      code: 'BTC',
      name: 'Bitcoin',
      symbol: '₿',
      rate: 0.000021,
      icon: <Bitcoin className="h-4 w-4" />,
      isFiat: false,
      stability: 'low',
      adoptionRate: 8
    }
  };

  useEffect(() => {
    setConversionRates(mockCurrencies);
  }, []);

  const refreshRates = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const calculateSOVRAmount = (amount: number, currencyCode: string): number => {
    const currency = conversionRates[currencyCode];
    if (!currency) return amount;
    return amount / currency.rate;
  };

  const calculateConversion = (amount: number, fromCurrency: string, toCurrency: string): number => {
    const from = conversionRates[fromCurrency];
    const to = conversionRates[toCurrency];
    if (!from || !to) return amount;
    
    const amountInSOVR = amount / from.rate;
    return amountInSOVR * to.rate;
  };

  const getSettlementAmount = (): number => {
    if (settlementMethod === 'sovr') {
      return calculateSOVRAmount(transaction.amount, 'sovr');
    } else if (settlementMethod === 'fiat') {
      return transaction.amount;
    } else {
      // Mixed: 50% SOVR, 50% selected currency
      const sovrAmount = calculateSOVRAmount(transaction.amount, selectedCurrency) / 2;
      return sovrAmount;
    }
  };

  const getStabilityColor = (stability: string) => {
    switch (stability) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStabilityBadge = (stability: string) => {
    switch (stability) {
      case 'high':
        return <Badge className="bg-green-100 text-green-800 border-green-200">High Stability</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Stability</Badge>;
      case 'low':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Low Stability</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleSettlement = async () => {
    const settlementData = {
      transactionId: transaction.id,
      amount: getSettlementAmount(),
      currency: selectedCurrency,
      method: settlementMethod,
      timestamp: new Date().toISOString()
    };
    
    await onSettlementComplete(settlementData);
  };

  return (
    <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
      {/* SOVR Doctrine Header */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>SOVR Doctrine:</strong> Fiat is optional, not privileged. All currencies are equal. 
          SOVR units provide mechanical truth foundation. <em>No USD dominance, no currency hierarchy.</em>
        </AlertDescription>
      </Alert>

      {/* Transaction Summary */}
      <Card className="border-2 border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Transaction Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Amount:</span>
              <p className="text-2xl font-bold">{transaction.amount} SOVR</p>
              <p className="text-sm text-gray-600">{transaction.description}</p>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Counterparty:</span>
              <p className="text-lg font-medium">{transaction.counterparty}</p>
              <Badge variant="outline" className="text-xs">
                {transaction.urgency} priority
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settlement Method Selection */}
      <Card className="border-2 border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Settlement Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={settlementMethod} onValueChange={(value) => setSettlementMethod(value as any)}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sovr" id="sovr" />
                <Label htmlFor="sovr" className="flex items-center gap-2 cursor-pointer">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">SOVR Native Settlement</div>
                    <div className="text-sm text-gray-600">Pure SOVR units, mechanical truth</div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fiat" id="fiat" />
                <Label htmlFor="fiat" className="flex items-center gap-2 cursor-pointer">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Fiat Settlement</div>
                    <div className="text-sm text-gray-600">Traditional currency through honoring agent</div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="mixed" />
                <Label htmlFor="mixed" className="flex items-center gap-2 cursor-pointer">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-medium">Mixed Settlement</div>
                    <div className="text-sm text-gray-600">50% SOVR, 50% selected currency</div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Currency Selection (when Fiat or Mixed) */}
      {(settlementMethod === 'fiat' || settlementMethod === 'mixed') && (
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Globe className="h-5 w-5" />
              Select Currency
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshRates}
                disabled={isRefreshing}
                className="border-amber-300 text-amber-700"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Rates
              </Button>
              <span className="text-sm text-amber-700">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(conversionRates).filter(([code]) => code !== 'sovr').map(([code, currency]) => (
                <div
                  key={code}
                  onClick={() => setSelectedCurrency(code)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedCurrency === code
                      ? 'border-amber-500 bg-amber-100'
                      : 'border-amber-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {currency.icon}
                      <span className="font-medium">{currency.name}</span>
                      <span className="text-sm text-gray-600">({currency.code})</span>
                    </div>
                    {getStabilityBadge(currency.stability)}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-medium">1 SOVR = {currency.rate} {currency.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Converted:</span>
                      <span className="font-medium">
                        {calculateConversion(transaction.amount, 'sovr', code).toFixed(2)} {currency.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Adoption:</span>
                      <span className={`font-medium ${getStabilityColor(currency.stability)}`}>
                        {currency.adoptionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Alert className="border-amber-200 bg-amber-100">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Important:</strong> Fiat settlement requires external honoring agent. 
                SOVR mechanical truth still governs the transaction. No USD privilege enforced.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Settlement Preview */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Settlement Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium text-green-700">Settlement Amount:</span>
              <p className="text-2xl font-bold text-green-800">
                {getSettlementAmount().toFixed(2)} {settlementMethod === 'sovr' ? 'SOVR' : conversionRates[selectedCurrency]?.symbol}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-green-700">Method:</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                {settlementMethod === 'sovr' ? 'Native SOVR' : 
                 settlementMethod === 'fiat' ? 'Fiat Settlement' : 'Mixed Settlement'}
              </Badge>
            </div>
          </div>

          {settlementMethod !== 'sovr' && (
            <div className="p-3 bg-green-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Conversion Breakdown:</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <div>Original: {transaction.amount} SOVR</div>
                <div>
                  {settlementMethod === 'mixed' ? (
                    <>
                      SOVR Portion: {(getSettlementAmount()).toFixed(2)} SOVR
                      <br />
                      Fiat Portion: {(calculateConversion(getSettlementAmount(), 'sovr', selectedCurrency)).toFixed(2)} {conversionRates[selectedCurrency]?.symbol}
                    </>
                  ) : (
                    <>
                      Total: {calculateConversion(transaction.amount, 'sovr', selectedCurrency).toFixed(2)} {conversionRates[selectedCurrency]?.symbol}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleSettlement}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            Complete Settlement
          </Button>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card className="border-2 border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            {showAdvancedOptions ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
            Advanced Options
          </CardTitle>
        </CardHeader>
        {showAdvancedOptions && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Rate Volatility:</span>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Stable (last 24h)</span>
                </div>
              </div>
              <div>
                <span className="font-medium">Settlement Time:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span>~2-5 minutes</span>
                </div>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Mechanical Truth Guarantee:</strong> All settlements, regardless of currency, 
                are validated through TigerBeetle clearing. No manual overrides or balance edits possible.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* SOVR Doctrine Footer */}
      <Alert className="border-slate-200 bg-slate-50">
        <CheckCircle className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">
          <strong>SOVR Fiat-Optional Principle:</strong> Currency choice is user preference, not system requirement. 
          SOVR provides mechanical truth foundation. All currencies equal, no USD privilege. 
          <em>Truth is mechanical, not currency-based.</em>
        </AlertDescription>
      </Alert>
    </div>
  );
}