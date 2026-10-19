"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/headings";

export default function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => Boolean(e));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  if (items.length < 2) return null;
  return (
    <aside className="toc" aria-label="On this page">
      <b>On this page</b>
      {items.filter((i) => i.level === 2).map((i) => (
        <a key={i.id} href={`#${i.id}`} className={active === i.id ? "on" : undefined}>{i.text}</a>
      ))}
    </aside>
  );
}
