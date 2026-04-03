# Developer Portfolio Platform — Architecture Diagrams

Visual system design diagrams reflecting the current production architecture.

---

## High-Level System Architecture

```
                        ┌──────────────────────────┐
                        │          Users            │
                        │    (Browser / Mobile)     │
                        └────────────┬─────────────┘
                                     │
                                     ▼
                        ┌──────────────────────────┐
                        │        Vercel CDN         │
                        │   Edge Network / Cache    │
                        └────────────┬─────────────┘
                                     │
                                     ▼
                        ┌──────────────────────────┐
                        │      Next.js 14 App       │
                        │       (App Router)        │
                        │                          │
                        │  ┌────────────────────┐  │
                        │  │   Edge Middleware   │  │
                        │  │  JWT Auth Guard     │  │
                        │  └────────────────────┘  │
                        │                          │
                        │  Public Pages            │
                        │  Admin Dashboard         │
                        │  API Routes              │
                        └───────┬──────────┬───────┘
                                │          │
                                ▼          ▼
              ┌─────────────────────┐  ┌──────────────────┐
              │    Neon PostgreSQL  │  │    Cloudinary    │
              │   (Serverless DB)   │  │  Media Storage   │
              │                     │  │                  │
              │  Prisma 7 +         │  │  Profile Images  │
              │  @prisma/adapter-pg │  │  Blog Thumbnails │
              │                     │  │  Skill Icons     │
              │  Tables:            │  │  Company Logos   │
              │  • users            │  │  Blog Images     │
              │  • about            │  └──────────────────┘
              │  • blogs            │
              │  • projects         │
              │  • skills           │
              │  • experience       │
              │  • subscribers      │
              └─────────────────────┘
```

---

## Three-Layer Admin Security Architecture

```
  Browser Request to /admin/*
            │
            ▼
  ┌─────────────────────────────────────────┐
  │  Layer 1 — Edge Middleware              │
  │  middleware.ts                          │
  │                                         │
  │  • Runs at Vercel Edge (no cold start)  │
  │  • Verifies HS256 JWT via Web Crypto API│
  │  • No npm dependencies                  │
  │  • Redirects → /admin/login if invalid  │
  │  • Clears stale cookie on redirect      │
  └──────────────────┬──────────────────────┘
                     │ valid token
                     ▼
  ┌─────────────────────────────────────────┐
  │  Layer 2 — Server Layout                │
  │  app/admin/layout.tsx                   │
  │                                         │
  │  • Async server component               │
  │  • Calls getAuthUser() — full JWT +     │
  │    DB lookup (catches revoked sessions) │
  │  • Renders AdminSidebar if user found   │
  │  • Renders bare shell for login page    │
  └──────────────────┬──────────────────────┘
                     │ user confirmed
                     ▼
  ┌─────────────────────────────────────────┐
  │  Layer 3 — API requireAuth              │
  │  lib/auth.ts → requireAuth(request)     │
  │                                         │
  │  • Every mutation endpoint (PUT/POST/   │
  │    DELETE) calls requireAuth first      │
  │  • Returns 401 if token missing/invalid │
  │  • Final guard even if layers 1 & 2     │
  │    are somehow bypassed                 │
  └─────────────────────────────────────────┘
```

---

## Authentication Flow

```
  Admin visits /admin/login
            │
            ▼
  POST /api/auth/login
  { email, password }
            │
            ▼
  Prisma → users table
  bcryptjs.compare(password, hash)
            │
       ┌────┴────┐
    invalid    valid
       │          │
       ▼          ▼
    401 Error   jsonwebtoken.sign()
                HS256 JWT (7 day expiry)
                        │
                        ▼
                httpOnly cookie set
                name: portfolio_token
                        │
                        ▼
                Redirect → /admin
```

---

## Request Flow — Public Blog Page

```
  User opens /blogs/[slug]
            │
            ▼
  Next.js Server Component (force-dynamic)
            │
            ▼
  Prisma query → Neon PostgreSQL
  blogs table WHERE slug = [slug]
  AND published = true
            │
            ▼
  TipTap JSON content returned
            │
            ▼
  TipTapRenderer component
            │
            ├── Headings / Paragraphs / Lists
            ├── Blockquotes
            ├── Inline images → served from Cloudinary CDN
            └── Code Blocks → Shiki syntax highlighting
```

---

## Image Upload Flow

```
  Admin selects image in editor or settings
            │
            ▼
  POST /api/upload
  FormData { file, context }
            │
            ▼
  requireAuth(request)  ← 401 if not authenticated
            │
            ▼
  Cloudinary SDK upload
  Organised into folders:
    portfolio/blogs/[slug]/
    portfolio/projects/[slug]/
    portfolio/skills/
    portfolio/experience/
    portfolio/about/
            │
            ▼
  Cloudinary returns { secure_url }
            │
            ▼
  URL stored in Neon DB via Prisma
  (or inserted into TipTap JSON for blog images)
```

---

## Prisma 7 Connection Architecture

```
  ┌─────────────────────────────────────────────────────┐
  │                  prisma.config.ts                   │
  │  (Prisma CLI only — db push, migrate, generate)     │
  │                                                     │
  │  defineConfig({                                     │
  │    datasource: {                                    │
  │      url:       POSTGRES_PRISMA_URL  (pooled)       │
  │      directUrl: POSTGRES_URL_NON_POOLING (direct)   │
  │    }                                                │
  │  })                                                 │
  └───────────────────────┬─────────────────────────────┘
                          │ CLI only
  ┌───────────────────────▼─────────────────────────────┐
  │                    lib/prisma.ts                    │
  │  (Runtime — API routes, Server Components)          │
  │                                                     │
  │  pg.Pool({ connectionString: POSTGRES_PRISMA_URL }) │
  │       ↓                                             │
  │  PrismaPg(pool)   ← @prisma/adapter-pg              │
  │       ↓                                             │
  │  new PrismaClient({ adapter })                      │
  │       ↓                                             │
  │  Neon PostgreSQL (serverless, connection pooling)   │
  └─────────────────────────────────────────────────────┘

  Note: schema.prisma has NO url in datasource block.
  This is a Prisma 7 breaking change from earlier versions.
```

---

## Theme System

```
  next-themes ThemeProvider
  (attribute="class", defaultTheme="dark")
            │
            ▼
  <html class="dark"> or <html class="">
            │
            ├── .dark { CSS variables }   ← Slate & Emerald dark
            └── :root  { CSS variables }  ← Slate & Emerald light

  User preference persisted in localStorage.
  ThemeToggle button in Navbar (sun/moon icon).
  SSR-safe: placeholder rendered before mount.
```

---

## Newsletter Subscription Flow

```
  Visitor enters email
            │
            ▼
  POST /api/newsletter
            │
            ▼
  Check: email already subscribed?
    Yes → return 409 (already subscribed)
    No  → Prisma insert → subscribers table
            │
            ▼
  Success response
```

---

## Deployment Pipeline

```
  Local Development
  .env.local → secrets (gitignored)
            │
            ▼
  git push origin main
            │
            ▼
  GitHub Repository
            │
            ▼
  Vercel (auto-deploy on push)
  Build command: prisma generate && next build
            │
            ▼
  Environment variables injected by Vercel dashboard
  (POSTGRES_PRISMA_URL, JWT_SECRET, CLOUDINARY_*, etc.)
            │
            ├── Next.js Frontend  (Vercel CDN)
            ├── API Routes        (Vercel Serverless Functions)
            └── Edge Middleware   (Vercel Edge Runtime)
                    │
                    ├── Neon PostgreSQL  (external)
                    └── Cloudinary       (external)
```
