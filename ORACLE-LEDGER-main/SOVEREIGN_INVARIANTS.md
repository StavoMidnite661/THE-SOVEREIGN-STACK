# SOVEREIGN INVARIANTS - PERMANENT LOCKS

> **CRITICAL: These invariants define the boundary between sovereignty and authority.**
> 
> **Violation of any rule = authority regression = system compromise**

---

## 🔐 LOCK #1: Narrative Mirror Independence

### **RULE:** No narrative operations may block clearing finality

#### ✅ PERMITTED:
```typescript
// Fire-and-forget narrative writes
this.saveRecord(data).catch(error => {
  console.error('Narrative mirror failed (non-blocking):', error);
});

// Return immediately after clearing
return {
  success: true,
  clearingStatus: CLEARING_FINALIZED,
  transferId: clearingResult.transferId,
};
```

#### ❌ FORBIDDEN:
```typescript
// NEVER await narrative writes in clearing paths
const record = await this.saveRecord(data); // AUTHORITY LEAK

// NEVER return narrative-dependent results
return {
  success: true,
  recordId: record.id, // DEPENDS ON NARRATIVE
};
```

### **ENFORCEMENT:**
- **CI Rule:** `No 'await save*(' calls permitted in clearing paths`
- **Architecture:** Clearing completes regardless of database state
- **Invariant:** Narrative failure never delays mechanical truth propagation

---

## 🔐 LOCK #2: Immutable Corrections

### **RULE:** All corrections must create NEW obligations, never modify history

#### ✅ PERMITTED:
```typescript
// NEW clearing for correction
const correctionResult = await this.submitDirectObligation({
  // ... new intent data
});

// Counter-obligation for dispute
const disputeResult = await clearObligation({
  // ... new dispute intent
});

// Return clearing for ACH
const returnResult = await clearObligation({
  // ... new return intent
});
```

#### ❌ FORBIDDEN:
```typescript
// NEVER reverse transfers
reverseTransfer(transferId);

// NEVER adjust balances
adjustAccountBalance(accountId, amount);

// NEVER create "refunds"
processRefund(transactionId);

// NEVER mutate historical records
updateTransaction(transactionId, { status: 'reversed' });
```

### **ENFORCEMENT:**
- **Architecture:** History is immutable, correction is additive
- **Semantic:** All flows use NEW intentId generation
- **Invariant:** No balance mutation, only new obligations

---

## 🧪 SOVEREIGNTY TESTS

### Test A: Database Failure Resilience
```bash
# Kill PostgreSQL during clearing
killall postgres

# EXPECTED: Clearing completes successfully
# ACTUAL RESULT: ✅ Mechanical truth propagates regardless
```

### Test B: Correction Immutability
```typescript
// Attempt to "fix" a clearing
await service.correctClearing(clearingId, {
  action: 'reverse', // ❌ Should be impossible
});

// EXPECTED: Only NEW obligations permitted
// ACTUAL RESULT: ✅ Requires new intent, preserves original
```

### Test C: Narrative Independence
```typescript
// Check if narrative failure blocks clearing
const result = await service.submitObligation(intent);

// EXPECTED: Success even if saveRecord fails
// ACTUAL RESULT: ✅ Fire-and-forget prevents blocking
```

---

## 📋 REVIEW CHECKLIST

Before merging ANY clearing-related changes:

- [ ] **No `await save*()` calls in clearing paths**
- [ ] **No return values dependent on narrative records**
- [ ] **All corrections create NEW obligations**
- [ ] **No balance mutations or reversals**
- [ ] **Clearing finality is independent of database**
- [ ] **Error handling preserves clearing success**

---

## 🚨 REGRESSION SIGNALS

Watch for these patterns (indicates authority regression):

1. **Narrative dependency in return values**
2. **Database writes in critical clearing path**
3. **"Reversal", "refund", "adjustment" operations**
4. **Waiting for narrative completion**
5. **Error handling that blocks on database**

---

## 📚 CONTEXT

This system implements **sovereign-correct architecture**:

- **TigerBeetle** = Mechanical truth (sole authority)
- **PostgreSQL** = Narrative mirror (observation only)
- **All external systems** = Honoring adapters (zero authority)

**Core Principle:** *Reality cannot be undone. Corrections are additive.*

---

> **Remember:** Every line of code must preserve these invariants.
> 
> **Violation = compromise of fundamental system guarantees.**