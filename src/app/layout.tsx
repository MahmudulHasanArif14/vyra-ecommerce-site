import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/hooks/use-cart";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Toaster } from "sonner";
import PageTracker from "@/components/analytics/page-tracker";
import "./globals.css";
import FloatingShopButton from "@/components/layout/floating-shop-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

config.autoAddCss = false;

export const metadata: Metadata = {
  title: "VYRA Accessories | Premium Fashion & Accessories in Bangladesh",
  description:
    "Shop premium clothing, bags, mobile cases, AirPods cases and accessories from VYRA Accessories.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PageTracker />
        <Toaster position="top-right" />
        <CartProvider>{children}</CartProvider>
        <FloatingShopButton />
      </body>
    </html>
  );
}
