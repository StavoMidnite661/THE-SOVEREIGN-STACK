# Sovereign Stack Integration — Save State

**Last Updated:** 2024-12-14 03:26 PST  
**Status:** 🟡 In Progress — Phase 1 (Foundation)

---

## 🎯 Ultimate Goal

Build a **self-verifying ledger system** where:
- Oracle Ledger = Central truth (double-entry accounting)
- Credit Terminal = Authorization engine (decides who can spend)  
- Studio App = USD Gateway (user interface)
- TigerBeetle = Fast clearing engine (optional, for high-speed operations)

**Key Principle:** "Ledgers update, money does not move."

---

## 📍 Current State

### Projects Identified

| Project | Location | Purpose | Status |
|---------|----------|---------|--------|
| **Oracle Ledger** | `ORACLE-LEDGER-main (1)/ORACLE-LEDGER-main/` | Central truth ledger | ✅ Analyzed |
| **Credit Terminal** | `sovr_hybrid_engineV2/` | Authorization engine | ✅ ABIs exported |
| **Studio App** | `studio/` | USD Gateway UI | ✅ Contracts imported |
| **SOVRPay** | `SOVRPay-main/SOVRPay-main/` | Ultimate stack (future) | 📋 Future |

### Completed Work

- [x] Created `SOVEREIGN_STACK_ARCHITECTURE.md` — Architecture overview
- [x] Created `AGENT_BRIEFING.md` — 1-page quick reference
- [x] Created `specs/ANCHOR_CONTRACT_SPEC.md` — Anchor contract interface
- [x] Created `specs/INSTACART_ADAPTER_SPEC.md` — Zero-fiat fulfillment adapter
- [x] Created `specs/TIGERBEETLE_LEDGER_SCHEMA.md` — TigerBeetle schema
- [x] Created `FOUNDATION_INTEGRATION_PLAN.md` — Integration roadmap
- [x] Created `studio/src/contracts/` — ABI exports for Studio
  - [x] `addresses.json` — Deployed contract addresses
  - [x] `AttestorOracleEIP712.json` — Attestation ABI
  - [x] `CreditEventRegistry.json` — Event logging ABI
  - [x] `index.ts` — TypeScript exports
- [x] Created `sovr_hybrid_engineV2/scripts/export-abis.js` — ABI export script
- [x] Analyzed Oracle Ledger structure and capabilities
- [x] **Step 1.1: Oracle Ledger → Credit Terminal bridge interface**
  - [x] Created `shared/oracle-ledger-bridge.ts` — Shared types and templates
  - [x] Created `sovr_hybrid_engineV2/val/core/oracle-ledger-bridge-service.ts` — Bridge service
  - [x] Added 7 anchor accounts to Oracle Ledger's constants.ts (2500-2505, 6300)
- [x] **Step 2: Credit Terminal → Oracle Ledger wiring**
  - [x] Upgraded `val/events/logger.ts` — Now records all events to Oracle Ledger
  - [x] Upgraded `val/core/spend_engine.ts` — Queries balances from Oracle Ledger
  - [x] Added event-to-journal mapping for all CreditEventTypes
- [x] **Step 3: Studio → Oracle Ledger wiring**
  - [x] Created `studio/src/lib/oracle-ledger.service.ts` — Oracle Ledger client
  - [x] Created `studio/src/app/api/oracle-ledger/balance/route.ts` — Balance API
  - [x] Created `studio/src/hooks/use-oracle-balance.ts` — React hooks
  - [x] Created `studio/src/components/oracle-balance-card.tsx` — Balance display
  - [x] Updated checkout route to record journal entries in Oracle Ledger
- [x] **Step 4: Anchor System Implementation**
  - [x] Created `sovr_hybrid_engineV2/contracts/EssentialFulfillmentAnchor.sol`
  - [x] Created `sovr_hybrid_engineV2/scripts/deploy_anchor.js`
  - [x] Created `sovr_hybrid_engineV2/val/adapters/instacart_adapter.ts`
  - [x] Updated `val/events/types.ts` and `adapter_interface.ts`

---

## 📋 TODO List (Priority Order)

### Phase 1: Wire the Foundation ✅ COMPLETE

#### Step 1: Oracle Ledger Setup ✅ COMPLETE
- [x] Create Oracle Ledger → Credit Terminal bridge interface
- [x] Define which Oracle Ledger accounts map to Credit Terminal operations
- [x] Create shared types between Oracle Ledger and Credit Terminal

#### Step 2: Credit Terminal → Oracle Ledger Connection ✅ COMPLETE
- [x] Create service in Credit Terminal to write journal entries to Oracle Ledger
- [x] Map Credit Terminal events to Oracle Ledger journal entry sources
- [x] Wire attestation events to journal entries

#### Step 3: Studio → Oracle Ledger Connection ✅ COMPLETE
- [x] Create balance query API in Studio backend
- [x] Wire Studio checkout to Oracle Ledger journal entries
- [x] Display Oracle Ledger balances in Studio UI

#### Step 4: Anchor System Implementation ✅ COMPLETE
- [x] Create `EssentialFulfillmentAnchor.sol` contract
- [x] Deploy to testnet (Script created)
- [x] Wire to Oracle Ledger obligation accounts (Via Adapter)
- [x] Create Instacart adapter (Tango Card integration)

### Phase 2: TigerBeetle Integration (Optional Fast Clearing) [NEXT]

- [ ] Install tigerbeetle-node in Credit Terminal
- [ ] Create TigerBeetle accounts that mirror Oracle Ledger accounts
- [ ] Wire high-frequency operations to TigerBeetle
- [ ] Sync TigerBeetle → Oracle Ledger for audit trail

