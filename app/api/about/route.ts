export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const about = await prisma.about.findFirst();
    return NextResponse.json({ about: about || null });
  } catch (error) {
    console.error("Get about error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();

    const existing = await prisma.about.findFirst();
    let about;
    if (existing) {
      about = await prisma.about.update({
        where: { id: existing.id },
        data: body,
      });
    } else {
      about = await prisma.about.create({ data: body });
    }

    return NextResponse.json({ about });
  } catch (error) {
    console.error("Update about error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
