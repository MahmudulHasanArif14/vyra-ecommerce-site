import Link from "next/link";
import NewsletterForm from "./newsletter-form";
import { getSettings } from "@/lib/settings";
import FadeIn from "../animation/fade-in";
import { Sparkles, ArrowRight } from "lucide-react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default async function Footer() {
  const settings = await getSettings();

  const storeName = settings.store_name || "VYRA Accessories";
  const storeEmail = settings.store_email || "hello@vyra.com";
  const storePhone = settings.store_phone || "+880 1700-000000";
  const storeAddress = settings.store_address || "Sylhet, Bangladesh";

  const facebookUrl = settings.facebook_url || "#";
  const instagramUrl = settings.instagram_url || "#";
  const youtubeUrl = settings.youtube_url || "#";

  const brandWord = storeName.split(" ")[0].toUpperCase();

  return (
    <footer className="relative bg-[#0a0a0a] text-white overflow-hidden">
      {/* ============================================================ */}
      {/* Ambient glows */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[130px]" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[130px]" />
      </div>

      <div className="relative">
        {/* ============================================================ */}
        {/* 1. NEWSLETTER */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center border-b border-white/5">
          <FadeIn y={20}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] mb-4">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                Newsletter
              </span>
            </div>

            <h2 className="text-lg md:text-2xl tracking-[0.3em] font-medium text-white">
              JOIN THE VYRA ARMY
            </h2>

            <p className="text-sm text-gray-400 mt-4 max-w-md mx-auto leading-relaxed">
              Be the first to know about new collections and exclusive offers.
            </p>

            <div className="max-w-md mx-auto mt-8">
              <NewsletterForm />
            </div>
          </FadeIn>
        </section>

        {/* ============================================================ */}
        {/* 2. THREE-COLUMN LINKS */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-12">
          {/* Products */}
          <FadeIn y={20} delay={0.05}>
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <h3 className="text-xs tracking-[0.2em] font-semibold text-white uppercase">
                  Products
                </h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-400">
                {[
                  { href: "/category/accessories", label: "Accessories" },
                  { href: "/category/clothing", label: "Clothing" },
                  { href: "/category/bags", label: "Bags" },
                  { href: "/category/mobile-cases", label: "Mobile Cases" },
                  { href: "/category/airpods-cases", label: "AirPods Cases" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 group hover:text-white transition-colors duration-300"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* Support */}
          <FadeIn y={20} delay={0.1}>
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <h3 className="text-xs tracking-[0.2em] font-semibold text-white uppercase">
                  Support
                </h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-400">
                {[
                  { href: "/about", label: "About us" },
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms & Conditions" },
                  { href: "/returns", label: "Refund & Exchange" },
                  { href: "/shipping", label: "Shipping Policy" },
                  { href: "/track-order", label: "Track Order" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 group hover:text-white transition-colors duration-300"
                    >
                      {/* <span className="w-3 h-px bg-white/20 group-hover:w-5 group-hover:bg-blue-400 transition-all duration-300" /> */}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* About Us */}
          <FadeIn y={20} delay={0.15}>
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <h3 className="text-xs tracking-[0.2em] font-semibold text-white uppercase">
                  Get in Touch
                </h3>
              </div>

              <p className="text-sm text-gray-400 italic mb-5 leading-relaxed">
                Elevate your everyday style.
              </p>

              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <span className="text-gray-600">Phone:</span>{" "}
                  <a
                    href={`tel:${storePhone}`}
                    className="hover:text-white transition"
                  >
                    {storePhone}
                  </a>
                </li>
                <li>
                  <span className="text-gray-600">Mail:</span>{" "}
                  <a
                    href={`mailto:${storeEmail}`}
                    className="hover:text-white transition break-all"
                  >
                    {storeEmail}
                  </a>
                </li>
                <li>
                  <span className="text-gray-600">Location:</span>{" "}
                  {storeAddress}
                </li>
              </ul>

              {/* Social icons */}
              <div className="flex gap-3 mt-6">
                {facebookUrl && facebookUrl !== "#" && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white hover:text-black hover:border-white transition-all duration-300 hover:scale-110"
                    aria-label="Facebook"
                  >
                    <FaFacebookF className="w-4 h-4" />
                  </a>
                )}
                {instagramUrl && instagramUrl !== "#" && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white hover:text-black hover:border-white transition-all duration-300 hover:scale-110"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="w-4 h-4" />
                  </a>
                )}
                {youtubeUrl && youtubeUrl !== "#" && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white hover:text-black hover:border-white transition-all duration-300 hover:scale-110"
                    aria-label="YouTube"
                  >
                    <FaYoutube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ============================================================ */}
        {/* 3. GIANT BRAND NAME */}
        {/* ============================================================ */}
        <section className="border-t border-white/5 overflow-hidden">
          <FadeIn y={60} duration={1.1}>
            <h2
              className="text-center font-bold text-white/95 select-none tracking-[-0.02em] leading-[0.8] py-8 px-4"
              style={{
                fontSize: "clamp(4rem, 18vw, 20rem)",
                fontFamily: "Georgia, serif",
              }}
            >
              {brandWord}
            </h2>
          </FadeIn>
        </section>

        {/* ============================================================ */}
        {/* 4. BOTTOM BAR */}
        {/* ============================================================ */}
        <section className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 cursor-pointer hover:border-white/25 transition">
                BDT ৳
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 cursor-pointer hover:border-white/25 transition">
                EN
              </span>
            </div>

            <p className="text-center">
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>

            <div className="flex items-center gap-5">
              <Link href="/privacy" className="hover:text-white transition">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition">
                Terms
              </Link>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
}