### Phase 3: Testing & Validation

- [ ] Test full flow: Studio → Credit Terminal → Oracle Ledger
- [ ] Test anchor authorization → fulfillment flow
- [ ] Validate double-entry accounting integrity
- [ ] Test compliance audit logging

### Phase 4: SOVRPay Integration (Future)

- [ ] Port Oracle Ledger schema to SOVRPay
- [ ] Connect all components to SOVRPay
- [ ] Build full RWA tokenization features

---

## 🗂️ Key Files Reference

### Architecture Documents
```
sovr_hybrid_engineV2/
├── SOVEREIGN_STACK_ARCHITECTURE.md  # Full architecture
├── AGENT_BRIEFING.md                # Quick reference
├── specs/
│   ├── ANCHOR_CONTRACT_SPEC.md      # Anchor contract
│   ├── INSTACART_ADAPTER_SPEC.md    # Instacart adapter
│   └── TIGERBEETLE_LEDGER_SCHEMA.md # TigerBeetle schema
└── FOUNDATION_INTEGRATION_PLAN.md   # Integration roadmap
```

### Oracle Ledger (Central Truth)
```
ORACLE-LEDGER-main (1)/ORACLE-LEDGER-main/
├── shared/schema.ts          # Drizzle ORM schema (1330 lines)
├── types.ts                  # TypeScript types (1128 lines)
├── constants.ts              # Chart of accounts, mock data
├── services/                 # 27 backend services
│   ├── achPaymentService.ts
│   ├── directDepositService.ts
│   ├── stripeJournalService.ts
│   ├── reconciliationService.ts
│   └── ...
└── server/                   # API server
```

### Credit Terminal (Authorization)
```
sovr_hybrid_engineV2/
├── contracts/                # Smart contracts
│   ├── AttestorOracleEIP712.sol
│   ├── CreditEventRegistry.sol
│   ├── SOVRHybridRouter_v2.sol
│   └── ...
├── val/                      # Value Attestation Layer
│   ├── core/
│   └── adapters/
└── frontend/                 # Credit Terminal UI
```

### Studio (USD Gateway)
```
studio/
├── src/
│   ├── contracts/            # Imported from Credit Terminal
│   │   ├── addresses.json
│   │   ├── AttestorOracleEIP712.json
│   │   ├── CreditEventRegistry.json
│   │   └── index.ts
│   └── app/
│       └── api/
│           └── checkout/     # Stripe checkout
└── backend/
```

---

## 🔑 Key Deployed Contracts (Base Mainnet)

| Contract | Address |
|----------|---------|
| SOVR Token | `0x65e75d0fc656a2e81ef17e9a2a8da58d82390422` |
| sFIAT | `0x2c98e9c8ba005dc690d98e2e31a4811c094e0be3` |
| ReserveManager | `0xed3db8f97024a3be5f5ae22f27024e5e94fad64a` |
| SOVRHybridRouter V2 | `0xf682bd9789c0a66f2cb82ecc13fc6b43d7b58830` |
| AttestorOracle | `0xaca71bc598139d9167414ae666f7cd9377b871f7` |
| TWAPHelper | `0xa3620e31fb37b7de32fadf5c476d93c080fe3ad4` |

---

## 📊 Oracle Ledger Key Accounts

From `constants.ts`:

| ID | Account Name | Type | Entity |
|----|--------------|------|--------|
| 1000 | Cash-ODFI-LLC | Asset | LLC |
| 1010 | Cash-Vault-USDC | Asset | Trust |
| 1050 | ACH-Settlement-Account | Asset | LLC |
| 1060 | Stripe-Clearing-Account | Asset | LLC |
| 1200 | Intercompany-Receivable-Trust | Asset | Trust |
| 1300 | AR | Asset | LLC |
| 2100 | ACH-Clearing-LLC | Liability | LLC |
| 2180 | Direct-Deposit-Liabilities | Liability | LLC |
| 2300 | AP | Liability | LLC |
| 2400 | Payroll-Liability | Liability | LLC |
| 3000 | LLC-Equity | Equity | LLC |
| 3100 | Trust-Capital | Equity | Trust |
| 4000 | Token-Realization-Gain/Loss | Income | LLC |
| 6000 | Payroll-Expense | Expense | LLC |
| 6100 | Ops-Expense | Expense | LLC |
| 6150 | ACH-Processing-Fees | Expense | LLC |
| 6160 | Stripe-Processing-Fees | Expense | LLC |

---

## 🔗 Integration Mapping (Credit Terminal → Oracle Ledger)

| Credit Terminal Event | Oracle Ledger Journal Source | Accounts |
|----------------------|------------------------------|----------|
| `CREDIT_DEPOSITED` | `CHAIN` | DR: Cash-Vault-USDC, CR: Token-Realization |
| `SPEND_AUTHORIZED` | `PAYMENT` | DR: Ops-Expense, CR: Cash-ODFI-LLC |
| `ATTESTATION_VERIFIED` | `CHAIN` | (Event logged, no journal) |
| `GIFT_CARD_CREATED` | `PURCHASE` | DR: Purchase-Expense, CR: AP |
| `SPEND_SETTLED` | `PAYMENT` | (Settlement confirmation) |

---

## 📝 Notes

- Oracle Ledger uses **Drizzle ORM** with PostgreSQL
- Credit Terminal contracts are on **Base Mainnet**
- Studio uses **Next.js** with Stripe integration
- TigerBeetle is optional for high-frequency operations
- All journal entries must balance (DEBIT = CREDIT)

---

## 🚨 Blockers / Issues

- None currently identified

---

*This file is the source of truth for integration progress. Reference frequently.*
