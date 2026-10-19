export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { deleteExpired } from "@/lib/analytics/retention";

/** Daily clean-up of visit data older than 90 days. Protected by CRON_SECRET (Vercel Cron sends it as a bearer token). */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await deleteExpired(prisma);
  return NextResponse.json(result);
}
