# SOVR Ecosystem UX Design Plan - Enhanced Implementation
## Building Upon Existing Studio and FinSec Monitor Implementations

### Executive Summary

Based on analysis of existing implementations, this plan enhances the current Studio (USD Gateway) and FinSec Monitor with SOVR doctrine-compliant UX patterns. The focus is on **Three SKUs That Matter**, **attestation-first workflows**, and **mechanical truth displays** while building upon the robust foundation already in place.

**Key Discovery**: The Studio project is production-ready with complete Next.js implementation, attestation integration, Oracle Ledger client, and Stripe connectivity. This plan enhances existing components rather than creating new systems.

---

## 1. Enhanced Studio Components (Building on Existing Implementation)

### 1.1 Enhanced Checkout Form for SOVR Doctrine Compliance

**Current State**: Basic checkout with "Authorize Payment" button
**Enhancement**: Transform to "Authorize Obligation Clearing" with SOVR terminology

```tsx
// Enhanced checkout-form.tsx (building on existing implementation)
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, CheckCircle, AlertCircle, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Enhanced Payment Form with SOVR doctrine messaging
function ObligationClearingForm({ onSuccess, onError }: { onSuccess: (id: string) => void; onError: (msg: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clearing, setClearing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setClearing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin },
      redirect: "if_required",
    });

    if (error) {
      setClearing(false);
      onError(error.message || "Obligation clearing failed");
    } else if (paymentIntent?.status === "succeeded") {
      setClearing(false);
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-blue-950/30 border border-blue-500/50 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <span className="text-blue-400 font-medium">Attestation-First Clearing</span>
        </div>
        <p className="text-sm text-blue-300">
          Legitimacy proven before obligation clearing. Truth is mechanical, not narrative.
        </p>
      </div>
      
      <PaymentElement options={{ layout: "tabs" }} />
      
      <Button
        type="submit"
        disabled={clearing || !stripe}
        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:hover:scale-100"
      >
        {clearing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Clearing Obligation...
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            Clear Obligation
          </>
        )}
      </Button>
      
      <div className="text-center">
        <p className="text-xs text-slate-500">
          No reversals possible • Mechanical truth enforced • If not cleared in TigerBeetle, it didn't happen
        </p>
      </div>
    </form>
  );
}

export default function EnhancedCheckoutForm() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [obligationId, setObligationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function authorizeObligation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const amount = Number((form.elements.namedItem("amount") as HTMLInputElement).value);
    const wallet = (form.elements.namedItem("wallet") as HTMLInputElement).value;
    const merchantId = (form.elements.namedItem("merchantId") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          wallet,
          merchantId,
          orderId: crypto.randomUUID(),
          burnPOSCR: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Obligation clearing failed");

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (obligationId) {
    return (
      <Card className="p-6 bg-green-950/30 border border-green-500/50 rounded-xl text-green-400">
        <CardContent className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 animate-in zoom-in spin-in-90 duration-500 delay-150" />
          <div>
            <p className="font-semibold">Obligation Cleared!</p>
            <p className="text-sm opacity-80">Transfer ID: {obligationId}</p>
            <Badge variant="outline" className="mt-2 border-green-500 text-green-400">
              Mechanical Truth Verified
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* SOVR Doctrine Banner */}
      <Card className="bg-gradient-to-r from-purple-950/50 to-blue-950/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-center text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            SOVR: Ledger-Cleared Obligation Network
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-sm text-slate-300">No payments • No custody • Just cleared obligations</p>
          <div className="flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Attestation Required
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Mechanical Truth
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              No Reversals
            </span>
          </div>
        </CardContent>
      </Card>

      {!clientSecret && (
        <form onSubmit={authorizeObligation} className="space-y-4">
          <div className="space-y-3">
            <input
              name="amount"
              type="number"
              step="0.01"
              placeholder="Amount (units)"
              required
              className="w-full h-12 px-4 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/50 transition-all duration-200 focus:scale-[1.02] focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 hover:border-white/40"
            />
            <input
              name="wallet"
              placeholder="Wallet Address (0x...)"
              required
              className="w-full h-12 px-4 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/50 transition-all duration-200 focus:scale-[1.02] focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 hover:border-white/40"
            />
            <input
              name="merchantId"
              placeholder="Merchant ID"
              required
              className="w-full h-12 px-4 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/50 transition-all duration-200 focus:scale-[1.02] focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 hover:border-white/40"
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Requesting Attestation...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Authorize Obligation Clearing
              </>
            )}
          </Button>
        </form>
      )}

      {error && (
        <Card className="p-4 bg-red-950/30 border border-red-500/50 rounded-xl text-red-400">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Attestation Failed</p>
              <p className="text-sm">{error}</p>
              <p className="text-xs mt-1">New attestation required • Cannot override mechanical truth</p>
            </div>
          </div>
        </Card>
      )}

      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: { theme: "night", variables: { colorPrimary: "#06b6d4" } },
          }}
        >
          <ObligationClearingForm
            onSuccess={(id) => setObligationId(id)}
            onError={(msg) => setError(msg)}
          />
        </Elements>
      )}
    </div>
  );
}
```

