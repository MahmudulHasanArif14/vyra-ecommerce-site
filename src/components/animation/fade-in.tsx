"use client";

import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  className?: string;
  once?: boolean;
};

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.8,
  y = 40,
  x = 0,
  className = "",
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    gsap.set(el, { opacity: 0, y, x });

    const anim = gsap.to(el, {
      opacity: 1,
      y: 0,
      x: 0,
      duration,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: once ? "play none none none" : "play none none reverse",
      },
    });

    return () => {
      anim.kill();
    };
  }, [delay, duration, y, x, once]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </div>
  );
}
