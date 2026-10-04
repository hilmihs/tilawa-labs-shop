import type { Metadata } from "next";
import { Suspense } from "react";
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { ToastProvider } from "@/lib/toast";
import { SessionProvider } from "@/lib/session";
import { WishlistProvider } from "@/lib/wishlist";
import { AddressesProvider } from "@/lib/addresses";
import { AppShell } from "@/components/AppShell";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap"
});

const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Toko Nusa · Indonesian craft, curated",
    template: "%s · Toko Nusa"
  },
  description:
    "An independent curator of craft and food from across the Indonesian archipelago. Direct from makers, with fast checkout and transparent shipping.",
  openGraph: {
    type: "website",
    title: "Toko Nusa",
    description:
      "An independent curator of craft and food from across the Indonesian archipelago.",
    siteName: "Toko Nusa"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <SessionProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <AddressesProvider>
                  <Suspense fallback={<>{children}</>}>
                    <AppShell>{children}</AppShell>
                  </Suspense>
                </AddressesProvider>
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
