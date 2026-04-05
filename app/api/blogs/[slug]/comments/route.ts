export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await prisma.blog.findUnique({ where: { slug }, select: { id: true } });
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const comments = await prisma.comment.findMany({
      where: { blogId: blog.id, parentId: null, isApproved: true },
      include: {
        reactions: true,
        replies: {
          where: { isApproved: true },
          include: { reactions: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { authorName, authorEmail, content, parentId } = await request.json();

    if (!authorName?.trim() || !authorEmail?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Name, email, and content are required" }, { status: 400 });
    }
    if (!authorEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (content.trim().length > 2000) {
      return NextResponse.json({ error: "Comment too long (max 2000 chars)" }, { status: 400 });
    }

    const blog = await prisma.blog.findUnique({ where: { slug }, select: { id: true } });
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const comment = await prisma.comment.create({
      data: {
        blogId: blog.id,
        authorName: authorName.trim(),
        authorEmail: authorEmail.toLowerCase().trim(),
        content: content.trim(),
        parentId: parentId || null,
      },
      include: { reactions: true, replies: true },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Post comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
