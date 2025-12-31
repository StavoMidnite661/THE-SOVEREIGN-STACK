// backend/webhook.js
require('dotenv').config();
const stripeLib = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const SFIAT_ABI = require('./abis/SFIAT.json'); 

const LEDGER_PATH = path.join(process.cwd(), 'ledger.json');

async function handleWebhookRaw(rawBody, sigHeader) {
  try {
    const event = stripeLib.webhooks.constructEvent(rawBody, sigHeader, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const requestId = pi.metadata.requestId;
      let ledger = {};
      if (fs.existsSync(LEDGER_PATH)) ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'));
      const row = ledger[requestId];
      if (!row) {
        console.warn('Webhook: no ledger entry for', requestId);
        return { ok: true };
      }
      row.status = 'paid';
      row.paymentIntentId = pi.id;
      row.paidAt = Date.now();
      fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));

      // If burnRequested: call SFIAT burn via admin wallet (dev only); in prod use multisig workflow
      if (row.burnRequested && process.env.PRIVATE_KEY && process.env.SFIAT_ADDRESS && process.env.RPC_URL) {
        try {
          const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
          const admin = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
          const sfiat = new ethers.Contract(process.env.SFIAT_ADDRESS, SFIAT_ABI, admin);
          const amount = ethers.utils.parseUnits(String(row.payload.amount), 18);
          // burnFrom pattern depends on your SFIAT contract — adapt as needed
          const tx = await sfiat.burnFrom(row.payload.wallet, amount);
          await tx.wait();
          row.sfiatBurnTx = tx.hash;
          row.status = 'settlement_completed';
          fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
        } catch (err) {
          console.error('Burn error', err);
          row.status = 'paid_burn_failed';
          row.burnError = err.message;
          fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
        }
      } else {
        console.log("Skipping on-chain burn (missing config or not requested).");
        row.status = 'settlement_completed_no_burn';
        fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
      }
    }
    return { ok: true };
  } catch (err) {
    console.error('Webhook handling error', err);
    throw err;
  }
}

module.exports = { handleWebhookRaw };
