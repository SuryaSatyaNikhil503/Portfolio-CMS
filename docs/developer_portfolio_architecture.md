# Developer Portfolio Platform — Architecture & Documentation

## Overview

A **production-grade developer portfolio with an integrated CMS and blogging system**.
The portfolio owner manages all content (blogs, projects, skills, experience, about)
from a secure admin dashboard. Changes are reflected immediately on the public site.

---

## Tech Stack

### Frontend + Backend
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + CSS variables |
| Theming | next-themes (light / dark toggle) |
| Rich Text | TipTap (lazy-loaded) |
| Syntax Highlighting | Shiki |
| Reading Time | reading-time library |

Next.js handles both the frontend and all backend API routes.
No standalone server (Express etc.) is used — the system runs entirely on
Vercel serverless and edge infrastructure.

---

### Database
**Neon PostgreSQL** (serverless Postgres)

Accessed via **Prisma 7** using the driver adapter pattern:
- `@prisma/adapter-pg` + `pg.Pool` for runtime connections
- `prisma.config.ts` + `defineConfig` for CLI operations (db push, generate)
- `schema.prisma` has **no `url` in the datasource block** — this is a Prisma 7
  breaking change; the URL is provided externally via config

Two connection strings are required:
- `POSTGRES_PRISMA_URL` — pooled connection (PgBouncer) used at runtime
- `POSTGRES_URL_NON_POOLING` — direct connection used by Prisma CLI for migrations

**Tables:**
- `users` — admin accounts (email, bcrypt-hashed password, role)
- `about` — profile info, title, bio, profile image, resume link, social URLs
- `blogs` — title, slug, content (TipTap JSON), tags, thumbnail, published flag, reading time
- `projects` — title, slug, description (TipTap JSON), tech stack, links, featured flag
- `skills` — name, icon (Cloudinary URL), category, display order
- `experience` — company, role, logo, location, dates, description, display order
- `subscribers` — email, subscribed date

---

### Media Storage
**Cloudinary**

All images are uploaded to Cloudinary and served via its CDN.
Images are never stored in the database — only the URL is saved.

Folder structure in Cloudinary:
```
portfolio/
  about/
  blogs/[slug]/
  projects/[slug]/
  skills/
  experience/
```

---

### Deployment
**Vercel**

- Frontend: served from Vercel's global CDN
- API Routes: run as Vercel Serverless Functions
- Edge Middleware: runs at Vercel Edge Runtime (no cold start, no npm deps)
- Build command: `prisma generate && next build`

---

## Admin Security — Three Layers

Every admin request passes through three independent security checks:

### Layer 1 — Edge Middleware (`middleware.ts`)
- Runs at the Vercel Edge before any page or API handler
- Verifies the `portfolio_token` cookie using **Web Crypto API** (HS256 JWT)
- Zero npm dependencies — works in the Edge Runtime
- Unauthenticated requests are redirected to `/admin/login`
- Stale/expired cookies are deleted on redirect
- Authenticated users visiting `/admin/login` are bounced to `/admin`

### Layer 2 — Server Layout (`app/admin/layout.tsx`)
- Async server component that calls `getAuthUser()` on every render
- `getAuthUser()` does a full JWT decode + database user lookup
- Catches revoked sessions that the middleware might miss (token valid but user deleted)
- Renders `AdminSidebar` for authenticated users
- Renders a bare shell for the login page

### Layer 3 — API `requireAuth` (`lib/auth.ts`)
- Every mutation endpoint (PUT, POST, DELETE) calls `requireAuth(request)` first
- Returns `401 Unauthorized` immediately if the token is missing or invalid
- Final safeguard — protects data even if the first two layers are somehow bypassed

---

## Authentication

**Login flow:**
1. `POST /api/auth/login` with `{ email, password }`
2. Prisma looks up the user by email
3. `bcryptjs.compare()` verifies the password against the stored hash
4. On success: `jsonwebtoken.sign()` creates an HS256 JWT (7-day expiry)
5. Token is stored in an `httpOnly` cookie (`portfolio_token`)
6. Browser is redirected to `/admin`

**Logout flow:**
1. `POST /api/auth/logout`
2. Cookie is deleted
3. Browser redirected to `/admin/login`

---

## Public Routes

| Route | Description |
|---|---|
| `/` | Home — hero, stats, featured sections |
| `/about` | Profile, bio, resume link |
| `/skills` | Skills grid with icons |
| `/experience` | Timeline of work history |
| `/projects` | Project cards grid |
| `/projects/[slug]` | Individual project detail page |
| `/blogs` | Blog listing with tag filter |
| `/blogs/[slug]` | Individual blog post with TipTap renderer |

---

## Admin Routes

| Route | Description |
|---|---|
| `/admin` | Dashboard overview |
| `/admin/login` | Login page (unauthenticated) |
| `/admin/blogs` | Blog list — create, publish/unpublish, delete |
| `/admin/blogs/new` | Create new blog |
| `/admin/blogs/[slug]/edit` | Edit blog with TipTap editor |
| `/admin/projects` | Manage projects |
| `/admin/skills` | Manage skills |
| `/admin/experience` | Manage work experience |
| `/admin/about` | Update profile, bio, social links |

---

## Blog System

Blogs are written using the **TipTap rich text editor** (lazily loaded for performance).

