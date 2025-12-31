/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ORACLE-LEDGER CLEARING OBSERVATION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * SOVEREIGN-CORRECT VERSION
 * Updated: 2025-12-17
 * 
 * AUTHORITY LEVEL: ZERO
 * 
 * This service is an OBSERVER ONLY. It records cleared events from TigerBeetle.
 * It has NO clearing authority. It CANNOT create, modify, or reverse entries.
 * 
 * HIERARCHY:
 * 1. TigerBeetle = SOLE CLEARING AUTHORITY (mechanical truth)
 * 2. This service = Observation layer (zero authority)
 * 
 * REMOVED:
 * - reversed: boolean (reversals forbidden)
 * - reversalEntryId (reversals forbidden)
 * - Direct journal creation with authority (converted to observation)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface StripeClearedEventData {
  id: string;
  amount: number;
  currency: string;
  customerId: string;
  description: string;
  applicationFee?: number;
  metadata?: Record<string, string>;
  createdAt: Date;
  clearingTransferId?: string;
}

export interface ACHClearedEventData {
  id: string;
  amount: number;
  currency: string;
  customerId: string;
  bankAccountId: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  description: string;
  createdAt: Date;
  clearingTransferId?: string;
}

export interface JournalObservation {
  id: string;
  clearingId: string;
  entryNumber: string;
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  entryType: 'DEBIT' | 'CREDIT';
  currency: string;
  createdAt: Date;
  clearingTransferId: string;
  observedAt: Date;
}

export interface DoubleEntryValidation {
  isValid: boolean;
  totalDebits: number;
  totalCredits: number;
  difference: number;
  errors: string[];
}

export class ClearingObservationService {
  private observations: JournalObservation[] = [];
  private chartOfAccounts: Map<string, { name: string; type: string; normalBalance: 'DEBIT' | 'CREDIT' }> = new Map();

  constructor() {
    this.initializeChartOfAccounts();
    console.log('[CLEARING OBSERVATION] Initialized as OBSERVER ONLY');
  }

  private initializeChartOfAccounts() {
    this.chartOfAccounts.set('1000', { name: 'Cash', type: 'ASSET', normalBalance: 'DEBIT' });
    this.chartOfAccounts.set('1100', { name: 'Stripe Clearing Account', type: 'ASSET', normalBalance: 'DEBIT' });
    this.chartOfAccounts.set('4000', { name: 'Clearing Revenue', type: 'REVENUE', normalBalance: 'CREDIT' });
    this.chartOfAccounts.set('5000', { name: 'Stripe Fees Expense', type: 'EXPENSE', normalBalance: 'DEBIT' });
  }

  async observeStripeClearedEvent(event: StripeClearedEventData): Promise<JournalObservation[]> {
    if (!event.clearingTransferId) {
      throw new Error('Event must be cleared in TigerBeetle before observation');
    }

    const observations: JournalObservation[] = [];
    const observedAt = new Date();
    const applicationFee = event.applicationFee || 0;

    observations.push({
      id: `obs_${Date.now()}_1`,
      clearingId: event.id,
      entryNumber: `${event.id}-001`,
      accountId: '1100',
      accountName: 'Stripe Clearing Account',
      debit: event.amount,
      credit: 0,
      description: `[OBSERVED] Charge ${event.id}`,
      entryType: 'DEBIT',
      currency: event.currency,
      createdAt: event.createdAt,
      clearingTransferId: event.clearingTransferId,
      observedAt,
    });

    observations.push({
      id: `obs_${Date.now()}_2`,
      clearingId: event.id,
      entryNumber: `${event.id}-002`,
      accountId: '4000',
      accountName: 'Clearing Revenue',
      debit: 0,
      credit: event.amount,
      description: `[OBSERVED] Revenue ${event.id}`,
      entryType: 'CREDIT',
      currency: event.currency,
      createdAt: event.createdAt,
      clearingTransferId: event.clearingTransferId,
      observedAt,
    });

    if (applicationFee > 0) {
      observations.push({
        id: `obs_${Date.now()}_3`,
        clearingId: event.id,
        entryNumber: `${event.id}-003`,
        accountId: '5000',
        accountName: 'Stripe Fees Expense',
        debit: applicationFee,
        credit: 0,
        description: `[OBSERVED] Fee ${event.id}`,
        entryType: 'DEBIT',
        currency: event.currency,
        createdAt: event.createdAt,
        clearingTransferId: event.clearingTransferId,
        observedAt,
      });

      observations.push({
        id: `obs_${Date.now()}_4`,
        clearingId: event.id,
        entryNumber: `${event.id}-004`,
        accountId: '1100',
        accountName: 'Stripe Clearing Account',
        debit: 0,
        credit: applicationFee,
        description: `[OBSERVED] Fee applied ${event.id}`,
        entryType: 'CREDIT',
        currency: event.currency,
        createdAt: event.createdAt,
        clearingTransferId: event.clearingTransferId,
        observedAt,
      });
    }

    this.observations.push(...observations);
    console.log(`[CLEARING OBSERVATION] Observed: ${event.id} (TB: ${event.clearingTransferId})`);
    return observations;
  }

