import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Chrome } from "@/components/chrome/Chrome";

const clash = localFont({
  src: [
    { path: "../public/fonts/ClashDisplay-400.woff2", weight: "400" },
    { path: "../public/fonts/ClashDisplay-500.woff2", weight: "500" },
    { path: "../public/fonts/ClashDisplay-600.woff2", weight: "600" },
    { path: "../public/fonts/ClashDisplay-700.woff2", weight: "700" },
  ],
  variable: "--font-display",
  display: "swap",
});

const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi-400.woff2", weight: "400" },
    { path: "../public/fonts/Satoshi-500.woff2", weight: "500" },
    { path: "../public/fonts/Satoshi-700.woff2", weight: "700" },
  ],
  variable: "--font-body",
  display: "swap",
});

const jbm = localFont({
  src: [
    { path: "../public/fonts/JetBrainsMono-400.woff2", weight: "400" },
    { path: "../public/fonts/JetBrainsMono-500.woff2", weight: "500" },
  ],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TEDx BIT Jaipur — Outreach Engine",
  description:
    "500 travel-feasible speaker candidates for TEDx BIT Jaipur. Warp search, one-click invites, and a ₹5,000 zero-waste outreach playbook.",
  openGraph: {
    title: "TEDx BIT Jaipur — Outreach Engine",
    description: "Speaker intelligence for TEDx BIT Jaipur. Type an idea, get a stage.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TEDx BIT Jaipur — Outreach Engine",
    description: "Speaker intelligence for TEDx BIT Jaipur.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${clash.variable} ${satoshi.variable} ${jbm.variable}`}>
      <body>
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
