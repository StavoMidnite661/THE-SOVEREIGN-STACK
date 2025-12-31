'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { ROUTER_ABI, ERC20_ABI } from '@/lib/abi';
import { CONTRACTS } from '@/lib/contracts';

// Hook for SOVR ↔ USDC swaps via V2 Router
export function useSwap() {
  const { chain } = useAccount();
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const swapSOVRForUSDC = async (amount: string, minOut: string) => {
    if (!chain || chain.id !== 8453) throw new Error('Please connect to Base network');
    
    const amountIn = parseUnits(amount, 18); // SOVR has 18 decimals
    const minAmountOut = parseUnits(minOut, 6); // USDC has 6 decimals

    return writeContractAsync({
      address: CONTRACTS.base.SOVRHybridRouter,
      abi: ROUTER_ABI,
      functionName: 'swapSOVRForUSDC',
      args: [amountIn, minAmountOut, BigInt(0)],
    });
  };

  const swapUSDCForSOVR = async (amount: string, minOut: string) => {
    if (!chain || chain.id !== 8453) throw new Error('Please connect to Base network');
    
    const amountIn = parseUnits(amount, 6); // USDC has 6 decimals
    const minAmountOut = parseUnits(minOut, 18); // SOVR has 18 decimals

    return writeContractAsync({
      address: CONTRACTS.base.SOVRHybridRouter,
      abi: ROUTER_ABI,
      functionName: 'swapUSDCForSOVR',
      args: [amountIn, minAmountOut, BigInt(0)],
    });
  };

  return {
    swapSOVRForUSDC,
    swapUSDCForSOVR,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}

// Hook for token balances
export function useBalance(token: 'SOVR' | 'USDC' | 'sFIAT') {
  const { address } = useAccount();
  
  let tokenAddress: `0x${string}`;
  let decimals: number;
  
  switch (token) {
    case 'SOVR':
      tokenAddress = CONTRACTS.base.SOVR;
      decimals = 18;
      break;
    case 'USDC':
      tokenAddress = CONTRACTS.base.USDC;
      decimals = 6;
      break;
    case 'sFIAT':
      tokenAddress = CONTRACTS.base.sFIAT;
      decimals = 18;
      break;
  }

  const { data: balance, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const formatted = balance ? formatUnits(balance, decimals) : '0';

  return { balance, formatted, refetch, decimals };
}

// Hook for token approval
export function useApproval(token: 'SOVR' | 'USDC' | 'sFIAT') {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  
  let tokenAddress: `0x${string}`;
  let decimals: number;
  
  switch (token) {
    case 'SOVR':
      tokenAddress = CONTRACTS.base.SOVR;
      decimals = 18;
      break;
    case 'USDC':
      tokenAddress = CONTRACTS.base.USDC;
      decimals = 6;
      break;
    case 'sFIAT':
      tokenAddress = CONTRACTS.base.sFIAT;
      decimals = 18;
      break;
  }

  const { data: allowance, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.base.SOVRHybridRouter] : undefined,
    query: { enabled: !!address },
  });

  const approve = async (amount: bigint) => {
    return writeContractAsync({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.base.SOVRHybridRouter, amount],
    });
  };

  return { allowance, approve, isPending, refetch, decimals };
}