  async observeACHClearedEvent(achEvent: ACHClearedEventData): Promise<JournalObservation[]> {
    if (!achEvent.clearingTransferId) {
      throw new Error('ACH event must be cleared in TigerBeetle before observation');
    }

    const observations: JournalObservation[] = [];
    const observedAt = new Date();

    observations.push({
      id: `ach_obs_${Date.now()}_1`,
      clearingId: achEvent.id,
      entryNumber: `${achEvent.id}-001`,
      accountId: '1000',
      accountName: 'Cash',
      debit: achEvent.amount,
      credit: 0,
      description: `[OBSERVED] ACH ${achEvent.id}`,
      entryType: 'DEBIT',
      currency: achEvent.currency,
      createdAt: achEvent.createdAt,
      clearingTransferId: achEvent.clearingTransferId,
      observedAt,
    });

    observations.push({
      id: `ach_obs_${Date.now()}_2`,
      clearingId: achEvent.id,
      entryNumber: `${achEvent.id}-002`,
      accountId: '4000',
      accountName: 'Clearing Revenue',
      debit: 0,
      credit: achEvent.amount,
      description: `[OBSERVED] ACH revenue ${achEvent.id}`,
      entryType: 'CREDIT',
      currency: achEvent.currency,
      createdAt: achEvent.createdAt,
      clearingTransferId: achEvent.clearingTransferId,
      observedAt,
    });

    this.observations.push(...observations);
    console.log(`[CLEARING OBSERVATION] Observed ACH: ${achEvent.id}`);
    return observations;
  }

  private validateDoubleEntry(entries: JournalObservation[]): DoubleEntryValidation {
    const totalDebits = entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredits = entries.reduce((sum, e) => sum + e.credit, 0);
    const diff = Math.abs(totalDebits - totalCredits);
    return {
      isValid: diff < 0.01,
      totalDebits,
      totalCredits,
      difference: diff,
      errors: diff >= 0.01 ? [`Imbalanced: D=${totalDebits} C=${totalCredits}`] : []
    };
  }

  async getObservations(clearingId?: string): Promise<JournalObservation[]> {
    return clearingId 
      ? this.observations.filter(o => o.clearingId === clearingId)
      : this.observations;
  }

  async getObservedBalances(): Promise<Record<string, number>> {
    const balances: Record<string, number> = {};
    for (const [id, acct] of this.chartOfAccounts.entries()) {
      const entries = this.observations.filter(o => o.accountId === id);
      balances[id] = entries.reduce((sum, e) => 
        acct.normalBalance === 'DEBIT' ? sum + e.debit - e.credit : sum + e.credit - e.debit, 0);
    }
    return balances;
  }

  // FORBIDDEN: No reverse, modify, or delete operations exist
}

// Export singleton instance with sovereign-correct name
export const clearingObservationService = new ClearingObservationService();

// Legacy alias for backward compatibility (DEPRECATED)
export const stripeJournalService = clearingObservationService;
export { ClearingObservationService as StripeJournalService };