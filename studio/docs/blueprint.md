# **App Name**: USD Gateway

## Core Features:

- Checkout Endpoint: Accepts checkout calls from sovr.world with USD amounts, validates the requests, and initiates the payment process.
- Event Publishing: Publishes USD-native events (PaymentInitiated, PaymentAuthorized, OrderSettled) to EventStore.
- Funding Verification (Optional): Optionally verifies with the token-funding service that the SOVR backing is locked/burned, ensuring secure settlement using the funding service URL provided.
- Idempotency Handling: Implements idempotency using a unique key to prevent duplicate requests within a specified time window.
- Error Handling: Gracefully handles errors, publishing a PaymentFailed event and returning an error response to the client.
- Settlement Confirmation: Returns a definitive success (settlement_reference + events published) so frontend and backend always see a USD-style payment.

## Style Guidelines:

- Primary color: Deep purple (#6750A4) evoking stability and security.
- Background color: Light gray (#F2F0F7) to maintain a clean, professional aesthetic.
- Accent color: Teal (#4FD1C5) for highlights and actionable elements, creating a sense of trustworthiness.
- Body and headline font: 'Inter' sans-serif for a modern, machined look.
- Use simple, geometric icons for payment status and actions.
- Clean, well-spaced layout with clear separation of sections for easy readability.
- Subtle loading animations for transaction processes.