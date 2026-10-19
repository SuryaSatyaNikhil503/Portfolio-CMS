# Portfolio Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native execution chosen by the owner). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Rebuild the portfolio front end and admin in the approved "Option D" design with 3D, add private blog and visitor analytics, and replace the blog editor, without changing SEO.

**Architecture:** Keep Next.js 14 App Router and Prisma. Re-skin with CSS-variable tokens (public light/dark, admin light/dark). 3D is a client-only dynamic import. Analytics is cookieless and IP-free, written through one validated route. The editor stays TipTap with new extensions and a shared `<Article>` stylesheet.

**Tech Stack:** Next 14.2, React 18, Tailwind 3, Prisma 7 + pg, TipTap 3, three, lowlight, zod, vitest.

**Spec:** `docs/superpowers/specs/2026-10-19-portfolio-revamp-design.md`. Visual source of truth: `docs/design/prototype/` (open `index.html` via a static server after `node gen-data.js`).

## Global Constraints

- SEO guard: `node scripts/seo-snapshot.mjs snap http://localhost:3000 docs/seo/after.json && node scripts/seo-snapshot.mjs diff docs/seo/baseline-production-2026-10-19.json docs/seo/after.json` must print "SEO check passed". Do not edit: `app/layout.tsx` metadata/JSON-LD, any `metadata`/`generateMetadata` export, `app/sitemap.ts`, `app/robots.ts`, `public/google*.html`, `next.config.mjs`.
- Existing headings keep level and text (Home `<h1>` = "Software Developer"; About `<h1>` = "About Me"; Skills h2 "Skills & Technologies"; Experience h2 "Experience"; Projects h2 "Projects"; Blogs h2 "Blog"; "What I Do", "What Drives Me", "Stay in the Loop" stay h2; their card titles stay h3). Prototype headlines that differ render as non-heading text.
- No IP address, cookie, fingerprint or third-party analytics. Geo only from `x-vercel-ip-country` and `x-vercel-ip-city`, never stored as IP.
- Prisma changes are additive only. Dev DB is local (`localhost:5433`); production only with `DB_TARGET=production` and the owner's go-ahead.
- Screens match the prototype in light, dark, desktop and 390px phone widths. Fonts: Bricolage Grotesque, Figtree, JetBrains Mono.
- No commits unless the owner asks; work stays on branch `revamp/option-d`.

## Review Focus

1. Browser sends Global Privacy Control / Do Not Track, or the visitor clicked "Turn off": the tracker sends nothing (tested).
2. `/api/track` receives oversized, malformed, bot or unknown-session input: returns 204/400 and writes no rows (tested).
3. WebGL unavailable or reduced motion: Home is fully usable and readable with no canvas (checked by disabling WebGL).
4. A legacy post (hard breaks, images, no code blocks, bullet lists) renders with visible bullets and unchanged text (SEO diff plus visual check).
5. Retention cleanup deletes only analytics rows older than 90 days and nothing else (tested against seeded rows).

---

### Task 1: Tokens, fonts, Tailwind, shared primitives

**Files:** Modify `app/globals.css`, `tailwind.config.ts`. Create `components/ui/Icon.tsx`.

**Interfaces:** Produces CSS variables `--bg --surface --surface-2 --fg --body --muted --line --bd --primary --on-primary --primary-soft --accent --good --warn --bad --code-bg --c1..--c5 --hard` under `:root`/`.dark`, and `[data-area="admin"]` overrides (incl. `--side`); utility classes `.btn .btn-primary .btn-s .btn-ghost .chip .chip-soft .pill-* .card .article`; `Icon({ name: IconName, size?: number })`.

- [ ] Port the prototype token blocks and component classes from `docs/design/prototype/styles.css` into `app/globals.css`, replacing the old HSL tokens (keep class-based dark via `.dark`).
- [ ] Map Tailwind colors to the variables (`bg-background`, `text-foreground`, etc. keep working) and add `fontFamily` for the three fonts via the existing Google `@import`.
- [ ] Port `ico()` paths from `lib.js` into `Icon.tsx`.
- [ ] Verify: `npx tsc --noEmit` passes; `npm run dev` renders every page without console errors.

### Task 2: 3D layer stack

