# Environment Setup Instructions

To connect your **Business Stripe Account** and complete the workflow setup, please follow these steps:

1.  Create a file named `.env` in the root of this directory (`studios/`).
2.  Copy the content below into that file.
3.  Replace the `...` placeholders with your actual keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys).

## .env Content Template

```ini
# --- STRIPE CONFIGURATION ---
# Get these from: https://dashboard.stripe.com/apikeys
# Ensure you are using the keys for your BUSINESS account (not a personal/test one if you want live funds).

STRIPE_SECRET_KEY=sk_test_...    <-- REPLACE THIS with your Secret Key
STRIPE_PUBLISHABLE_KEY=pk_test_...  <-- REPLACE THIS with your Publishable Key
STRIPE_WEBHOOK_SECRET=whsec_...     <-- REPLACE THIS if you have set up webhooks

# --- OTHER CONFIGURATION ---
EVENTSTORE_BASE=http://localhost:2113
# EVENTSTORE_API_KEY=your_key_here

# IDEMPOTENCY_WINDOW_MS=300000
```

Once you save the `.env` file, restart the development server (`Ctrl+C` then `npx next dev -p 9003`) to apply the changes.
