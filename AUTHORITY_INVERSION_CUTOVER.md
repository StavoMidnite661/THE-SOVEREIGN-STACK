# AUTHORITY INVERSION CUTOVER - FILES THAT MUST CHANGE

## Purpose
This document marks **every file** that must change for TigerBeetle to become the sole clearing authority.

---

## CURRENT STATE (Wrong)
```
Intent → Stripe.create() → Postgres → Done
                ↑
       TigerBeetle exists but is NOT in this path
```

## TARGET STATE (Correct)
```
Intent → Attestation → TigerBeetle.createTransfer() → CLEARING_FINALIZED
                                    ↓
                            Event emitted
                                    ↓
                        Narrative Mirror (Postgres) records
                                    ↓
                        Honoring Adapter (Stripe) MAY act
```

---

## FILES THAT MUST CHANGE

### 🔴 CRITICAL: Services That Bypass TigerBeetle

#### [cardPaymentService.ts](file:///d:/SOVR_Development_Holdings_LLC/The%20Soverign%20Stack/ORACLE-LEDGER-main/services/cardPaymentService.ts)

| Line | Current | Required Change |
|------|---------|-----------------|
| L97 | `stripe.paymentIntents.create()` | Must call `TigerBeetle.createTransfer()` FIRST |
| L221-278 | `processCardRefund()` | **DELETE ENTIRELY** - reversals forbidden |
| L280-339 | `handleCardDispute()` | Refactor - disputes create NEW intents, not reversals |

**Functions to DELETE:**
- `processCardRefund()`
- `createCardFeeReversalEntries()`

---

#### [achPaymentService.ts](file:///d:/SOVR_Development_Holdings_LLC/The%20Soverign%20Stack/ORACLE-LEDGER-main/services/achPaymentService.ts)

| Line | Current | Required Change |
|------|---------|-----------------|
| L88 | `stripe.paymentIntents.create()` | Must call `TigerBeetle.createTransfer()` FIRST |
| L222 | `stripe.transfers.create()` | Must be AFTER TigerBeetle clearing |
| L291-341 | `processAchReturn()` | Refactor - returns create NEW obligations |

**Functions to DELETE:**
- None (returns can stay as new-intent creators)

**Functions to REFACTOR:**
- `processAchPayment()` - Add TigerBeetle clearing step

---

#### [directDepositService.ts](file:///d:/SOVR_Development_Holdings_LLC/The%20Soverign%20Stack/ORACLE-LEDGER-main/services/directDepositService.ts)

| Line | Current | Required Change |
|------|---------|-----------------|
| L110 | `stripe.payouts.create()` | Must be AFTER TigerBeetle clearing |

---

#### [stripeJournalService.ts](file:///d:/SOVR_Development_Holdings_LLC/The%20Soverign%20Stack/ORACLE-LEDGER-main/services/stripeJournalService.ts)

| Issue | Required Change |
|-------|-----------------|
| Creates journal entries directly | Must ONLY mirror events from TigerBeetle |

---

#### [consulCreditsService.ts](file:///d:/SOVR_Development_Holdings_LLC/The%20Soverign%20Stack/ORACLE-LEDGER-main/services/consulCreditsService.ts)

| Line | Current | Required Change |
|------|---------|-----------------|
| L356 | `createJournalEntryFromTransaction()` | Must receive events FROM TigerBeetle, not create authority |

---

#### [api.ts](file:///d:/SOVR_Development_Holdings_LLC/The%20Soverign%20Stack/ORACLE-LEDGER-main/server/api.ts)

| Line | Current | Required Change |
|------|---------|-----------------|
| L3857 | `createJournalEntry = true` | Journal entries must MIRROR TigerBeetle events only |
| L3926 | Journal entry creation | Must be triggered by TigerBeetle event, not inline |

---

### 🟡 FILES TO ADD (New Integration Layer)

#### NEW: `tigerbeetle-integration.ts`
Location: `ORACLE-LEDGER-main/services/tigerbeetle-integration.ts`

**Purpose:** Bridge between Oracle services and TigerBeetle

```typescript
import { getTigerBeetle } from '../../sovr_hybrid_engineV2/val/core/tigerbeetle_service';
import { getNarrativeMirror } from '../../sovr_hybrid_engineV2/val/core/narrative-mirror-service';

export async function clearObligation(intent: Intent): Promise<ClearingResult> {
  // 1. CLEAR in TigerBeetle (FINALITY)
  const tb = getTigerBeetle();
  const cleared = await tb.createTransfer(
    BigInt(intent.debitAccount),
    BigInt(intent.creditAccount),
    BigInt(intent.amount)
  );
  
  if (!cleared) {
    return { success: false, cleared: false };
  }
  
  // >>> CLEARING_FINALIZED <<<
  // State is now irreversible
  
  // 2. Propagate to narrative mirror
  const mirror = getNarrativeMirror();
  await mirror.recordClearedEvent(intent);
  
  // 3. Return - honoring is OPTIONAL and handled separately
  return { success: true, cleared: true, finality: new Date() };
}
```

---

### 🟢 FILES ALREADY CORRECT

| File | Status | Notes |
|------|--------|-------|
| `tigerbeetle_service.ts` | ✅ Exists | Needs CLEARING_FINALIZED comments |
| `narrative-mirror-service.ts` | ✅ Created | Sovereign-correct |
| `constants.ts` | ✅ Correct | 27 accounts defined |
| `schema.sql` | ✅ Correct | Observer schema |

---

## EXECUTION ORDER

### Phase 1: Create Integration Layer
1. Create `tigerbeetle-integration.ts`
2. Add `clearObligation()` function
3. Add CLEARING_FINALIZED constant

### Phase 2: Refactor Services (One by One)
1. `achPaymentService.ts` - Add TigerBeetle call before Stripe
2. `cardPaymentService.ts` - Add TigerBeetle call, DELETE refund logic
3. `directDepositService.ts` - Add TigerBeetle call before payout
4. `stripeJournalService.ts` - Convert to observer mode

### Phase 3: Delete Forbidden Operations
1. Remove `processCardRefund()`
2. Remove `createCardFeeReversalEntries()`
3. Remove any chargeback handlers

### Phase 4: Validation
1. Run semantic scanner - expect ZERO violations
2. Grep for `stripe.*create` - all must be AFTER TigerBeetle
3. Grep for `refund|reversal|rollback` - must be ZERO in production code

---

## DANGER ZONE: Functions That Must Die

These functions CANNOT be refactored. They must be **DELETED**:

| File | Function | Reason |
|------|----------|--------|
| cardPaymentService.ts | `processCardRefund()` | Reversals forbidden |
| cardPaymentService.ts | `createCardFeeReversalEntries()` | Reversals forbidden |

These functions represent **forbidden operations** per `SOVR_BLACKLIST_V2.md`.

---

## SUCCESS CRITERIA

When complete:

1. **ALL** `stripe.*.create()` calls happen AFTER `TigerBeetle.createTransfer()`
2. **ZERO** functions with "refund" or "reversal" in name (except new-intent creators)
3. **ZERO** direct journal entry creation (only mirroring from TigerBeetle)
4. **EXPLICIT** CLEARING_FINALIZED marker in every flow
5. Semantic scanner returns **ZERO violations**

---

## THE DAY TIGERBEETLE BECOMES REAL

When all changes above are complete:

> TigerBeetle will be the **sole clearing authority**.  
> Postgres will be a **narrative mirror**.  
> Stripe will be an **optional honoring adapter**.

Until then, the current state is:   
**"Implemented but not wired."**
