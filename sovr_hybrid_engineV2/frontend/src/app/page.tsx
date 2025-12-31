'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowDownUp, Loader2, CheckCircle2, AlertCircle, ShieldCheck, XCircle, ExternalLink } from 'lucide-react';
import { useSwap, useBalance, useApproval } from '@/hooks/useSwap';
import { parseUnits, formatUnits } from 'viem';

export default function TradePage() {
  const { isConnected, chain } = useAccount();
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'toUSDC' | 'toSOVR'>('toUSDC');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'approving' | 'swapping' | 'success'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);

  const { swapSOVRForUSDC, swapUSDCForSOVR, isPending, isConfirming, hash } = useSwap();
  const sovrBalance = useBalance('SOVR');
  const usdcBalance = useBalance('USDC');
  const approval = useApproval(direction === 'toUSDC' ? 'SOVR' : 'USDC');

  const fromToken = direction === 'toUSDC' ? 'SOVR' : 'USDC';
  const toToken = direction === 'toUSDC' ? 'USDC' : 'SOVR';
  const fromBalance = direction === 'toUSDC' ? sovrBalance : usdcBalance;
  const toBalance = direction === 'toUSDC' ? usdcBalance : sovrBalance;
  const fromDecimals = direction === 'toUSDC' ? 18 : 6;
  const toDecimals = direction === 'toUSDC' ? 6 : 18;

  // Estimate output (simplified 1:1 for now - real app would query pool)
  const estimatedOutput = amount ? (parseFloat(amount)).toFixed(toDecimals === 6 ? 2 : 4) : '0';

  // Check if user has enough balance
  const hasEnoughBalance = amount && fromBalance.balance &&
    parseUnits(amount || '0', fromDecimals) <= fromBalance.balance;

  // Check if approval is needed
  const needsApproval = amount && approval.allowance !== undefined &&
    parseUnits(amount || '0', fromDecimals) > approval.allowance;

  // Format allowance for display
  const currentAllowance = approval.allowance ? formatUnits(approval.allowance, fromDecimals) : '0';

  const handleApprove = async () => {
    if (!amount) return;
    setError(null);
    setStep('approving');

    try {
      await approval.approve(parseUnits(amount, fromDecimals));
      await approval.refetch();
      setStep('idle');
    } catch (err) {
      console.error('Approval failed:', err);
      setError('Approval failed. Please try again.');
      setStep('idle');
    }
  };

  const handleSwap = async () => {
    if (!amount) return;
    setError(null);

    // Check balance first
    if (!hasEnoughBalance) {
      setError(`Insufficient ${fromToken} balance. You have ${parseFloat(fromBalance.formatted).toFixed(4)} ${fromToken}.`);
      return;
    }

    // Check approval
    if (needsApproval) {
      setError(`Please approve ${fromToken} first before swapping.`);
      return;
    }

    setStep('swapping');

    try {
      // Calculate min output with 1% slippage
      const minOut = (parseFloat(amount) * 0.99).toFixed(toDecimals);

      let result;
      if (direction === 'toUSDC') {
        result = await swapSOVRForUSDC(amount, minOut);
      } else {
        result = await swapUSDCForSOVR(amount, minOut);
      }

      setTxHash(result);
      setStep('success');
      setAmount('');
      sovrBalance.refetch();
      usdcBalance.refetch();
      approval.refetch();

      // Reset success after 5 seconds
      setTimeout(() => {
        setStep('idle');
        setTxHash(null);
      }, 5000);
    } catch (err: unknown) {
      console.error('Swap failed:', err);

      // Parse error for user-friendly message
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      if (errorMessage.includes('transferFrom failed')) {
        setError('Transfer failed. Make sure you have approved the router to spend your tokens.');
      } else if (errorMessage.includes('insufficient')) {
        setError(`Insufficient ${fromToken} balance.`);
      } else if (errorMessage.includes('reverted')) {
        setError('Transaction reverted. The pool may not have enough liquidity.');
      } else if (errorMessage.includes('user rejected')) {
        setError('Transaction cancelled by user.');
      } else {
        setError(`Swap failed: ${errorMessage.slice(0, 100)}`);
      }

      setStep('idle');
    }
  };

  const toggleDirection = () => {
    setDirection(d => d === 'toUSDC' ? 'toSOVR' : 'toUSDC');
    setAmount('');
    setError(null);
  };

  const isWrongNetwork = chain && chain.id !== 8453;
  const isLoading = step === 'approving' || step === 'swapping' || isPending || isConfirming;

  return (
    <div className="min-h-screen relative">
      {/* Aurora Background  */}
      <div className="aurora-glow" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
            <span className="text-white/90">Credit</span>
            <span className="text-white"> Terminal</span>
          </h1>
          <p className="text-white text-lg font-light">
            Swap SOVR ↔ USDC on Base
          </p>
        </div>

        {/* Swap Card */}
        <div className="max-w-md mx-auto">
          <div className="glass-card p-6 rounded-2xl hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:border-orange-500/30 transition-all duration-500 group">
            {/* Wrong Network Warning */}
            {isWrongNetwork && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm">Please switch to Base network</span>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Success Display */}
            {step === 'success' && txHash && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Swap successful!</span>
                </div>
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-400/70 hover:text-green-400 flex items-center gap-1"
                >
                  View on BaseScan <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* From Token */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white uppercase tracking-wider text-xs">From</span>
                <span className="text-white text-xs">
                  Balance: {parseFloat(fromBalance.formatted).toFixed(4)} {fromToken}
                </span>
              </div>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:border-orange-500/50 focus:outline-none transition-colors"
                  disabled={isLoading}
                />
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 min-w-[100px]">
                  <span className="text-white font-medium">{fromToken}</span>
                </div>
              </div>
              <button
                onClick={() => setAmount(fromBalance.formatted)}
                className="mt-2 text-xs text-orange-400 hover:text-orange-300 transition-colors"
              >
                Max
              </button>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center -my-1 relative z-10">
              <button
                onClick={toggleDirection}
                disabled={isLoading}
                className="p-2 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-900/20 transition-all transform hover:scale-110 disabled:opacity-50 hover:shadow-orange-500/30"
              >
                <ArrowDownUp className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* To Token */}
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white uppercase tracking-wider text-xs">To (estimated)</span>
                <span className="text-white text-xs">
                  Balance: {parseFloat(toBalance.formatted).toFixed(4)} {toToken}
                </span>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={estimatedOutput}
                  readOnly
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70 text-lg"
                />
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 min-w-[100px]">
                  <span className="text-white font-medium">{toToken}</span>
                </div>
              </div>
            </div>

            {/* Approval Status */}
            <div className="mt-4 p-3 bg-white/5 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-sm">Approve {fromToken}</span>
                </div>
                {needsApproval ? (
                  <span className="text-amber-400 text-sm">Required</span>
                ) : (
                  <span className="text-green-400 text-sm">Approved ✓</span>
                )}
              </div>
              {needsApproval && (
                <p className="text-white/80 text-xs mt-1">
                  Current allowance: {parseFloat(currentAllowance).toFixed(4)} {fromToken}
                </p>
              )}
            </div>

            {/* Swap Info */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white">Rate</span>
                <span className="text-white">1 {fromToken} ≈ 1 {toToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Slippage</span>
                <span className="text-white">1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Network</span>
                <span className="text-white">Base</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {!isConnected ? (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="w-full py-4 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white transition-all hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Connect Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              ) : needsApproval && amount ? (
                <button
                  onClick={handleApprove}
                  disabled={isLoading || !amount || isWrongNetwork}
                  className="w-full py-4 rounded-xl font-medium bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {step === 'approving' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    `Approve ${fromToken}`
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSwap}
                  disabled={isLoading || !amount || !hasEnoughBalance || isWrongNetwork}
                  className="w-full py-4 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {step === 'swapping' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Swapping...
                    </>
                  ) : !amount ? (
                    'Enter amount'
                  ) : !hasEnoughBalance ? (
                    `Insufficient ${fromToken}`
                  ) : (
                    `Swap ${fromToken} → ${toToken}`
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Router Info */}
          <div className="mt-4 text-center">
            <a
              href="https://basescan.org/address/0x200dbb33ff5ff1a75d9d7f49b88e8361349eda4d"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/70 hover:text-white flex items-center justify-center gap-1"
            >
              V2 Router: 0x200d...da4d <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 w-full text-center text-white text-xs">
        <p className="mb-2">© 2025 SOVR Pay. All rights reserved. A new era in digital finance.</p>
        <div className="flex justify-center gap-4">
          <a href="#" className="hover:text-gray-300 transition-colors">Docs</a>
          <a href="#" className="hover:text-gray-300 transition-colors">API Reference</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