**Files:** Create `components/hero/StackScene.tsx`, `components/hero/HeroStack.tsx`. Add dependency `three` and `@types/three`.

**Interfaces:** Produces `HeroStack()` (client; `next/dynamic` of `StackScene`, `ssr:false`, mounted after `requestIdleCallback`); `StackScene({ dark: boolean; labels: boolean })`. Layers top to bottom: React, API gateway, Spring Boot, AI Integrations, Agents, Database.

- [ ] Port `docs/design/prototype/hero3d.js` to TypeScript with `three`; set `ColorManagement.enabled=false`, linear output and light intensities scaled so it matches the prototype; dispose on unmount; one frame drawn immediately; honors `prefers-reduced-motion`.
- [ ] If WebGL is unavailable render nothing (the text beside it is server-rendered).
- [ ] Verify: screenshot next to the prototype in light and dark; heap does not grow when toggling theme ten times.

### Task 3: Public chrome

**Files:** Modify `components/Navbar.tsx`, `components/Footer.tsx`, `components/ThemeToggle.tsx`, `components/ThemeProvider.tsx` (default theme light, `enableSystem` off). Do not edit `app/layout.tsx`.

**Interfaces:** Produces the prototype nav and footer; Footer mounts `<Tracker />` and `<MeasurementNotice />` (Task 12).

- [ ] Restyle Navbar/Footer to the prototype (logo tile, links, theme toggle, Résumé button linking to the existing `/api/resume/download`); keep link targets and text.
- [ ] Verify: SEO diff shows no change to internal links (additions only).

### Task 4: `openToWork` field and Home

**Files:** Modify `prisma/schema.prisma` (`About.openToWork Boolean @default(true)`), `app/api/about/route.ts`, `app/page.tsx`, `components/HomeContent.tsx`, `lib/getPortfolioStats.ts`. Create `components/home/*` as needed.

**Interfaces:** Consumes `HeroStack`. Produces `About.openToWork`, returned by `GET /api/about` and accepted by its admin `PUT`.

- [ ] Run `npx prisma db push` (local default) after adding the field; confirm it only adds a column.
- [ ] Build Home sections in the prototype's order, server-rendered: hero (name as non-heading text, `<h1>` "Software Developer"), pill (shown only if `openToWork`), stats, What I Do + CTA card, Skills layers (six cards, skills from DB by category; AI Integrations and Agents tiles static: LLM APIs, RAG, Embeddings / Agentic AI, Multi-agent systems), Experience, Latest articles (3), Featured project, "Stay in the Loop".
- [ ] Verify: `seo-snapshot` diff for `/` passes.

### Task 5: About, Skills, Experience

**Files:** Modify `app/about/page.tsx`, `app/skills/page.tsx`, `app/experience/page.tsx`, `components/SectionHeading.tsx`, `components/TimelineItem.tsx`, `components/SkillIcon.tsx`.

- [ ] Rebuild each page to the prototype; About facts are Specialization / Experience / Availability (Availability uses the pill style and follows `openToWork`); keep "What Drives Me" four cards and the closing CTA.
- [ ] Verify: SEO diff for these paths passes; screenshots match prototype.

### Task 6: Projects, Blogs, blog post, comments, newsletter, shared Article

**Files:** Modify `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`, `app/blogs/page.tsx`, `app/blogs/[slug]/page.tsx`, `components/ProjectCard.tsx`, `components/BlogCard.tsx`, `components/CommentSection.tsx`, `components/NewsletterForm.tsx`, `components/TipTapRenderer.tsx`. Create `components/Article.tsx`.

**Interfaces:** Produces `Article({ doc }: { doc: TipTapNode | null })` (server component; renders the TipTap JSON with visible lists, highlighted code blocks and copy buttons) used by the site, the editor canvas and the preview. `NewsletterForm` gains an unticked "also let me see which pages I read" checkbox sent as `linkSession` with the current session id.

- [ ] Remove the public view count and the old `ViewTracker` from the blog page (the new tracker replaces it).
- [ ] `Article`: render marks/nodes as today plus `codeBlock` via `lowlight` (server-side highlighting, `language` and optional `filename` attrs), callout and image-with-caption nodes; the `.article` stylesheet restores list markers.
- [ ] Verify: legacy post renders bullets, text identical (SEO headings diff passes for all post pages).

