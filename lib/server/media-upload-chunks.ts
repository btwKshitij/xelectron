import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, rename, rm, readdir, stat, open } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MEDIA_CHUNK_BYTES } from "@/lib/media-upload";
import { uploadProductImage, validateProductMedia } from "@/lib/server/r2";

const root = join(tmpdir(), "xelectron-media-uploads");
const lifetime = 60 * 60 * 1000;
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
type Metadata = { name: string; type: string; size: number; expires: number };

export class MediaUploadError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

function ownerDirectory(owner: string) {
  return join(root, createHash("sha256").update(owner).digest("hex"));
}

function uploadDirectory(owner: string, id: string) {
  if (!idPattern.test(id)) throw new MediaUploadError("Invalid upload ID.");
  return join(ownerDirectory(owner), id);
}

export async function startMediaUpload(owner: string, input: unknown) {
  const value = input as Partial<Metadata> | null;
  if (!value || typeof value.name !== "string" || !value.name || value.name.length > 255 ||
      typeof value.type !== "string" || value.type.length > 100 ||
      typeof value.size !== "number" || !Number.isSafeInteger(value.size) || value.size <= 0) {
    throw new MediaUploadError("Invalid upload file details.");
  }
  const metadata: Metadata = { name: value.name, type: value.type, size: value.size, expires: Date.now() + lifetime };
  try { validateProductMedia(metadata); } catch (error) {
    throw new MediaUploadError(error instanceof Error ? error.message : "Invalid media file.");
  }

  const directory = ownerDirectory(owner);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  // Clean abandoned uploads on subsequent activity; completed results remain
  // briefly available so a lost completion response can be retried safely.
  let active = 0;
  for (const entry of await readdir(directory)) {
    if (!idPattern.test(entry)) continue;
    const path = join(directory, entry);
    const info = await stat(path).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return null; // Another request cancelled it.
      throw error;
    });
    if (!info) continue;
    if (Date.now() - info.mtimeMs > lifetime) {
      await rm(path, { recursive: true, force: true });
    } else {
      const complete = await stat(join(path, "result.json")).catch(() => null);
      if (!complete) active++;
    }
  }
  if (active >= 8) throw new MediaUploadError("Too many active uploads. Finish or cancel an upload first.", 429);
  const id = randomUUID();
  const path = uploadDirectory(owner, id);
  await mkdir(path, { mode: 0o700 });
  await writeFile(join(path, "metadata.json"), JSON.stringify(metadata));
  await writeFile(join(path, "data"), Buffer.alloc(0));
  return { id };
}

async function withUpload<T>(owner: string, id: string, action: (path: string, metadata: Metadata) => Promise<T>) {
  const path = uploadDirectory(owner, id);
  let metadata: Metadata;
  try { metadata = JSON.parse(await readFile(join(path, "metadata.json"), "utf8")); } catch {
    throw new MediaUploadError("Upload expired or was not found. Please retry.", 404);
  }
  if (metadata.expires < Date.now()) throw new MediaUploadError("Upload expired. Please retry.", 410);
  const lock = join(path, "lock");
  try { await mkdir(lock); } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new MediaUploadError("Upload is still processing. Please retry.", 409);
    }
    throw error;
  }
  try { return await action(path, metadata); } finally { await rm(lock, { recursive: true, force: true }); }
}

export async function appendMediaChunk(owner: string, id: string, offset: number, bytes: Uint8Array) {
  return withUpload(owner, id, async (path, metadata) => {
    if (!Number.isSafeInteger(offset) || offset < 0 || offset % MEDIA_CHUNK_BYTES !== 0 ||
        bytes.length !== Math.min(MEDIA_CHUNK_BYTES, metadata.size - offset) || !bytes.length) {
      throw new MediaUploadError("Invalid upload chunk size or offset.");
    }
    const file = await open(join(path, "data"), "r+");
    try {
      const { size } = await file.stat();
      if (offset > size) throw new MediaUploadError("Upload chunks must arrive in order.");
      if (offset < size) {
        const existing = Buffer.alloc(bytes.length);
        const { bytesRead } = await file.read(existing, 0, bytes.length, offset);
        if (bytesRead === bytes.length && existing.equals(Buffer.from(bytes))) return { received: size };
        // A prior interrupted write can be replaced by a retry at this offset.
        if (size >= offset + bytes.length) throw new MediaUploadError("Upload chunk conflicts with stored data.");
      }
      let written = 0;
      while (written < bytes.length) {
        const result = await file.write(bytes, written, bytes.length - written, offset + written);
        if (!result.bytesWritten) throw new Error("Unable to store upload chunk.");
        written += result.bytesWritten;
      }
      return { received: offset + bytes.length };
    } finally { await file.close(); }
  });
}

export async function finishMediaUpload(owner: string, id: string) {
  return withUpload(owner, id, async (path, metadata) => {
    const saved = await readFile(join(path, "result.json"), "utf8").catch(() => null);
    if (saved) return JSON.parse(saved) as { key: string; url: string };
    const data = await readFile(join(path, "data"));
    if (data.length !== metadata.size) throw new MediaUploadError("Upload is incomplete.");
    const result = await uploadProductImage(new File([data], metadata.name, { type: metadata.type }));
    await writeFile(join(path, "result.tmp"), JSON.stringify(result));
    await rename(join(path, "result.tmp"), join(path, "result.json"));
    await rm(join(path, "data"), { force: true });
    return result;
  });
}

export async function cancelMediaUpload(owner: string, id: string) {
  await withUpload(owner, id, async (path) => {
    // Keep the lock directory until withUpload releases it.
    await rm(join(path, "data"), { force: true });
    await rm(join(path, "metadata.json"), { force: true });
  });
  await rm(uploadDirectory(owner, id), { recursive: true, force: true });
}
