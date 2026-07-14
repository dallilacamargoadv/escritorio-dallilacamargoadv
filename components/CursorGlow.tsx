"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    function handleMove(event: MouseEvent) {
      el!.style.setProperty("--cursor-x", `${event.clientX}px`);
      el!.style.setProperty("--cursor-y", `${event.clientY}px`);
      el!.style.opacity = "1";
    }

    function handleLeave() {
      el!.style.opacity = "0";
    }

    window.addEventListener("mousemove", handleMove);
    document.documentElement.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
