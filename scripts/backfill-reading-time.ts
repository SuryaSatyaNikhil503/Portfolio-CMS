// Recomputes `readingTime` for every post from its real content (it was stuck at the "1 min read" default).
// Local database by default. Production is an explicit opt-in:  DB_TARGET=production npx tsx scripts/backfill-reading-time.ts
import path from "node:path";
import dotenv from "dotenv";

if (process.env.DB_TARGET !== "production") dotenv.config({ path: path.resolve(process.cwd(), ".env.development.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { readingTimeFromDoc } from "../lib/readingTime";

const pool = new Pool({ connectionString: process.env.POSTGRES_PRISMA_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const host = new URL(process.env.POSTGRES_PRISMA_URL ?? "postgres://unknown").hostname;
  console.log(`Target database host: ${host}`);
  const blogs = await prisma.blog.findMany({ select: { id: true, slug: true, content: true, readingTime: true } });
  for (const b of blogs) {
    const next = readingTimeFromDoc(b.content);
    if (next.label !== b.readingTime) {
      await prisma.blog.update({ where: { id: b.id }, data: { readingTime: next.label } });
      console.log(`${b.slug}: ${b.readingTime} -> ${next.label} (${next.words} words)`);
    }
  }
  console.log("done");
}

main().finally(() => prisma.$disconnect().then(() => pool.end()));
