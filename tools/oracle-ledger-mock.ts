/**
 * Oracle Ledger Mock Service
 * 
 * Simplified mock service for development.
 * Implements IOracleLedgerBridge interface with mock responses.
 */

// Type definitions
interface CreateJournalEntryRequest {
  description: string;
  lines: JournalEntryLine[];
  source: string;
  status?: string;
  eventId?: string;
  attestationHash?: string;
}

interface CreateJournalEntryResponse {
  success: boolean;
  journalEntryId?: string;
  error?: string;
}

interface JournalEntryLine {
  accountId: number;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string;
}

interface AnchorAuthorization {
  eventId: string;
  user: string;
  anchorType: string;
  units: bigint;
  expiry: number;
  attestationSignature?: string;
}

type AnchorType = 'GROCERY' | 'UTILITY' | 'FUEL' | 'MOBILE' | 'HOUSING' | 'MEDICAL';

interface IOracleLedgerBridge {
  createJournalEntry(request: CreateJournalEntryRequest): Promise<CreateJournalEntryResponse>;
  getJournalEntry(id: string): Promise<any>;
  getJournalEntriesByEventId(eventId: string): Promise<any[]>;
  getAccountBalance(accountId: number): Promise<number>;
  getAccountBalances(accountIds: number[]): Promise<Record<number, number>>;
  recordAnchorAuthorization(auth: AnchorAuthorization): Promise<CreateJournalEntryResponse>;
  recordAnchorFulfillment(
    eventId: string,
    anchorType: AnchorType,
    units: bigint,
    proofHash: string
  ): Promise<CreateJournalEntryResponse>;
  recordAnchorExpiry(
    eventId: string,
    anchorType: AnchorType,
    units: bigint,
    user: string
  ): Promise<CreateJournalEntryResponse>;
  recordAttestationVerified(
    orderId: string,
    amount: number,
    recipient: string,
    attestor: string,
    txHash: string
  ): Promise<CreateJournalEntryResponse>;
  ping(): Promise<boolean>;
}

// =============================================================================
// ORACLE LEDGER MOCK SERVICE
// =============================================================================

export class OracleLedgerMockService implements IOracleLedgerBridge {
  private journalIdCounter: number = 0;

  constructor() {
    console.log('[OracleLedger-Mock] Service initialized');
  }

  // =============================================================================
  // IOracleLedgerBridge Implementation
  // =============================================================================