### Task 7: SEO checkpoint

- [ ] Run the SEO guard command from Global Constraints against `npm run dev` with `NEXT_PUBLIC_SITE_URL=https://suryasatyanikhil.vercel.app`. Expected: "SEO check passed". Fix any diff before continuing.

### Task 8: Admin shell, dark mode, login, dashboard

**Files:** Modify `app/admin/layout.tsx`, `components/AdminSidebar.tsx`, `app/admin/login/page.tsx`, `app/admin/page.tsx`, `app/api/admin/stats/route.ts`.

- [ ] Wrap admin in `data-area="admin"`; sidebar per prototype (Dashboard, Visitors, Blogs, Projects, Skills, Experience, About, Comments, Subscribers); theme toggle in the sidebar footer using `next-themes`; admin pages never indexed.
- [ ] Login with the small 3D stack (dark) per prototype.
- [ ] Dashboard shows KPIs/charts from real data (Task 13 supplies analytics numbers; before data exists show the designed empty state).

### Task 9: Admin content pages

**Files:** Modify `app/admin/{blogs,projects,skills,experience,about,comments,subscribers}/page.tsx` and their API routes only if fields change.

- [ ] Blogs list: Views column (button opens `/admin/blogs/[slug]/views`), status tabs, search, draft row.
- [ ] Skills: new layout (add row on top; one row per category with chips; drag to reorder categories; edit/delete on chip hover); keep icon upload and `displayOrder`.
- [ ] About: add the "Show Open to new roles" switch saving `openToWork`.
- [ ] Subscribers: Visits column ("Not shared" unless linked).
- [ ] Verify: each page against the prototype in light and dark.

### Task 10: Reading time, SEO checks, Markdown paste (pure logic, TDD)

**Files:** Create `lib/readingTime.ts`, `lib/seoChecks.ts`, `editor/markdownPaste.ts`, `vitest.config.ts`, `tests/*.test.ts`. Add `vitest` dev dependency and `"test": "vitest run"` script.

**Interfaces:**
- `readingTimeFromDoc(doc: unknown, wpm?: number): { words: number; minutes: number; label: string }` (label e.g. "6 min read"; empty doc = "1 min read").
- `seoChecks(i: { title: string; excerpt: string; tags: string[]; thumbnail: string; doc: unknown }): { id: string; ok: boolean; text: string }[]`.
- `looksLikeMarkdown(text: string): boolean`.

- [ ] Tests first: `readingTimeFromDoc` counts words in paragraphs, headings, lists and code blocks, 230 wpm, rounds up; `seoChecks` flags title over 60 chars, missing excerpt, more than 6 tags, missing thumbnail, image without alt; `looksLikeMarkdown("## Hi\n- a\n- b")` is true and `looksLikeMarkdown("just a sentence")` is false.
- [ ] Implement until `npm test` passes.

### Task 11: Editor rebuild

**Files:** Modify `editor/TipTapEditor.tsx`, `editor/MenuBar.tsx`, `app/admin/blogs/new/page.tsx`, `app/admin/blogs/[slug]/edit/page.tsx`, `app/api/blogs/route.ts`, `app/api/blogs/[slug]/route.ts`. Create `editor/SlashMenu.tsx`, `editor/BubbleToolbar.tsx`, `editor/CodeBlockView.tsx`, `editor/useAutosave.ts`, `editor/EditorSidebar.tsx`.

**Interfaces:** Consumes `Article`, `readingTimeFromDoc`, `seoChecks`, `looksLikeMarkdown`. `useAutosave({ slug?: string; getPayload(): BlogPayload; delayMs?: number }): { status: "saved" | "saving" | "error"; savedAt: Date | null }`. Blog API saves `readingTime` computed server-side from `content` on every create/update.

- [ ] Extensions: StarterKit (codeBlock off), CodeBlockLowlight with a node view (language picker, filename, copy), Placeholder, Image (alt required), BubbleMenu toolbar, slash menu (`/` filters: headings, lists, quote, code block, callout, image, divider), Markdown paste.
- [ ] Layout per prototype: top bar (status, words/read time, Write/Split/Preview, Save draft, Publish), canvas, right sidebar (publish, thumbnail, slug, excerpt counter, tags, search preview, checks). Canvas and preview use `Article` styles.
- [ ] Autosave every 2.5 s after the last change; creating a new post saves a draft first and then continues on its slug.
- [ ] Verify with Playwright-style browser run: create post, add bullets, numbered list, code block (Java), paste Markdown, autosave indicator shows Saved, Publish, open the public page and see identical rendering.

