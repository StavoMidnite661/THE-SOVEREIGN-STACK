# ⚠️ WARNING: NON-AUTHORITATIVE EXECUTION PLAYBOOK ⚠️

> **AUTHORITY LEVEL: ZERO**
> 
> This document describes **execution mechanics only**.  
> It has **no authority** over meaning, truth, or clearing.
> 
> **Canonical Authority:**  
> - `SOVR_CANONICAL_SPEC_V2.md` - **SOLE SEMANTIC AUTHORITY**
> - `SOVR_SOVEREIGN_DOCTRINE_V2.md` - **OPERATIONAL DOCTRINE**
> - `SOVR_OPERATOR_DOCTRINE_V2.md` - **OPERATOR RULES**
> - `SOVR_BLACKLIST_V2.md` - **FORBIDDEN OPERATIONS**
>
> **If this document conflicts with canonical spec, canonical spec wins.**

---

# SOVR Clearing Engine Integration - Execution Playbook

## Overview

This playbook provides implementation steps for integrating SOVR ecosystem components into a sovereign-correct clearing system.

**What This System Is:**
- A ledger-cleared obligation network
- TigerBeetle as **sole mechanical truth**
- PostgreSQL as **narrative mirror** (observer only, never authoritative)
- External honoring adapters (Stripe, ACH) with **zero clearing authority**

**What This System Is NOT:**
- ❌ A payment processor
- ❌ A custodial system
- ❌ A fund transmitter
- ❌ Subject to external validation
- ❌ Capable of reversals

---

## Architecture Diagram (Sovereign-Correct)

```
┌──────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL HONORING ADAPTERS                       │
│  (Stripe, ACH, Banks - OPTIONAL EXECUTION ONLY)                   │
│  * NO CLEARING AUTHORITY                                           │
│  * MAY REFUSE WITHOUT SYSTEM IMPACT                                │
└──────────────────────────────────────────────────────────────────────┘
                          │ (honoring attempts)
                          ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        CREDIT TERMINAL                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                  Intent Submission Gateway                       │ │
│  │  - User claim validation                                       │ │
│  │  - Attestation enforcement                                     │ │
│  │  - Intent → Transfer translation                               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                          │                                          │
│                          ▼                                          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │            ⚡ TIGERBEETLE CLEARING ENGINE ⚡                     │ │
│  │         ** SOLE SOURCE OF MECHANICAL TRUTH **                  │ │
│  │                                                                  │ │
│  │  - Finalized transfers (irreversible)                          │ │
│  │  - Account state (definitive)                                  │ │
│  │  - "If not cleared here, did not happen"                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                     │ (clearing events)                             │
└─────────────────────┼──────────────────────────────────────────────┘
                      │
                      ▼ (event propagation ONLY)
┌──────────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL (Narrative Mirror)                     │
│  ** OBSERVER ONLY - NEVER AUTHORITATIVE **                         │
│  - Records cleared events                                           │
│  - Provides compliance reporting                                    │
│  - CANNOT override clearing finality                                │
└──────────────────────────────────────────────────────────────────────┘
                      │
                      ▼ (observation ONLY)
┌──────────────────────────────────────────────────────────────────────┐
│                        FINSEC MONITOR                                │
│  ** READ-ONLY OBSERVATION DASHBOARD **                             │
│  - Displays cleared obligations                                     │
│  - Reports honoring attempts                                        │
│  - NO CONTROL CAPABILITIES                                          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Clearing Lifecycle (Sovereign-Correct)

```
1. INTENT
   User submits claim
   ↓
2. ATTESTATION  
   Legitimacy verified (REQUIRED before clearing)
   ↓
3. CLEARING ⚡ [FINALITY POINT]
   TigerBeetle executes transfer
   >> STATE BECOMES IRREVERSIBLE <<
   ↓
4. PROPAGATION
   Event emitted to narrative mirror (Postgres)
   ↓
5. HONORING (OPTIONAL)
   External adapter may execute
   >> Adapter refusal changes nothing about cleared state <<
```

**Critical Rules:**
- **CLEARING (Step 3) = Point of No Return**
- PostgreSQL records Step 3, never authorizes it
- Honoring failures (Step 5) require new intents, never reversals

---

## Implementation Phases

### Phase 1: Environment Setup

#### 1.1 Database Initialization (Narrative Mirror ONLY)

```bash
# Initialize PostgreSQL as OBSERVER
# This is NOT a ledger. This is a narrative recording system.

psql -U postgres -f config/schema.sql

# Verify observer schema (NOT authoritative schema)
psql -U postgres -d sovr_mirror -c "\\dt+"
```

**Schema Purpose:**
- ✅ Record cleared events
- ✅ Provide audit trail
- ❌ Authorize clearing
- ❌ Override TigerBeetle state

#### 1.2 Configuration Files

**`tigerbeetle.config.json`:**
```json
{
  "cluster_id": 1,
  "replication_factor": 3,
  "cluster_size": 3,
  "comment": "TigerBeetle is SOLE clearing authority",
  "accounts": {
    "comment": "These accounts exist in TigerBeetle FIRST",
    "1000": "Cash-ODFI-LLC",
    "1010": "Cash-Vault-USDC",
    "1050": "ACH-Settlement-Account",
    "1060": "Stripe-Clearing-Account"
  }
}
```

---

### Phase 2: TigerBeetle Integration (Clearing Engine Deployment)

#### 2.1 Install TigerBeetle

```bash
# Deploy the MECHANICAL TRUTH ENGINE
wget https://github.com/tigerbeetle/tigerbeetle/releases/download/v0.12.0/tigerbeetle-v0.12.0-linux-amd64.tar.gz