  async createJournalEntry(request: CreateJournalEntryRequest): Promise<CreateJournalEntryResponse> {
    try {
      // Validate double-entry
      const totalDebits = request.lines
        .filter(l => l.type === 'DEBIT')
        .reduce((sum, l) => sum + l.amount, 0);
      
      const totalCredits = request.lines
        .filter(l => l.type === 'CREDIT')
        .reduce((sum, l) => sum + l.amount, 0);

      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        return {
          success: false,
          error: `Journal entry does not balance: Debits=${totalDebits}, Credits=${totalCredits}`,
        };
      }

      const journalId = this.generateJournalId();
      
      console.log(`[OracleLedger-Mock] Created journal entry: ${journalId}`);
      console.log(`  Description: ${request.description}`);
      console.log(`  Source: ${request.source}`);
      console.log(`  Lines: ${request.lines.length} (Debits: ${totalDebits}, Credits: ${totalCredits})`);
      
      return {
        success: true,
        journalEntryId: journalId,
      };
    } catch (error) {
      console.error('[OracleLedger-Mock] Error creating journal entry:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getJournalEntry(id: string): Promise<any> {
    try {
      return {
        id,
        date: new Date().toISOString().split('T')[0],
        description: `Mock journal entry ${id}`,
        lines: [],
        source: 'MOCK',
        status: 'Posted',
        eventId: id,
      };
    } catch (error) {
      console.error('[OracleLedger-Mock] Error getting journal entry:', error);
      return null;
    }
  }

  async getJournalEntriesByEventId(eventId: string): Promise<any[]> {
    try {
      console.log(`[OracleLedger-Mock] Getting journal entries for event: ${eventId}`);
      return [];
    } catch (error) {
      console.error('[OracleLedger-Mock] Error getting journal entries by event ID:', error);
      return [];
    }
  }

  async getAccountBalance(accountId: number): Promise<number> {
    try {
      // Return mock balance based on account ID
      const mockBalances: Record<number, number> = {
        1000: 50000000,  // Cash-ODFI-LLC: $500,000
        1010: 25000000,  // Cash-Vault-USDC: $250,000
        1050: 0,         // ACH-Settlement
        1060: 0,         // Stripe-Clearing
        2500: 0,         // ANCHOR_GROCERY_OBLIGATION
        2501: 0,         // ANCHOR_UTILITY_OBLIGATION
        2502: 0,         // ANCHOR_FUEL_OBLIGATION
      };
      
      return mockBalances[accountId] || Math.random() * 10000;
    } catch (error) {
      console.error('[OracleLedger-Mock] Error getting account balance:', error);
      return 0;
    }
  }

  async getAccountBalances(accountIds: number[]): Promise<Record<number, number>> {
    try {
      const balances: Record<number, number> = {};
      for (const accountId of accountIds) {
        balances[accountId] = await this.getAccountBalance(accountId);
      }
      return balances;
    } catch (error) {
      console.error('[OracleLedger-Mock] Error getting account balances:', error);
      return {};
    }
  }

  async recordAnchorAuthorization(auth: AnchorAuthorization): Promise<CreateJournalEntryResponse> {
    console.log(`[OracleLedger-Mock] Recording anchor authorization: ${auth.eventId}`);
    console.log(`  User: ${auth.user}`);
    console.log(`  Type: ${auth.anchorType}`);
    console.log(`  Units: ${auth.units}`);

    // Create journal entry (debit cash, credit obligation)
    const obligationAccountId = this.getAnchorObligationAccountId(auth.anchorType as AnchorType);
    
    const journalRequest: CreateJournalEntryRequest = {
      description: `Anchor authorization: ${auth.anchorType} - ${auth.units} units for ${auth.user}`,
      source: 'ANCHOR',
      status: 'Posted',
      lines: [
        {
          accountId: 1010, // Cash-Vault-USDC
          type: 'DEBIT',
          amount: Number(auth.units),
          description: `User ${auth.user} authorized spend`,
        },
        {
          accountId: obligationAccountId,
          type: 'CREDIT',
          amount: Number(auth.units),
          description: `${auth.anchorType} fulfillment obligation`,
        },
      ],
      eventId: auth.eventId,
    };

    return this.createJournalEntry(journalRequest);
  }

  async recordAnchorFulfillment(
    eventId: string,
    anchorType: AnchorType,
    units: bigint,
    proofHash: string
  ): Promise<CreateJournalEntryResponse> {
    console.log(`[OracleLedger-Mock] Recording anchor fulfillment: ${eventId}`);
    console.log(`  Type: ${anchorType}`);
    console.log(`  Units: ${units}`);
    console.log(`  Proof: ${proofHash.substring(0, 16)}...`);

    // Create journal entry (debit obligation, credit expense)
    const obligationAccountId = this.getAnchorObligationAccountId(anchorType);
    
    const journalRequest: CreateJournalEntryRequest = {
      description: `Anchor fulfillment: ${anchorType} - ${units} units fulfilled`,
      source: 'ANCHOR',
      status: 'Posted',
      lines: [
        {
          accountId: obligationAccountId,
          type: 'DEBIT',
          amount: Number(units),
          description: 'Obligation cleared by fulfillment',
        },
        {
          accountId: 6300, // ANCHOR_FULFILLMENT_EXPENSE
          type: 'CREDIT',
          amount: Number(units),
          description: 'Fulfillment cost recognized',
        },
      ],
      eventId,
      attestationHash: proofHash,
    };

    return this.createJournalEntry(journalRequest);
  }

  async recordAnchorExpiry(
    eventId: string,
    anchorType: AnchorType,
    units: bigint,
    user: string
  ): Promise<CreateJournalEntryResponse> {
    console.log(`[OracleLedger-Mock] Recording anchor expiry: ${eventId}`);
    console.log(`  Type: ${anchorType}`);
    console.log(`  Units: ${units}`);
    console.log(`  User: ${user}`);

    // Create journal entry (debit obligation, credit cash)
    const obligationAccountId = this.getAnchorObligationAccountId(anchorType);
    
    const journalRequest: CreateJournalEntryRequest = {
      description: `Anchor expiry: ${anchorType} - ${units} units returned to ${user}`,
      source: 'ANCHOR',
      status: 'Posted',
      lines: [
        {
          accountId: obligationAccountId,
          type: 'DEBIT',
          amount: Number(units),
          description: 'Obligation cleared by expiry',
        },
        {
          accountId: 1010, // Cash-Vault-USDC
          type: 'CREDIT',
          amount: Number(units),
          description: `Returned to user ${user}`,
        },
      ],
      eventId,
    };

    return this.createJournalEntry(journalRequest);
  }

  async recordAttestationVerified(
    orderId: string,
    amount: number,
    recipient: string,
    attestor: string,
    txHash: string
  ): Promise<CreateJournalEntryResponse> {
    console.log(`[OracleLedger-Mock] Recording attestation: ${orderId}`);
    console.log(`  Amount: $${amount / 100}`);
    console.log(`  Recipient: ${recipient}`);
    console.log(`  Attestor: ${attestor}`);
    console.log(`  TxHash: ${txHash.substring(0, 16)}...`);

    // Create memo journal entry (zero-sum for audit trail)
    const journalRequest: CreateJournalEntryRequest = {
      description: `Attestation verified: Order ${orderId} - $${amount / 100} for ${recipient}`,
      source: 'ATTESTATION',
      status: 'Posted',
      lines: [
        {
          accountId: 1010, // Cash-Vault-USDC
          type: 'DEBIT',
          amount: 0,
          description: `Attestation by ${attestor}`,
        },
        {
          accountId: 1010, // Cash-Vault-USDC
          type: 'CREDIT',
          amount: 0,
          description: `Order: ${orderId}`,
        },
      ],
      eventId: orderId,
    };

    return this.createJournalEntry(journalRequest);
  }

  async ping(): Promise<boolean> {
    try {
      console.log('[OracleLedger-Mock] Health check: OK');
      return true;
    } catch (error) {
      console.error('[OracleLedger-Mock] Health check failed:', error);
      return false;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private generateJournalId(): string {
    this.journalIdCounter++;
    const timestamp = Date.now();
    return `JE-${timestamp}-${this.journalIdCounter.toString().padStart(4, '0')}`;
  }

  private getAnchorObligationAccountId(anchorType: AnchorType): number {
    const accountMap: Record<AnchorType, number> = {
      GROCERY: 2500,
      UTILITY: 2501,
      FUEL: 2502,
      MOBILE: 2503,
      HOUSING: 2504,
      MEDICAL: 2505,
    };
    return accountMap[anchorType];
  }

  // Debug methods
  async getAllJournalEntries(): Promise<any[]> {
    try {
      console.log('[OracleLedger-Mock] Getting all journal entries');
      return [];
    } catch (error) {
      console.error('[OracleLedger-Mock] Error getting all journal entries:', error);
      return [];
    }
  }

  async getBalanceSummary(): Promise<Record<string, number>> {
    try {
      console.log('[OracleLedger-Mock] Getting balance summary');
      return {
        'Account-1000': 50000000,
        'Account-1010': 25000000,
        'Account-2500': 0,
        'Account-2501': 0,
        'Account-6300': 0,
      };
    } catch (error) {
      console.error('[OracleLedger-Mock] Error getting balance summary:', error);
      return {};
    }
  }

  async getPendingObligations(): Promise<Record<AnchorType, number>> {
    try {
      console.log('[OracleLedger-Mock] Getting pending obligations');
      return {
        GROCERY: 0,
        UTILITY: 0,
        FUEL: 0,
        MOBILE: 0,
        HOUSING: 0,
        MEDICAL: 0,
      };
    } catch (error) {
      console.error('[OracleLedger-Mock] Error getting pending obligations:', error);
      return {
        GROCERY: 0,
        UTILITY: 0,
        FUEL: 0,
        MOBILE: 0,
        HOUSING: 0,
        MEDICAL: 0,
      };
    }
  }
}

// =============================================================================
// EXPORT FOR USE
// =============================================================================

export default OracleLedgerMockService;