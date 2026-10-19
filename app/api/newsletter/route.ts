export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { name, email, profession, location, phone, linkSession, sessionId } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existing = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase() },
    });
    // Optional, opt-in only: connect this visit's page history to the subscriber.
    const link = async (subscriberId: string) => {
      if (linkSession !== true || typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId)) return;
      await prisma.visitSession.updateMany({ where: { id: sessionId }, data: { subscriberId } }).catch(() => {});
    };

    if (existing) {
      await link(existing.id);
      return NextResponse.json({ message: "Already subscribed" }, { status: 200 });
    }

    const created = await prisma.subscriber.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        profession: profession?.trim() || "",
        location: location?.trim() || "",
        phone: phone?.trim() || "",
      },
    });
    await link(created.id);

    return NextResponse.json({ message: "Subscribed successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
