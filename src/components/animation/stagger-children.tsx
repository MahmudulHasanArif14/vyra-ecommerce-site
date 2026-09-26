"use client";

import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function StaggerChildren({
  children,
  className = "",
  stagger = 0.08,
  y = 40,
  selector = ":scope > *",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  selector?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = ref.current;
    const items = container.querySelectorAll(selector);
    if (items.length === 0) return;

    gsap.set(items, { opacity: 0, y });

    const anim = gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger,
      ease: "power3.out",
      scrollTrigger: {
        trigger: container,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      anim.kill();
    };
  }, [stagger, y, selector]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
