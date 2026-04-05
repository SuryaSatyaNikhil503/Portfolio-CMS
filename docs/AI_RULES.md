# AI_RULES.md

# AI Development Rules for the Portfolio Project

This document defines **rules for AI coding assistants** (ChatGPT,
Cursor, Copilot, Claude, etc.) working on this repository.

The goal is to ensure all generated code follows the correct
architecture.

------------------------------------------------------------------------

# Core Architecture Rules

1.  The project uses **Next.js App Router**.
2.  The repository contains **frontend, backend APIs, and admin
    dashboard in the same codebase**.
3.  Backend logic must use **Next.js API Routes**, not Express servers.
4.  The application is deployed to **Vercel serverless infrastructure**.

------------------------------------------------------------------------

# Database Rules

Database used:

MongoDB Atlas

Use:

-   mongoose

Collections include:

users\
blogs\
projects\
skills\
experience\
about\
subscribers

Never store images inside MongoDB.

Only store **image URLs**.

------------------------------------------------------------------------

# Image Handling Rules

Images must be uploaded to **Cloudinary**.

Images must NOT be:

-   stored as base64
-   stored inside MongoDB

Upload flow:

Client → API Route → Cloudinary → URL returned

The URL should be stored in MongoDB documents.

------------------------------------------------------------------------

# Blog Content Rules

Blogs must use **TipTap editor**.

Content is stored as:

TipTap JSON format

Never store raw HTML inside the database.

Rendering must convert TipTap JSON into UI components.

------------------------------------------------------------------------

# Code Highlighting Rules

Code blocks in blog posts must use:

Shiki

The syntax highlighting engine should run during rendering.

------------------------------------------------------------------------

# Authentication Rules

Admin authentication must use:

-   JWT tokens
-   HTTPOnly cookies
-   bcrypt password hashing

Never store plain text passwords.

Admin routes must be protected.

------------------------------------------------------------------------

# Environment Variable Rules

Sensitive values must not be committed to Git.

Environment variables must be stored in **Vercel dashboard**.

Required variables:

MONGODB_URI\
JWT_SECRET\
CLOUDINARY_CLOUD_NAME\
CLOUDINARY_API_KEY\
CLOUDINARY_SECRET

Repository should only contain:

.env.example

------------------------------------------------------------------------

# File Structure Rules

The project structure must follow:

    portfolio/

    app/
      blogs/
      projects/
      skills/
      experience/
      about/
      admin/

    app/api/
      blogs/
      projects/
      skills/
      experience/
      newsletter/
      upload/
      auth/

    components/
    models/
    lib/
    editor/
    utils/

AI should generate code consistent with this structure.

------------------------------------------------------------------------

# Performance Rules

Generated code should prioritize:

-   SEO friendly routes
-   optimized images
-   minimal API payloads
-   server-side rendering where beneficial

Target page load time:

\< 500ms

------------------------------------------------------------------------

# Code Style Rules

Use:

-   TypeScript
-   functional components
-   async/await
-   modular architecture

Avoid:

-   monolithic files
-   duplicate logic
-   storing secrets in code

------------------------------------------------------------------------

# Development Goal

The system should behave as a **developer portfolio platform + blogging
CMS**.

Features include:

-   blog publishing
-   project showcase
-   skills grid
-   experience timeline
-   newsletter subscription
-   admin CMS

AI assistants should always generate code that respects this
architecture.
