export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  uploadToCloudinary,
  getNextSequentialName,
  CLOUDINARY_FOLDERS,
} from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const context = formData.get("context") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!context) {
      return NextResponse.json(
        { error: "Upload context is required" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let folder: string;
    let publicId: string | undefined;

    // Route to the correct Cloudinary folder based on context
    if (context === "profile-photo") {
      folder = CLOUDINARY_FOLDERS.PROFILE_PHOTO;
    } else if (context === "resume") {
      folder = CLOUDINARY_FOLDERS.RESUME;
    } else if (context.startsWith("blog:")) {
      const blogSlug = context.split(":")[1];
      folder = CLOUDINARY_FOLDERS.BLOG(blogSlug);
      publicId = await getNextSequentialName(folder);
    } else if (context.startsWith("project:")) {
      const projectSlug = context.split(":")[1];
      folder = CLOUDINARY_FOLDERS.PROJECT(projectSlug);
      publicId = await getNextSequentialName(folder);
    } else if (context.startsWith("logo:")) {
      const companyName = context.split(":")[1];
      folder = CLOUDINARY_FOLDERS.LOGO;
      publicId = companyName.toLowerCase().replace(/\s+/g, "-");
    } else if (context.startsWith("skill:")) {
      const skillName = context.split(":")[1];
      folder = CLOUDINARY_FOLDERS.SKILL;
      publicId = skillName.toLowerCase().replace(/\s+/g, "-");
    } else {
      folder = "Portfolio-CMS/Misc";
    }

    const result = await uploadToCloudinary(buffer, folder, publicId);

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
