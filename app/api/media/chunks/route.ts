import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";
import { MEDIA_CHUNK_BYTES } from "@/lib/media-upload";
import { startMediaUpload, appendMediaChunk, finishMediaUpload, cancelMediaUpload, MediaUploadError } from "@/lib/server/media-upload-chunks";

export const runtime = "nodejs";
export const maxDuration = 300;

async function boundedBody(request: Request, limit: number) {
  const reader = request.body?.getReader();
  if (!reader) throw new MediaUploadError("Missing upload data.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new MediaUploadError("Upload request is too large.", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    const params = new URL(request.url).searchParams;
    const id = params.get("id");
    const action = params.get("action") || "start";
    if (action === "start") {
      let body: unknown;
      try { body = JSON.parse((await boundedBody(request, 4096)).toString("utf8")); } catch (error) {
        if (error instanceof MediaUploadError) throw error;
        throw new MediaUploadError("Invalid upload details.");
      }
      return NextResponse.json({ success: true, data: await startMediaUpload(user.id, body) }, { status: 201 });
    }
    if (!id) throw new MediaUploadError("Missing upload ID.");
    if (action === "complete") return NextResponse.json({ success: true, data: await finishMediaUpload(user.id, id) });
    if (action === "chunk") {
      const offset = params.get("offset");
      if (!offset || !/^\d+$/.test(offset)) throw new MediaUploadError("Missing or invalid chunk offset.");
      const data = await appendMediaChunk(user.id, id, Number(offset), await boundedBody(request, MEDIA_CHUNK_BYTES));
      return NextResponse.json({ success: true, data });
    }
    if (action !== "cancel") throw new MediaUploadError("Invalid upload action.");
    await cancelMediaUpload(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError || error instanceof MediaUploadError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error("Chunked media upload failed:", error);
    return NextResponse.json({ success: false, error: "Unable to process the upload. Please retry." }, { status: 500 });
  }
}