### Task 12: Analytics collection and privacy

**Files:** Modify `prisma/schema.prisma` (add `VisitSession`, `PageView`, `VisitEvent`; `Subscriber.sessionId String?`). Create `lib/analytics/{bots,device,source,schema,retention}.ts`, `app/api/track/route.ts`, `components/analytics/{Tracker,MeasurementNotice}.tsx`, `app/privacy/page.tsx`, `privacy/data-map.yaml`, `app/api/cron/retention/route.ts` (secret-protected) and `vercel.json` cron entry (added only with the owner's approval at deploy time). Modify `app/api/resume/download/route.ts` (log `resume_download` event when `?s=` session id given) and `app/api/newsletter/route.ts` (link session when `linkSession` true).

**Interfaces:**
- `isBot(ua: string | null | undefined): boolean`; `parseUA(ua: string): { device: "mobile" | "tablet" | "desktop"; os: string; browser: string }`; `classifySource(referrer: string, utmSource: string | null, selfHost: string): { source: string; host: string }`.
- `trackPayload` (zod discriminated union on `type`: `view` | `leave` | `event`) with `sid` (uuid), `path` (starts with `/`, max 300), `activeSeconds` (0..7200), `scrollDepth` (0..100).
- `POST /api/track`: 204 on success or ignored, 400 on invalid, never reads or stores IP; rate limit 60 requests per `sid` per minute.
- `Tracker`: sends `view` on mount and route change, `leave` via `navigator.sendBeacon` on `visibilitychange` hidden / `pagehide`; does nothing if `navigator.globalPrivacyControl`, `navigator.doNotTrack === "1"`, `localStorage["measure"] === "off"`, `navigator.webdriver`, or path starts with `/admin`.
- `deleteExpired(db, now: Date): Promise<{ sessions: number; views: number; events: number }>` deletes rows older than 90 days.

- [ ] Tests first (vitest): `isBot`, `parseUA`, `classifySource` (google, linkedin, t.co, direct, utm override, own host = Direct), `trackPayload` rejects oversize path and out-of-range depth, `deleteExpired` leaves a 10-day-old row and removes a 100-day-old row.
- [ ] Implement, `npx prisma db push` locally, then verify with curl: valid view returns 204 and creates a row; bot UA and malformed body create none.
- [ ] Measurement notice text and buttons per prototype ("Got it" / "Turn off"); `/privacy` page states what is and is not collected and how to turn it off.

### Task 13: Admin analytics

**Files:** Create `app/api/admin/analytics/{overview,sessions,sessions/[id]}/route.ts`, `app/api/admin/blogs/[slug]/views/route.ts`, `app/admin/analytics/page.tsx`, `app/admin/analytics/[id]/page.tsx`, `app/admin/blogs/[slug]/views/page.tsx`, `components/admin/charts/*`. Modify `app/api/admin/stats/route.ts`.

**Interfaces:** All routes require the admin JWT (`lib/auth.ts`). `overview?days=7|30|90` returns `{ visits, uniqueSessions, avgSeconds, pagesPerVisit, resumeDownloads, perDay[], sources[{source, visits, avgSeconds}], devices[], cities[] }`. Blog views = legacy `BlogView` count plus new page views; the drill-down lists new rows only and returns `detailsSince: ISO date`.

- [ ] Build the three screens and the dashboard widgets per prototype with real data and designed empty states.
- [ ] Verify: generate visits locally with a script, see them in each screen; unauthenticated calls return 401.

### Task 14: Final verification

- [ ] `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` (with local DB env) all pass.
- [ ] SEO guard passes against the production build (`npm run start`).
- [ ] Visual QA of all 22 prototype screens in light, dark and phone widths.
- [ ] Security pass (hawkscan skill if its runtime exists; otherwise a manual review of the new API routes, auth checks and input validation).
- [ ] Write `docs/superpowers/DEPLOY.md`: additive production schema steps (`DB_TARGET=production npx prisma db push` after reviewing the diff), env checklist, rollback.
