
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripeService } from '@/lib/stripe.service';
import { sovrService } from '@/lib/sovr.service';
import crypto from 'crypto';

const {
  EVENTSTORE_BASE,
  EVENTSTORE_API_KEY,
  EVENTSTORE_STREAM_PREFIX = 'orders',
  STRIPE_WEBHOOK_SECRET
} = process.env;

if (!STRIPE_WEBHOOK_SECRET) {
  console.warn("STRIPE_WEBHOOK_SECRET is not set. Webhook will not function.");
}

async function publishEvent(streamName: string, eventType: string, data: object): Promise<boolean> {
    if(!EVENTSTORE_BASE) {
        console.error("EVENTSTORE_BASE not set, cannot publish event");
        return false;
    }
    const event = [{
        eventId: crypto.randomUUID(),
        eventType,
        data
    }];
    const url = `${EVENTSTORE_BASE}/streams/${encodeURIComponent(streamName)}`;
    // const url = ... declared above
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/vnd.eventstore.events+json',
                ...(EVENTSTORE_API_KEY ? { 'ES-ApiKey': EVENTSTORE_API_KEY } : {})
            },
            body: JSON.stringify(event)
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => '<no body>');
            console.error(`EventStore publish failed: ${res.status} ${txt}`);
            return false;
        }
        return true;
    } catch (error: any) {
        console.warn(`Failed to publish to EventStore (Service might be down): ${error.message}`);
        return false; // Fail gracefully
    }
    return true;
}


export async function POST(req: Request) {
    if (!STRIPE_WEBHOOK_SECRET) {
      console.log("Received Stripe webhook, but no secret is configured. Ignoring.");
      return NextResponse.json({ received: true, message: "Webhook ignored, no secret configured." });
    }
    
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') as string;

    // Call local ledger/burn handler (PR feature)
    try {
        // @ts-ignore
        const { handleWebhookRaw } = require('../../../../../backend/webhook');
        await handleWebhookRaw(body, signature);
        console.log("Local ledger/burn handler processed successfully.");
    } catch (e: any) {
        console.error("Local ledger handler failed:", e.message);
        // Don't fail the request yet, let EventStore try
    }

    let event: Stripe.Event;

    try {
        event = stripeService.stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // This metadata would need to be set when creating the PaymentIntent
    const eventObject = event.data.object as { metadata?: { order_id?: string } };
    const order_id = eventObject.metadata?.order_id;
    if (!order_id) {
         console.warn("Received Stripe event without order_id in metadata", event.id);
         // Still acknowledge receipt to Stripe
         return NextResponse.json({ received: true });
    }

    const stream = `${EVENTSTORE_STREAM_PREFIX}-${order_id}`;

    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntentSucceeded = event.data.object;
            console.log(`PaymentIntent ${paymentIntentSucceeded.id} for order ${order_id} succeeded!`);
            
            await publishEvent(stream, 'PaymentAuthorized', {
                order_id,
                amount: paymentIntentSucceeded.amount,
                currency: paymentIntentSucceeded.currency,
                settled_at: new Date(paymentIntentSucceeded.created * 1000).toISOString(),
                settlement_reference: paymentIntentSucceeded.id, // Using PI id as ref
            });

            await publishEvent(stream, 'OrderSettled', {
                order_id,
                merchant_receipt: paymentIntentSucceeded.id
            });

            // --- INTEGRATION: Mint sFIAT ---
            // Assuming the 'receipt_email' or a metadata field contains the user's wallet address.
            // For now, we look for 'wallet_address' in metadata.
            const wallet_address = paymentIntentSucceeded.metadata?.wallet_address;
            
            if (wallet_address) {
                try {
                    const amountEth = (paymentIntentSucceeded.amount / 100).toString(); // Stripe is in cents
                    await sovrService.mintsFIAT(wallet_address, amountEth);
                    console.log(`Minted ${amountEth} sFIAT to ${wallet_address}`);
                    
                    await publishEvent(stream, 'AssetMinted', {
                        asset: 'sFIAT',
                        amount: amountEth,
                        to: wallet_address
                    });
                } catch (mintError: any) {
                    console.error("Minting failed:", mintError.message);
                    await publishEvent(stream, 'MintingFailed', {
                        reason: mintError.message
                    });
                }
            } else {
                console.warn("No wallet_address found in payment metadata. Skipping mint.");
            }
            // -------------------------------
            break;

        case 'payment_intent.payment_failed':
            const paymentIntentFailed = event.data.object;
            console.log(`PaymentIntent ${paymentIntentFailed.id} for order ${order_id} failed!`);
            await publishEvent(stream, 'PaymentFailed', {
                order_id,
                reason: 'Stripe payment failed',
                details: paymentIntentFailed.last_payment_error?.message || 'Unknown error',
            });
            break;
            
        default:
            console.log(`Unhandled Stripe event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