tar -xzf tigerbeetle-v0.12.0-linux-amd64.tar.gz
sudo mv tigerbeetle-v0.12.0-linux-amd64/tigerbeetle /usr/local/bin/
```

#### 2.2 Start TigerBeetle Cluster (SOLE AUTHORITY)

```bash
# This cluster IS the source of truth
# Nothing else has clearing authority

mkdir -p /var/lib/tigerbeetle/node{1,2,3}

# Start replicated mechanical truth
nohup tigerbeetle --cluster=1 --replica=1 --replication=3 --addresses=0.0.0.0:3000 /var/lib/tigerbeetle/node1 > /var/log/tigerbeetle-node1.log 2>&1 &
nohup tigerbeetle --cluster=2 --replica=2 --replication=3 --addresses=0.0.0.0:3000 /var/lib/tigerbeetle/node2 > /var/log/tigerbeetle-node2.log 2>&1 &
nohup tigerbeetle --cluster=3 --replica=3 --replication=3 --addresses=0.0.0.0:3000 /var/lib/tigerbeetle/node3 > /var/log/tigerbeetle-node3.log 2>&1 &
```

---

### Phase 3: Credit Terminal (Intent → Transfer Translation)

#### 3.1 TigerBeetle Service (Clearing Interface)

**`src/val/core/tigerbeetle-clearing-service.ts`:**
```typescript
import { createClient, Transfer, Account, Client } from 'tigerbeetle-node';
import { NarrativeMirrorService } from './narrative-mirror-service';

/**
 * TigerBeetle Clearing Service
 * 
 * THIS IS THE SOLE CLEARING AUTHORITY.
 * 
 * Rules:
 * 1. Clearing happens HERE FIRST
 * 2. Narrative mirror records AFTER clearing
 * 3. No clearing = did not happen
 * 4. Clearing cannot be reversed
 */
export class TigerBeetleClearingService {
  private tb: Client;
  private narrativeMirror: NarrativeMirrorService;
  
  constructor() {
    this.tb = createClient({
      cluster_id: 1,
      replication_factor: 3,
      replica_addresses: [
        '0.0.0.0:3000',
        '0.0.0.0:3001',
        '0.0.0.0:3002',
      ],
    });
    this.narrativeMirror = NarrativeMirrorService.getInstance();
  }
  
  /**
   * Clear an obligation (FINALITY)
   * 
   * Once this succeeds, the obligation is CLEARED.
   * No reversal. No rollback. No override.
   */
  async clearObligation(transfer: Transfer): Promise<ClearingResult> {
    try {
      // STEP 1: CLEAR IN TIGERBEETLE (MECHANICAL TRUTH)
      const result = await this.tb.createTransfers([transfer]);
      
      if (result.length > 0) {
        return {
          success: false,
          error: `Clearing rejected: ${result[0].result}`,
          cleared: false,
        };
      }
      
      // CLEARING SUCCEEDED = FINALITY ACHIEVED
      console.log(`[CLEARING] Obligation cleared: ${transfer.id}`);
      console.log(`[CLEARING] Debit: ${transfer.debit_account_id}, Credit: ${transfer.credit_account_id}`);
      console.log(`[CLEARING] Amount: ${transfer.amount}`);
      console.log(`[CLEARING] STATE IS NOW IRREVERSIBLE`);
      
      // STEP 2: PROPAGATE TO NARRATIVE MIRROR (OBSERVATION)
      await this.narrativeMirror.recordClearedEvent({
        transfer_id: transfer.id.toString(),
        debit_account: Number(transfer.debit_account_id),
        credit_account: Number(transfer.credit_account_id),
        amount: Number(transfer.amount),
        cleared_at: new Date(),
        source: 'TIGERBEETLE',
      });
      
      return {
        success: true,
        transfer_id: transfer.id.toString(),
        cleared: true,
        finality_timestamp: new Date(),
      };
    } catch (error) {
      console.error('[CLEARING] Exception during clearing:', error);
      return {
        success: false,
        error: error.message,
        cleared: false,
      };
    }
  }
  
  /**
   * NO REVERSE METHOD EXISTS
   * 
   * Clearing is final. Mistakes require new intents.
   */
}

interface ClearingResult {
  success: boolean;
  transfer_id?: string;
  cleared: boolean;
  finality_timestamp?: Date;
  error?: string;
}
```

#### 3.2 Narrative Mirror Service (Observer ONLY)

**`src/val/core/narrative-mirror-service.ts`:**
```typescript
import { PrismaClient } from '@prisma/client';

