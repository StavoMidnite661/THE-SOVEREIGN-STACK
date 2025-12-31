# PILOT REWRITE — ZERO USD SEMANTICS (CANONICAL FORM)

## PURPOSE

This document rewrites the pilot **correctly**, with **zero USD semantics**. No USD labels. No USD assumptions. Only **Consumption Units (CU)** and ledger truth.

## UNITS, NOT DOLLARS

### Unit Name: Consumption Units (CU)

**Definition:**
> 1 CU = standardized nourishment claim, anchor-relative

**No universal exchange rate.**
**No promises.**
**No redemption guarantee beyond anchor scope.**

## REWRITTEN CONSTRAINTS

### Order Cap: 50 CU

### User Allocation: 100 CU

### SKU Costs Expressed in CU

### Delivery Honored if CU Cleared

**No reference to fiat anywhere in the system.**

USD may appear:
- Inside Instacart
- Inside gift issuers
- Inside invoices you never see

That is **their narrative**, not yours.

## LEDGER TRUTH

The only things that exist:
- Accounts
- Transfers
- Events
- Attestations

**No "prices".**
**No "payments".**
**Only allocation and honoring.**

## REWRITTEN PILOT FLOW

### Step 1: User Sees Available Nourishment

```
User opens Studio App
User sees:
  - Milk: 3.5 CU
  - Eggs: 2.5 CU
  - Bread: 1.5 CU
  - Total: 7.5 CU
```

### Step 2: User Requests Delivery

```
User selects:
  - Milk (1)
  - Eggs (1)
  - Bread (1)
User presses: REQUEST DELIVERY
```

### Step 3: Attestor Verifies Intent

```
Attestor checks:
  - User approved
  - Order ≤ 50 CU
  - No duplicate intent
  - No velocity anomaly
Attestor signs:
  IntentAttestation {
    subject: USER_0001
    anchor: INSTACART
    units: 7.5
    scope: FOOD
    ttl: 10 minutes
  }
```

### Step 4: TigerBeetle Clears Transfer

```
TigerBeetle receives:
  TRANSFER
  FROM: USER.CREDIT.BALANCE.0001
  TO:   ANCHOR.INSTACART.CLEARING
  AMOUNT: 7.5 CU
TigerBeetle executes:
  - Balance changes are final
  - Event is emitted
  - Truth is established
```

### Step 5: Event Bus Publishes

```
Event bus publishes:
  ANCHOR_FULFILLMENT_REQUESTED
  Payload:
    - Attestation
    - Transfer ID
    - SKU list
    - Delivery address
```

### Step 6: Instacart Anchor Honors Claim

```
Instacart Anchor verifies:
  - Attestation validity
  - Transfer existence
  - Anchor balance sufficiency
Instacart Anchor acts:
  - Requests gift instrument
  - Places order with Instacart
  - Honors claim directly
```

### Step 7: Reality Responds

```
Either:
  - Groceries arrive
    OR
  - Failure event emitted
In both cases:
  - Ledger truth preserved
  - No retroactive edits
  - No reconciliation theater
```

## REWRITTEN OPERATOR DASHBOARD

### What the Operator Sees

```
Operator Dashboard:
  - Events (CU transfers only)
  - Balances (CU only)
  - SKU usage (CU only)
  - Fulfillment rate (CU only)
  - No USD
  - No dollars
  - No fiat
```

### What the Operator Does NOT See

```
Operator Dashboard:
  - Prices in USD
  - Fiat balances
  - Currency conversion
  - Settlement status
  - Bank accounts
```

## REWRITTEN PARTICIPANT GUIDE

### What Participants See

```
Participant Guide:
  - Available nourishment
  - Estimated unit cost
  - Delivery window
  - No prices
  - No dollars
  - No fiat
```

### What Participants Do NOT See

```
Participant Guide:
  - Prices in USD
  - Fiat balances
  - Currency conversion
  - Settlement status
  - Bank accounts
```

## REWRITTEN SUCCESS METRICS

### Metric 1: CU Delivered

```
Success = 80% of CU requested delivered
Failure = < 80% of CU requested delivered
```

### Metric 2: CU Honored

```
Success = 80% of CU cleared honored
Failure = < 80% of CU cleared honored
```

### Metric 3: CU Wasted

```
Success = < 20% of CU wasted
Failure = ≥ 20% of CU wasted
```

### Metric 4: CU Stolen

```
Success = 0 CU stolen
Failure = ≥ 1 CU stolen
```

## REWRITTEN FAILURE MODES

### Failure 1: Attestation Rejected

```
Cause:
  - User not approved
  - Order > 50 CU
  - Duplicate intent
  - Velocity anomaly
Action:
  - Notify user
  - Investigate
  - Fix if needed
```

