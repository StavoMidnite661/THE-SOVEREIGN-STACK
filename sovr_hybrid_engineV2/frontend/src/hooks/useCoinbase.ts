'use client';

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { ROUTER_ABI, ERC20_ABI } from '@/lib/abi';
import { CONTRACTS } from '@/lib/contracts';

// Coinbase Card USDC address on Base
export const COINBASE_CARD_ADDRESS = '0x6E0Ea58833142d5aA8f856FeAb6f05BFe406d7d5' as const;

// USDC on Base
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

export function useCoinbaseOfframp() {
  const { chain, address } = useAccount();
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  /**
   * Step 1: Swap SOVR → USDC (USDC goes to user's wallet)
   */
  const swapToUSDC = async (sovrAmount: string, minUsdcOut: string) => {
    if (!chain || chain.id !== 8453) throw new Error('Please connect to Base network');
    
    const amountIn = parseUnits(sovrAmount, 18);
    const minOut = parseUnits(minUsdcOut, 6); // USDC has 6 decimals

    return writeContractAsync({
      address: CONTRACTS.base.SOVRHybridRouter,
      abi: ROUTER_ABI,
      functionName: 'swapSOVRForUSDC',
      args: [amountIn, minOut, BigInt(0)],
    });
  };

  /**
   * Step 2: Transfer USDC to Coinbase Card address
   */
  const sendToCoinbaseCard = async (usdcAmount: string) => {
    if (!chain || chain.id !== 8453) throw new Error('Please connect to Base network');
    
    const amount = parseUnits(usdcAmount, 6); // USDC has 6 decimals

    return writeContractAsync({
      address: USDC_BASE,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [COINBASE_CARD_ADDRESS, amount],
    });
  };

  /**
   * Full flow: Swap SOVR → USDC, then send to Coinbase Card
   * Note: This requires two transactions (swap + transfer)
   */
  const offrampToCoinbase = async (sovrAmount: string) => {
    // Calculate expected USDC (assuming ~1:1 for simplicity, adjust based on actual rate)
    const expectedUsdc = sovrAmount; // This should query the actual pool price
    const minUsdc = (parseFloat(expectedUsdc) * 0.99).toFixed(6); // 1% slippage

    // Step 1: Swap
    await swapToUSDC(sovrAmount, minUsdc);
    
    // Note: User will need to call sendToCoinbaseCard separately after swap confirms
    // OR we implement a batched transaction
  };

  return {
    swapToUSDC,
    sendToCoinbaseCard,
    offrampToCoinbase,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    coinbaseAddress: COINBASE_CARD_ADDRESS,
  };
}
