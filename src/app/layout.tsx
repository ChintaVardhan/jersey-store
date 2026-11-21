import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { Analytics } from "@/components/analytics";
import { StorefrontShell } from "@/components/storefront-shell";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Jersey Store — Football & Cricket Kits",
    template: "%s · Jersey Store",
  },
  description:
    "Gen Z jersey drops: football & cricket Fan Editions, Master Copies, and Custom Builds. Matchday ready.",
  openGraph: {
    title: "Jersey Store",
    description: "Football & cricket jerseys. Drops. Custom kits.",
    type: "website",
    siteName: "Jersey Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jersey Store",
    description: "Football & cricket jerseys. Drops. Custom kits.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <StorefrontShell>{children}</StorefrontShell>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
