# Portfolio revamp: design

Status: approved by the owner (screens and decisions, 2026-10-19). Reference: `docs/design/prototype/` (live copy: https://claude.ai/artifact/VC4kRcVsjZdLde4LqLqrsr).

## Intent

Recruiters should land on the site, understand in five seconds who the owner is, what they build and how to get the résumé, and remember it. The owner also wants to learn which posts and sources work, privately, in the admin. The site keeps its CMS, content, URLs and SEO exactly as they are.

## Decisions (owner's words, in order)

1. Visual direction is **Option D** ("Layer Stack"): cobalt, coral and ink on cool white, chunky outlines, hard shadows on interactive things. Light and dark themes (keep the existing toggle). Fonts: Bricolage Grotesque (headings), Figtree (body), JetBrains Mono (code and data).
2. The Home hero has a live 3D stack of **six layers, top to bottom: React, API gateway, Spring Boot, AI Integrations, Agents, Database**. Slabs slide apart on hover; labels follow. Phones get a smaller scene without labels; reduced-motion users get a still frame.
3. **Build the screens exactly as the prototype.** Public site, admin, analytics, editor, in light/dark and phone layouts.
4. **"Open to new roles" pill is kept and highlighted** (green, pulsing). An admin switch turns it on and off. The About page's Availability card follows the same switch.
5. **Admin gets the same palette family, calmer, with a dark mode.**
6. **Skills admin is redesigned**: add-skill row on top, then one row per category with skills as chips.
7. **Do not collect IP addresses.** Not stored, not hashed, not masked.
8. **Blog analytics**: view counts are admin-only (removed from the public site). Clicking a count opens every visit: source, referrer, time on page, read depth, device, city.
9. **Visitor analytics**: sources by visits and by time spent, devices, locations, every visit as a journey (pages in order, time on each, events such as résumé download).
10. **Blog editor rebuilt**: correct reading time, slash menu, Markdown paste, autosave, split preview, SEO checks, visible bullets and numbered lists, real code blocks (language, file name, colours, line highlight, copy button). The editor and the public site share one article stylesheet.
11. **SEO must not change.** See "SEO guard".

## Anti-goals

- Anything that makes the page slower to first paint, hides text from crawlers, or changes titles, descriptions, canonicals, Open Graph, JSON-LD, URLs, robots, sitemap, headings or alt text.
- Collecting identifiers: no IP, no cookies, no fingerprinting, no third-party analytics.
- Touching the production database during development.

## SEO guard (hard constraint)

`scripts/seo-snapshot.mjs` crawls the public pages and records everything search engines read. Baseline of production: `docs/seo/baseline-production-2026-10-19.json`. After the revamp the same script runs against the local build and `diff` must pass:

- Strictly identical: HTTP status, title, description, canonical, robots meta, `<html lang>`, Open Graph, Twitter tags, every JSON-LD block, `robots.txt`, `sitemap.xml`, the text of every `<h1>`, and image alt coverage.
- Additive only: headings (every baseline heading must still exist, with the same level and text, in the same order) and internal links.
- Files not to edit: `app/layout.tsx` (metadata and JSON-LD), every `export const metadata` / `generateMetadata`, `app/sitemap.ts`, `app/robots.ts`, `public/google*.html`, `next.config.mjs`, slugs and routes.
- Where the prototype's headline differs from the existing heading, the existing heading text stays as the heading (styled as the eyebrow) and the prototype's line is rendered as non-heading text. Home: `<h1>` stays "Software Developer".
- Rendering: all page text stays server-rendered. The 3D canvas is a client-only dynamic import that starts after the page is interactive; it never contains text.

Pre-existing issues found (not changed, reported to the owner): `sitemap.xml` is statically generated at deploy time and currently lists 4 of 10 posts; four pages have no `<h1>`.

## Privacy and data (DPDP Act 2023 lens; legal calls are for counsel)

- No IP address is read into storage. City and country come from the platform's geo headers (`x-vercel-ip-country`, `x-vercel-ip-city`) at request time; the headers are discarded. (The hosting platform's own request logs are outside the app's control.)
- No cookies, no persistent identifiers. A visit is stitched together with a random id in `sessionStorage` (cleared when the tab closes).
- Respect opt-out: Global Privacy Control, Do Not Track, and a one-click "Turn off" in the measurement notice (stored in `localStorage`; nothing is sent after it).
- Bots are excluded (user agent and `navigator.webdriver`).
- Optional linking: the subscribe form has an unticked checkbox "Also let me see which pages I read before subscribing". Only if ticked is the visit linked to the subscriber (so the admin can show their journey).
- Retention: visit data is deleted after 90 days (scheduled cleanup plus cleanup on write).
- Notice: a short `/privacy` page (what is measured, what is not, how to turn it off, contact). Data map in `privacy/data-map.yaml`.
- Existing legacy `blog_views` rows (263) stay and are counted into totals; the new detailed list starts on launch day and says so.

## Architecture

- Next.js 14 App Router, React 18, Tailwind 3, Prisma 7 on Postgres (Neon in production).
- Design tokens as CSS variables (public light/dark, admin light/dark) mapped into Tailwind. Admin dark mode reuses `next-themes`.
- 3D: `three` in a client component (`components/hero/StackScene.tsx`), loaded with `next/dynamic({ ssr: false })` after idle; matches the prototype's materials and lighting.
- New Prisma models (additive only): `VisitSession`, `PageView`, `VisitEvent`; `About.openToWork`; `Subscriber.sessionId` (nullable link). No existing column is changed or dropped.
- Tracking: a tiny client tracker (page view on route change, `sendBeacon` on page hide with active seconds and scroll depth) posting to `POST /api/track`. Validated server-side with zod, bot-filtered, size-limited, rate-limited per session id. Admin read APIs require the existing admin JWT.
- Editor: TipTap (same saved JSON, so the 10 existing posts open unchanged) plus code-block-lowlight, placeholder, a slash-command menu, bubble menu, Markdown paste, autosave to the existing blog API, and a shared `<Article>` renderer used by the site, the editor canvas and the split preview.
- Reading time computed from the document text on save (and shown live in the editor).

## Left to the builder

Component file layout, exact Tailwind mapping, icon set (inline SVG matching the prototype), loading and error states, and test details. Anything the prototype shows is binding; anything it does not show follows the same tokens.

## Database safety

Development uses a local scratch Postgres on port 5433 with a read-only copy of public content (about, blogs, projects, experiences, skills). Subscribers, comments and users are not copied. Prisma CLI and the seed script default to the local database; production needs `DB_TARGET=production` on purpose. Production schema changes (additive) happen only after the owner approves.

## Done means

Build and lint pass; the SEO diff passes; every prototype screen matches in light, dark, desktop and phone; the editor creates, edits and publishes a post with a code block and lists that render identically on the site; analytics records a visit and shows it in the admin; the privacy behaviour above is verified; nothing in production changed.

## As built (deviations from the plan above)

- "Unique visitors" is not shown: with no persistent identifier there is no honest count. The dashboard shows Visits, Page views, Avg. time on site, Résumé downloads and Subscribers.
- A visit points at the subscriber (`VisitSession.subscriberId`), not the other way round. No consent-ledger table: measurement is anonymous, the one person-linked step has its own unticked checkbox.
- Admin analytics pages read the database directly in server components behind the existing admin login (no new public or admin API endpoints for analytics).
- The newsletter form keeps its five fields (name, email, profession, location, phone) because the admin Subscribers table depends on them.
- The Projects admin now has an Edit form with a description editor (previously a project could only be created and deleted, with an empty description).
- Fixed while building: unpublished drafts were readable through the public blog URL and `/api/blogs`; `/api/shorten` was open to anyone; subscriber emails did not escape the post title; `/api/resume/download` was frozen at build time.
