export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({ error: "Email not configured" }, { status: 503 });
    }

    const { slug, subscriberIds } = await request.json();
    if (!slug || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
      return NextResponse.json({ error: "slug and subscriberIds are required" }, { status: 400 });
    }

    const blog = await prisma.blog.findUnique({ where: { slug } });
    if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

    const subscribers = await prisma.subscriber.findMany({
      where: { id: { in: subscriberIds } },
      select: { email: true, name: true },
    });
    if (subscribers.length === 0) return NextResponse.json({ sent: 0 });

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
          You are receiving this because you subscribed to Nikhil's newsletter.
        </p>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });

    const results = await Promise.allSettled(
      subscribers.map((s) =>
        transporter.sendMail({
          from: `"Nikhil" <${process.env.GMAIL_USER}>`,
          to: s.email,
          subject: `New article: ${blog.title}`,
          html,
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return NextResponse.json({ sent, total: subscribers.length });
  } catch (error) {
    console.error("Notify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
