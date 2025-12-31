import CheckoutForm from "@/components/checkout-form";
import { Icons } from "@/components/icons";

export default function Home() {
  return (
    <main className="min-h-screen w-full relative bg-black font-body text-foreground flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
      {/* Dark Horizon Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #000000 40%, #0d1a36 100%)",
        }}
      />

      <div className="w-full max-w-lg z-10 animate-in fade-in zoom-in-95 duration-1000 slide-in-from-bottom-8">
        <header className="flex flex-col items-center gap-4 mb-10 justify-center">
          <Icons.logo className="h-12 w-12 text-primary drop-shadow-[0_0_15px_rgba(56,189,248,0.5)] animate-pulse" />
          <h1 className="text-4xl font-bold font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-cyan-600 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] animate-in fade-in slide-in-from-top-4 duration-700 delay-200 fill-mode-backwards">
            USD Gateway
          </h1>
        </header>
        <CheckoutForm />
        <footer className="mt-12 text-center text-sm text-muted-foreground/60 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-backwards">
          <p>© 2025 SOVR Pay. All rights reserved. A new era in digital finance.</p>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            <span className="hover:text-primary cursor-pointer transition-colors hover:scale-105 active:scale-95 duration-200">Docs</span>
            <span className="hover:text-primary cursor-pointer transition-colors hover:scale-105 active:scale-95 duration-200">API Reference</span>
            <span className="hover:text-primary cursor-pointer transition-colors hover:scale-105 active:scale-95 duration-200">Privacy Policy</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
