export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, getAuthUser } from "@/lib/auth";
import { readingTimeFromDoc } from "@/lib/readingTime";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    const tag = searchParams.get("tag");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Drafts are private: without a valid admin session only published posts are returned.
    const admin = await getAuthUser().catch(() => null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (!admin || published === "true") where.published = true;
    else if (published === "false") where.published = false;
    if (tag) where.tags = { has: tag };

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      omit: { content: true },
    });

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error("Get blogs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();

    const slug =
      body.slug ||
      body.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A blog with this slug already exists" },
        { status: 400 }
      );
    }

    // readingTime is always computed from the content, never trusted from the client.
    const readingTime = body.content ? readingTimeFromDoc(body.content).label : undefined;
    const blog = await prisma.blog.create({
      data: { ...body, slug, ...(readingTime ? { readingTime } : {}) },
    });
    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error("Create blog error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
