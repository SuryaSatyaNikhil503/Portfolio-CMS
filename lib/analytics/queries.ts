import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { fillDays, delta } from "./series";

export type Days = 7 | 30 | 90;
export const parseDays = (v: string | string[] | undefined): Days => (v === "7" ? 7 : v === "90" ? 90 : 30);
const ago = (days: number) => new Date(Date.now() - days * 86_400_000);

export async function getOverview(days: Days) {
  const from = ago(days);
  const prevFrom = ago(days * 2);
  const [visits, visitsPrev, pv, pvPrev, secs, secsPrev, resume, resumePrev, perDay, sources, devices, cities, topPages, subscribers] = await Promise.all([
    prisma.visitSession.count({ where: { startedAt: { gte: from } } }),
    prisma.visitSession.count({ where: { startedAt: { gte: prevFrom, lt: from } } }),
    prisma.pageView.count({ where: { enteredAt: { gte: from } } }),
    prisma.pageView.count({ where: { enteredAt: { gte: prevFrom, lt: from } } }),
    prisma.pageView.aggregate({ _sum: { activeSeconds: true }, where: { enteredAt: { gte: from } } }),
    prisma.pageView.aggregate({ _sum: { activeSeconds: true }, where: { enteredAt: { gte: prevFrom, lt: from } } }),
    prisma.visitEvent.count({ where: { name: "resume_download", createdAt: { gte: from } } }),
    prisma.visitEvent.count({ where: { name: "resume_download", createdAt: { gte: prevFrom, lt: from } } }),
    prisma.$queryRaw<{ d: string; n: number }[]>(Prisma.sql`select to_char(date_trunc('day', "startedAt"), 'YYYY-MM-DD') as d, count(*)::int as n from visit_sessions where "startedAt" >= ${from} group by 1`),
    prisma.$queryRaw<{ source: string; visits: number; secs: number; pages: number }[]>(Prisma.sql`select s.source, count(distinct s.id)::int as visits, coalesce(sum(p."activeSeconds"), 0)::int as secs, count(p.id)::int as pages from visit_sessions s left join page_views p on p."sessionId" = s.id where s."startedAt" >= ${from} group by s.source order by visits desc`),
    prisma.visitSession.groupBy({ by: ["device"], _count: { _all: true }, where: { startedAt: { gte: from } } }),
    prisma.$queryRaw<{ city: string; country: string; n: number }[]>(Prisma.sql`select city, country, count(*)::int as n from visit_sessions where "startedAt" >= ${from} and city <> '' group by city, country order by n desc limit 6`),
    prisma.$queryRaw<{ path: string; views: number; secs: number }[]>(Prisma.sql`select path, count(*)::int as views, coalesce(round(avg("activeSeconds")), 0)::int as secs from page_views where "enteredAt" >= ${from} group by path order by views desc limit 8`),
    prisma.subscriber.count(),
  ]);
  const totalSecs = secs._sum.activeSeconds ?? 0;
  const prevSecs = secsPrev._sum.activeSeconds ?? 0;
  const avg = visits ? totalSecs / visits : 0;
  const avgPrev = visitsPrev ? prevSecs / visitsPrev : 0;
  return {
    days, visits, pageViews: pv, avgSeconds: avg, pagesPerVisit: visits ? pv / visits : 0, resume, subscribers,
    deltas: { visits: delta(visits, visitsPrev), pageViews: delta(pv, pvPrev), avgSeconds: delta(avg, avgPrev), resume: delta(resume, resumePrev) },
    perDay: fillDays(perDay, days),
    sources: sources.map((s) => ({ source: s.source, visits: s.visits, avgSeconds: s.visits ? s.secs / s.visits : 0, pagesPerVisit: s.visits ? s.pages / s.visits : 0 })),
    devices: devices.map((d) => ({ device: d.device, n: d._count._all })),
    cities, topPages,
  };
}

const sessionInclude = {
  views: { orderBy: { seq: "asc" as const }, select: { path: true, title: true, activeSeconds: true, scrollDepth: true, seq: true, enteredAt: true } },
  events: { orderBy: { createdAt: "asc" as const }, select: { name: true, createdAt: true } },
  subscriber: { select: { name: true, email: true, profession: true, location: true } },
};

