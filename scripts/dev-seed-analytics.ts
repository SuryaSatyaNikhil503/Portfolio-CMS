// DEV ONLY: fills the LOCAL database with sample visits so the admin analytics screens have something to show.
// Refuses to run against any database that is not on localhost.  Run: npx tsx scripts/dev-seed-analytics.ts
import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.development.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { randomUUID } from "node:crypto";

const url = process.env.POSTGRES_PRISMA_URL ?? "";
const host = (() => { try { return new URL(url).hostname; } catch { return ""; } })();
if (host !== "127.0.0.1" && host !== "localhost") { console.error(`Refusing to seed sample data into "${host || "unknown"}": this script only runs on a local database.`); process.exit(1); }

const pool = new Pool({ connectionString: url });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

let seed = 42;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const pick = <T,>(arr: T[], weights?: number[]): T => {
  if (!weights) return arr[Math.floor(rnd() * arr.length)]!;
  let r = rnd() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < arr.length; i++) { r -= weights[i]!; if (r <= 0) return arr[i]!; }
  return arr[arr.length - 1]!;
};

const SOURCES = [["LinkedIn", "linkedin.com", "https://www.linkedin.com/feed/"], ["Google", "google.com", "https://www.google.com/"], ["Direct", "", ""], ["GitHub", "github.com", "https://github.com/SuryaSatyaNikhil503/Email-Scheduler"], ["Twitter/X", "t.co", "https://t.co/"], ["Reddit", "reddit.com", "https://www.reddit.com/r/java"]] as const;
const DEVICES = [["mobile", "iOS", "Safari"], ["desktop", "Windows", "Chrome"], ["desktop", "macOS", "Chrome"], ["mobile", "Android", "Chrome"], ["desktop", "Linux", "Firefox"], ["tablet", "iOS", "Safari"]] as const;
const CITIES = [["Hyderabad", "IN"], ["Bengaluru", "IN"], ["Mumbai", "IN"], ["Pune", "IN"], ["Singapore", "SG"], ["London", "GB"], ["Austin", "US"]] as const;

async function main() {
  const blogs = await prisma.blog.findMany({ where: { published: true }, select: { id: true, slug: true, title: true } });
  const sub = await prisma.subscriber.upsert({ where: { email: "sample.subscriber@example.com" }, update: {}, create: { name: "Sample Subscriber", email: "sample.subscriber@example.com", profession: "Talent partner", location: "Mumbai, IN" } });
  await prisma.visitSession.deleteMany({});
  let n = 0;
  for (let day = 29; day >= 0; day--) {
    const count = Math.round(3 + (29 - day) * 0.25 + rnd() * 5);
    for (let k = 0; k < count; k++) {
      const [source, host, ref] = pick([...SOURCES], [36, 30, 20, 12, 6, 4]);
      const [device, os, browser] = pick([...DEVICES], [30, 22, 18, 14, 4, 2]);
      const [city, country] = pick([...CITIES], [28, 19, 11, 9, 6, 4, 3]);
      const start = new Date(Date.now() - day * 86_400_000 - Math.floor(rnd() * 80_000_000));
      const id = randomUUID();
      const recruiter = source === "LinkedIn" && rnd() < 0.45;
      const reader = !recruiter && rnd() < 0.7;
      const paths: { path: string; title: string; blogId: string | null; secs: number; depth: number }[] = [];
      if (recruiter) {
        for (const [p, t, s] of [["/", "Home", 18], ["/about", "About", 40], ["/experience", "Experience", 41], ["/projects", "Projects", 27]] as const) paths.push({ path: p, title: t, blogId: null, secs: Math.round(s * (0.6 + rnd())), depth: 60 + Math.floor(rnd() * 40) });
      } else if (reader && blogs.length) {
        const b = pick(blogs);
        paths.push({ path: `/blogs/${b.slug}`, title: b.title, blogId: b.id, secs: Math.round((source === "LinkedIn" ? 190 : source === "Google" ? 165 : 80) * (0.4 + rnd() * 1.2)), depth: 20 + Math.floor(rnd() * 80) });
        if (rnd() < 0.4) paths.push({ path: "/blogs", title: "Blogs", blogId: null, secs: 15 + Math.floor(rnd() * 25), depth: 100 });
      } else {
        paths.push({ path: "/", title: "Home", blogId: null, secs: 6 + Math.floor(rnd() * 20), depth: 30 + Math.floor(rnd() * 60) });
      }
      const linked = recruiter && rnd() < 0.08 ? sub.id : null;
      await prisma.visitSession.create({
        data: {
          id, startedAt: start, lastSeenAt: start, source, referrerHost: host, referrer: ref, device, os, browser, country, city, subscriberId: linked,
          views: { create: paths.map((p, i) => ({ seq: i, path: p.path, title: p.title, blogId: p.blogId, activeSeconds: p.secs, scrollDepth: p.depth, enteredAt: new Date(start.getTime() + i * 25_000) })) },
          events: recruiter && rnd() < 0.5 ? { create: [{ name: "resume_download", path: "/projects", createdAt: new Date(start.getTime() + paths.length * 25_000) }] } : undefined,
        },
      });
      n++;
    }
  }
  console.log(`Seeded ${n} sample visits over 30 days on ${host}.`);
}
main().finally(() => prisma.$disconnect().then(() => pool.end()));
