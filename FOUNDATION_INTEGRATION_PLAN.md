# SOVR Foundation Integration Plan

## The Two Pillars

| Component | Location | Purpose |
|-----------|----------|---------|
| **Credit Terminal** | `sovr_hybrid_engineV2/` | Authorization Engine (decides who can spend) |
| **Studio App** | `studio/` | USD Gateway (the face, where users interact) |

---

## Current State Analysis

### Credit Terminal (`sovr_hybrid_engineV2`)

**What Exists:**
- ✅ Smart Contracts deployed on Base Mainnet
- ✅ SOVRHybridRouter_v2 (production router with TWAP oracle)
- ✅ AttestorOracle (EIP-712 attestation)
- ✅ CreditEventRegistry (on-chain event logging)
- ✅ sFIAT stablecoin
- ✅ ReserveManager (collateral management)
- ✅ VAL (Value Attestation Layer) with merchant adapters

**What's Missing:**
- ❌ TigerBeetle integration (the truth ledger)
- ❌ Anchor Contract for real-world fulfillment
- ❌ Connection to Studio App

### Studio App (`studio`)

**What Exists:**
- ✅ Next.js frontend with TypeScript
- ✅ Stripe integration (checkout API)
- ✅ Attestation request flow (calls Attestor)
- ✅ Ledger.json for tracking
- ✅ Firebase backend services

**What's Missing:**
- ❌ Connection to Credit Terminal contracts
- ❌ ABI imports from Credit Terminal
- ❌ TigerBeetle balance display
- ❌ Anchor fulfillment UI

---

## Architecture: How They Connect

```
┌───────────────────────────────────────────────────────────────────────────┐
│                              USER                                          │
│                        "I want groceries"                                 │
└─────────────────────────────────┬─────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         STUDIO APP (UI Layer)                              │
│                                                                            │
│   - Displays TigerBeetle balance                                          │
│   - User initiates spend intent                                           │
│   - Shows attestation status                                              │
│   - Displays fulfillment confirmation                                     │
│                                                                            │
│   Location: /studio/                                                      │
└─────────────────────────────────┬─────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    CREDIT TERMINAL (Authorization)                         │
│                                                                            │
│   SMART CONTRACTS:                                                        │
│   - AttestorOracleEIP712.sol → Signs attestations                        │
│   - CreditEventRegistry.sol → Logs events on-chain                       │
│   - SOVRHybridRouter_v2.sol → Routes value                               │
│                                                                            │
│   VAL LAYER:                                                              │
│   - AttestationEngine → Creates signed proofs                            │
│   - UniversalSpendEngine → Processes spend requests                      │
│   - Merchant Adapters → Tango, Square, Stripe, etc.                      │
│                                                                            │
│   Location: /sovr_hybrid_engineV2/                                        │
└─────────────────────────────────┬─────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      TIGERBEETLE (Truth Ledger)                            │
│                                                                            │
│   - User account balances (source of truth)                               │
│   - Anchor obligation accounts                                            │
│   - Transfer history                                                      │
│   - Double-entry accounting                                               │
│                                                                            │
│   Location: External service (cluster_id: 0, port: 3000)                 │
└─────────────────────────────────┬─────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    ANCHOR FULFILLMENT (Exit Valve)                         │
│                                                                            │
│   - Instacart Adapter → Gift card issuance                               │
│   - Utility Adapter → Bill payment                                        │
│   - Real-world goods delivered                                            │
│                                                                            │
│   Location: /sovr_hybrid_engineV2/val/adapters/                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Integration Steps

### Phase 1: Connect Studio to Credit Terminal

**Goal:** Studio can call Credit Terminal contracts

1. **Export ABIs from Credit Terminal**
   ```bash
   # In sovr_hybrid_engineV2/
   npx hardhat compile
   # ABIs generated in artifacts/contracts/
   ```

2. **Copy ABIs to Studio**
   ```
   studio/src/contracts/
   ├── AttestorOracleEIP712.json
   ├── CreditEventRegistry.json
   ├── SOVRHybridRouter_v2.json
   └── addresses.json  # Contract addresses by network
   ```

3. **Create Contract Hooks in Studio**
   ```typescript
   // studio/src/hooks/useAttestor.ts
   export function useAttestor() {
     const contract = useContract(ATTESTOR_ADDRESS, AttestorABI);
     return {
       requestAttestation: (params) => contract.attest(params),
       verifyAttestation: (sig) => contract.verify(sig),
     };
   }
   ```

### Phase 2: Add TigerBeetle to Credit Terminal

**Goal:** Credit Terminal uses TigerBeetle as truth ledger

1. **Install TigerBeetle Client**
   ```bash
   # In sovr_hybrid_engineV2/
   npm install tigerbeetle-node
   ```

2. **Create TigerBeetle Service**
   ```
   sovr_hybrid_engineV2/val/core/
   └── tigerbeetle.ts  # Ledger client
   ```

3. **Wire VAL to TigerBeetle**
   - UniversalSpendEngine checks TigerBeetle balance
   - AttestationEngine records transfers in TigerBeetle
   - Merchant adapters update obligation accounts

### Phase 3: Implement Anchor Contract

**Goal:** Real-world fulfillment via anchors

1. **Create Anchor Contract**
   ```
   sovr_hybrid_engineV2/contracts/
   └── EssentialFulfillmentAnchor.sol
   ```

2. **Update VAL Adapters**
   - Tango adapter becomes GROCERY anchor
   - Link to TigerBeetle obligation accounts

3. **Deploy and Wire**
   - Deploy anchor contract to Base
   - Register in Credit Terminal
   - Update Studio to display anchor status

### Phase 4: Studio Balance Display

**Goal:** Studio shows TigerBeetle balance

1. **Create Balance API in Studio Backend**
   ```
   studio/backend/
   └── balance.ts  # Queries TigerBeetle via Credit Terminal
   ```

2. **Create Balance Component**
   ```typescript
   // studio/src/components/BalanceCard.tsx
   export function BalanceCard() {
     const { balance } = useTigerBeetleBalance();
     return <Card>Available: {balance} units</Card>;
   }
   ```

---

## File Structure After Integration

```
SOVR Foundation/
├── sovr_hybrid_engineV2/          # CREDIT TERMINAL
│   ├── contracts/
│   │   ├── AttestorOracleEIP712.sol
│   │   ├── CreditEventRegistry.sol
│   │   ├── SOVRHybridRouter_v2.sol
│   │   ├── EssentialFulfillmentAnchor.sol  # NEW
│   │   └── ...
│   ├── val/
│   │   ├── core/
│   │   │   ├── attestation_engine.ts
│   │   │   ├── spend_engine.ts
│   │   │   └── tigerbeetle.ts  # NEW
│   │   ├── adapters/
│   │   │   ├── tango.ts (GROCERY anchor)
│   │   │   └── ...
│   │   └── anchor/  # NEW
│   │       ├── anchor_contract.ts
│   │       └── instacart_adapter.ts
│   ├── specs/                     # ARCHITECTURE DOCS
│   │   ├── ANCHOR_CONTRACT_SPEC.md
│   │   ├── INSTACART_ADAPTER_SPEC.md
│   │   └── TIGERBEETLE_LEDGER_SCHEMA.md
│   └── frontend/                  # Credit Terminal UI
│
├── studio/                        # STUDIO APP (USD Gateway)
│   ├── src/
│   │   ├── contracts/             # NEW - Imported ABIs
│   │   │   └── addresses.json
│   │   ├── hooks/
│   │   │   ├── useAttestor.ts     # NEW
│   │   │   └── useBalance.ts      # NEW
│   │   ├── components/
│   │   │   ├── BalanceCard.tsx    # NEW
│   │   │   └── ...
│   │   └── app/
│   │       └── api/
│   │           └── balance/       # NEW
│   └── backend/
│       └── tigerbeetle-client.ts  # NEW
│
└── TigerBeetle/                   # TRUTH LEDGER (External)
    └── (running as cluster)