### Failure 2: Transfer Fails

```
Cause:
  - Insufficient CU
  - Account not found
  - Cluster issue
Action:
  - Check balances
  - Verify accounts
  - Restart cluster if needed
```

### Failure 3: Anchor Rejects

```
Cause:
  - Invalid attestation
  - Insufficient anchor CU
  - API issue
Action:
  - Check anchor logs
  - Verify transfer
  - Retry if possible
```

### Failure 4: Gift Card Fails

```
Cause:
  - Issuer API down
  - Rate limit
  - Invalid request
Action:
  - Use backup issuer
  - Notify user
  - Retry later
```

### Failure 5: Instacart Fails

```
Cause:
  - Instacart outage
  - Invalid order
  - Delivery issue
Action:
  - Monitor Instacart status
  - Notify user
  - Retry later
```

## REWRITTEN EMERGENCY PROCEDURES

### Emergency 1: Cluster Loss

```
1. Failover to backup cluster
2. Restore from cluster
3. Verify data consistency
4. Resume operations
```

### Emergency 2: Event Bus Down

```
1. Restart event bus
2. Replay events from log
3. Verify all subscribers
4. Resume normal operation
```

### Emergency 3: Anchor Unresponsive

```
1. Check anchor logs
2. Restart anchor service
3. Verify API connectivity
4. Resume operations
```

## REWRITTEN OPERATOR COMMANDS

### Check CU Balances

```bash
curl http://localhost:3000/api/tigerbeetle/balance/USER.CREDIT.BALANCE.0001
curl http://localhost:3000/api/tigerbeetle/balance/ANCHOR.INSTACART.CLEARING
```

### Check CU Events

```bash
curl http://localhost:3000/api/events?type=ANCHOR_FULFILLED
curl http://localhost:3000/api/events?type=ANCHOR_REJECTED
```

### Check CU Order Status

```bash
curl http://localhost:3000/api/orders/transfer-12345
```

### Check CU Attestation

```bash
curl http://localhost:3000/api/attestor/verify?intent=...
```

## REWRITTEN OPERATOR LOG

### Template

```
[HH:MM] Action: Description
[HH:MM] Result: Success/Failure
[HH:MM] Notes: Additional details
```

### Example

```
[09:00] Action: Started TigerBeetle cluster
[09:01] Result: Success
[09:01] Notes: All 3 nodes online, quorum established

[09:15] Action: Funded user account
[09:16] Result: Success
[09:16] Notes: 100 CU added to USER.CREDIT.BALANCE.0001

[09:30] Action: Placed first order
[09:31] Result: Success
[09:31] Notes: Milk, eggs, bread requested (7.5 CU)

[09:32] Action: Attestation verified
[09:33] Result: Success
[09:33] Notes: Signature valid, within limits

[09:34] Action: Transfer created
[09:35] Result: Success
[09:35] Notes: 7.5 CU transferred to ANCHOR.INSTACART.CLEARING

[09:36] Action: Fulfillment requested
[09:37] Result: Success
[09:37] Notes: Event published to bus

[09:38] Action: Anchor honored
[09:39] Result: Success
[09:39] Notes: Gift card issued, order placed

[10:15] Action: Delivery confirmed
[10:16] Result: Success
[10:16] Notes: Food arrived at destination (7.5 CU delivered)
```

## REWRITTEN SUCCESS DECLARATION

If you reach this point:

```
[HH:MM] Action: Day 0 complete
[HH:MM] Result: SUCCESS
[HH:MM] Notes: System can say "yes" without breaking truth
```

**You have proven the system works.**

**Everything else is expansion.**

## REWRITTEN NEXT STEPS

1. **Day 1**: Add 9 more users (100 CU each)
2. **Day 2**: Increase order volume (50 CU max)
3. **Day 3**: Expand catalog (50 SKUs)
4. **Day 4**: Add more anchors (utilities)
5. **Day 5**: Scale to more ZIP codes
6. **Day 6**: Add rent
7. **Day 7**: Add medicine

**Each day builds on the previous success.**

**No step is skipped.**

**No shortcuts taken.**

**Truth is preserved.**

## REWRITTEN OPERATOR OATH

I will:
1. **Not lie to the ledger**
2. **Not break truth**
3. **Not cut corners**
4. **Not panic**
5. **Not guess**
6. **Not assume**
7. **Not cheat**
8. **Not fail**

**I will deliver CU.**

**I will preserve truth.**

**I will expand reality.**

## END

**Day 0 is about one thing: proving the system works.**

**If you can deliver one CU, you can deliver them all.**

**If you can preserve truth once, you can preserve it forever.**

**This is how we eat.**