export async function getSessions(days: Days, take = 25) {
  const rows = await prisma.visitSession.findMany({ where: { startedAt: { gte: ago(days) } }, orderBy: { startedAt: "desc" }, take, include: sessionInclude });
  return rows.map((s) => ({
    id: s.id, startedAt: s.startedAt, source: s.source, device: s.device, os: s.os, browser: s.browser, country: s.country, city: s.city,
    entry: s.views[0]?.path ?? "/", pages: s.views.length, seconds: s.views.reduce((a, v) => a + v.activeSeconds, 0),
    resume: s.events.some((e) => e.name === "resume_download"), identified: Boolean(s.subscriber),
  }));
}

export async function getSession(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return prisma.visitSession.findUnique({ where: { id }, include: sessionInclude });
}

/** Views per post: legacy counts (before detailed tracking) plus new detailed page views. */
export async function getBlogViewTotals(): Promise<Map<string, number>> {
  const [legacy, fresh] = await Promise.all([
    prisma.blogView.groupBy({ by: ["blogId"], _count: { _all: true } }),
    prisma.pageView.groupBy({ by: ["blogId"], _count: { _all: true }, where: { blogId: { not: null } } }),
  ]);
  const m = new Map<string, number>();
  for (const r of legacy) m.set(r.blogId, (m.get(r.blogId) ?? 0) + r._count._all);
  for (const r of fresh) if (r.blogId) m.set(r.blogId, (m.get(r.blogId) ?? 0) + r._count._all);
  return m;
}

export async function getBlogViews(slug: string, days: Days) {
  const blog = await prisma.blog.findUnique({ where: { slug }, select: { id: true, title: true, slug: true, createdAt: true } });
  if (!blog) return null;
  const from = ago(days);
  const [legacy, total, visits, agg, perDay, sources, legacySources, rows, firstDetail] = await Promise.all([
    prisma.blogView.count({ where: { blogId: blog.id } }),
    prisma.pageView.count({ where: { blogId: blog.id } }),
    prisma.$queryRaw<{ n: number }[]>(Prisma.sql`select count(distinct "sessionId")::int as n from page_views where "blogId" = ${blog.id}`),
    prisma.pageView.aggregate({ _avg: { activeSeconds: true, scrollDepth: true }, where: { blogId: blog.id } }),
    prisma.$queryRaw<{ d: string; n: number }[]>(Prisma.sql`select to_char(date_trunc('day', "enteredAt"), 'YYYY-MM-DD') as d, count(*)::int as n from page_views where "blogId" = ${blog.id} and "enteredAt" >= ${from} group by 1`),
    prisma.$queryRaw<{ source: string; n: number }[]>(Prisma.sql`select s.source, count(*)::int as n from page_views p join visit_sessions s on s.id = p."sessionId" where p."blogId" = ${blog.id} group by s.source order by n desc`),
    prisma.blogView.groupBy({ by: ["source"], _count: { _all: true }, where: { blogId: blog.id } }),
    prisma.pageView.findMany({ where: { blogId: blog.id }, orderBy: { enteredAt: "desc" }, take: 100, include: { session: { select: { id: true, source: true, referrerHost: true, referrer: true, device: true, os: true, browser: true, country: true, city: true } } } }),
    prisma.pageView.findFirst({ orderBy: { enteredAt: "asc" }, select: { enteredAt: true } }),
  ]);
  const merged = new Map<string, number>();
  for (const s of sources) merged.set(s.source, (merged.get(s.source) ?? 0) + s.n);
  for (const s of legacySources) merged.set(s.source, (merged.get(s.source) ?? 0) + s._count._all);
  return {
    blog, days, views: legacy + total, legacy, detailed: total, visits: visits[0]?.n ?? 0,
    avgSeconds: agg._avg.activeSeconds ?? 0, avgDepth: agg._avg.scrollDepth ?? 0, perDay: fillDays(perDay, days),
    sources: Array.from(merged.entries()).map(([source, n]) => ({ source, n })).sort((a, b) => b.n - a.n),
    rows, detailsSince: firstDetail?.enteredAt ?? null,
  };
}
