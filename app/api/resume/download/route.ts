import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    const about = await prisma.about.findFirst({
      select: { resumeLink: true },
    });

    if (!about?.resumeLink) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Extract resource_type and public_id from the Cloudinary URL
    // e.g. .../image/upload/v123/Portfolio-CMS/Personal-Data/Resume/file.pdf
    const match = about.resumeLink.match(
      /\/(?:image|raw|video)\/upload\/(?:v\d+\/)?(.+)$/
    );

    if (!match) {
      return NextResponse.redirect(about.resumeLink);
    }

    // Strip file extension from public_id — Cloudinary signs without it
    const publicId = match[1].replace(/\.[^/.]+$/, "");
    const format = match[1].split(".").pop() || "pdf";

    // Generate signed download URL
    const signedUrl = cloudinary.url(publicId, {
      resource_type: "image",
      format,
      type: "upload",
      sign_url: true,
      attachment: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    // Fetch server-side so Cloudinary never sees the browser — no 401
    const fileRes = await fetch(signedUrl);

    if (!fileRes.ok) {
      console.error("Cloudinary fetch failed:", fileRes.status, await fileRes.text());
      return NextResponse.json(
        { error: `Storage returned ${fileRes.status}` },
        { status: 502 }
      );
    }

    const buffer = await fileRes.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Resume download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
