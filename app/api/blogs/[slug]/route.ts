export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, getAuthUser } from "@/lib/auth";
import { readingTimeFromDoc } from "@/lib/readingTime";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await prisma.blog.findUnique({ where: { slug } });
    if (!blog || (!blog.published && !(await getAuthUser().catch(() => null)))) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    return NextResponse.json({ blog });
  } catch (error) {
    console.error("Get blog error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { slug } = await params;
    const body = await request.json();

    const data = body.content ? { ...body, readingTime: readingTimeFromDoc(body.content).label } : body;
    const blog = await prisma.blog.update({ where: { slug }, data });

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("Update blog error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { slug } = await params;
    await prisma.blog.delete({ where: { slug } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete blog error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
