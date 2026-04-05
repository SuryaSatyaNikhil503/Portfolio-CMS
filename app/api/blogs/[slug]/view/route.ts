export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function parseSource(referrer: string): string {
  if (!referrer) return "Direct";
  if (referrer.includes("google")) return "Google";
  if (referrer.includes("twitter") || referrer.includes("t.co") || referrer.includes("x.com")) return "Twitter/X";
  if (referrer.includes("linkedin")) return "LinkedIn";
  if (referrer.includes("github")) return "GitHub";
  if (referrer.includes("reddit")) return "Reddit";
  if (referrer.includes("facebook") || referrer.includes("fb.com")) return "Facebook";
  if (referrer.includes("youtube")) return "YouTube";
  return "Other";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { referrer = "" } = await request.json().catch(() => ({ referrer: "" }));

    const blog = await prisma.blog.findUnique({ where: { slug }, select: { id: true } });
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.blogView.create({
      data: {
        blogId: blog.id,
        source: parseSource(referrer),
        referrer: referrer.slice(0, 500),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("View tracking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await prisma.blog.findUnique({ where: { slug }, select: { id: true } });
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [total, bySource] = await Promise.all([
      prisma.blogView.count({ where: { blogId: blog.id } }),
      prisma.blogView.groupBy({
        by: ["source"],
        where: { blogId: blog.id },
        _count: { source: true },
        orderBy: { _count: { source: "desc" } },
      }),
    ]);

    return NextResponse.json({
      total,
      sources: bySource.map((s) => ({ source: s.source, count: s._count.source })),
    });
  } catch (error) {
    console.error("View count error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
