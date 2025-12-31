/**
 * Oracle Ledger Service
 * 
 * Client service for Studio to interact with the Oracle Ledger.
 * Provides balance queries, journal entry creation, and account lookup.
 */

// Types from shared (will be copied for Studio's use)
export enum AccountType {
  Asset = 'Asset',
  Liability = 'Liability',
  Equity = 'Equity',
  Income = 'Income',
  Expense = 'Expense',
}

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  balance?: number;
}

export interface JournalEntryLine {
  accountId: number;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  lines: JournalEntryLine[];
  source: string;
  status: 'Posted' | 'Pending';
  txHash?: string;
  eventId?: string;
}

export interface BalanceResponse {
  success: boolean;
  data?: {
    userId: string;
    available: number;
    pending: number;
    total: number;
    lastUpdated: string;
    accounts: {
      cash: number;
      vault: number;
      anchorObligations: number;
    };
  };
  error?: string;
}

export interface JournalResponse {
  success: boolean;
  journalEntryId?: string;
  error?: string;
}

/**
 * Oracle Ledger Account IDs
 * These map to the accounts in Oracle Ledger's constants.ts
 */
export const ORACLE_ACCOUNTS = {
  // Assets
  CASH_ODFI_LLC: 1000,
  CASH_VAULT_USDC: 1010,
  ACH_SETTLEMENT: 1050,
  STRIPE_CLEARING: 1060,
  
  // Liabilities
  ANCHOR_GROCERY_OBLIGATION: 2500,
  ANCHOR_UTILITY_OBLIGATION: 2501,
  ANCHOR_FUEL_OBLIGATION: 2502,
  
  // Expense
  ANCHOR_FULFILLMENT_EXPENSE: 6300,
} as const;

/**
 * Oracle Ledger Client
 * 
 * In development mode, this uses in-memory storage.
 * In production, this would connect to the Oracle Ledger API.
 */
class OracleLedgerClient {
  private baseUrl: string;
  private apiKey: string | undefined;
  
  // In-memory storage for development
  private userBalances: Map<string, { available: number; pending: number }>;
  private accountBalances: Map<number, number>;
  private journalEntries: Map<string, JournalEntry>;
  private journalCounter: number = 0;
  
  constructor() {
    this.baseUrl = process.env.ORACLE_LEDGER_URL || 'http://localhost:3001';
    this.apiKey = process.env.ORACLE_LEDGER_API_KEY;
    
    this.userBalances = new Map();
    this.accountBalances = new Map();
    this.journalEntries = new Map();
    
    // Initialize with mock balances
    this.initializeMockData();
  }
  
  private initializeMockData(): void {
    // Set initial account balances (in cents)
    this.accountBalances.set(ORACLE_ACCOUNTS.CASH_ODFI_LLC, 50000000);   // $500,000
    this.accountBalances.set(ORACLE_ACCOUNTS.CASH_VAULT_USDC, 25000000);  // $250,000
    this.accountBalances.set(ORACLE_ACCOUNTS.ACH_SETTLEMENT, 0);
    this.accountBalances.set(ORACLE_ACCOUNTS.STRIPE_CLEARING, 0);
    this.accountBalances.set(ORACLE_ACCOUNTS.ANCHOR_GROCERY_OBLIGATION, 0);
  }
  
