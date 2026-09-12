export type UploadedProductImage = {
  key: string;
  url: string;
};

export type UploadProgressCallback = (
  completed: number,
  total: number,
  currentFileName: string
) => void;

export interface UploadProductImageOptions {
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
}

export async function uploadProductImage(
  file: File,
  options: UploadProductImageOptions = {}
): Promise<UploadedProductImage> {
  const { timeoutMs = 90000, retries = 2, signal } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        throw new Error("Upload was cancelled.");
      }
      signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    try {
      const formData = new FormData();
      formData.set("file", file);

      let response: Response;
      try {
        response = await fetch("/api/media", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
      } catch (fetchErr: any) {
        const isAbort = controller.signal.aborted || fetchErr?.name === "AbortError";
        if (isAbort) {
          throw new Error(
            `Upload timed out for "${file.name}". The file may be too large or the network connection is slow.`
          );
        }
        throw new Error(
          `Network connection lost while uploading "${file.name}". Please check your internet connection and try again.`
        );
      } finally {
        clearTimeout(timer);
      }

      let result: any;
      const responseText = await response.text();
      try {
        result = JSON.parse(responseText);
      } catch {
        if (!response.ok) {
          if (response.status === 413) {
            throw new Error(
              `"${file.name}" exceeds the server's maximum upload limit (50 MB).`
            );
          }
          if (response.status === 504 || response.status === 502) {
            throw new Error(
              `Upload server gateway timed out for "${file.name}". Please try again.`
            );
          }
          throw new Error(
            `Upload failed for "${file.name}" with server status ${response.status}.`
          );
        }
        throw new Error(
          `Upload response for "${file.name}" was invalid. Please try again.`
        );
      }

      if (!response.ok || !result.success || !result.data?.url || !result.data?.key) {
        throw new Error(
          result.error || `Unable to upload "${file.name}". Please try again.`
        );
      }

      return result.data as UploadedProductImage;
    } catch (err: any) {
      clearTimeout(timer);
      const isTransient =
        err?.message?.includes("Network connection lost") ||
        err?.message?.includes("timed out") ||
        err?.message?.includes("Failed to fetch") ||
        err?.name === "TypeError";

      lastError = err instanceof Error ? err : new Error(String(err));

      // Retry transient network or timeout issues with exponential delay
      if (attempt < retries && isTransient) {
        const delay = (attempt + 1) * 1200;
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }

      // If it's a permanent validation error (400, 413, invalid type), break immediately
      break;
    }
  }

  throw (
    lastError ||
    new Error(
      `Unable to upload "${file.name}". Please check your connection and try again.`
    )
  );
}

export interface UploadBatchOptions {
  concurrency?: number;
  onProgress?: UploadProgressCallback;
  signal?: AbortSignal;
}

export async function uploadProductImagesBatch(
  files: File[],
  options?: UploadBatchOptions
): Promise<UploadedProductImage[]> {
  if (files.length === 0) return [];

  const concurrency = Math.max(1, Math.min(options?.concurrency ?? 2, files.length));
  const results: UploadedProductImage[] = new Array(files.length);
  let completed = 0;
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < files.length) {
      const idx = nextIndex++;
      const currentFile = files[idx];
      options?.onProgress?.(completed, files.length, currentFile.name);

      const uploaded = await uploadProductImage(currentFile, {
        signal: options?.signal,
      });

      results[idx] = uploaded;
      completed++;
      options?.onProgress?.(completed, files.length, currentFile.name);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return results;
}

export async function deleteProductImage(keyOrUrl: string): Promise<boolean> {
  try {
    const response = await fetch("/api/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: keyOrUrl, url: keyOrUrl }),
    });
    const result = await response.json();
    return Boolean(response.ok && result.success);
  } catch {
    return false;
  }
}
