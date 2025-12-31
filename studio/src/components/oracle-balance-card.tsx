"use client";

import { useOracleBalance } from "@/hooks/use-oracle-balance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet, TrendingUp, Clock } from "lucide-react";

interface OracleBalanceCardProps {
    userId: string | null;
    onRefresh?: () => void;
    className?: string;
}

/**
 * Oracle Ledger Balance Card
 * 
 * Displays the user's balance from Oracle Ledger (the source of truth)
 */
export function OracleBalanceCard({ userId, onRefresh, className }: OracleBalanceCardProps) {
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
                        <span>Connect wallet to view balance</span>
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
                        <p className="font-medium">Unable to load balance</p>
                        <p className="text-sm text-red-400/70">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            className="mt-3 border-red-800 text-red-400 hover:bg-red-900/20"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
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
                    <Wallet className="h-4 w-4" />
                    Oracle Ledger Balance
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
                {/* Main Balance */}
                <div>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                        ${balance?.availableUSD?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Available Balance</p>
                </div>

                {/* Balance Details */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/50">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <TrendingUp className="h-3 w-3" />
                            Pending
                        </div>
                        <p className="text-sm font-medium text-slate-200">
                            ${balance?.pendingUSD?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Wallet className="h-3 w-3" />
                            Total
                        </div>
                        <p className="text-sm font-medium text-slate-200">
                            ${balance?.totalUSD?.toFixed(2) || '0.00'}
                        </p>
                    </div>
                </div>

                {/* Vault Info */}
                {balance?.accounts && (
                    <div className="pt-3 border-t border-slate-700/50">
                        <p className="text-xs text-slate-500 mb-2">Vault Status</p>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Cash Pool</span>
                            <span className="text-slate-200 font-mono">
                                ${((balance.accounts.cash || 0) / 100).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                            <span className="text-slate-400">USDC Vault</span>
                            <span className="text-slate-200 font-mono">
                                ${((balance.accounts.vault || 0) / 100).toLocaleString()}
                            </span>
                        </div>
                        {balance.accounts.anchorObligations > 0 && (
                            <div className="flex justify-between text-xs mt-1">
                                <span className="text-amber-400">Pending Fulfillment</span>
                                <span className="text-amber-200 font-mono">
                                    ${((balance.accounts.anchorObligations || 0) / 100).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Last Updated */}
                {balance?.lastUpdated && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 pt-2">
                        <Clock className="h-3 w-3" />
                        Updated {new Date(balance.lastUpdated).toLocaleTimeString()}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default OracleBalanceCard;
