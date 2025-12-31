import { NextResponse } from "next/server";
import { z } from "zod";
import { getOracleLedgerClient, ORACLE_ACCOUNTS } from "@/lib/oracle-ledger.service";

const BalanceQuerySchema = z.object({
  userId: z.string().min(1),
  accountId: z.number().optional(),
});

/**
 * GET /api/oracle-ledger/balance
 * 
 * Query balance from Oracle Ledger
 * 
 * Query params:
 * - userId: User wallet address or ID
 * - accountId: (optional) Specific account to query
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const accountIdStr = searchParams.get("accountId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }
    
    const oracleClient = getOracleLedgerClient();
    
    // If accountId specified, return specific account balance
    if (accountIdStr) {
      const accountId = parseInt(accountIdStr, 10);
      const balance = await oracleClient.getAccountBalance(accountId);
      
      return NextResponse.json({
        success: true,
        data: {
          accountId,
          balance,
          balanceUSD: balance / 100,
        },
      });
    }
    
    // Otherwise return user balance
    const result = await oracleClient.getBalance(userId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...result.data,
        availableUSD: (result.data?.available || 0) / 100,
        pendingUSD: (result.data?.pending || 0) / 100,
        totalUSD: (result.data?.total || 0) / 100,
      },
    });
  } catch (err: any) {
    console.error("Oracle Ledger Balance Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/oracle-ledger/balance
 * 
 * Record a value credit to user's Oracle Ledger balance
 */
export async function POST(req: Request) {
  try {
    const json = await req.json();
    
    const { userId, amount, source, description } = json;
    
    if (!userId || amount === undefined) {
      return NextResponse.json(
        { error: "userId and amount are required" },
        { status: 400 }
      );
    }
    
    const oracleClient = getOracleLedgerClient();
    const amountCents = Math.round(amount * 100);
    
    // Create journal entry to credit user's balance
    const result = await oracleClient.createJournalEntry(
      description || `Value credit to ${userId}: $${amount.toFixed(2)}`,
      [
        {
          accountId: ORACLE_ACCOUNTS.CASH_VAULT_USDC,
          type: "CREDIT",
          amount: amountCents,
          description: `Credit to ${userId}`,
        },
        {
          accountId: ORACLE_ACCOUNTS.CASH_ODFI_LLC,
          type: "DEBIT",
          amount: amountCents,
          description: source || "Balance credit",
        },
      ],
      source || "PAYMENT",
      { userId }
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    // Get updated balance
    const balanceResult = await oracleClient.getBalance(userId);
    
    return NextResponse.json({
      success: true,
      journalEntryId: result.journalEntryId,
      balance: balanceResult.data,
    });
  } catch (err: any) {
    console.error("Oracle Ledger Credit Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
