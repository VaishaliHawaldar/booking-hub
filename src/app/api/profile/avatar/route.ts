import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  AVATAR_MAX_BYTES,
  createAvatarUploadUrl,
  isAvatarContentType,
} from "@/lib/s3";

/**
 * POST /api/profile/avatar
 * Body: { contentType: string, size: number }
 * Returns a presigned S3 URL the browser can PUT the image to, plus the
 * public URL the image will be available at once uploaded.
 */
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const contentType = body?.contentType;
  const size = body?.size;

  if (!isAvatarContentType(contentType)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG or WebP images are allowed" },
      { status: 400 },
    );
  }
  if (!Number.isInteger(size) || size <= 0 || size > AVATAR_MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 5 MB or smaller" },
      { status: 400 },
    );
  }

  try {
    const result = await createAvatarUploadUrl(userId, contentType, size);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to create S3 upload URL", err);
    return NextResponse.json(
      { error: "Image upload is unavailable right now" },
      { status: 500 },
    );
  }
}
