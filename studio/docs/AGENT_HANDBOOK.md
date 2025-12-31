# SOVR USD Gateway — Agent Handbook (Stripe Pull Model)

## 1. One-Sentence Summary
We let users convert SOVR credit into real USD using Stripe. Stripe only moves USD when a valid attestation exists. The system requires **no upfront reserve** — Stripe pulls the money at spend time.

---

## 2. Architecture Flow

```
User
  |
  | Enter amount + wallet
  v
Frontend (Checkout Form)
  |
  | POST /api/checkout
  v
Backend
  |--- Request Attestation ---> Attestor Network (SAN)
  |<-- Signed Proof (EIP712) --
  |
  |--- Create Stripe PaymentIntent (attestation in metadata) --->
  |<-- clientSecret -------------------
  v
Frontend (Stripe PaymentElement)
  |
  | User enters card & pays
  v
Stripe
  |
  |--- USD Settlement ---> SOVR Reserve (Stripe Balance)
  |
  |--- webhook ---> Backend
  v
Backend: Burn sFIAT + Update Ledger
  |
  v
Frontend: Success Screen
```

---

## 3. Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| **User** | Submits wallet + USD amount, authorizes payment |
| **Frontend** | Collects order, calls `/api/checkout`, loads Stripe PaymentElement |
| **Backend** | Orchestrates attestation, creates PaymentIntent, writes ledger, processes webhook |
| **Attestor (SAN)** | Verifies on-chain deposit state, signs EIP-712 attestation |
| **Stripe** | Executes USD flow, returns funds to Stripe balance |
| **Admin/Gnosis Safe** | Controls `reserve.setRouter`, burning authority |

---

## 4. Key Steps (Operational)

### Deploy & Config
- Contracts deployed on chain
- `ReserveManager` has `router` set to Router contract
- `SFIAT` has MINTER/BURNER roles configured
- Backend `.env` has Stripe keys + RPC URL

### Start Services
1. Start Hardhat node + deploy contracts
2. Start backend service
3. Start attestor service (or dev signer)
4. Start frontend

### Test Buy Flow
1. Fill checkout: $5, wallet, orderId
2. Click Authorize → Backend requests attestation + creates PaymentIntent
3. Complete Stripe payment with test card `4242 4242 4242 4242`
4. Verify webhook writes ledger with `settlement_completed`
5. Verify sFIAT burn tx on-chain

---

## 5. Security Checklist (Before Real Money)

- [ ] Admin keys moved to Gnosis Safe multisig
- [ ] Attestor session keys are short-lived
- [ ] Stripe webhooks validated with `STRIPE_WEBHOOK_SECRET`
- [ ] Backend admin keys in vault (not plaintext)
- [ ] Audit trail: requestId, paymentIntentId, attestation.signature, onChainTxHash
- [ ] Alerting for: failed burn, webhook miss, unusual volumes

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| No clientSecret returned | Check attestor response, backend logs |
| PaymentElement fails to load | Verify clientSecret and publishable key |
| Webhook not firing | Check Stripe CLI: `stripe listen --forward-to localhost:9002/api/webhooks/stripe` |
| Paid but burn failed | Check admin signer balance, gas, contract roles |
| Attestation rejected | Verify payload matches metadata; check nonce & expiry |

---

## 7. Playbook: Compromised Attestor Key

1. Publish emergency message
2. Multisig: revoke session key via `attestor.revokeSession(key)`
3. Pause `/api/checkout` (maintenance mode)
4. Audit last 72h ledger entries
5. Reissue session keys via MPC only after mitigation

---

## 8. Quick Reference Commands

```bash
# Start node
npx hardhat node

# Deploy local
npx hardhat run scripts/deploy_local.js --network localhost

# Start backend
npm run dev

# Listen Stripe webhooks (dev)
stripe listen --forward-to localhost:9002/api/webhooks/stripe
```

---

## 9. Compliance Script (For Regulators/Partners)

> "SOVR provides private, trust-backed digital credits used to authorize real-world merchant payouts. The system does not convert public cryptocurrencies into global stablecoins — it issues internal settlement credits that are only realized to fiat via merchant payment processors (Stripe, etc.) when an attestation proves a deposit or authorization. We use short-lived cryptographic attestations, multisig governance, and on-chain audit logs to ensure traceability and prevent abuse."
