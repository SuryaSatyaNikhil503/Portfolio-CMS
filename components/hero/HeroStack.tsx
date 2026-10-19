"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

// The canvas never ships in the server HTML and never delays first paint: it is fetched after the page is idle.
const StackScene = dynamic(() => import("./StackScene"), { ssr: false, loading: () => null });

export default function HeroStack({ labels = true, className, forceDark = false }: { labels?: boolean; className?: string; forceDark?: boolean }) {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const id = idle ? idle(() => setReady(true), { timeout: 1200 }) : window.setTimeout(() => setReady(true), 300);
    return () => {
      if (!idle) window.clearTimeout(id);
    };
  }, []);

  return (
    <div className={className ?? "hero3d-slot"} aria-hidden="true">
      {ready && (forceDark || resolvedTheme) ? <StackScene dark={forceDark || resolvedTheme === "dark"} labels={labels} /> : null}
    </div>
  );
}
