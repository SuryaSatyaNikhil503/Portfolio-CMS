export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url param required" }, { status: 400 });

  try {
    const res = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!res.ok) throw new Error("TinyURL failed");
    const shortUrl = await res.text();
    return NextResponse.json({ shortUrl: shortUrl.trim() });
  } catch {
    return NextResponse.json({ error: "Could not shorten URL" }, { status: 502 });
  }
}
