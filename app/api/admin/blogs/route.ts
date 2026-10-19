export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/** Admin list: every post (drafts too) with its private view and comment counts. */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      omit: { content: true },
      include: { _count: { select: { views: true, comments: true, pageViews: true } } },
    });
    return NextResponse.json({
      blogs: blogs.map(({ _count, ...b }) => ({ ...b, viewCount: _count.views + _count.pageViews, commentCount: _count.comments })),
    });
  } catch (error) {
    console.error("Admin blogs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
