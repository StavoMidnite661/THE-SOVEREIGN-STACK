import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
// Adjust import path to point to backend/attestor-client.js in project root
// @ts-ignore
import { requestAttestation } from "../../../../backend/attestor-client"; 
import fs from "fs";
import path from "path";
import { getOracleLedgerClient, ORACLE_ACCOUNTS } from "@/lib/oracle-ledger.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const CheckoutSchema = z.object({
  amount: z.number().min(0.01),
  wallet: z.string().min(5),
  merchantId: z.string().min(1),
  orderId: z.string().min(1),
  burnPOSCR: z.boolean().optional().default(false),
});

const LEDGER_PATH = path.join(process.cwd(), "ledger.json");

function writeLedgerEntry(requestId: string, item: any) {
  let ledger = {};
  if (fs.existsSync(LEDGER_PATH)) {
      try {
        ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, "utf8"));
      } catch (e) {
          console.error("Error reading ledger:", e);
      }
  }
  (ledger as any)[requestId] = item;
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = CheckoutSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { amount, wallet, merchantId, orderId, burnPOSCR } = parsed.data;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = { requestId, wallet, amount, merchantId, orderId, timestamp };

    // Initialize Oracle Ledger client
    const oracleClient = getOracleLedgerClient();

    // 1) Request attestation from Attestor Network
    let attestation;
    try {
        attestation = await requestAttestation(payload); // { signature, signer, expiresAt, rawPayload }
    } catch (e: any) {
        console.error("Attestation failed:", e);
        return NextResponse.json({ error: "Attestation failed: " + e.message }, { status: 500 });
    }

    // 2) Record in Oracle Ledger: Attestation event
    const attestationJournal = await oracleClient.createJournalEntry(
      `Checkout attestation: ${requestId} - $${amount.toFixed(2)} for ${wallet}`,
      [
        // Memo entry for audit trail (no balance change)
        { accountId: ORACLE_ACCOUNTS.CASH_VAULT_USDC, type: "DEBIT", amount: 0, description: `Attestor: ${attestation.signer}` },
        { accountId: ORACLE_ACCOUNTS.CASH_VAULT_USDC, type: "CREDIT", amount: 0, description: `Order: ${orderId}` },
      ],
      "ATTESTATION",
      { eventId: requestId, userId: wallet }
    );
    console.log(`[Checkout] Oracle Ledger attestation recorded: ${attestationJournal.journalEntryId}`);

    // 3) Record ledger row (file-based): attested + payment intent to follow
    const ledgerRow = {
      requestId,
      status: "attested",
      payload,
      attestation,
      burnRequested: !!burnPOSCR,
      createdAt: Date.now(),
      paymentIntentId: null as string | null,
      clientSecret: null as string | null,
      oracleJournalIds: [attestationJournal.journalEntryId] as string[],
    };
    writeLedgerEntry(requestId, ledgerRow);

    // 4) Create Stripe PaymentIntent with attestation metadata
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: {
        requestId,
        orderId,
        merchantId,
        attestationSigner: attestation.signer,
        attestationExpiresAt: attestation.expiresAt,
        oracleJournalId: attestationJournal.journalEntryId || "",
      },
      automatic_payment_methods: { enabled: true },
    });

    // 5) Record in Oracle Ledger: Payment Intent created
    const paymentJournal = await oracleClient.createJournalEntry(
      `Payment intent created: ${intent.id} - $${amount.toFixed(2)}`,
      [
        // Memo entry for audit trail (balance will change after payment confirmation)
        { accountId: ORACLE_ACCOUNTS.STRIPE_CLEARING, type: "DEBIT", amount: 0, description: `Intent: ${intent.id}` },
        { accountId: ORACLE_ACCOUNTS.STRIPE_CLEARING, type: "CREDIT", amount: 0, description: `Pending payment: ${requestId}` },
      ],
      "PAYMENT",
      { eventId: requestId, userId: wallet }
    );
    console.log(`[Checkout] Oracle Ledger payment intent recorded: ${paymentJournal.journalEntryId}`);

    // 6) Update file-based ledger with payment intent details
    ledgerRow.status = "payment_intent_created";
    ledgerRow.paymentIntentId = intent.id;
    ledgerRow.clientSecret = intent.client_secret;
    ledgerRow.oracleJournalIds.push(paymentJournal.journalEntryId || "");
    writeLedgerEntry(requestId, ledgerRow);

    return NextResponse.json({
      requestId,
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      oracleJournalIds: ledgerRow.oracleJournalIds,
    });
  } catch (err: any) {
    console.error("Checkout Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
