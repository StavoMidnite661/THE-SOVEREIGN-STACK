# SOVR CANONICAL SPEC

## SOVEREIGN LEDGER ARCHITECTURE

### PURPOSE

This document replaces all bank-style, database-centric assumptions with a ledger-native, sovereign-correct model. It defines how value exists, moves, and becomes spendable without requiring fiat pre-funding, while remaining compatible with real-world merchants (Instacart, gift cards, utilities).

**This is not a payments app. This is a clearing engine with optional settlement.**

## CORE DOCTRINE

1. **Money does not move. Ledgers update.**
2. **TigerBeetle is truth. Everything else is narrative.**
3. **Fiat is a settlement option, not a prerequisite.**
4. **Spend happens first. Settlement happens later (or never).**
5. **Anchors — not banks — give value real-world substance.**

## SYSTEM LAYERS

### 1. TIGERBEETLE — SOVEREIGN CLEARING ENGINE (PRIMARY)

**What it is:** A deterministic, append-only, double-entry clearing engine.

**What it does:**
- Enforces balances
- Enforces double-entry
- Enforces ordering
- Enforces finality

**What it never does:**
- Queries
- Joins
- Reconciliation
- Reporting
- Compliance logic

**TigerBeetle is not a database. It is a mechanical truth machine.**

### 2. ORACLE LEDGER (POSTGRES) — NARRATIVE & COMPLIANCE MIRROR (SECONDARY)

**What it is:** A human-readable, regulator-friendly event mirror.

**What it does:**
- Stores immutable ledger events
- Stores attestations
- Produces reports
- Answers auditors

**What it never does:**
- Calculate balances
- Enforce correctness
- Decide validity

**Postgres reflects truth. It never creates it.**

### 3. ATTESTOR — INTENT GATE & FRAUD FIREWALL

**What it is:** The system's truth oracle for intent.

**Responsibilities:**
- Verifies authorization
- Prevents replay
- Prevents double-spend
- Signs spend intents

**Nothing touches TigerBeetle without attestation.**

### 4. ANCHORS — REAL-WORLD VALUE SURFACES

**Anchors are entities willing to honor ledger value.**

**Examples:**
- Instacart (groceries)
- Gift card issuers
- Utilities
- Telecoms

**Anchors are not banks. They are counterparties.**

## TIGERBEETLE-NATIVE SCHEMA

### ACCOUNT TYPES (BY CONVENTION)

| Account | Purpose |
|---------|---------|
| USER:* | User value accounts |
| RESERVE:* | Deferred settlement buckets |
| ANCHOR:* | Merchant / issuer accounts |
| TREASURY | System equity |
| BURN | Irreversible sink |

### ACCOUNT CREATION

**Accounts are created by the application, not discovered.**

**Each account ID is deterministic and known ahead of time.**

### TRANSFER MODEL

**Every action is a single TigerBeetle transfer:**

```
(debit_account) → (credit_account)
```

**No pending state. No partial state. No reversal.**

**If it exists, it is final.**

## EVENT-DRIVEN INTEGRATION

### THE ONLY VALID WRITE PATH

```
User Intent
↓
Attestor Signs
↓
TigerBeetle create_transfer()
↓
TransferCommitted Event
↓
Postgres INSERT (append-only)
```

**Postgres subscribes to truth. It never catches up.**

### POSTGRES CANONICAL TABLES

```sql
CREATE TABLE ledger_events (
  id BIGSERIAL PRIMARY KEY,
  tb_transfer_id BIGINT NOT NULL,
  debit_account BIGINT NOT NULL,
  credit_account BIGINT NOT NULL,
  amount BIGINT NOT NULL,
  metadata JSONB,
  occurred_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE balance_snapshots (
  account_id BIGINT,
  balance BIGINT,
  snapshot_at TIMESTAMPTZ,
  PRIMARY KEY (account_id, snapshot_at)
);
```

**Snapshots are:**
- Periodic
- Informational
- Never authoritative

## THE ANCHOR MODEL

### WHAT MAKES AN ANCHOR VALID

An anchor must:
1. Deliver goods/services digitally
2. Accept prepaid value (gift card, balance, API credit)
3. Not require chargeback-reversible settlement

**Instacart qualifies.**

### INSTACART ANCHOR FLOW (ZERO FIAT FLOAT)

