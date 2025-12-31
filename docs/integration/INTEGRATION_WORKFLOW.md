# Credit Terminal ↔ Studio Integration Guide

> **Note**: This document focuses on the **Credit Terminal** side of the integration. For the Studio Gateway workflow, see [`studio/WORKFLOW_OVERVIEW.md`](./studio/WORKFLOW_OVERVIEW.md).

## System Architecture Overview

The SOVR ecosystem consists of two primary applications that work together to enable cryptographically-verified credit spending:

### 1. **Credit Terminal** (sovr_hybrid_engineV2/frontend)
- **Port**: 3002
- **Purpose**: User-facing swap and credit interface
- **Tech Stack**: Next.js, Wagmi, RainbowKit, Viem
- **Primary Functions**:
  - SOVR ↔ USDC token swaps via SOVRHybridRouter
  - Wallet connection (Base network)
  - Balance display for SOVR, USDC, sFIAT
  - Spend request initiation

### 2. **Studio (USD Gateway)** (studio/)
- **Port**: 9002
- **Purpose**: Fiat settlement gateway with attestation
- **Tech Stack**: Next.js, Stripe, Firebase
- **Primary Functions**:
  - Attestation request/verification
  - Stripe PaymentIntent creation
  - Webhook settlement processing
  - sFIAT/POSCR burning

---

## End-to-End Workflow: "The Rocket Flow"

### Phase 1: User Acquires Credit (On-Chain)

**Location**: Credit Terminal (localhost:3002)

1. **User connects wallet** via RainbowKit
   - Must be on Base network (chainId: 8453)
   - Wallet displays live balances via `useBalance` hook

2. **User swaps USDC → SOVR** (or vice versa)
   - Calls `SOVRHybridRouter.swapUSDCForSOVR()`
   - Contract address: `0x200dbb33ff5ff1a75d9d7f49b88e8361349eda4d`
   - Approval required first via ERC20.approve()

3. **SOVR balance increases**
   - Balance fetched via Wagmi's `useReadContract`
   - Reads from SOVR token: `0x65e75d0fc656a2e81ef17e9a2a8da58d82390422`

### Phase 2: Spend Request (Terminal → Studio)

**API Route**: `POST /api/spend` (Credit Terminal)

**Request Flow**:
```
Credit Terminal Frontend
    ↓ (user clicks "Spend")
Credit Terminal API (/api/spend)
    ↓ (forwards to Studio)
Studio Gateway API (/api/checkout)
    ↓ (requests attestation)
Attestor Service (SAN)
    ↓ (signs EIP-712)
Stripe PaymentIntent (with metadata)
```

**Code Path**:
```typescript
// Credit Terminal: frontend/src/app/api/spend/route.ts
const studioPayload = {
  order_id: `ORD-${Date.now()}`,
  amount_usd: parseFloat(amount),
  payer: '0xMockUserWallet', // TODO: Get from session
  merchant_id: merchant, // 'square' | 'tango' | 'coinbase'
  site_order_id: `TERM-${Date.now()}`,
  metadata: { email }
};

fetch(`${STUDIO_URL}/api/checkout`, {
  method: 'POST',
  body: JSON.stringify(studioPayload)
});
```

### Phase 3: Attestation Pull (Studio)

**Location**: Studio Gateway (`POST /api/checkout`)

1. **Studio receives spend request**
   - Validates: amount, wallet, merchantId

2. **Studio pulls attestation** from Attestor Service (SAN)
   ```
   POST ${ATTESTOR_SERVICE_URL}/attest
   {
     "wallet": "0x...",
     "amount": 10.00,
     "merchantId": "square",
     "orderId": "ORD-123"
   }
   ```

3. **Attestor signs EIP-712 message**
   - Creates cryptographic proof linking:
     - Wallet address
     - Amount
     - Merchant
     - Timestamp/Nonce
   - Returns: `{ signature, signer, expiry }`

4. **Studio creates Stripe PaymentIntent**
   ```typescript
   const paymentIntent = await stripe.paymentIntents.create({
     amount: amount * 100, // cents
     currency: 'usd',
     metadata: {
       attestation_signature: attestation.signature,
       attestation_signer: attestation.signer,
       attestation_expiry: attestation.expiry,
       sovr_wallet: wallet,
       sovr_order_id: orderId
     }
   });
   ```

5. **Returns `clientSecret` to Terminal**

### Phase 4: Payment Completion (User → Stripe)

**Location**: Credit Terminal Frontend

1. **Terminal receives `clientSecret`**
2. **Loads Stripe PaymentElement** (react-stripe-js)
3. **User completes payment** (credit card, Apple Pay, etc.)
4. **Stripe processes transaction**

### Phase 5: Settlement & Burn (Webhook)

**Location**: Studio Gateway (`POST /api/webhooks/stripe`)

1. **Stripe fires `payment_intent.succeeded` webhook**
2. **Studio verifies webhook signature**
3. **Studio updates ledger**
   - Writes to `ledger.json`
   - Records: orderId, amount, wallet, timestamp

