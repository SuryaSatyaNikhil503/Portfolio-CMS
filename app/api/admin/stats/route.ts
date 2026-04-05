export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const [
      blogCount,
      projectCount,
      skillCount,
      subscriberCount,
      totalViews,
      commentCount,
      viewsBySource,
    ] = await Promise.all([
      prisma.blog.count(),
      prisma.project.count(),
      prisma.skill.count(),
      prisma.subscriber.count(),
      prisma.blogView.count(),
      prisma.comment.count({ where: { isApproved: true } }),
      prisma.blogView.groupBy({
        by: ["source"],
        _count: { source: true },
        orderBy: { _count: { source: "desc" } },
      }),
    ]);

    return NextResponse.json({
      blogCount,
      projectCount,
      skillCount,
      subscriberCount,
      totalViews,
      commentCount,
      viewsBySource: viewsBySource.map((v) => ({ source: v.source, count: v._count.source })),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