```
USER:VALUE
↓ (spend intent)
ATTST
↓ (signature)
TB: USER → ANCHOR
↓ (final)
ANCHOR ADAPTER
↓
Gift Card / Order Credit Issued
```

**Key insight:** The system never touches fiat. Instacart is the honored counterparty.

## GIFT CARD ADAPTER (ZERO-FLOAT SPEC)

### ADAPTER RESPONSIBILITIES

- Accept ledger confirmation
- Call issuer API
- Deliver code/order
- Emit fulfillment receipt

### FAILURE MODEL

```
IF issuance fails → no TB transfer is created
NO refunds
NO clawbacks
```

**Ledger finality first. Delivery second.**

## WHEN FIAT BECOMES OPTIONAL FOREVER

Fiat is only required when:
- No anchor exists
- A counterparty demands settlement

Once anchors cover:
- Food
- Utilities
- Connectivity
- Shelter

Fiat becomes a legacy bridge, not a necessity.

## ONE-PAGE AGENT DOCTRINE

**We operate a sovereign clearing engine.**

**Value exists because counterparties honor it.**

**TigerBeetle enforces truth.**

**Attestors enforce intent.**

**Anchors provide real-world substance.**

**Fiat is optional and deferred.**

**We do not move money. We update ledgers.**

## FINAL STATE

This system:
- Does not require banks
- Does not require prefunding
- Does not require debt
- Does not rely on trust

It relies on: **Truth, ordering, and honored counterparties.**

That is sovereignty.

---

## INSTACART ANCHOR CONTRACT — LANGUAGE-AGNOSTIC INTERFACE

### PURPOSE

To exchange cleared ledger credit for food delivery fulfillment, without requiring fiat prefunding.

### INPUTS (FROM SOVEREIGN LEDGER)

```
request_id        : UUID
consumer_id       : DID | Wallet | AccountID
anchor_id         : INSTACART
value_units       : integer (food credits, not USD)
value_reference   : "US_GROCERY_UNIT"
delivery_address  : structured address
items_requested   : optional SKU list | cart hash
expiry_time       : timestamp
attestation_sig   : attestor signature
```

### ANCHOR OBLIGATIONS

```
IF attestation_sig is valid
AND value_units >= minimum_order_threshold
AND request_id unused
THEN
    fulfill grocery order
    return fulfillment_receipt
ELSE
    reject request
```

### OUTPUTS (TO LEDGER)

```
request_id
anchor_id
fulfilled_units
fulfillment_reference (Instacart order ID)
timestamp
status = FULFILLED | PARTIAL | REJECTED
```

### CRITICAL RULE

**The Anchor never touches fiat logic.**

**It only honors cleared value claims.**

---

## TIGERBEETLE ACCOUNT NAMESPACE

### ACCOUNT ID SCHEMA (128-BIT)

```
[ DOMAIN ][ ANCHOR ][ ROLE ][ SUBJECT ]
```

### DOMAINS

```
01 = CORE
02 = USERS
03 = ANCHORS
04 = RESERVE (optional, later)
```

### CORE ACCOUNTS

```
01.00.00.0000  → SYSTEM_CLEARING
01.00.01.0000  → SYSTEM_ESCROW
```

### USER ACCOUNTS

```
02.00.01.<user_id> → USER_CREDIT_BALANCE
02.00.02.<user_id> → USER_SPEND_PENDING
```

### ANCHOR ACCOUNTS

```
03.01.01.0001 → ANCHOR_INSTACART_CLEARING
03.01.02.0001 → ANCHOR_INSTACART_SETTLED
```

### UTILITIES (FUTURE-PROOFED)

```
03.02.01.0001 → ANCHOR_ELECTRIC
03.03.01.0001 → ANCHOR_WATER
03.04.01.0001 → ANCHOR_RENT
```

### WHY THIS MATTERS

- No USD accounts
- No merchant balances
- No "money"
- Just claims, clearance, and honoring

---

## GIFT CARD ADAPTER — EXECUTABLE SPEC (ZERO FIAT FLOAT)

### TRIGGER

```
EVENT: AnchorFulfillmentRequested
```

### REQUIRED INPUTS

```
attestation_id
anchor_id = INSTACART
value_units
consumer_reference
```

### EXECUTION LOGIC

