import "server-only";

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const maxProductImageSize = 50 * 1024 * 1024; // 50 MB max
const allowedImageTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
  "video/x-matroska",
  "video/x-msvideo",
  "video/avi",
  "video/3gpp",
  "video/x-flv",
  "video/mpeg",
]);

const allowedExtensions = new Set([
  "png", "jpg", "jpeg", "webp", "gif", "svg", "avif",
  "mp4", "webm", "mov", "ogg", "mkv", "avi", "m4v", "flv", "3gp", "ts"
]);

export function getR2PublicBaseUrl(): string {
  const url = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-71e14405ed4a425db543797ffb54d14a.r2.dev";
  return url.replace(/\/+$/, "");
}

export function extractR2Key(keyOrUrl?: string | null): string | null {
  if (!keyOrUrl || typeof keyOrUrl !== "string") return null;
  const trimmed = keyOrUrl.trim();
  if (!trimmed) return null;

  // If it's a YouTube embed or external URL (not R2), ignore
  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) return null;

  // Proxied URL format: /api/media/products/...
  if (trimmed.startsWith("/api/media/")) {
    return trimmed.replace(/^\/api\/media\//, "");
  }

  // Public R2 dev / custom domain format: https://pub-xxx.r2.dev/products/...
  const publicBase = getR2PublicBaseUrl();
  if (trimmed.startsWith(publicBase)) {
    return trimmed.slice(publicBase.length).replace(/^\/+/, "");
  }

  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname.includes("r2.dev") || parsed.hostname.includes("cloudflarestorage.com")) {
        return parsed.pathname.replace(/^\/+/, "");
      }
    } catch {}
  }

  // Direct key format: products/...
  if (trimmed.startsWith("products/")) {
    return trimmed;
  }

  return null;
}

function inferMimeType(fileName: string, fallbackType: string): string {
  if (fallbackType && fallbackType !== "application/octet-stream") return fallbackType;
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "mp4":
    case "m4v":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    case "ogg":
      return "video/ogg";
    case "mkv":
      return "video/x-matroska";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "avif":
      return "image/avif";
    default:
      return fallbackType || "application/octet-stream";
  }
}

let r2Client: S3Client | undefined;

function requiredEnvironment(name: "R2_ACCOUNT_ID" | "R2_ACCESS_KEY_ID" | "R2_SECRET_ACCESS_KEY" | "R2_BUCKET_NAME") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export function getR2BucketName() {
  return requiredEnvironment("R2_BUCKET_NAME");
}

export function getR2Client() {
  if (r2Client) return r2Client;

  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${requiredEnvironment("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requiredEnvironment("R2_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnvironment("R2_SECRET_ACCESS_KEY"),
    },
  });
  return r2Client;
}

function safeFileName(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^[-.]+|[-.]+$)/g, "");
  return cleaned || "product-image";
}

export async function uploadProductImage(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const isAllowed = allowedImageTypes.has(file.type) || allowedExtensions.has(ext);

  if (!isAllowed) {
    throw new Error("Choose a valid image (PNG, JPG, WebP, GIF) or video (MP4, WebM, MOV).");
  }

  if (file.size === 0) {
    throw new Error("The selected file is empty (0 bytes).");
  }

  if (file.size > maxProductImageSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Media file is ${sizeMB} MB. Maximum allowed size is 50 MB.`);
  }

  const contentType = inferMimeType(file.name, file.type);
  const key = `products/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  
  await getR2Client().send(new PutObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));

  const publicBase = getR2PublicBaseUrl();
  const url = publicBase ? `${publicBase}/${key}` : `/api/media/${key}`;

  return { key, url };
}

export async function getProductMedia(key: string, range?: string) {
  return getR2Client().send(new GetObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
    ...(range ? { Range: range } : {}),
  }));
}

export async function deleteProductMedia(keyOrUrl?: string | null) {
  const key = extractR2Key(keyOrUrl);
  if (!key) return false;

  try {
    await getR2Client().send(new DeleteObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }));
    return true;
  } catch (error) {
    console.error(`Failed to delete R2 object for key "${key}":`, error);
    return false;
  }
}

export async function deleteMultipleProductMedia(keysOrUrls: (string | null | undefined)[]) {
  const keys = keysOrUrls
    .map(extractR2Key)
    .filter((k): k is string => typeof k === "string" && k.length > 0);

  if (keys.length === 0) return;

  await Promise.allSettled(
    keys.map(async (key) => {
      try {
        await getR2Client().send(new DeleteObjectCommand({
          Bucket: getR2BucketName(),
          Key: key,
        }));
      } catch (err) {
        console.error(`Failed to batch-delete R2 object "${key}":`, err);
      }
    })
  );
}

