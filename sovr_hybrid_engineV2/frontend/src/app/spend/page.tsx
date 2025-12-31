'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CreditCard, Gift, Wallet, Loader2, CheckCircle2, Mail, ArrowRight, ExternalLink } from 'lucide-react';
import { useBalance, useApproval } from '@/hooks/useSwap';
import { useCoinbaseOfframp, COINBASE_CARD_ADDRESS } from '@/hooks/useCoinbase';
import { parseUnits } from 'viem';

type MerchantId = 'coinbase' | 'square' | 'tango' | 'instacart';

const merchants = [
    {
        id: 'coinbase' as MerchantId,
        name: 'Coinbase Card',
        icon: Wallet,
        desc: 'Direct USDC → Spend anywhere',
        enabled: true,
        highlight: true
    },
    { id: 'square' as MerchantId, name: 'Square', icon: Gift, desc: 'Universal gift cards', enabled: true },
    { id: 'tango' as MerchantId, name: 'Tango Card', icon: CreditCard, desc: '1000+ brands', enabled: true },
    { id: 'instacart' as MerchantId, name: 'Instacart', icon: Gift, desc: 'Zero-Float Groceries', enabled: true },
];

export default function SpendPage() {
    const { isConnected, chain, address } = useAccount();
    const sovrBalance = useBalance('SOVR');
    const sovrApproval = useApproval('SOVR');

    const [merchant, setMerchant] = useState<MerchantId>('coinbase');
    const [amount, setAmount] = useState('');
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'idle' | 'approving' | 'swapping' | 'sending' | 'success'>('idle');
    const [result, setResult] = useState<{ txHash?: string; usdcAmount?: string } | null>(null);

    const { swapToUSDC, sendToCoinbaseCard } = useCoinbaseOfframp();

    const needsApproval = amount && sovrApproval.allowance !== undefined &&
        parseUnits(amount || '0', 18) > sovrApproval.allowance;

    const handleCoinbaseOfframp = async () => {
        if (!amount) return;

        try {
            // Step 1: Approve if needed
            if (needsApproval) {
                setStep('approving');
                await sovrApproval.approve(parseUnits(amount, 18));
                await sovrApproval.refetch();
            }

            // Step 2: Swap SOVR → USDC
            setStep('swapping');
            const minUsdc = (parseFloat(amount) * 0.99).toFixed(6); // 1% slippage
            await swapToUSDC(amount, minUsdc);

            // Step 3: Auto-send USDC to Coinbase Card
            setStep('sending');
            await sendToCoinbaseCard(minUsdc);

            // Save to transaction history
            const stored = localStorage.getItem('sovr_transactions');
            const transactions = stored ? JSON.parse(stored) : [];
            transactions.unshift({
                id: `tx_${Date.now()}`,
                type: 'offramp',
                amount: minUsdc,
                status: 'completed',
                timestamp: new Date().toISOString(),
                destination: 'Coinbase Card',
            });
            localStorage.setItem('sovr_transactions', JSON.stringify(transactions));

            setStep('success');
            setResult({ usdcAmount: minUsdc });
            sovrBalance.refetch();

        } catch (error) {
            console.error('Offramp failed:', error);
            setStep('idle');
        }
    };

    const handleGiftCardSpend = async () => {
        if (!amount || !email) return;

        setStep('swapping');
        try {
            const res = await fetch('/api/spend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchant,
                    amount: parseFloat(amount),
                    email,
                    wallet: email || address, // Use email as ID if provided (e.g. Admin@sovr.credit)
                    orderId: `ord_${Date.now()}`
                }),
            });

            const data = await res.json();
            if (data.success) {
                setStep('success');
                setResult({ txHash: data.transactionId });
            }
        } catch (error) {
            console.error('Spend failed:', error);
            setStep('idle');
        }
    };

    const handleSpend = () => {
        if (merchant === 'coinbase') {
            handleCoinbaseOfframp();
        } else {
            handleGiftCardSpend();
        }
    };

    const isWrongNetwork = chain && chain.id !== 8453;
    const isLoading = step !== 'idle' && step !== 'success';

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card p-8 text-center max-w-md">
                    <h3 className="text-xl font-light mb-4">Connect Wallet</h3>
                    <p className="text-gray-400 text-sm mb-6">Connect to access your SOVR balance</p>
                    <div className="flex justify-center"><ConnectButton /></div>
                </div>
            </div>
        );
    }

    if (isWrongNetwork) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card p-8 text-center max-w-md">
                    <h3 className="text-xl font-light mb-4">Wrong Network</h3>
                    <p className="text-gray-400 text-sm mb-6">Please switch to Base network</p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            <div className="aurora-glow" />

            <div className="container mx-auto px-4 py-20 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
                        <span className="bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                            Spend Credit
                        </span>
                    </h1>
                    <p className="text-gray-500 text-lg font-light">
                        Convert SOVR into real-world spending power
                    </p>
                </div>

                {/* Balance Card */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">SOVR Balance</p>
                            <p className="text-4xl font-light">{parseFloat(sovrBalance.formatted).toFixed(4)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Network</p>
                            <p className="text-lg font-light text-orange-400">Base</p>
                        </div>
                    </div>
                </div>

                {/* Success Result */}
                {step === 'success' && result && (
                    <div className="glass-card p-6 mb-8 border border-emerald-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">USDC Ready to Spend!</span>
                        </div>
                        {merchant === 'coinbase' ? (
                            <div className="space-y-4">
                                <p className="text-gray-400">
                                    <span className="text-white font-medium">{result.usdcAmount} USDC</span> is now in your wallet.
                                </p>
                                <div className="bg-black/30 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-2">Send to your Coinbase Card:</p>
                                    <p className="text-sm font-mono text-orange-400 break-all">{COINBASE_CARD_ADDRESS}</p>
                                </div>
                                <a
                                    href={`https://basescan.org/address/${COINBASE_CARD_ADDRESS}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-orange-400 text-sm hover:underline"
                                >
                                    View on BaseScan <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        ) : (
                            <p className="text-gray-400">Gift card code sent to your email!</p>
                        )}
                        <button
                            onClick={() => { setStep('idle'); setResult(null); setAmount(''); }}
                            className="mt-4 text-sm text-gray-500 hover:text-white"
                        >
                            ← Make another transaction
                        </button>
                    </div>
                )}

                {step !== 'success' && (
                    <>
                        {/* Merchant Selection */}
                        <div className="mb-6">
                            <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-4">Select Method</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {merchants.map((m) => {
                                    const Icon = m.icon;
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => m.enabled && setMerchant(m.id)}
                                            disabled={!m.enabled}
                                            className={`glass-card p-5 text-left transition-all ${merchant === m.id ? 'ring-1 ring-orange-500/50 bg-orange-500/5' : ''
                                                } ${m.highlight ? 'border-emerald-500/20' : ''} ${!m.enabled ? 'opacity-40' : ''}`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Icon className={`w-5 h-5 ${m.highlight ? 'text-emerald-400' : 'text-gray-400'}`} />
                                                {m.highlight && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">DIRECT</span>}
                                            </div>
                                            <h3 className="font-medium mb-1">{m.name}</h3>
                                            <p className="text-gray-500 text-sm">{m.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="glass-card p-6 mb-4">
                            <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-4">Amount (SOVR)</h2>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-4 text-3xl font-light focus:outline-none focus:border-orange-500/30"
                            />
                            <div className="flex justify-between mt-2 text-sm">
                                <span className="text-gray-600">≈ ${amount || '0'} USDC</span>
                                <button
                                    onClick={() => setAmount(sovrBalance.formatted)}
                                    className="text-orange-400 hover:underline"
                                >
                                    Max
                                </button>
                            </div>
                        </div>

                        {/* Email for gift cards */}
                        {merchant !== 'coinbase' && (
                            <div className="glass-card p-6 mb-6">
                                <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-4">Delivery Email</h2>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@email.com"
                                        className="w-full bg-black/30 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-lg font-light focus:outline-none focus:border-orange-500/30"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Coinbase Info */}
                        {merchant === 'coinbase' && (
                            <div className="glass-card p-4 mb-6 border border-emerald-500/10">
                                <div className="flex items-start gap-3">
                                    <Wallet className="w-5 h-5 text-emerald-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-300">USDC will be sent to your Coinbase Card:</p>
                                        <p className="text-xs font-mono text-gray-500 mt-1 break-all">{COINBASE_CARD_ADDRESS}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={handleSpend}
                            disabled={!amount || isLoading || (merchant !== 'coinbase' && !email)}
                            className="w-full btn-primary py-5 rounded-xl font-medium flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {step === 'approving' ? 'Approving SOVR...' :
                                        step === 'swapping' ? 'Swapping to USDC...' :
                                            step === 'sending' ? 'Sending to Coinbase...' : 'Processing...'}
                                </>
                            ) : needsApproval ? (
                                'Approve SOVR'
                            ) : (
                                <>
                                    {merchant === 'coinbase' ? 'Swap & Send to Coinbase' : `Get ${merchant} Gift Card`}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
