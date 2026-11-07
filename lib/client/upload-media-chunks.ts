import { MEDIA_CHUNK_BYTES } from "@/lib/media-upload";
import type { UploadedProductImage, UploadProductImageOptions } from "./upload-product-image";

class ChunkRequestError extends Error {
  constructor(message: string, public retryable: boolean) { super(message); }
}

export async function uploadMediaInChunks(file: File, options: UploadProductImageOptions): Promise<UploadedProductImage> {
  const { timeoutMs = 300000, retries = 2, signal, onProgress } = options;

  async function request<T>(query: string, body?: BodyInit, json = false): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      if (signal?.aborted) throw new Error("Upload was cancelled.");
      const controller = new AbortController();
      const abort = () => controller.abort();
      signal?.addEventListener("abort", abort, { once: true });
      const timer = setTimeout(abort, timeoutMs);
      try {
        const response = await fetch(`/api/media/chunks${query}`, {
          method: "POST",
          headers: { "Content-Type": json ? "application/json" : "application/octet-stream" },
          body,
          signal: controller.signal,
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success) {
          throw new ChunkRequestError(
            result?.error || `Upload failed for "${file.name}" (HTTP ${response.status}).`,
            response.status === 409 || response.status === 429 || response.status >= 500
          );
        }
        return result.data as T;
      } catch (error) {
        if (signal?.aborted) throw new Error("Upload was cancelled.");
        const retryable = error instanceof ChunkRequestError ? error.retryable : true;
        if (attempt >= retries || !retryable) {
          if (controller.signal.aborted) throw new Error(`Upload timed out for "${file.name}". Please retry.`);
          throw error;
        }
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
      }
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1200));
    }
  }

  const { id } = await request<{ id: string }>("", JSON.stringify({ name: file.name, type: file.type, size: file.size }), true);
  const uploadId = encodeURIComponent(id);
  try {
    for (let offset = 0; offset < file.size; offset += MEDIA_CHUNK_BYTES) {
      const end = Math.min(offset + MEDIA_CHUNK_BYTES, file.size);
      await request(`?action=chunk&id=${uploadId}&offset=${offset}`, file.slice(offset, end));
      onProgress?.(Math.min(99, Math.round(end / file.size * 100)), end, file.size);
    }
    const result = await request<UploadedProductImage>(`?action=complete&id=${uploadId}`);
    if (!result?.key || !result?.url) throw new Error("Upload returned an invalid media URL.");
    onProgress?.(100, file.size, file.size);
    return result;
  } catch (error) {
    // A separate short-lived signal permits cleanup after user cancellation.
    await fetch(`/api/media/chunks?action=cancel&id=${uploadId}`, {
      method: "POST", signal: AbortSignal.timeout(5000),
    }).catch(() => undefined);
    throw error;
  }
}
