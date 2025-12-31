import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Manual parser for .env since default dotenv might not be available in this context easily
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const secretMatch = envContent.match(/STRIPE_WEBHOOK_SECRET=(whsec_[a-zA-Z0-9]+)/);

if (!secretMatch) {
    console.error('❌ Could not find STRIPE_WEBHOOK_SECRET in .env');
    process.exit(1);
}

const secret = secretMatch[1];
console.log(`✅ Found Webhook Secret: ${secret.substring(0, 10)}...`);

const payload = JSON.stringify({
  id: 'evt_test_webhook',
  object: 'event',
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: 'pi_test_12345',
      object: 'payment_intent',
      amount: 2000,
      currency: 'usd',
      created: Math.floor(Date.now() / 1000), // Added missing timestamp
      metadata: {
        order_id: 'ORD-TEST-WEBHOOK'
      }
    }
  }
});

const timestamp = Math.floor(Date.now() / 1000);
const signaturePayload = `${timestamp}.${payload}`;
const signature = crypto
  .createHmac('sha256', secret)
  .update(signaturePayload)
  .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;

console.log('🚀 Sending Webhook Request to localhost:9003...');

fetch('http://localhost:9003/api/webhooks/stripe', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripeSignature
    },
    body: payload
})
.then(async res => {
    const text = await res.text();
    if (res.status === 200) {
        console.log('✅ Webhook Verification Success! (200 OK)');
        console.log('Response:', text);
    } else {
        console.error(`❌ Webhook Failed: ${res.status}`);
        console.error('Response:', text);
    }
})
.catch(err => {
    console.error('❌ Connectivity Error:', err);
});
