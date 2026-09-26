"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Ticket,
  Star,
  Warehouse,
  Menu,
  X,
  LogOut,
  Store,
} from "lucide-react";
import { logout } from "@/actions/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ============================================================ */}
      {/* MOBILE TOP BAR */}
      {/* ============================================================ */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/10 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/30 flex items-center justify-center">
            <span className="text-sm font-bold text-cyan-300">V</span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-widest leading-none">
              VYRA
            </p>
            <p className="text-[8px] tracking-[0.3em] text-gray-500 leading-none mt-0.5">
              ADMIN
            </p>
          </div>
        </Link>

        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -mr-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR */}
      {/* ============================================================ */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[#0f0f0f] border-r border-white/10 sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/admin" className="block group">
            <h1 className="text-2xl font-serif font-bold tracking-widest text-white group-hover:text-cyan-300 transition">
              VYRA
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-gray-500 mt-0.5">
              ADMIN PANEL
            </p>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group ${
                  active
                    ? "bg-cyan-500/10 text-cyan-300"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {/* Active left border */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-cyan-400" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                    active ? "" : "group-hover:scale-110"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: view store + sign out */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <Store className="w-4 h-4 shrink-0" />
            View Store
          </Link>

          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE OVERLAY */}
      {/* ============================================================ */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* ============================================================ */}
      {/* MOBILE DRAWER */}
      {/* ============================================================ */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#0f0f0f] border-r border-white/10 z-50 flex flex-col transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h1 className="text-xl font-serif font-bold tracking-widest text-white">
              VYRA
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-gray-500">
              ADMIN PANEL
            </p>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  active
                    ? "bg-cyan-500/10 text-cyan-300"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-cyan-400" />
                )}

                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <Store className="w-4 h-4 shrink-0" />
            View Store
          </Link>

          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
