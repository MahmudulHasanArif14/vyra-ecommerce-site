"use client";

import { useCart } from "@/hooks/use-cart";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import { gsap } from "gsap";

export default function CartClient({
  emptyState,
}: {
  emptyState: React.ReactNode;
}) {
  const { items, removeItem, updateQuantity, cartTotal, cartCount } = useCart();
  const listRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    if (items.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      "[data-cart-header]",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
    );

    if (listRef.current) {
      const rows = listRef.current.querySelectorAll("[data-cart-row]");
      tl.fromTo(
        rows,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08 },
        "-=0.3",
      );
    }

    tl.fromTo(
      summaryRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 },
      "-=0.4",
    );

    return () => {
      tl.kill();
    };
  }, [items.length]);

  if (items.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[130px]" />
        <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[130px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <div data-cart-header className="mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Shopping Cart
              </h1>
              <p className="text-sm text-gray-500">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* ============================================================ */}
          {/* CART ITEMS */}
          {/* ============================================================ */}
          <div ref={listRef} className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.variantId}
                data-cart-row
                className="group relative bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05]"
              >
                <div className="flex gap-4 md:gap-6">
                  {/* Image */}
                  <Link
                    href={`/products/${item.variantId}`}
                    className="relative w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden bg-white/5 shrink-0"
                  >
                    <Image
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400"
                      }
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 80px, 112px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm md:text-base truncate text-white">
                            {item.name}
                          </h3>

                          {(item.color || item.size) && (
                            <p className="text-xs text-gray-500 mt-1 flex gap-3 flex-wrap">
                              {item.color && (
                                <span className="inline-flex items-center gap-1">
                                  <span
                                    className="w-2 h-2 rounded-full bg-white/20"
                                    aria-hidden
                                  />
                                  {item.color}
                                </span>
                              )}
                              {item.size && (
                                <span className="inline-flex items-center">
                                  Size: {item.size}
                                </span>
                              )}
                            </p>
                          )}
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="shrink-0 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="font-semibold mt-2 text-base md:text-lg text-white tabular-nums">
                        ৳{item.price}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3 md:mt-0">
                      <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-white/[0.02]">
                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 text-sm font-medium tabular-nums min-w-[40px] text-center text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-sm font-medium text-white md:hidden tabular-nums">
                        ৳{item.price * item.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Line total — desktop */}
                  <div className="hidden md:flex items-center">
                    <p className="font-semibold text-base text-white tabular-nums">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <div className="pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition group"
              >
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition" />
                Continue shopping
              </Link>
            </div>
          </div>

          {/* ============================================================ */}
          {/* ORDER SUMMARY */}
          {/* ============================================================ */}
          <div ref={summaryRef} className="lg:col-span-1">
            <div className="lg:sticky lg:top-28 bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5 backdrop-blur-sm">
              <h2 className="text-lg font-bold tracking-tight text-white">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium tabular-nums text-white">
                    ৳{cartTotal}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-xs text-gray-500">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              {/* Free delivery nudge */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                <Truck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Add more items to unlock free delivery
                </p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-bold text-2xl tabular-nums text-white">
                    ৳{cartTotal}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Inclusive of all taxes
                </p>
              </div>

              <Link
                href="/checkout"
                className="group w-full bg-white text-black py-4 rounded-xl text-xs tracking-[0.2em] font-medium hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
              >
                PROCEED TO CHECKOUT
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </Link>

              {/* Trust badges */}
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <TrustRow icon={Shield} text="Secure checkout" />
                <TrustRow icon={RotateCcw} text="7-day easy returns" />
                <TrustRow icon={Truck} text="Fast delivery in Bangladesh" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustRow({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <Icon className="w-3.5 h-3.5" />
      <span>{text}</span>
    </div>
  );
}
