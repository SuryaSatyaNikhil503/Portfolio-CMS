"use client";

import { useEffect } from "react";

/** Cards with the `tilt` class lean toward the cursor. Pointer devices only; off for reduced motion. */
export default function Tilt() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(hover: hover)").matches) return;
    let active: HTMLElement | null = null;
    const reset = () => { if (active) { active.style.transform = ""; active = null; } };
    const move = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest<HTMLElement>(".tilt") ?? null;
      if (active && active !== t) reset();
      if (!t) return;
      const r = t.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      t.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-3px)`;
      active = t;
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", reset); reset(); };
  }, []);
  return null;
}
