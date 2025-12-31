---
description: Launch the full SOVR Ecosystem (FIC → Apps)
---

# SOVR Ecosystem Launch

Start all apps through the FIC Operations Center for centralized monitoring.

## 1. Start FinSec Monitor (FIC) — FIRST
The central Operations Control Center that monitors all other apps.
It runs on port 3000.

```bash
cd "d:/SOVR_Development_Holdings_LLC/The Soverign Stack/FinSec Monitor"
npm install
npm run dev
```

> [!IMPORTANT]
> Start FIC first so it can monitor the health of all subsequent apps as they come online.

## 2. Start USD Gateway (Studio)
The Studio handles Stripe processing and sFIAT logic.
It runs on port 9002.

```bash
cd "d:/SOVR_Development_Holdings_LLC/The Soverign Stack/studio"
npm install
npm run dev
```

## 3. Start Credit Terminal (Frontend)
The Terminal is the user interface for Swapping and Spending.
It runs on port 3002 (changed from 3000 to avoid FIC conflict).

```bash
cd "d:/SOVR_Development_Holdings_LLC/The Soverign Stack/credit-terminal/frontend"
npm install
npm run dev
```

## 4. Start Oracle Ledger (Optional)
The compliance mirror for double-entry accounting.

```bash
cd "d:/SOVR_Development_Holdings_LLC/The Soverign Stack/ORACLE-LEDGER-main"
npm install
npm run dev
```

---

## Verification

Once all apps are running, check FIC dashboard:
- Open http://localhost:3000
- Verify all servers show "healthy" status
- Check Webhooks are active
- Review AI Analytics for system health

> [!NOTE]
> Ensure you have `STRIPE_SECRET_KEY` in `studio/.env` for real payments, or it will run in mock mode.
