export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { tiptapText } from "@/lib/readingTime";

/** Admin list: projects with a flag telling whether the description is empty. */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ projects: projects.map(({ description, ...p }) => ({ ...p, hasDescription: tiptapText(description).length > 0 })) });
  } catch (error) {
    console.error("Admin projects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
