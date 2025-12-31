/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TIGERBEETLE CLEARING INTEGRATION - SECURITY HARDENED
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * ** THIS IS THE KEYSTONE **
 * ** THE SOLE BRIDGE BETWEEN INTENT AND REALITY **
 * 
 * AUTHORITY LEVEL: MAXIMUM
 * SECURITY LEVEL: HIGH
 * 
 * SECURITY REFINEMENT (SESSION-006):
 * - True reentrancy protection via intentId
 * - Synchronized transferId management
 * - Atomic clearing-first workflow
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { getTigerBeetle } from './tigerbeetle_service';
import { getNarrativeMirror } from './narrative-mirror-service';
import { logger } from './secure-logger';

// =============================================================================
// CONSTANTS & TYPES
// =============================================================================

export const CLEARING_FINALIZED = 'CLEARING_FINALIZED' as const;

export interface ClearingIntent {
  intentId: string;
  debitAccount: number;
  creditAccount: number;
  amount: number;
  description: string;
  source: 'ACH' | 'CARD' | 'DIRECT_DEPOSIT' | 'ANCHOR' | 'INTERNAL';
  attestationHash?: string;
  metadata?: Record<string, unknown>;
}

export interface ClearingResult {
  success: boolean;
  cleared: boolean;
  transferId?: string;
  finalityTimestamp?: Date;
  error?: string;
  status: typeof CLEARING_FINALIZED | 'FAILED' | 'REJECTED';
}

// =============================================================================
// CLEARING INTERFACE (THE ONLY PATH TO TRUTH)
// =============================================================================

/**
 * clearObligation - SECURITY REFINED VERSION
 * 
 * Workflow:
 * 1. Check for reentrancy via intentId
 * 2. Clear in TigerBeetle (FINALITY)
 * 3. Emit to narrative mirror (OBSERVATION)
 */
export async function clearObligation(intent: ClearingIntent): Promise<ClearingResult> {
  const tb = getTigerBeetle();
  
  // ==========================================================================
  // PROTECTION: REENTRANCY (Idempotency)
  // ==========================================================================
  
  if (tb.isAlreadyCleared(intent.intentId)) {
    const existing = tb.getExistingResult(intent.intentId);
    if (existing) {
      logger.info('CLEARING_REENTRANCY_RECOVERED', { intentId: intent.intentId });
      return existing;
    }
  }

  logger.info('CLEARING_VOD_INITIATED', { intentId: intent.intentId });

  try {
    // ==========================================================================
    // STEP 1: CLEAR IN TIGERBEETLE (The act of clearing)
    // ==========================================================================
    
    // The service handles mechanical transferId generation and storage
    const cleared = await tb.createTransfer(
      BigInt(intent.debitAccount),
      BigInt(intent.creditAccount),
      BigInt(intent.amount),
      intent.intentId
    );
    
    if (!cleared) {
      return {
        success: false,
        cleared: false,
        status: 'REJECTED',
        error: 'TigerBeetle clearing rejected (Check balances/constraints)',
      };
    }

    // ==========================================================================
    // STEP 2: CLEARING_FINALIZED Achieved
    // ==========================================================================
    
    const result = tb.getExistingResult(intent.intentId)!;
    
    logger.compliance('CLEARING_FINALIZED', {
      intentId: intent.intentId,
      transferId: result.transferId,
    });

    // ==========================================================================
    // STEP 3: NARRATIVE MIRROR (Observation)
    // ==========================================================================
    
    try {
      const mirror = getNarrativeMirror();
      await mirror.createJournalEntry({
        description: `[CLEARED] ${intent.description}`,
        source: intent.source,
        eventId: intent.intentId, // Use intentId as the link
        attestationHash: intent.attestationHash,
        lines: [
          { accountId: intent.debitAccount, type: 'DEBIT', amount: intent.amount, description: intent.description },
          { accountId: intent.creditAccount, type: 'CREDIT', amount: intent.amount, description: intent.description },
        ]
      });
    } catch (mirrorError) {
      // Mirror failure does NOT block clearing success
      logger.error('NARRATIVE_MIRROR_LAG', { 
        intentId: intent.intentId, 
        error: mirrorError.message 
      });
    }

    return result;

  } catch (error) {
    logger.error('CLEARING_CATASTROPHIC_FAILURE', {
      intentId: intent.intentId,
      error: error.message
    });
    
    return {
      success: false,
      cleared: false,
      status: 'FAILED',
      error: error.message,
    };
  }
}

export default {
  clearObligation,
  CLEARING_FINALIZED,
};