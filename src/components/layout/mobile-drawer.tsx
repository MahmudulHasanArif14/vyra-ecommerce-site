"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, Heart, User } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
};

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  storeName: string;
  logoUrl?: string | null;
  isActive: (href: string) => boolean;
}

export default function MobileDrawer({
  open,
  onClose,
  items,
  storeName,
  logoUrl,
  isActive,
}: MobileDrawerProps) {
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-[86%] max-w-[390px] bg-[#0f0f0f] border-l border-white/10 shadow-2xl md:hidden flex flex-col"
          >
            {/* Drawer header */}
            <div className="h-[68px] px-5 flex items-center justify-between border-b border-white/10">
              <Link href="/" onClick={onClose} className="relative h-8 w-24">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={storeName}
                    fill
                    sizes="96px"
                    className="object-contain object-left"
                  />
                ) : (
                  <Image
                    src="/assets/logo.png"
                    alt={storeName}
                    fill
                    sizes="96px"
                    className="object-contain object-left "
                  />
                )}
              </Link>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="h-9 w-9 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 overflow-y-auto px-5 py-5">
              <div className="flex flex-col">
                {items.map((item, index) => {
                  const active = isActive(item.href);
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.035, duration: 0.25 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`
                          group flex items-center justify-between
                          py-4 border-b border-white/5
                          text-sm tracking-[0.12em] uppercase
                          transition-colors duration-300
                          ${
                            active
                              ? "text-white font-medium"
                              : "text-gray-400 hover:text-white"
                          }
                        `}
                      >
                        <span>{item.label}</span>
                        <span
                          className={`
                            h-1.5 w-1.5 rounded-full transition-all duration-300
                            ${
                              active
                                ? "bg-cyan-400 scale-100 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                                : "bg-transparent scale-0"
                            }
                          `}
                        />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </nav>

            {/* Drawer footer */}
            <div className="px-5 py-5 border-t border-white/10 space-y-1">
              <Link
                href="/search"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                <Search className="w-4 h-4" />
                Search
              </Link>

              <Link
                href="/wishlist"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                <Heart className="w-4 h-4" />
                Wishlist
              </Link>

              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                <User className="w-4 h-4" />
                My Account
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
