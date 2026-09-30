import "server-only";
import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * S3 access for profile images. Only ever imported on the server, so AWS
 * credentials never reach the browser — the client gets a short-lived
 * presigned URL and uploads the file directly to S3.
 *
 * Required environment variables:
 *   - AWS_REGION             bucket region, e.g. ap-south-1
 *   - AWS_S3_BUCKET          bucket name
 *   - AWS_ACCESS_KEY_ID      IAM credentials with s3:PutObject on the bucket
 *   - AWS_SECRET_ACCESS_KEY  (picked up automatically by the AWS SDK)
 * Optional:
 *   - AWS_S3_PUBLIC_URL      base URL objects are served from (e.g. a
 *                            CloudFront domain). Defaults to the bucket's
 *                            virtual-hosted S3 URL.
 */

export const AVATAR_CONTENT_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type AvatarContentType = keyof typeof AVATAR_CONTENT_TYPES;

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const PRESIGNED_URL_TTL_SECONDS = 60;

const s3 = new S3Client({ region: process.env.AWS_REGION });

function requireBucket(): string {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET is not configured");
  }
  return bucket;
}

/** Base URL that uploaded objects are publicly readable from. */
export function getPublicBaseUrl(): string {
  const configured = process.env.AWS_S3_PUBLIC_URL;
  if (configured) return configured.replace(/\/+$/, "");
  return `https://${requireBucket()}.s3.${process.env.AWS_REGION}.amazonaws.com`;
}

export function isAvatarContentType(value: unknown): value is AvatarContentType {
  return typeof value === "string" && Object.hasOwn(AVATAR_CONTENT_TYPES, value);
}

function avatarKeyPrefix(userId: string): string {
  // Auth0 subjects look like "auth0|abc123" — keep keys URL/path friendly.
  return `avatars/${userId.replace(/[^a-zA-Z0-9_-]/g, "_")}/`;
}

/** True if `url` points at an avatar uploaded by this user via this app. */
export function isOwnAvatarUrl(userId: string, url: string): boolean {
  return url.startsWith(`${getPublicBaseUrl()}/${avatarKeyPrefix(userId)}`);
}

/**
 * Creates a presigned PUT URL for a new avatar image. Content type and length
 * are part of the signature, so S3 rejects an upload that doesn't match what
 * was validated here.
 */
export async function createAvatarUploadUrl(
  userId: string,
  contentType: AvatarContentType,
  contentLength: number,
): Promise<{ uploadUrl: string; fileUrl: string }> {
  const key = `${avatarKeyPrefix(userId)}${randomUUID()}.${AVATAR_CONTENT_TYPES[contentType]}`;

  const command = new PutObjectCommand({
    Bucket: requireBucket(),
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: PRESIGNED_URL_TTL_SECONDS,
    // Not signed by default — without this the client could upload any type.
    signableHeaders: new Set(["content-type"]),
  });

  return { uploadUrl, fileUrl: `${getPublicBaseUrl()}/${key}` };
}
