import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import OrganizationJsonLd from "@/components/seo/organization-json-ld";
import { CartProvider } from "@/hooks/use-cart";

import { Toaster } from "sonner";
import PageTracker from "@/components/analytics/page-tracker";
import "./globals.css";
import FloatingShopButton from "@/components/layout/floating-shop-button";
import SmoothScroll from "@/components/animation/smooth-scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // ⭐ Add this
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "VYRA Accessories | Premium Fashion & Accessories in Bangladesh",
  description:
    "Shop premium clothing, bags, mobile cases, AirPods cases and accessories from VYRA Accessories.",
  metadataBase: new URL(
    process.env.SITE_URL || "https://vyra-ecommerce-site.vercel.app",
  ),
  openGraph: {
    title: "VYRA Accessories | Premium Fashion & Accessories",
    description:
      "Shop premium clothing, bags, mobile cases, AirPods cases and accessories.",
    type: "website",
    siteName: "VYRA Accessories",
  },
  twitter: {
    card: "summary_large_image",
    title: "VYRA Accessories",
    description: "Shop premium fashion and accessories in Bangladesh.",
  },
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
      <body className="min-h-full flex flex-col bg-[#0f0f0f] text-white">
        <SmoothScroll>
          <OrganizationJsonLd />
          <PageTracker />
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#fff",
                backdropFilter: "blur(10px)",
              },
            }}
          />
          <CartProvider>{children}</CartProvider>
          <FloatingShopButton />
        </SmoothScroll>
      </body>
    </html>
  );
}
