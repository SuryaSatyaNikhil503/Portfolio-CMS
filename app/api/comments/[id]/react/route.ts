export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const VALID_REACTIONS = ["👍", "❤️", "🔥", "👏"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const { type } = await request.json();

    if (!VALID_REACTIONS.includes(type)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    // Toggle: remove if exists, add if not
    const existing = await prisma.commentReaction.findFirst({
      where: { commentId: id, type },
    });

    if (existing) {
      await prisma.commentReaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.commentReaction.create({ data: { commentId: id, type } });
    }

    const reactions = await prisma.commentReaction.findMany({ where: { commentId: id } });
    return NextResponse.json({ reactions });
  } catch (error) {
    console.error("React error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