/**
 * Narrative Mirror Service
 * 
 * ** THIS IS NOT A LEDGER **
 * ** THIS IS AN OBSERVER **
 * 
 * Purpose:
 * - Record cleared events from TigerBeetle
 * - Provide compliance reporting
 * - Enable narrative querying
 * 
 * Forbidden Operations:
 * - Clearing authorization
 * - Balance mutation
 * - Transfer reversal
 * - Overriding mechanical truth
 */
export class NarrativeMirrorService {
  private prisma: PrismaClient;
  private static instance: NarrativeMirrorService;
  
  private constructor() {
    this.prisma = new PrismaClient();
  }
  
  public static getInstance(): NarrativeMirrorService {
    if (!this.instance) {
      this.instance = new NarrativeMirrorService();
    }
    return this.instance;
  }
  
  /**
   * Record a cleared event (OBSERVATION ONLY)
   * 
   * This does NOT clear the obligation.
   * TigerBeetle already did that.
   * This is narrative documentation.
   */
  async recordClearedEvent(event: ClearedEvent): Promise<void> {
    await this.prisma.cleared_events.create({
      data: {
        transfer_id: event.transfer_id,
        debit_account: event.debit_account,
        credit_account: event.credit_account,
        amount: event.amount,
        cleared_at: event.cleared_at,
        source: event.source,
        narrative_recorded_at: new Date(),
      },
    });
    
    console.log(`[NARRATIVE MIRROR] Recorded cleared event: ${event.transfer_id}`);
    console.log(`[NARRATIVE MIRROR] This is observation, not authority`);
  }
  
  /**
   * Query cleared obligations (READ-ONLY)
   */
  async getClearedObligations(accountId: number): Promise<ClearedEvent[]> {
    return this.prisma.cleared_events.findMany({
      where: {
        OR: [
          { debit_account: accountId },
          { credit_account: accountId },
        ],
      },
      orderBy: { cleared_at: 'desc' },
    });
  }
  
  /**
   * NO UPDATE METHODS EXIST
   * NO DELETE METHODS EXIST
   * NO REVERSAL METHODS EXIST
   * 
   * This is a write-once, read-only narrative.
   */
}

interface ClearedEvent {
  transfer_id: string;
  debit_account: number;
  credit_account: number;
  amount: number;
  cleared_at: Date;
  source: string;
}
```

---

## DEPLOYMENT CHECKLIST (Sovereign-Correct)

### Pre-Deployment Verification

- [ ] **TigerBeetle cluster operational** (mechanical truth active)
- [ ] **PostgreSQL configured as observer** (never authoritative)
- [ ] **No reversal logic anywhere** (grep for forbidden operations)
- [ ] **No "payment processor" language** (semantic freeze enforced)
- [ ] **Clearing → Propagation flow correct** (TB first, always)
- [ ] **Honoring adapters marked optional** (failure changes nothing)

### Forbidden Patterns Check

Run before deployment:

```bash
# Scan for FORBIDDEN blacklist violations
grep -r "payment processor" .
grep -r "user funds" .
grep -r "balance update" .
grep -r "refund" .
grep -r "chargeback" .
grep -r "rollback" .

# Expected: ZERO MATCHES
```

---

## OPERATOR RULES (Critical)

### Rule 1: Truth is Mechanical
**If it did not clear in TigerBeetle, it did not happen.**

No database query overrides this.
No admin panel overrides this.
No external system overrides this.

### Rule 2: No Reversals
**Cleared obligations cannot be reversed.**

Mistakes require **new intents**, not edits.
Disputes require **new clearing**, not rollbacks.

### Rule 3: Narrative Mirror Has No Authority
**PostgreSQL observations do not define reality.**

If TigerBeetle and Postgres disagree, **TigerBeetle is correct**.
Fix the mirror, never "reconcile" by editing balances.

### Rule 4: Honoring is Optional
**External adapter refusal changes nothing about cleared state.**

Stripe fails? **Obligation still cleared.**
ACH rejects? **Clearing already final.**

New honoring attempts require **new intents**, not retries.

---

## AUTHORITY HIERARCHY (Final)

```
1. TigerBeetle        ← MECHANICAL TRUTH (sole authority)
2. Attestors          ← Legitimacy gatekeepers
3. Narrative Mirror   ← Observer (PostgreSQL)
4. FinSec Monitor     ← Read-only dashboard
5. Honoring Adapters  ← Optional execution (Stripe, ACH)
```

**No component below rank 1 has clearing authority.**

---

## FINAL WARNING

⚠️ **This playbook is subordinate to:**
- SOVR_CANONICAL_SPEC_V2.md
- SOVR_SOVEREIGN_DOCTRINE_V2.md
- SOVR_OPERATOR_DOCTRINE_V2.md
- SOVR_BLACKLIST_V2.md

If any conflict exists, **canonical doctrine wins**.

**Semantic drift is system death.**

---

**Document Version**: 2.0 (Sovereign-Correct)  
**Last Updated**: 2025-12-17  
**Authority Level**: ZERO (Execution Mechanics Only)  
**Status**: ✅ DOCTRINE-COMPLIANT - SAFE FOR DEPLOYMENT
