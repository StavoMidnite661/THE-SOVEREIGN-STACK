# DAY 0 OF THE PILOT — OPERATOR WALKTHROUGH

## PURPOSE

This document defines **exactly what you do** on Day 0 of the pilot. No theory. No hand-waving. Just the hour-by-hour execution that proves the system can say "yes" once without breaking truth.

## T-24 TO T-1 (PREPARATION WINDOW)

### YOUR ONLY OBJECTIVE

Ensure the system can say **"yes"** once without breaking truth.

### CHECKLIST (NON-NEGOTIABLE)

- [ ] TigerBeetle cluster green (3 nodes, quorum)
- [ ] Event bus live (at-least-once delivery)
- [ ] 1 user account funded with **Consumption Units**
- [ ] Instacart anchor API reachable
- [ ] Gift card adapter in *live-issuer, low-limit* mode
- [ ] Operator dashboard open (events + balances only)

**No dashboards showing "money".**
**No balances in USD.**
**Only units and events.**

## HOUR 0 — FIRST INTENT

### WHAT HAPPENS

A human opens the Studio App.

### WHAT THEY DO NOT SEE

- Prices
- Dollars
- Cards
- Banks

### WHAT THEY DO SEE

- "Available nourishment"
- "Estimated unit cost"
- "Delivery window"

### WHAT THEY SELECT

- Milk
- Eggs
- Bread

### WHAT THEY PRESS

**REQUEST DELIVERY**

**This is NOT a purchase.**
**This is a request to consume previously acknowledged value.**

## HOUR 0 + 10s — ATTESTATION

### WHAT THE ATTESTOR DOES

The Attestor answers **one question only**:

> "Is this a legitimate human request within allowed bounds?"

### CHECKS

- User is approved
- Order ≤ daily cap
- No duplicate intent
- No velocity anomaly

### WHAT THE ATTESTOR SIGNS

```
IntentAttestation {
  subject: USER_0001
  anchor: INSTACART
  units: 12.45
  scope: FOOD
  ttl: 10 minutes
}
```

**No signature → nothing happens.**

## HOUR 0 + 15s — CLEARING

### WHAT TIGERBEETLE RECEIVES

**One instruction only**:

```
TRANSFER
FROM: USER.CREDIT.BALANCE
TO:   ANCHOR.INSTACART.CLEARING
AMOUNT: 12.45 units
```

### IF IT SUCCEEDS

- Balance changes are final
- Event is emitted
- Truth is established

### IF IT FAILS

- The world rewinds
- No side effects

**This is the point of no return — but only internally.**

## HOUR 0 + 20s — EVENT EMISSION

### WHAT THE EVENT BUS PUBLISHES

```
ANCHOR_FULFILLMENT_REQUESTED
```

### PAYLOAD

- Attestation
- Transfer ID
- SKU list
- Delivery address

**Nothing external has happened yet.**

## HOUR 0 + 30s — ANCHOR ACTION

### WHAT THE INSTACART ANCHOR DOES

The Instacart Anchor acts **as an honoring counterparty**, not a merchant.

### WHAT IT VERIFIES

- Attestation validity
- Transfer existence
- Anchor balance sufficiency

### ONLY THEN DOES IT

- Request a gift instrument
- Place the Instacart order

**This is the first contact with the outside world.**

## HOUR 0 + 5–60 min — REALITY RESPONDS

### EITHER

- Groceries arrive
  **OR**
- A failure event is emitted

### IN BOTH CASES

- Ledger truth is preserved
- No retroactive edits
- No reconciliation theater

**Day 0 success = 1 delivery.**

**Nothing else matters yet.**

## DAY 0 SUCCESS CRITERIA

1. **One delivery** completed
2. **No fiat touched**
3. **No bank involved**
4. **No prefunding required**
5. **Complete audit trail** maintained
6. **No double-spend** detected
7. **No fraud** detected

## DAY 0 FAILURE MODES

### FAILURE 1: ATTESTATION REJECTED

**Cause**: User not approved, order too large, duplicate intent

**Action**: Notify user, investigate, fix if needed

### FAILURE 2: TIGERBEETLE TRANSFER FAILS

**Cause**: Insufficient balance, account not found, cluster issue

**Action**: Check balances, verify accounts, restart cluster if needed

### FAILURE 3: ANCHOR REJECTS

