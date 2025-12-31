"use client";

import { useState, useEffect, useCallback } from "react";

interface OracleBalance {
  userId: string;
  available: number;
  pending: number;
  total: number;
  availableUSD: number;
  pendingUSD: number;
  totalUSD: number;
  lastUpdated: string;
  accounts: {
    cash: number;
    vault: number;
    anchorObligations: number;
  };
}

interface UseOracleBalanceResult {
  balance: OracleBalance | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage Oracle Ledger balance for a user
 * 
 * @param userId - The user's wallet address or ID
 * @param autoRefresh - Whether to automatically refresh the balance (default: true)
 * @param refreshInterval - Refresh interval in ms (default: 30000 = 30 seconds)
 */
export function useOracleBalance(
  userId: string | null,
  autoRefresh: boolean = true,
  refreshInterval: number = 30000
): UseOracleBalanceResult {
  const [balance, setBalance] = useState<OracleBalance | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!userId) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/oracle-ledger/balance?userId=${encodeURIComponent(userId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch balance");
      }

      if (data.success && data.data) {
        setBalance(data.data);
      } else {
        throw new Error(data.error || "Invalid response");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const intervalId = setInterval(fetchBalance, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, userId, fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}

/**
 * Hook to credit value to a user's Oracle Ledger balance
 */
export function useOracleCredit() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const creditBalance = useCallback(async (
    userId: string,
    amount: number,
    description?: string,
    source?: string
  ): Promise<{ success: boolean; journalEntryId?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/oracle-ledger/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount,
          description,
          source,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to credit balance");
      }

      return {
        success: true,
        journalEntryId: data.journalEntryId,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    creditBalance,
    loading,
    error,
  };
}

export default useOracleBalance;
