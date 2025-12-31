import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FIC - Financial Intelligence Center",
  description: "Enterprise-grade financial monitoring and intelligence platform with AI-powered analytics, real-time transaction monitoring, and compliance tracking.",
  keywords: ["FIC", "Financial Intelligence", "monitoring", "compliance", "fraud detection", "financial analytics", "transaction monitoring"],
  authors: [{ name: "Financial Intelligence Team" }],
  openGraph: {
    title: "FIC - Financial Intelligence Center",
    description: "Financial monitoring and intelligence platform",
    url: "https://fic.example.com",
    siteName: "FIC Dashboard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FIC - Financial Intelligence Center",
    description: "Financial monitoring and intelligence platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey=""
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}