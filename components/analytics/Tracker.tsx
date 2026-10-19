"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const KEY = "measure";

/** Anonymous measurement is skipped for privacy signals, opt-out, automation and the admin area. */
export function measurementAllowed(): boolean {
  try {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.globalPrivacyControl || nav.doNotTrack === "1" || nav.webdriver) return false;
    if (localStorage.getItem(KEY) === "off") return false;
  } catch {
    /* storage blocked: still measure anonymously */
  }
  return true;
}

function sessionId(): string {
  try {
    let s = sessionStorage.getItem("sid");
    if (!s) { s = crypto.randomUUID(); sessionStorage.setItem("sid", s); }
    return s;
  } catch {
    return crypto.randomUUID();
  }
}

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) return;
  } catch { /* fall through */ }
  fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
}

export default function Tracker() {
  const pathname = usePathname();
  const seq = useRef(-1);
  const cur = useRef<{ seq: number; path: string; active: number; since: number | null; depth: number } | null>(null);

  const flush = () => {
    const c = cur.current;
    if (!c) return;
    const active = c.active + (c.since ? Date.now() - c.since : 0);
    send({ type: "leave", sid: sessionId(), path: c.path, seq: c.seq, activeSeconds: Math.min(7200, Math.round(active / 1000)), scrollDepth: c.depth });
  };

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api") || !measurementAllowed()) return;
    // Only a new path starts a new page view (React may run this effect twice in development).
    if (cur.current?.path !== pathname) {
      flush();
      seq.current += 1;
      const first = seq.current === 0;
      const utm = new URLSearchParams(window.location.search).get("utm_source") ?? undefined;
      cur.current = { seq: seq.current, path: pathname, active: 0, since: document.hidden ? null : Date.now(), depth: 0 };
      send({ type: "view", sid: sessionId(), path: pathname, seq: seq.current, title: document.title.slice(0, 200), ...(first ? { referrer: document.referrer || undefined, utm } : {}) });
    }

    const onScroll = () => {
      const c = cur.current;
      if (!c) return;
      const h = document.documentElement.scrollHeight;
      c.depth = Math.max(c.depth, Math.min(100, Math.round(((window.scrollY + window.innerHeight) / Math.max(h, 1)) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onVisibility = () => {
      const c = cur.current;
      if (!c) return;
      if (document.hidden) { if (c.since) { c.active += Date.now() - c.since; c.since = null; } flush(); }
      else c.since = Date.now();
    };
    const onHide = () => flush();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest("[data-resume]");
      if (a && measurementAllowed() && !location.pathname.startsWith("/admin")) send({ type: "event", sid: sessionId(), path: location.pathname, name: "resume_download" });
    };
    const onEvent = (e: Event) => {
      if (!measurementAllowed()) return;
      const name = (e as CustomEvent<string>).detail;
      if (name === "newsletter_subscribe" || name === "comment") send({ type: "event", sid: sessionId(), path: location.pathname, name });
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);
    document.addEventListener("click", onClick);
    window.addEventListener("track:event", onEvent);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("click", onClick);
      window.removeEventListener("track:event", onEvent);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
