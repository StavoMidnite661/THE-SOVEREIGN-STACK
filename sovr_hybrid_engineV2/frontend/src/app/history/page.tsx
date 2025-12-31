'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount, useBlockNumber } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CheckCircle2, Clock, ArrowDownRight, ArrowUpRight, Shield, Wallet, ExternalLink, RefreshCw } from 'lucide-react';
import { COINBASE_CARD_ADDRESS } from '@/hooks/useCoinbase';

interface Transaction {
    id: string;
    type: 'offramp' | 'swap' | 'spend';
    amount: string;
    status: 'completed' | 'pending';
    timestamp: Date;
    txHash?: string;
    destination?: string;
}

// Load transactions from localStorage (lazy init to avoid useEffect)
const getStoredTransactions = (): Transaction[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('sovr_transactions');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((tx: Transaction) => ({
        ...tx,
        timestamp: new Date(tx.timestamp)
    }));
};

const useTransactionHistory = () => {
    const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions);

    const addTransaction = (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
        const newTx: Transaction = {
            ...tx,
            id: `tx_${Date.now()}`,
            timestamp: new Date(),
        };
        const updated = [newTx, ...transactions];
        setTransactions(updated);
        localStorage.setItem('sovr_transactions', JSON.stringify(updated));
    };

    return { transactions, addTransaction };
};

export default function HistoryPage() {
    const { isConnected, address, chain } = useAccount();
    const { data: blockNumber } = useBlockNumber({ watch: true });
    const { transactions } = useTransactionHistory();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // In production: fetch events from blockchain
        await new Promise(r => setTimeout(r, 1000));
        setIsRefreshing(false);
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card p-8 text-center max-w-md">
                    <h3 className="text-xl font-light mb-4">Connect Wallet</h3>
                    <p className="text-gray-400 text-sm mb-6">Connect to view your transaction history</p>
                    <div className="flex justify-center"><ConnectButton /></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            <div className="aurora-glow" />

            <div className="container mx-auto px-4 py-20 max-w-4xl">
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
                            <span className="bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                                History
                            </span>
                        </h1>
                        <p className="text-gray-500 text-lg font-light">
                            Your SOVR credit activity
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="glass-card p-3 hover:bg-white/5 transition-all"
                    >
                        <RefreshCw className={`w-5 h-5 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Connected Wallet Info */}
                <div className="glass-card p-5 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Connected Wallet</p>
                                <p className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Network</p>
                            <p className="text-sm text-orange-400">{chain?.name || 'Base'}</p>
                        </div>
                    </div>
                </div>

                {/* Coinbase Card Info */}
                <div className="glass-card p-5 mb-8 border border-emerald-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500">Coinbase Card Destination</p>
                            <p className="font-mono text-sm text-emerald-400">{COINBASE_CARD_ADDRESS}</p>
                        </div>
                        <a
                            href={`https://basescan.org/address/${COINBASE_CARD_ADDRESS}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-white"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="glass-card p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Offramps</p>
                        <p className="text-2xl font-light">{transactions.filter(t => t.type === 'offramp').length}</p>
                    </div>
                    <div className="glass-card p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Block</p>
                        <p className="text-2xl font-light font-mono">{blockNumber?.toString().slice(-6) || '—'}</p>
                    </div>
                    <div className="glass-card p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <p className="text-lg font-light text-emerald-400">Live</p>
                        </div>
                    </div>
                </div>

                {/* Transaction List */}
                {transactions.length > 0 ? (
                    <div className="space-y-3">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="glass-card p-5 hover:bg-white/[0.02] transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                            {tx.type === 'offramp' ? (
                                                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                                            ) : (
                                                <ArrowDownRight className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium">
                                                    {tx.type === 'offramp' ? 'Coinbase Card Offramp' : 'Swap'}
                                                </h3>
                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/20">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                    <span className="text-emerald-400">{tx.status}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-500 text-sm">
                                                {tx.timestamp.toLocaleString('en-US', {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                            {tx.txHash && (
                                                <a
                                                    href={`https://basescan.org/tx/${tx.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-orange-400 text-xs font-mono hover:underline flex items-center gap-1 mt-1"
                                                >
                                                    {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-light text-emerald-400">+{tx.amount} USDC</p>
                                        <div className="flex items-center gap-1 justify-end mt-1">
                                            <Shield className="w-3 h-3 text-emerald-400/60" />
                                            <span className="text-gray-600 text-xs">Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center">
                        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-light mb-2">No transactions yet</h3>
                        <p className="text-gray-500 text-sm">
                            Swap SOVR and send to your Coinbase Card to see activity here
                        </p>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="mt-8 flex gap-4">
                    <Link
                        href="/spend"
                        className="flex-1 glass-card p-4 text-center hover:bg-white/5 transition-all"
                    >
                        <p className="text-sm text-gray-400">Ready to spend?</p>
                        <p className="text-orange-400 font-medium">Go to Spend →</p>
                    </Link>
                    <Link
                        href="/"
                        className="flex-1 glass-card p-4 text-center hover:bg-white/5 transition-all"
                    >
                        <p className="text-sm text-gray-400">Need more credit?</p>
                        <p className="text-orange-400 font-medium">Go to Trade →</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