4. **Studio burns sFIAT/POSCR** (optional, if `burnPOSCR: true`)
   ```typescript
   const tx = await contract.burn(
     wallet,
     parseUnits(amount.toString(), 18)
   );
   ```

5. **On-chain event emitted**
   - `SettlementCompleted(attestationId, merchantRef, gatewayRef)`

---

## Key Integration Points

### Environment Variables

**Credit Terminal (.env)**:
```bash
NEXT_PUBLIC_RPC_BASE=https://mainnet.base.org
NEXT_PUBLIC_WALLET_CONNECT_ID=demo
STUDIO_URL=http://localhost:9002  # Points to Studio
```

**Studio (.env.local)**:
```bash
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
ATTESTOR_SERVICE_URL=http://localhost:4002
RPC_URL=https://mainnet.base.org
PRIVATE_KEY=0x...  # For burning tokens
```

### Contract Addresses (Base Mainnet)

| Contract | Address |
|----------|---------|
| SOVR Token | `0x65e75d0fc656a2e81ef17e9a2a8da58d82390422` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| sFIAT | `0x2c98e9c8ba005dc690d98e2e31a4811c094e0be3` |
| SOVRHybridRouter V2 | `0x200dbb33ff5ff1a75d9d7f49b88e8361349eda4d` |
| ReserveManager | `0xed3db8f97024a3be5f5ae22f27024e5e94fad64a` |
| AttestorOracle | `0xaca71bc598139d9167414ae666f7cd9377b871f7` |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CREDIT TERMINAL (Port 3002)                 │
│                                                                 │
│  [User Wallet] → [Swap SOVR/USDC] → [Balance: 100 SOVR]       │
│                                                                 │
│  [Spend Button] → POST /api/spend                              │
│                      ↓                                          │
└──────────────────────┼──────────────────────────────────────────┘
                       │
                       │ Forward spend request
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                    STUDIO GATEWAY (Port 9002)                   │
│                                                                 │
│  POST /api/checkout                                             │
│    ↓                                                            │
│  1. Request Attestation from SAN                                │
│    ← { signature, signer, expiry }                              │
│                                                                 │
│  2. Create Stripe PaymentIntent                                 │
│     metadata: { attestation_signature, sovr_wallet }            │
│    → { clientSecret }                                           │
│                                                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Return clientSecret
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                     CREDIT TERMINAL                             │
│                                                                 │
│  [Stripe PaymentElement] → User pays with card                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                       │
                       │ payment_intent.succeeded
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                    STUDIO GATEWAY                               │
│                                                                 │
│  POST /api/webhooks/stripe                                      │
│    ↓                                                            │
│  1. Verify webhook signature                                    │
│  2. Update ledger.json                                          │
│  3. Burn sFIAT on-chain (optional)                              │
│  4. Emit SettlementCompleted event                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current Status & Known Issues

### ✅ Working
- Credit Terminal running on port 3002
- Wallet connection via RainbowKit
- SOVR/USDC swap functionality
- Balance display (after RPC fix)

### ⚠️ Needs Verification
- Studio Gateway running on port 9002
- Attestor Service (SAN) availability
- Stripe webhook endpoint configuration
- Actual spend flow end-to-end

### 🔧 Configuration Required
- `STUDIO_URL` in Credit Terminal .env
- `ATTESTOR_SERVICE_URL` in Studio .env
- Stripe webhook secret setup
- Private key for token burning

---

## Testing the Full Flow

### 1. Start Both Services
```bash
# Terminal 1: Credit Terminal
cd sovr_hybrid_engineV2/frontend
npm run dev  # Port 3002

# Terminal 2: Studio Gateway
cd studio
npm run dev  # Port 9002
```

### 2. Verify Connectivity
```bash
# Test Terminal → Studio connection
curl -X POST http://localhost:3002/api/spend \
  -H "Content-Type: application/json" \
  -d '{"merchant":"square","amount":"10","email":"test@example.com"}'
```

### 3. End-to-End Test
1. Open http://localhost:3002
2. Connect wallet (Base network)
3. Swap USDC → SOVR
4. Click "Spend" (if UI exists)
5. Complete Stripe payment
6. Verify settlement in Studio logs

---

## Security Considerations

1. **Attestation Expiry**: All attestations have 24-hour TTL
2. **Replay Protection**: Nonce-based to prevent double-spend
3. **Signature Verification**: EIP-712 typed data signing
4. **Webhook Validation**: Stripe signature verification required
5. **Private Key Storage**: Never commit to git, use env vars

---

## Next Steps for Full Integration

1. ✅ Fix RPC configuration (DONE)
2. ⬜ Verify Studio is running on port 9002
3. ⬜ Test `/api/spend` → `/api/checkout` flow
4. ⬜ Configure Stripe webhook endpoint
5. ⬜ Deploy Attestor Service (SAN)
6. ⬜ Add spend UI to Credit Terminal
7. ⬜ Test full end-to-end transaction
8. ⬜ Implement proper wallet session management

---

**Last Updated**: December 12, 2025
**Maintained By**: SOVR Development Team
