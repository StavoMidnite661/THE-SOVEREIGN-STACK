"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Inner payment form that uses Stripe hooks
function PaymentForm({ onSuccess, onError }: { onSuccess: (id: string) => void; onError: (msg: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin },
      redirect: "if_required",
    });

    if (error) {
      setPaying(false);
      onError(error.message || "Payment failed");
    } else if (paymentIntent?.status === "succeeded") {
      setPaying(false);
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      <button
        type="submit"
        disabled={paying || !stripe}
        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:hover:scale-100"
      >
        {paying ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</> : "Complete Payment"}
      </button>
    </form>
  );
}

export default function CheckoutForm() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function authorizePayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const amount = Number((form.elements.namedItem("amount") as HTMLInputElement).value);
    const wallet = (form.elements.namedItem("wallet") as HTMLInputElement).value;
    const merchantId = (form.elements.namedItem("merchantId") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          wallet,
          merchantId,
          orderId: crypto.randomUUID(),
          burnPOSCR: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (paymentId) {
    return (
      <div className="p-6 bg-green-950/30 border border-green-500/50 rounded-xl text-green-400 flex items-center gap-3 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-500">
        <CheckCircle className="h-6 w-6 animate-in zoom-in spin-in-90 duration-500 delay-150" />
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
          <p className="font-semibold">Payment Successful!</p>
          <p className="text-sm opacity-80">ID: {paymentId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!clientSecret && (
        <form onSubmit={authorizePayment} className="space-y-4">
          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="Amount USD"
            required
            suppressHydrationWarning
            className="w-full h-12 px-4 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/50 transition-all duration-200 focus:scale-[1.02] focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 hover:border-white/40"
          />
          <input
            name="wallet"
            placeholder="Wallet Address (0x...)"
            required
            suppressHydrationWarning
            className="w-full h-12 px-4 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/50 transition-all duration-200 focus:scale-[1.02] focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 hover:border-white/40 delay-75"
          />
          <input
            name="merchantId"
            placeholder="Merchant ID"
            required
            suppressHydrationWarning
            className="w-full h-12 px-4 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/50 transition-all duration-200 focus:scale-[1.02] focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 hover:border-white/40 delay-150"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:hover:scale-100 delay-200"
          >
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Authorizing...</> : "Authorize Payment"}
          </button>
        </form>
      )}

      {error && (
        <div className="p-4 bg-red-950/30 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: { theme: "night", variables: { colorPrimary: "#06b6d4" } },
          }}
        >
          <PaymentForm
            onSuccess={(id) => setPaymentId(id)}
            onError={(msg) => setError(msg)}
          />
        </Elements>
      )}
    </div>
  );
}