**Cause**: Invalid attestation, insufficient anchor balance, API issue

**Action**: Check anchor logs, verify transfer, retry if possible

### FAILURE 4: GIFT CARD ISSUER FAILS

**Cause**: Issuer API down, rate limit, invalid request

**Action**: Use backup issuer, notify user, retry later

### FAILURE 5: INSTACART API FAILS

**Cause**: Instacart outage, invalid order, delivery issue

**Action**: Monitor Instacart status, notify user, retry later

## DAY 0 EMERGENCY PROCEDURES

### EMERGENCY 1: CLUSTER LOSS

1. Failover to backup cluster
2. Restore from cluster
3. Verify data consistency
4. Resume operations

### EMERGENCY 2: EVENT BUS DOWN

1. Restart event bus
2. Replay events from log
3. Verify all subscribers
4. Resume normal operation

### EMERGENCY 3: ANCHOR UNRESPONSIVE

1. Check anchor logs
2. Restart anchor service
3. Verify API connectivity
4. Resume operations

## DAY 0 OPERATOR COMMANDS

### CHECK TIGERBEETLE BALANCES

```bash
curl http://localhost:3000/api/tigerbeetle/balance/USER.CREDIT.BALANCE.0001
curl http://localhost:3000/api/tigerbeetle/balance/ANCHOR.INSTACART.CLEARING
```

### CHECK EVENTS

```bash
curl http://localhost:3000/api/events?type=ANCHOR_FULFILLED
curl http://localhost:3000/api/events?type=ANCHOR_REJECTED
```

### CHECK ORDER STATUS

```bash
curl http://localhost:3000/api/orders/transfer-12345
```

### CHECK ATTESTATION

```bash
curl http://localhost:3000/api/attestor/verify?intent=...
```

## DAY 0 OPERATOR LOG

### TEMPLATE

```
[HH:MM] Action: Description
[HH:MM] Result: Success/Failure
[HH:MM] Notes: Additional details
```

### EXAMPLE

```
[09:00] Action: Started TigerBeetle cluster
[09:01] Result: Success
[09:01] Notes: All 3 nodes online, quorum established

[09:15] Action: Funded user account
[09:16] Result: Success
[09:16] Notes: 100 CU added to USER.CREDIT.BALANCE.0001

[09:30] Action: Placed first order
[09:31] Result: Success
[09:31] Notes: Milk, eggs, bread requested

[09:32] Action: Attestation verified
[09:33] Result: Success
[09:33] Notes: Signature valid, within limits

[09:34] Action: Transfer created
[09:35] Result: Success
[09:35] Notes: 12.45 CU transferred to ANCHOR.INSTACART.CLEARING

[09:36] Action: Fulfillment requested
[09:37] Result: Success
[09:37] Notes: Event published to bus

[09:38] Action: Anchor honored
[09:39] Result: Success
[09:39] Notes: Gift card issued, order placed

[10:15] Action: Delivery confirmed
[10:16] Result: Success
[10:16] Notes: Food arrived at destination
```

## DAY 0 SUCCESS DECLARATION

If you reach this point:

```
[HH:MM] Action: Day 0 complete
[HH:MM] Result: SUCCESS
[HH:MM] Notes: System can say "yes" without breaking truth
```

**You have proven the system works.**

**Everything else is expansion.**

## NEXT STEPS AFTER DAY 0 SUCCESS

1. **Day 1**: Add 9 more users
2. **Day 2**: Increase order volume
3. **Day 3**: Expand catalog
4. **Day 4**: Add more anchors
5. **Day 5**: Scale to more ZIP codes
6. **Day 6**: Add utilities
7. **Day 7**: Add rent

**Each day builds on the previous success.**

**No step is skipped.**

**No shortcuts taken.**

**Truth is preserved.**

## OPERATOR OATH

I will:
1. **Not lie to the ledger**
2. **Not break truth**
3. **Not cut corners**
4. **Not panic**
5. **Not guess**
6. **Not assume**
7. **Not cheat**
8. **Not fail**

**I will deliver food.**

**I will preserve truth.**

**I will expand reality.**

## END

**Day 0 is about one thing: proving the system works.**

**If you can deliver one order, you can deliver them all.**

**If you can preserve truth once, you can preserve it forever.**

**This is how we eat.**