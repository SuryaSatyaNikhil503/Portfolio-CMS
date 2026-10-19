# Deploying the revamp

Everything below is additive. The new code can run on the current database, and the old code ignores the new tables,
so a rollback never needs a database change.

## Before you start
1. **Back up the database.** In the Neon console: your project -> Branches -> create a branch from `main` (instant, free). Keep it for a week.
2. Make sure `git status` shows only the revamp (branch `revamp/option-d`) and open a PR / merge when you are happy.

## 1. Check the database change (read-only)
```bash
DB_TARGET=production npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```
Expected: only `ALTER TABLE "about" ADD COLUMN "openToWork"` and `CREATE TABLE/INDEX/FOREIGN KEY` for `visit_sessions`, `page_views`, `visit_events`. Anything that says `DROP` means stop and ask.

## 2. Apply it
```bash
DB_TARGET=production npx prisma db push
```
(`DB_TARGET=production` is required on purpose: without it Prisma and the seed scripts use the local database.)

## 3. Fix the "1 min read" on your existing posts
```bash
DB_TARGET=production npx tsx scripts/backfill-reading-time.ts
```
It prints the target host first, then only updates the `readingTime` text of each post.

## 4. Optional: automatic clean-up of old visits
Cleanup already runs opportunistically (about 1 in 100 visits). For a daily job, add in Vercel: env `CRON_SECRET` (any long random string) and this `vercel.json`:
```json
{ "crons": [{ "path": "/api/cron/retention", "schedule": "0 3 * * *" }] }
```

## 5. Deploy
Push the branch; Vercel builds with `prisma generate && next build`. No new environment variables are required.

## 6. After it is live
- Run the SEO guard against the live site and check that nothing changed except the new content:
  `node scripts/seo-snapshot.mjs snap https://suryasatyanikhil.vercel.app docs/seo/live.json && node scripts/seo-snapshot.mjs diff docs/seo/baseline-production-2026-10-19.json docs/seo/live.json`
  (The old baseline is from before the revamp. The sitemap lists only the URLs it had; extra pages are informational.)
- Sign in, switch the dark mode on in the sidebar, open Blogs and click a view count.
- Open the home page in a private window: the measurement notice appears once. Click "Turn off", reload, and confirm no new visit appears in Visitors.

## Rollback
Redeploy the previous deployment in Vercel. The new tables stay unused. If needed, restore from the Neon branch you created.

## Things this revamp deliberately did not change (SEO)
`app/layout.tsx` metadata and JSON-LD, every `metadata`/`generateMetadata`, `sitemap.ts`, `robots.ts`, `next.config.mjs`, URLs and slugs.
Known pre-existing items, left alone: the sitemap is generated at build time and only lists posts that existed at the last deploy;
Skills, Experience, Projects and Blogs pages have no `<h1>`.

## Local development
```bash
scripts/dev-db.sh start          # local Postgres on :5433 (data in ~/.portfolio-dev-db)
npm run dev                      # uses .env.development.local (git-ignored), never the production database
npx tsx scripts/dev-seed-analytics.ts   # sample visits, refuses any non-local database
npm test && npm run lint && npx tsc --noEmit
```
Prisma commands and `scripts/seed-admin.ts` target the local database unless you pass `DB_TARGET=production`.