```

---

## Deployed Contract Addresses (Base Mainnet)

From Credit Terminal README:

| Contract | Address |
|----------|---------|
| SOVR Token | `0x65e75d0fc656a2e81ef17e9a2a8da58d82390422` |
| sFIAT | `0x2c98e9c8ba005dc690d98e2e31a4811c094e0be3` |
| ReserveManager | `0xed3db8f97024a3be5f5ae22f27024e5e94fad64a` |
| SOVRPrivatePool | `0x18d4a13a0116b360efddb72aa626721cfa2a8228` |
| SOVRProgrammablePool | `0x4f9b7a45b5234ca1cc96980d2cb0f49768d26622` |
| SOVRHybridRouter V2 | `0xf682bd9789c0a66f2cb82ecc13fc6b43d7b58830` |
| AttestorOracle | `0xaca71bc598139d9167414ae666f7cd9377b871f7` |
| TWAPHelper | `0xa3620e31fb37b7de32fadf5c476d93c080fe3ad4` |

---

## Next Actions (Priority Order)

1. **[ ] Export ABIs** from Credit Terminal
2. **[ ] Create addresses.json** in Studio with contract addresses
3. **[ ] Install tigerbeetle-node** in Credit Terminal
4. **[ ] Create tigerbeetle.ts** service in VAL
5. **[ ] Wire Studio hooks** to Credit Terminal
6. **[ ] Deploy Anchor Contract** (EssentialFulfillmentAnchor)
7. **[ ] Test first attestation** through Studio → Credit Terminal → TigerBeetle

---

## The Goal

Once integrated:

```
User opens Studio
   → Sees balance from TigerBeetle
   → Clicks "Get Groceries"
   → Credit Terminal attests the spend
   → TigerBeetle records the transfer
   → Instacart adapter issues gift card
   → User receives groceries
   → NO FIAT MOVED UPFRONT
```

This is the foundation. SOVRPay is the full vision built on top.

---

*Foundation Integration Plan v1.0 — December 2024*
