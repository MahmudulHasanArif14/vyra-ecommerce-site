"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SplitHeroClient({
  menImage,
  womenImage,
  menLabel,
  menCta,
  menUrl,
  womenLabel,
  womenCta,
  womenUrl,
}: {
  menImage: string;
  womenImage: string;
  menLabel: string;
  menCta: string;
  menUrl: string;
  womenLabel: string;
  womenCta: string;
  womenUrl: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!sectionRef.current) return;

    let ctx: any;

    (async () => {
      const { gsap } = await import("gsap");

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          "[data-hero-image]",
          { scale: 1.15, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.4, stagger: 0.15 },
        )
          .fromTo(
            "[data-hero-overlay]",
            { opacity: 0 },
            { opacity: 1, duration: 0.8 },
            "-=1",
          )
          .fromTo(
            "[data-hero-text]",
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: 0.12 },
            "-=0.7",
          )
          .fromTo(
            "[data-hero-cta]",
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 0.7, stagger: 0.12 },
            "-=0.5",
          );
      }, sectionRef);
    })();

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-6rem)] md:h-[calc(100vh-3rem)] min-h-125 md:min-h-150"
    >
      {/* ============================================================ */}
      {/* MEN PANEL */}
      {/* ============================================================ */}
      <Link
        href={menUrl}
        className="relative group overflow-hidden block bg-[#0a0a0a]"
      >
        {/* Image */}
        <div className="absolute inset-0" data-hero-image>
          <Image
            src={menImage}
            alt="Men's collection"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-[90%_center] transition-transform duration-900 ease-out group-hover:scale-105"
            priority
            fetchPriority="high"
          />
        </div>

        {/* Overlay */}
        <div
          className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/85 group-hover:via-black/45 transition-all duration-500"
          data-hero-overlay
        />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-12 md:pb-20 text-white text-center px-4 z-10">
          <h2
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-[0.15em] drop-shadow-2xl"
            style={{ fontFamily: "Georgia, serif" }}
            data-hero-text
          >
            {menLabel}
          </h2>

          <span
            className="mt-4 md:mt-6 text-[10px] md:text-xs tracking-[0.25em] uppercase inline-flex items-center gap-2 relative"
            data-hero-text
          >
            {menCta}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
            <span
              className="absolute left-0 right-0 -bottom-2 h-px bg-white origin-left"
              data-hero-cta
            />
          </span>
        </div>
      </Link>

      {/* ============================================================ */}
      {/* WOMEN PANEL */}
      {/* ============================================================ */}
      <Link
        href={womenUrl}
        className="relative group overflow-hidden block bg-[#0a0a0a]"
      >
        {/* Image */}
        <div className="absolute inset-0" data-hero-image>
          <Image
            src={womenImage}
            alt="Women's collection"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-[center_30%] transition-transform duration-900 ease-out group-hover:scale-105"
            priority
          />
        </div>

        {/* Overlay */}
        <div
          className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/85 group-hover:via-black/45 transition-all duration-500"
          data-hero-overlay
        />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-12 md:pb-20 text-white text-center px-4 z-10">
          <h2
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-[0.15em] drop-shadow-2xl"
            style={{ fontFamily: "Georgia, serif" }}
            data-hero-text
          >
            {womenLabel}
          </h2>

          <span
            className="mt-4 md:mt-6 text-[10px] md:text-xs tracking-[0.25em] uppercase inline-flex items-center gap-2 relative"
            data-hero-text
          >
            {womenCta}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
            <span
              className="absolute left-0 right-0 -bottom-2 h-px bg-white origin-left"
              data-hero-cta
            />
          </span>
        </div>
      </Link>
    </section>
  );
}
