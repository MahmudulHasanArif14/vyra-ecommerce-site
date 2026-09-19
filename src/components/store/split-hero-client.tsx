"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";

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
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
  }, []);

  return (
    <section className="pt-0.1 grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
      {/* MEN */}
      <Link href={menUrl} className="relative group overflow-hidden block">
        <div className="absolute inset-0" data-hero-image>
          <Image
            src={menImage}
            alt="Men's collection"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-[center_25%] transition-transform duration-900 group-hover:scale-105 "
            priority
          />
        </div>
        <div
          className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors duration-500"
          data-hero-overlay
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-12 md:pb-20 text-white text-center px-4">
          <h2
            className="text-5xl md:text-7xl font-bold tracking-[0.15em] drop-shadow-lg"
            data-hero-text
          >
            {menLabel}
          </h2>
          <span
            className="mt-4 md:mt-6 text-xs md:text-sm tracking-[0.25em] relative inline-block"
            data-hero-text
          >
            {menCta}
            <span
              className="absolute left-0 right-0 -bottom-2 h-px bg-white origin-left"
              data-hero-cta
            />
          </span>
        </div>
      </Link>

      {/* WOMEN */}
      <Link href={womenUrl} className="relative group overflow-hidden block">
        <div className="absolute inset-0" data-hero-image>
          <Image
            src={womenImage}
            alt="Women's collection"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-[center_30%] transition-transform duration-900 group-hover:scale-105"
            priority
          />
        </div>
        <div
          className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors duration-500"
          data-hero-overlay
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-12 md:pb-20 text-white text-center px-4">
          <h2
            className="text-5xl md:text-7xl font-bold tracking-[0.15em] drop-shadow-lg"
            data-hero-text
          >
            {womenLabel}
          </h2>
          <span
            className="mt-4 md:mt-6 text-xs md:text-sm tracking-[0.25em] relative inline-block"
            data-hero-text
          >
            {womenCta}
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
