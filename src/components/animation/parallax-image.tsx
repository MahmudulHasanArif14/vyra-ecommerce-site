"use client";

import { useEffect, useRef } from "react";
import Image, { ImageProps } from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ParallaxImage({
  intensity = 15,
  wrapperClassName = "",
  ...props
}: ImageProps & { intensity?: number; wrapperClassName?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !imageRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const img = imageRef.current;
    gsap.set(img, { scale: 1 + intensity / 100 });

    const anim = gsap.fromTo(
      img,
      { y: -(intensity * 5) },
      {
        y: intensity * 5,
        ease: "none",
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );

    return () => {
      anim.kill();
    };
  }, [intensity]);

  return (
    <div
      ref={wrapperRef}
      className={`overflow-hidden relative ${wrapperClassName}`}
    >
      <div ref={imageRef} className="absolute inset-0">
        <Image {...props} />
      </div>
    </div>
  );
}
