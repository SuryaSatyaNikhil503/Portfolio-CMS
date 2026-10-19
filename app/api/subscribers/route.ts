export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const rows = await prisma.subscriber.findMany({
      orderBy: { subscribedAt: "desc" },
      include: { sessions: { select: { id: true }, orderBy: { startedAt: "desc" } } },
    });
    // Only visits the subscriber chose to share (ticked the optional box) are ever linked.
    const subscribers = rows.map(({ sessions, ...s }) => ({ ...s, visitCount: sessions.length, latestVisitId: sessions[0]?.id ?? null }));

    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error("Get subscribers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.subscriber.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete subscriber error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
