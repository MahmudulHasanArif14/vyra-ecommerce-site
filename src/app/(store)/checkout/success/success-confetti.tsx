"use client";

import { useEffect, useRef } from "react";

export default function SuccessConfetti() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!containerRef.current) return;

    const container = containerRef.current;
    const colors = ["#000000", "#8B5E3C", "#F59E0B", "#10B981", "#EF4444"];
    const particles: HTMLDivElement[] = [];

    // Create 40 particles
    for (let i = 0; i < 40; i++) {
      const particle = document.createElement("div");
      const size = Math.random() * 8 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        left: 50%;
        top: 30%;
        opacity: 0;
        pointer-events: none;
        will-change: transform, opacity;
      `;

      container.appendChild(particle);
      particles.push(particle);
    }

    // Animate each particle using Web Animations API
    particles.forEach((particle, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 250 + 100;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance - 100;

      particle.animate(
        [
          { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
          {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: 1,
            offset: 0.1,
          },
          {
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0.5) rotate(${Math.random() * 720 - 360}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 1500 + Math.random() * 1000,
          delay: i * 15,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        },
      );
    });

    // Cleanup after animation
    const timeout = setTimeout(() => {
      particles.forEach((p) => p.remove());
    }, 3500);

    return () => {
      clearTimeout(timeout);
      particles.forEach((p) => p.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-0 top-0 h-screen pointer-events-none overflow-hidden z-50"
      aria-hidden="true"
    />
  );
}
