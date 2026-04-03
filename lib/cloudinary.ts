import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Organized folder structure constants
export const CLOUDINARY_FOLDERS = {
  PROFILE_PHOTO: "Portfolio-CMS/Personal-Data/Photo",
  RESUME: "Portfolio-CMS/Personal-Data/Resume",
  BLOG: (slug: string) => `Portfolio-CMS/Blogs/${slug}`,
  PROJECT: (slug: string) => `Portfolio-CMS/Projects/${slug}`,
  LOGO: "Portfolio-CMS/Logos",
  SKILL: "Portfolio-CMS/Skills",
} as const;

/**
 * Upload a file buffer to the specified Cloudinary folder.
 * Optionally pass a publicId for named files (e.g., company logos).
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "auto",
        overwrite: true,
      },
      (error, result) => {
        if (error) reject(error);
        else
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Get the next sequential file name (001, 002, ...) for a folder.
 * Used for blog images and project thumbnails to keep things ordered.
 */
export async function getNextSequentialName(folder: string): Promise<string> {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder + "/",
      max_results: 500,
    });
    const count = result.resources.length;
    return String(count + 1).padStart(3, "0");
  } catch {
    return "001";
  }
}

export default cloudinary;
