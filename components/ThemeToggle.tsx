"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Same-sized placeholder before mount to avoid layout shift
  if (!mounted) return <span className="tbtn" aria-hidden="true" />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="tbtn"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Icon name={isDark ? "sun" : "moon"} size={18} />
    </button>
  );
}