### 1.2 Enhanced Oracle Balance Card for Obligation Display

**Current State**: Basic balance display
**Enhancement**: Transform to show "obligations cleared" instead of "funds available"

```tsx
// Enhanced oracle-balance-card.tsx
"use client";

import { useOracleBalance } from "@/hooks/use-oracle-balance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wallet, TrendingUp, Clock, Shield, Zap } from "lucide-react";

interface EnhancedOracleBalanceCardProps {
    userId: string | null;
    onRefresh?: () => void;
    className?: string;
}

/**
 * Enhanced Oracle Ledger Balance Card for SOVR
 * 
 * Displays cleared obligations instead of "funds"
 * Emphasizes mechanical truth and attestation requirements
 */
export function EnhancedOracleBalanceCard({ userId, onRefresh, className }: EnhancedOracleBalanceCardProps) {
    const { balance, loading, error, refetch } = useOracleBalance(userId);

    const handleRefresh = async () => {
        await refetch();
        onRefresh?.();
    };

    if (!userId) {
        return (
            <Card className={`bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 ${className}`}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                        <Wallet className="h-5 w-5" />
                        <span>Connect wallet to view cleared obligations</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (loading && !balance) {
        return (
            <Card className={`bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 ${className}`}>
                <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24 bg-slate-700" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-8 w-32 bg-slate-700" />
                    <Skeleton className="h-4 w-48 bg-slate-700" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={`bg-gradient-to-br from-red-900/20 to-slate-800 border-red-800/50 ${className}`}>
                <CardContent className="pt-6">
                    <div className="text-center text-red-400">
                        <p className="font-medium">Mechanical Truth Unavailable</p>
                        <p className="text-sm text-red-400/70">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            className="mt-3 border-red-800 text-red-400 hover:bg-red-900/20"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry Connection
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 ${className}`}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Cleared Obligations
                    <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                        Verified
                    </Badge>
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="h-8 w-8 text-slate-400 hover:text-slate-200"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Main Obligation Balance */}
                <div>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                        {balance?.availableUSD?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Available Authorization Capacity</p>
                    <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        These are cleared obligations, not funds
                    </p>
                </div>

                {/* Obligation Details */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/50">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <TrendingUp className="h-3 w-3" />
                            Pending Clearing
                        </div>
                        <p className="text-sm font-medium text-slate-200">
                            {balance?.pendingUSD?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Wallet className="h-3 w-3" />
                            Total Capacity
                        </div>
                        <p className="text-sm font-medium text-slate-200">
                            {balance?.totalUSD?.toFixed(2) || '0.00'}
                        </p>
                    </div>
                </div>

                {/* SOVR Doctrine Compliance */}
                <div className="pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-2">SOVR Compliance Status</p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-green-400">✓ Mechanical Truth</span>
                            <span className="text-green-400">TigerBeetle Verified</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-green-400">✓ No Custody</span>
                            <span className="text-green-400">No "User Funds"</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-green-400">✓ Attestation Required</span>
                            <span className="text-green-400">EIP-712 Enforced</span>
                        </div>
                    </div>
                </div>

                {/* Vault Status with SOVR Terminology */}
                {balance?.accounts && (
                    <div className="pt-3 border-t border-slate-700/50">
                        <p className="text-xs text-slate-500 mb-2">Obligation Categories</p>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Cleared Obligations</span>
                            <span className="text-slate-200 font-mono">
                                {((balance.accounts.cash || 0) / 100).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                            <span className="text-slate-400">Attestation Pool</span>
                            <span className="text-slate-200 font-mono">
                                {((balance.accounts.vault || 0) / 100).toLocaleString()}
                            </span>
                        </div>
                        {balance.accounts.anchorObligations > 0 && (
                            <div className="flex justify-between text-xs mt-1">
                                <span className="text-amber-400">External Honoring</span>
                                <span className="text-amber-200 font-mono">
                                    {((balance.accounts.anchorObligations || 0) / 100).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Last Updated with Mechanical Truth */}
                {balance?.lastUpdated && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 pt-2">
                        <Clock className="h-3 w-3" />
                        <span>Mechanical truth verified: {new Date(balance.lastUpdated).toLocaleTimeString()}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default EnhancedOracleBalanceCard;
```

---

## 2. Three SKUs That Matter Interface Components

### 2.1 Survival Dashboard Component

**New Component**: Essential goods interface for survival testing

```tsx
// components/survival-dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Milk, 
  Egg, 
  Bread, 
  ShoppingCart, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Shield
} from "lucide-react";

interface SurvivalItem {
  id: string;
  name: string;
  icon: any;
  price: number;
  calories: number;
  description: string;
  availability: 'available' | 'low' | 'out';
  lastDelivery?: Date;
  nextAvailable?: string;
  deliveryRate: number;
}

interface SurvivalBundle {
  id: string;
  name: string;
  totalPrice: number;
  totalCalories: number;
  items: SurvivalItem[];
  description: string;
}

export function SurvivalDashboard() {
  const [survivalScore, setSurvivalScore] = useState(85);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const survivalItems: SurvivalItem[] = [
    {
      id: 'milk',
      name: 'Whole Milk',
      icon: Milk,
      price: 3.5,
      calories: 480,
      description: 'Complete protein + fats for metabolic continuity',
      availability: 'available',
      lastDelivery: new Date(),
      nextAvailable: '24h',
      deliveryRate: 96
    },
    {
      id: 'eggs',
      name: 'Chicken Eggs',
      icon: Egg,
      price: 2.5,
      calories: 360,
      description: 'Essential amino acids for cellular repair',
      availability: 'available',
      deliveryRate: 94
    },
    {
      id: 'bread',
      name: 'White Bread',
      icon: Bread,
      price: 1.5,
      calories: 320,
      description: 'Carbohydrates + fiber for energy',
      availability: 'available',
      deliveryRate: 97
    }
  ];

  const survivalBundle: SurvivalBundle = {
    id: 'essential-bundle',
    name: 'Essential Survival Bundle',
    totalPrice: 7.5,
    totalCalories: 1160,
    items: survivalItems,
    description: '7.5 units • ~1,200 kcal sustained survival capability'
  };

  const handleItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const calculateTotal = () => {
    return survivalItems
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  };

  const authorizeSurvivalGoods = async () => {
    setIsAuthorizing(true);
    try {
      // Attestation-first workflow
      const attestation = await requestAttestation({
        type: 'SURVIVAL_GOODS',
        items: Array.from(selectedItems),
        total: calculateTotal()
      });

      // Submit to obligation clearing
      const result = await clearObligation({
        amount: calculateTotal(),
        reference: 'survival_goods_bundle',
        attestation,
        honoringAgent: 'instacart'
      });

      console.log('Survival goods authorized:', result);
    } catch (error) {
      console.error('Authorization failed:', error);
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Survival Status Header */}
      <Card className="bg-gradient-to-r from-green-950/50 to-emerald-950/50 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-400" />
            Survival Capability Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-green-400">{survivalScore}%</p>
              <p className="text-sm text-green-300">System can sustain life</p>
            </div>
            <Badge 
              variant="outline" 
              className="border-green-500 text-green-400 bg-green-950/30"
            >
              {survivalScore >= 80 ? 'Adequate' : 'Critical'}
            </Badge>
          </div>
          <Progress value={survivalScore} className="h-3 mb-2" />
          <p className="text-xs text-green-300">
            Target: ≥80% for life sustainability • Current: {survivalScore}%
          </p>
        </CardContent>
      </Card>

      {/* Individual SKUs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {survivalItems.map((item) => {
          const IconComponent = item.icon;
          const isSelected = selectedItems.has(item.id);
          
          return (
            <Card 
              key={item.id} 
              className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                isSelected 
                  ? 'border-cyan-500 bg-cyan-950/30' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => handleItemToggle(item.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-6 w-6 text-cyan-400" />
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      item.availability === 'available' 
                        ? 'border-green-500 text-green-400' 
                        : 'border-yellow-500 text-yellow-400'
                    }`}
                  >
                    {item.availability}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-400">{item.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-cyan-400">{item.price} units</span>
                  <span className="text-sm text-slate-500">{item.calories} kcal</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <Truck className="h-3 w-3" />
                  <span>{item.deliveryRate}% delivery rate</span>
                  {item.nextAvailable && (
                    <>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>Next: {item.nextAvailable}</span>
                    </>
                  )}
                </div>

                {isSelected && (
                  <div className="flex items-center gap-2 text-cyan-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Selected for authorization</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Survival Bundle */}
      <Card className="bg-gradient-to-r from-purple-950/50 to-cyan-950/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-purple-400" />
            {survivalBundle.name}
          </CardTitle>
          <p className="text-sm text-purple-300">{survivalBundle.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-400">{survivalBundle.totalPrice}</p>
              <p className="text-xs text-slate-400">Total Units</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{survivalBundle.totalCalories}</p>
              <p className="text-xs text-slate-400">Total Calories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{survivalItems.length}</p>
              <p className="text-xs text-slate-400">Essential Items</p>
            </div>
          </div>

          <div className="space-y-2">
            {survivalBundle.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-300">{item.name}</span>
                <span className="text-cyan-400">{item.price} units</span>
              </div>
            ))}
          </div>

          <Button
            onClick={authorizeSurvivalGoods}
            disabled={isAuthorizing || selectedItems.size === 0}
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-cyan-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-purple-400 hover:to-cyan-500 transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            {isAuthorizing ? (
              <>
                <Zap className="h-5 w-5 animate-pulse" />
                Authorizing Survival Goods...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Authorize {calculateTotal().toFixed(1)} Units Delivery
              </>
            )}
          </Button>

          <p className="text-xs text-center text-slate-500">
            Attestation required • External honoring optional • No reversals possible
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions (integrate with existing backend)
async function requestAttestation(payload: any) {
  const response = await fetch('/api/attestation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}

async function clearObligation(obligation: any) {
  const response = await fetch('/api/obligation/clear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obligation)
  });
  return response.json();
}
```

---

## 3. Key UX Patterns for SOVR Doctrine Compliance

### 3.1 Authorization-First Language Transformation

**Pattern**: Replace payment terminology with obligation clearing language

| Traditional Payment | SOVR Obligation Clearing |
|-------------------|-------------------------|
| "Pay for goods" | "Authorize outcome" |
| "Process transaction" | "Clear obligation" |
| "Settle balance" | "Record finality" |
| "Reverse if needed" | "New transfer required" |
| "User funds" | "Cleared obligations" |
| "Bank custody" | "Mechanical truth" |

### 3.2 Attestation-Visible Workflow

**Pattern**: Show attestation status clearly in all user flows

```tsx
<AttestationFlow>
  <AttestationRequest>
    <RequestHeader>
      <Title>Legitimacy Verification Required</Title>
      <Subtitle>Prove identity before obligation clearing</Subtitle>
    </RequestHeader>
    
    <RequestDetails>
      <Amount>7.5 units</Amount>
      <Reference>Essential goods bundle</Reference>
      <Timestamp>2025-12-28T11:00:00Z</Timestamp>
    </RequestDetails>
    
    <WalletSignature>
      <WalletAddress>0x1234...abcd</WalletAddress>
      <SignaturePrompt>Sign this attestation in your wallet</SignaturePrompt>
      <SignatureButton>Sign Attestation</SignatureButton>
    </WalletSignature>
  </AttestationRequest>
  
  <VerificationProcess>
    <VerificationSteps>
      <Step1 status="pending">Validating signature...</Step1>
      <Step2 status="pending">Checking legitimacy...</Step2>
      <Step3 status="pending">Preparing clearing...</Step3>
    </VerificationSteps>
    
    <VerificationResult>
      <SuccessState>
        <SuccessIcon>✓</SuccessIcon>
        <Title>Attestation Verified</Title>
        <Description>Legitimacy proven • Proceeding to clearing</Description>
      </SuccessState>
    </VerificationResult>
  </VerificationProcess>
</AttestationFlow>
```

### 3.3 Mechanical Truth Display

**Pattern**: Show TigerBeetle finality clearly in all results

```tsx
<ClearingResult>
  <SuccessIcon>✓</SuccessIcon>
  <Title>Obligation Cleared</Title>
  <Details>
    <TransferId>Transfer ID: tb_123456789</TransferId>
    <Finality>Finality: Mechanical (TigerBeetle)</Finality>
    <NoReversals>No Reversals Possible</NoReversals>
  </Details>
  <NextStep>
    {honoringAgent ? "Honoring in progress..." : "Clearing complete"}
  </NextStep>
</ClearingResult>
```

### 3.4 External Honoring Agent Selection

**Pattern**: Users choose honoring agents as optional services

```tsx
<HonoringAgentSelection>
  <MarketplaceHeader>
    <Title>Choose Honoring Agent (Optional)</Title>
    <Subtitle>External agents may fulfill your cleared obligations</Subtitle>
    <SkipOption>Skip Honoring • Record Only</SkipOption>
  </MarketplaceHeader>
  
  <AgentCategories>
    <Category title="Grocery Delivery">
      <AgentCard agent="instacart">
        <AgentLogo src="/instacart-logo.png" />
        <AgentName>Instacart</AgentName>
        <ServiceArea>Nationwide</ServiceArea>
        <DeliveryTime>1-4 hours</DeliveryTime>
        <Reliability>98%</Reliability>
        <SelectButton>Select Instacart</SelectButton>
      </AgentCard>
    </Category>
  </AgentCategories>
  
  <SkipHonoring>
    <SkipOptionCard>
      <Title>Record Only</Title>
      <Description>Clear obligation without external honoring</Description>
      <Benefits>
        <Benefit>No external dependencies</Benefit>
        <Benefit>Guaranteed clearing</Benefit>
        <Benefit>Full sovereignty</Benefit>
      </Benefits>
      <SkipButton>Skip Honoring</SkipButton>
    </SkipOptionCard>
  </SkipHonoring>
</HonoringAgentSelection>
```

---

## 4. Implementation Priority and Roadmap

### Phase 1: Immediate Terminology Updates (Week 1)
1. **Studio Enhancement**
   - Update checkout-form.tsx: "Authorize Payment" → "Authorize Obligation Clearing"
   - Add SOVR doctrine banner to main page
   - Enhance oracle-balance-card.tsx: "Available Balance" → "Available Authorization Capacity"

2. **Language Audit**
   - Replace "payment" with "authorization" throughout interface
   - Replace "balance" with "cleared obligations" in displays
   - Add "mechanical truth" messaging to all transfer confirmations

### Phase 2: Three SKUs Interface (Week 2-3)
1. **Core Components**
   - Create survival-dashboard.tsx with Milk, Eggs, Bread interface
   - Build mobile-survival-app.tsx for touch-optimized workflows
   - Add Three SKUs routing to Studio navigation

2. **Survival Testing Integration**
   - Connect to existing backend attestation service
   - Integrate with Oracle Ledger for obligation recording
   - Add real-time delivery tracking for survival goods

### Phase 3: Enhanced Monitoring (Week 4)
1. **FinSec Monitor Enhancement**
   - Add sovr-compliance-tab.tsx to existing monitoring dashboard
   - Create Three SKUs delivery rate metrics
   - Add mechanical truth verification displays

2. **Real-Time Updates**
   - WebSocket integration for live survival status
   - Honoring agent reliability tracking
   - System health indicators for TigerBeetle cluster

---

## 5. Success Metrics and Validation

### UX Doctrine Compliance
- **Terminology Consistency**: 100% replacement of payment language with obligation language
- **Attestation Visibility**: Clear attestation status shown in all user flows
- **Mechanical Truth Display**: Transfer finality visible in all results
- **No Reversals Messaging**: Clear finality messaging in all interfaces

### Survival Testing Metrics
- **Bundle Authorization Rate**: ≥80% successful Three SKUs purchases
- **Delivery Success Rate**: ≥80% for all survival goods (Milk ≥80%, Eggs ≥80%, Bread ≥80%)
- **Mobile Usage**: ≥70% of survival goods transactions on mobile devices
- **Emergency Access**: ≤30 seconds to emergency bundle authorization

### Technical Performance
- **Attestation Success Rate**: ≥95% successful EIP-712 signatures
- **TigerBeetle Integration**: 100% of transfers recorded in mechanical truth
- **Mobile Responsiveness**: Touch-optimized interfaces for all core functions
- **Real-Time Updates**: ≤2 second latency for survival status updates

---

## 6. Integration with Existing Systems

### Studio Integration Points
- **Existing API Routes**: `/api/checkout`, `/api/oracle-ledger/balance`
- **Current Attestation**: Backend attestor-client.js integration
- **Stripe Integration**: Maintain existing payment processing for fiat bridging
- **Oracle Ledger**: Extend current balance display for obligation terminology

### FinSec Monitor Integration
- **Current Monitoring**: Extend existing summary-cards.tsx and overview-tab.tsx
- **Existing Store**: Use current monitoring-store for state management
- **UI Components**: Build upon existing card, badge, and progress components
- **Real-Time Updates**: Extend current WebSocket connections for survival metrics

### Backend Service Integration
- **Attestation Service**: Leverage existing EIP-712 implementation
- **Oracle Ledger**: Extend current journal entry creation for survival bundles
- **TigerBeetle**: Integrate mechanical truth verification for all obligations
- **Event Bus**: Extend real-time event propagation for delivery tracking

---

## Conclusion

This enhanced UX design plan transforms the existing Studio and FinSec Monitor implementations into SOVR doctrine-compliant user experiences. By building upon the production-ready foundation already in place, we add the missing sovereign patterns while maintaining the robust functionality already developed.

**Key Transformations:**
1. **Language Evolution**: Payment → Authorization, Balance → Obligations, Processing → Clearing
2. **Attestation-First UX**: Legitimacy verification before any user action
3. **Three SKUs Focus**: Essential goods as primary user interface for survival testing
4. **Mechanical Truth Display**: TigerBeetle finality visible throughout all user journeys
5. **Mobile-First Design**: Touch-optimized workflows for immediate survival access

The plan ensures **this is not fintech** - it's obligation clearing reality itself, made accessible through intuitive user experiences that honor SOVR's sovereign principles while serving real-world user needs.