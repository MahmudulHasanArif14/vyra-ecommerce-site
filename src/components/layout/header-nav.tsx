"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Menu, X, Search, Heart, User } from "lucide-react";

import CartIcon from "./cart-icon";

// ⭐ Lazy-load the mobile drawer (pulls in framer-motion only when opened)
const MobileDrawer = dynamic(() => import("./mobile-drawer"), {
  ssr: false,
});

type NavItem = {
  href: string;
  label: string;
};

interface HeaderNavProps {
  items: NavItem[];
  storeName: string;
  logoUrl?: string | null;
}

export default function HeaderNav({
  items,
  storeName,
  logoUrl,
}: HeaderNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ticking = useRef(false);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        ticking.current = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ESC closes mobile drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* =========================
          HEADER (plain HTML — no framer-motion)
      ========================== */}

      <header
        className={`
          sticky top-0 inset-x-0 z-50
          w-full
          glass-header
          transition-all duration-300
          text-white
          animate-[slideDown_0.45s_ease-out]
          ${
            scrolled
              ? "bg-[#0a0a0a]/95 border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
              : "bg-[#0a0a0a]/90 border-b border-white/5"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-[76px] flex items-center">
          {/* LOGO */}
          <Link
            href="/"
            aria-label={storeName}
            className="relative shrink-0 flex items-center h-10 w-28 sm:w-32 "
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={storeName}
                fill
                sizes="128px"
                className="object-contain object-left scale-[1.5] "
                priority
              />
            ) : (
              <Image
                src="/assets/logo.png"
                alt={storeName}
                fill
                sizes="128px"
                className="object-contain object-left scale-[1.5]"
                priority
              />
            )}
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-5 lg:gap-7">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative
                      px-1 py-2
                      text-[10px] lg:text-[11px]
                      font-medium
                      tracking-[0.15em]
                      uppercase
                      whitespace-nowrap
                      transition-colors duration-300
                      ${
                        active ? "text-white" : "text-gray-400 hover:text-white"
                      }
                    `}
                  >
                    {item.label}

                    {/* CSS-only underline animation (no framer-motion) */}
                    <span
                      className={`
                        absolute left-0 right-0 -bottom-0.5 h-0.5 bg-cyan-400 origin-center
                        transition-transform duration-250 ease-out
                        ${active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}
                      `}
                    />
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            <Link
              href="/search"
              aria-label="Search"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-300"
            >
              <Search className="w-4.5 h-4.5" />
            </Link>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-300"
            >
              <Heart className="w-4.5 h-4.5" />
            </Link>

            <div className="h-9 w-9 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white/5">
              <CartIcon />
            </div>

            <Link
              href="/account"
              aria-label="Account"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-300"
            >
              <User className="w-[18px] h-[18px]" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-full text-white hover:bg-white/5 transition-all duration-300"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =========================
          MOBILE DRAWER (lazy-loaded)
      ========================== */}
      {mobileOpen && (
        <MobileDrawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          items={items}
          storeName={storeName}
          logoUrl={logoUrl}
          isActive={isActive}
        />
      )}
    </>
  );
}
