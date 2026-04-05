export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import nodemailer from "nodemailer";

function createTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

async function sendPublishEmail(blog: { title: string; slug: string; excerpt: string; thumbnail: string }) {
  const transporter = createTransporter();
  if (!transporter) return;

  const subscribers = await prisma.subscriber.findMany({ select: { email: true, name: true } });
  if (subscribers.length === 0) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com";
  const blogUrl = `${siteUrl}/blogs/${blog.slug}`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0E1117;color:#EEF2F7;border-radius:12px;">
      <h1 style="color:#2ECC8A;margin-bottom:8px;font-size:24px;">New Article Published!</h1>
      <h2 style="font-size:20px;margin-bottom:12px;color:#EEF2F7;">${blog.title}</h2>
      ${blog.excerpt ? `<p style="color:#94A3B8;margin-bottom:20px;">${blog.excerpt}</p>` : ""}
      ${blog.thumbnail ? `<img src="${blog.thumbnail}" alt="${blog.title}" style="width:100%;border-radius:8px;margin-bottom:20px;" />` : ""}
      <a href="${blogUrl}" style="display:inline-block;background:#2ECC8A;color:#0E1117;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Read Article</a>
      <p style="margin-top:24px;font-size:12px;color:#64748B;">
        You are receiving this because you subscribed to Nikhil's newsletter.<br/>
        <a href="${siteUrl}" style="color:#2ECC8A;">Unsubscribe</a>
      </p>
    </div>
  `;

  await Promise.allSettled(
    subscribers.map((s) =>
      transporter.sendMail({
        from: `"Nikhil" <${process.env.GMAIL_USER}>`,
        to: s.email,
        subject: `New article: ${blog.title}`,
        html,
      })
    )
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await prisma.blog.findUnique({ where: { slug } });
    if (!blog) {
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

    // Check if this is a publish action (draft → published)
    const previous = await prisma.blog.findUnique({ where: { slug }, select: { published: true } });
    const isBeingPublished = !previous?.published && body.published === true;

    const blog = await prisma.blog.update({ where: { slug }, data: body });

    if (isBeingPublished) {
      sendPublishEmail(blog).catch((e) => console.error("Email send error:", e));
    }

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