```
VERIFY attestation_id
VERIFY unspent value_units
REQUEST gift_code from issuer
    denomination = value_units
    issuer = grocery_partner
RECEIVE gift_code
EMIT AnchorFulfilled event
LOCK value_units permanently
```

### FAILURE HANDLING

```
IF gift_code unavailable:
    DO NOT burn
    DO NOT debit
    REQUEUE request
```

### KEY INSIGHT

**The adapter never holds cash.**

**It only exchanges ledger-cleared claims for codes.**

---

## ONE-PAGE SURVIVAL BRIEF

### "THIS IS HOW WE EAT"

#### THE PROBLEM

People don't need money.
They need food, utilities, and shelter.
Banks gate access to those using debt and prefunding.

#### THE SOLUTION

We built a ledger-cleared access system.
No bank.
No debit card.
No fiat reserve required to start.

#### HOW IT WORKS (PLAIN ENGLISH)

1. Value is acknowledged (SOVR / credit signal)
2. Ledger clears the claim (TigerBeetle)
3. Attestor confirms truth
4. Anchor honors the claim
5. Food arrives

**At no point does "money move".**

#### WHY INSTACART MATTERS

Instacart = food + logistics + national coverage.
That makes it a survival anchor, not a merchant.

#### WHEN FIAT BECOMES OPTIONAL FOREVER

The moment anchors honor ledger truth directly, fiat becomes:
- Optional
- Delayed
- External
- Irrelevant to survival

#### WHAT THIS SYSTEM ACTUALLY IS

**A sovereign clearing network that converts truth into life.**

---

## IMPLEMENTATION CHECKLIST

### PHASE 1: TIGERBEETLE SETUP

- [ ] Deploy 3-node TigerBeetle cluster
- [ ] Configure account and transfer ledgers
- [ ] Set up event bus
- [ ] Define account namespace

### PHASE 2: CORE SERVICES

- [ ] Credit Terminal integration
- [ ] Event bus implementation
- [ ] Instacart Anchor service
- [ ] Gift Card Adapter service
- [ ] Utility Anchor service

### PHASE 3: STUDIO APP

- [ ] Order placement UI
- [ ] Gift card management UI
- [ ] Utility payment UI
- [ ] Event subscription

### PHASE 4: TESTING

- [ ] Unit tests for all services
- [ ] Integration tests
- [ ] Load testing (10,000+ TPS)
- [ ] Failover testing

### PHASE 5: DEPLOYMENT

- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Alert configuration
- [ ] Documentation

---

## EMERGENCY PROCEDURES

### TIGERBEETLE NODE FAILURE

1. Automatic failover to replica
2. Replace failed node
3. Restore from cluster
4. Verify data consistency

### EVENT BUS FAILURE

1. Failover to backup bus
2. Replay events from log
3. Verify all subscribers
4. Resume normal operation

### INSTACART OUTAGE

1. Queue orders locally
2. Retry on Instacart recovery
3. Notify users of delays
4. Refund if necessary

### GIFT CARD ISSUER FAILURE

1. Pause activations
2. Notify users
3. Resume on issuer recovery
4. Process backlog

---

## COMMANDMENTS

1. Thou shalt not duplicate data
2. Thou shalt not poll
3. Thou shalt not sync
4. Thou shalt not guess accounts
5. Thou shalt not trust external systems
6. Thou shalt not fear failure
7. Thou shalt not panic
8. Thou shalt not break the ledger
9. Thou shalt not forget the events
10. Thou shalt not forget: TigerBeetle is the ledger

---

## GLOSSARY

- **TigerBeetle**: The SOVR ledger (primary source of truth)
- **Account Ledger**: Stores account balances (Ledger ID: 1)
- **Transfer Ledger**: Stores transfer records (Ledger ID: 2)
- **Event Bus**: Pub/sub system for event-driven integration
- **Credit Terminal**: Entry point for all transactions
- **Instacart Anchor**: Integration with Instacart API
- **Gift Card Adapter**: Integration with gift card issuers
- **Utility Anchor**: Integration with utility providers
- **Studio App**: User interface for SOVR ecosystem
- **FIC**: Financial Intelligence Center (monitoring)
- **Attestor**: Intent gate and fraud firewall
- **Anchor**: Entity willing to honor ledger value

---

## END

**TigerBeetle is the ledger. Events are the integration. Accounts are exact. Anchors are the honoring counterparties. This is how we eat.**