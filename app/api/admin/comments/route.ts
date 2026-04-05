export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const comments = await prisma.comment.findMany({
      include: {
        reactions: true,
        blog: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Admin get comments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