Supported content types:
- Headings (H1–H3)
- Paragraphs, bold, italic
- Ordered and unordered lists
- Blockquotes
- Inline images (uploaded to Cloudinary)
- Code blocks with **Shiki syntax highlighting**

Content is stored as **TipTap JSON** in the `content` column (PostgreSQL `Json` type).
The `TipTapRenderer` component converts this JSON to HTML for the public blog page.

Reading time is auto-calculated on save using the `reading-time` library.

---

## Theme System

- **next-themes** manages light/dark preference
- Theme is applied via a `class` attribute on `<html>` (Tailwind `darkMode: "class"`)
- Default: dark mode
- User preference is persisted in `localStorage`
- A sun/moon `ThemeToggle` button lives in the Navbar
- All colors use CSS variables so both themes share the same component code

**Palette — Slate & Emerald:**

| Role | Light | Dark |
|---|---|---|
| Background | `#F5F8FC` cool off-white | `#0E1117` deep slate |
| Text | `#141B28` | `#EEF2F7` |
| Primary | `#2D9966` forest emerald | `#2ECC8A` bright emerald |
| Accent | `#1A8FAC` ocean blue | `#2DC6E9` sky blue |
| Border | `#D5DDE9` | `#212B3E` |

---

## Image Upload API

**Endpoint:** `POST /api/upload`

Request: `multipart/form-data` with fields:
- `file` — the image binary
- `context` — folder hint e.g. `blog:my-slug`, `skill`, `about`

Response: `{ url: "https://res.cloudinary.com/..." }`

The API requires authentication (`requireAuth`) — unauthenticated uploads return 401.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `POSTGRES_PRISMA_URL` | Neon pooled connection string (runtime) |
| `POSTGRES_URL_NON_POOLING` | Neon direct connection string (Prisma CLI) |
| `JWT_SECRET` | Secret for signing/verifying HS256 JWTs |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account identifier |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_SITE_URL` | Public base URL (used for canonical/OG URLs) |
| `ADMIN_EMAIL` | Seed script only — admin account email |
| `ADMIN_PASSWORD` | Seed script only — admin account password |
| `ADMIN_NAME` | Seed script only — admin display name |

`ADMIN_*` variables are only used by `npm run seed` and are never read at runtime.
All variables are stored in `.env.local` locally (gitignored) and in the
Vercel Environment Variables dashboard in production.

---

## Project Structure

```
portfolio-cms/
├── app/
│   ├── page.tsx                  # Home (server component)
│   ├── layout.tsx                # Root layout + ThemeProvider
│   ├── globals.css               # CSS variables (light + dark themes)
│   ├── about/
│   ├── blogs/[slug]/
│   ├── projects/[slug]/
│   ├── skills/
│   ├── experience/
│   └── admin/
│       ├── layout.tsx            # Admin layout (auth guard layer 2)
│       ├── login/
│       ├── blogs/[slug]/edit/
│       ├── projects/
│       ├── skills/
│       ├── experience/
│       └── about/
├── app/api/
│   ├── about/route.ts
│   ├── blogs/route.ts
│   ├── blogs/[slug]/route.ts
│   ├── projects/route.ts
│   ├── projects/[slug]/route.ts
│   ├── skills/route.ts
│   ├── experience/route.ts
│   ├── newsletter/route.ts
│   ├── upload/route.ts
│   └── auth/
│       ├── login/route.ts
│       ├── logout/route.ts
│       └── me/route.ts
├── components/
│   ├── Navbar.tsx                # Navigation + ThemeToggle
│   ├── Footer.tsx                # Footer + social links
│   ├── AdminSidebar.tsx          # Admin navigation (client)
│   ├── ThemeProvider.tsx         # next-themes wrapper
│   ├── ThemeToggle.tsx           # Sun/moon toggle button
│   ├── BlogCard.tsx
│   ├── ProjectCard.tsx
│   ├── TimelineItem.tsx
│   ├── SkillIcon.tsx
│   ├── TipTapRenderer.tsx
│   └── ...
├── editor/
│   └── TipTapEditor.tsx          # Rich text editor (lazy loaded)
├── lib/
│   ├── prisma.ts                 # Prisma client (adapter-pg runtime)
│   ├── auth.ts                   # getAuthUser, requireAuth, JWT helpers
│   ├── cloudinary.ts             # Cloudinary SDK config
│   └── getPortfolioStats.ts      # Home page stats query
├── middleware.ts                 # Edge JWT auth guard (layer 1)
├── prisma/
│   └── schema.prisma             # Prisma schema (no url in datasource)
├── prisma.config.ts              # Prisma 7 CLI config (url + directUrl)
├── scripts/
│   └── seed-admin.ts             # Admin user seeder (reads from env vars)
├── tailwind.config.ts
└── .env.example
```

---

## Performance Strategy

- **Server Components by default** — data fetched at the server, no client waterfalls
- **Lazy-loaded TipTap editor** — heavy editor bundle only loads on admin edit pages
- **Cloudinary CDN** — all media served from the nearest edge node globally
- **Neon serverless Postgres** — scales to zero, no idle compute cost
- **Vercel Edge Middleware** — auth check runs at the edge with zero cold start
- **`force-dynamic`** on all API routes — ensures fresh data, no stale caches