  /**
   * Get balance for a user
   */
  async getBalance(userId: string): Promise<BalanceResponse> {
    try {
      // Get or create user balance
      let userBalance = this.userBalances.get(userId);
      
      if (!userBalance) {
        // New user gets $1000 initial balance
        userBalance = { available: 100000, pending: 0 }; // $1000 in cents
        this.userBalances.set(userId, userBalance);
      }
      
      // Get total anchor obligations
      const groceryObligation = this.accountBalances.get(ORACLE_ACCOUNTS.ANCHOR_GROCERY_OBLIGATION) || 0;
      const utilityObligation = this.accountBalances.get(ORACLE_ACCOUNTS.ANCHOR_UTILITY_OBLIGATION) || 0;
      const fuelObligation = this.accountBalances.get(ORACLE_ACCOUNTS.ANCHOR_FUEL_OBLIGATION) || 0;
      const totalObligations = groceryObligation + utilityObligation + fuelObligation;
      
      return {
        success: true,
        data: {
          userId,
          available: userBalance.available,
          pending: userBalance.pending,
          total: userBalance.available + userBalance.pending,
          lastUpdated: new Date().toISOString(),
          accounts: {
            cash: this.accountBalances.get(ORACLE_ACCOUNTS.CASH_ODFI_LLC) || 0,
            vault: this.accountBalances.get(ORACLE_ACCOUNTS.CASH_VAULT_USDC) || 0,
            anchorObligations: totalObligations,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Get balance for a specific account
   */
  async getAccountBalance(accountId: number): Promise<number> {
    return this.accountBalances.get(accountId) || 0;
  }
  
  /**
   * Create a journal entry
   */
  async createJournalEntry(
    description: string,
    lines: JournalEntryLine[],
    source: string,
    metadata?: {
      eventId?: string;
      txHash?: string;
      userId?: string;
    }
  ): Promise<JournalResponse> {
    try {
      // Validate double-entry (debits must equal credits)
      const totalDebits = lines
        .filter(l => l.type === 'DEBIT')
        .reduce((sum, l) => sum + l.amount, 0);
      
      const totalCredits = lines
        .filter(l => l.type === 'CREDIT')
        .reduce((sum, l) => sum + l.amount, 0);
      
      if (totalDebits !== totalCredits) {
        return {
          success: false,
          error: `Journal entry does not balance: Debits=${totalDebits}, Credits=${totalCredits}`,
        };
      }
      
      // Generate journal ID
      this.journalCounter++;
      const journalId = `JE-${Date.now()}-${this.journalCounter.toString().padStart(4, '0')}`;
      
      // Create entry
      const entry: JournalEntry = {
        id: journalId,
        date: new Date().toISOString().split('T')[0],
        description,
        lines,
        source,
        status: 'Posted',
        eventId: metadata?.eventId,
        txHash: metadata?.txHash,
      };
      
      // Store entry
      this.journalEntries.set(journalId, entry);
      
      // Update account balances
      for (const line of lines) {
        const currentBalance = this.accountBalances.get(line.accountId) || 0;
        const adjustment = line.type === 'DEBIT' ? line.amount : -line.amount;
        this.accountBalances.set(line.accountId, currentBalance + adjustment);
      }
      
      // Update user balance if relevant
      if (metadata?.userId) {
        const userBalance = this.userBalances.get(metadata.userId);
        if (userBalance) {
          // Check if this affects user's available balance
          const vaultChange = lines
            .filter(l => l.accountId === ORACLE_ACCOUNTS.CASH_VAULT_USDC)
            .reduce((sum, l) => sum + (l.type === 'CREDIT' ? l.amount : -l.amount), 0);
          
          userBalance.available += vaultChange;
          this.userBalances.set(metadata.userId, userBalance);
        }
      }
      
      console.log(`[OracleLedger] Created journal entry: ${journalId}`);
      
      return {
        success: true,
        journalEntryId: journalId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Record a checkout payment
   * 
   * Creates journal entries for:
   * 1. Stripe payment received: DR Stripe-Clearing, CR Cash-ODFI
   * 2. Value credited to user: DR Cash-Vault, CR User-Balance (conceptual)
   */
  async recordCheckoutPayment(
    requestId: string,
    userId: string,
    amount: number,
    paymentIntentId: string
  ): Promise<JournalResponse> {
    const amountCents = Math.round(amount * 100);
    
    // Create payment receipt journal entry
    const result = await this.createJournalEntry(
      `Stripe payment received: ${requestId} - $${amount.toFixed(2)}`,
      [
        {
          accountId: ORACLE_ACCOUNTS.STRIPE_CLEARING,
          type: 'DEBIT',
          amount: amountCents,
          description: `Payment Intent: ${paymentIntentId}`,
        },
        {
          accountId: ORACLE_ACCOUNTS.CASH_ODFI_LLC,
          type: 'CREDIT',
          amount: amountCents,
          description: 'Stripe settlement',
        },
      ],
      'PAYMENT',
      { eventId: requestId, userId }
    );
    
    if (result.success) {
      // Credit user's balance
      const userBalance = this.userBalances.get(userId) || { available: 0, pending: 0 };
      userBalance.available += amountCents;
      this.userBalances.set(userId, userBalance);
    }
    
    return result;
  }
  
  /**
   * Get journal entries for an event
   */
  async getJournalEntriesByEventId(eventId: string): Promise<JournalEntry[]> {
    const entries: JournalEntry[] = [];
    
    for (const entry of this.journalEntries.values()) {
      if (entry.eventId === eventId) {
        entries.push(entry);
      }
    }
    
    return entries;
  }
  
  /**
   * Health check
   */
  async ping(): Promise<boolean> {
    return true;
  }
}

// Singleton instance
let oracleLedgerClient: OracleLedgerClient | null = null;

export function getOracleLedgerClient(): OracleLedgerClient {
  if (!oracleLedgerClient) {
    oracleLedgerClient = new OracleLedgerClient();
  }
  return oracleLedgerClient;
}

export default OracleLedgerClient;
