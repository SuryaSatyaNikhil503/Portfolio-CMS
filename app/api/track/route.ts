export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isBot } from "@/lib/analytics/bots";
import { parseUA } from "@/lib/analytics/device";
import { classifySource } from "@/lib/analytics/source";
import { trackPayload } from "@/lib/analytics/schema";
import { deleteExpired } from "@/lib/analytics/retention";

// Anonymous visit measurement. This route never reads, logs or stores an IP address.
// City and country come from the hosting platform's geo headers and only the place names are kept.

const hits = new Map<string, { n: number; t: number }>();
function limited(sid: string): boolean {
  const now = Date.now();
  const h = hits.get(sid);
  if (!h || now - h.t > 60_000) {
    hits.set(sid, { n: 1, t: now });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  return ++h.n > 60;
}

// Global cap on brand-new visits per minute. Inventing session ids defeats the per-session limit above, and
// capping the total (instead of per IP) protects the database without ever looking at an IP address.
const NEW_VISITS_PER_MINUTE = 600;
let burst = { n: 0, t: 0 };
function flooded(): boolean {
  const now = Date.now();
  if (now - burst.t > 60_000) burst = { n: 0, t: now };
  return ++burst.n > NEW_VISITS_PER_MINUTE;
}

const done = () => new NextResponse(null, { status: 204 });

export async function POST(request: NextRequest) {
  try {
    if (isBot(request.headers.get("user-agent"))) return done();
    const origin = request.headers.get("origin");
    if (origin) {
      try { if (new URL(origin).host !== request.headers.get("host")) return new NextResponse(null, { status: 403 }); } catch { return new NextResponse(null, { status: 403 }); }
    }

    const raw = await request.text();
    if (raw.length > 4096) return new NextResponse(null, { status: 413 });
    let json: unknown;
    try { json = JSON.parse(raw); } catch { return new NextResponse(null, { status: 400 }); }
    const parsed = trackPayload.safeParse(json);
    if (!parsed.success) return new NextResponse(null, { status: 400 });
    const p = parsed.data;
    if (limited(p.sid)) return new NextResponse(null, { status: 429 });

    if (p.type === "view") {
      if (p.seq === 0 && flooded()) return done();
      const ua = parseUA(request.headers.get("user-agent") ?? "");
      const selfHost = request.headers.get("host") ?? "";
      let referrer = "";
      try { const u = p.referrer ? new URL(p.referrer) : null; referrer = u ? `${u.origin}${u.pathname}`.slice(0, 300) : ""; } catch { referrer = ""; }
      const { source, host } = classifySource(p.referrer ?? "", p.utm, selfHost);
      let city = "";
      try { city = decodeURIComponent(request.headers.get("x-vercel-ip-city") ?? ""); } catch { city = ""; }
      const country = (request.headers.get("x-vercel-ip-country") ?? "").slice(0, 2);

      const blogSlug = p.path.startsWith("/blogs/") ? p.path.slice("/blogs/".length).split("/")[0] : "";
      const blog = blogSlug ? await prisma.blog.findFirst({ where: { slug: blogSlug, published: true }, select: { id: true } }) : null;

      await prisma.visitSession.upsert({
        where: { id: p.sid },
        create: { id: p.sid, source, referrerHost: host, referrer, device: ua.device, os: ua.os, browser: ua.browser, country, city },
        update: { lastSeenAt: new Date() },
      });
      await prisma.pageView.upsert({
        where: { sessionId_seq: { sessionId: p.sid, seq: p.seq } },
        create: { sessionId: p.sid, seq: p.seq, path: p.path, title: (p.title ?? "").slice(0, 200), blogId: blog?.id ?? null },
        update: {},
      });
      if (Math.random() < 0.01) deleteExpired(prisma).catch(() => {});
    } else if (p.type === "leave") {
      await prisma.pageView.updateMany({ where: { sessionId: p.sid, seq: p.seq }, data: { activeSeconds: p.activeSeconds, scrollDepth: p.scrollDepth } });
      await prisma.visitSession.updateMany({ where: { id: p.sid }, data: { lastSeenAt: new Date() } });
    } else {
      const exists = await prisma.visitSession.findUnique({ where: { id: p.sid }, select: { id: true } });
      if (exists) await prisma.visitEvent.create({ data: { sessionId: p.sid, name: p.name, path: p.path } });
    }
    return done();
  } catch (error) {
    console.error("Track error:", error instanceof Error ? error.message : "unknown");
    return done(); // measurement must never break a page
  }
}
