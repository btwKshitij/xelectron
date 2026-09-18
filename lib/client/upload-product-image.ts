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
  onProgress?: (percent: number, loaded: number, total: number) => void;
}

function uploadWithXHR(
  file: File,
  timeoutMs: number,
  signal?: AbortSignal,
  onProgress?: (percent: number, loaded: number, total: number) => void
): Promise<UploadedProductImage> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.set("file", file);

    xhr.open("POST", "/api/media");
    xhr.timeout = timeoutMs;

    if (signal) {
      if (signal.aborted) {
        return reject(new Error("Upload was cancelled."));
      }
      signal.addEventListener(
        "abort",
        () => {
          xhr.abort();
          reject(new Error("Upload was cancelled."));
        },
        { once: true }
      );
    }

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
          onProgress(percent, e.loaded, e.total);
        }
      };
    }

    xhr.onload = () => {
      let result: any;
      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        if (xhr.status === 413) {
          return reject(
            new Error(
              `"${file.name}" exceeds maximum allowed upload size (250 MB for video / 50 MB for image).`
            )
          );
        }
        return reject(
          new Error(
            `Upload failed for "${file.name}" with server status ${xhr.status}.`
          )
        );
      }

      if (xhr.status >= 200 && xhr.status < 300 && result?.success && result?.data?.url) {
        onProgress?.(100, file.size, file.size);
        return resolve(result.data as UploadedProductImage);
      }

      reject(
        new Error(
          result?.error || `Unable to upload "${file.name}". Please try again.`
        )
      );
    };

    xhr.onerror = () => {
      reject(
        new Error(
          `Network connection lost while uploading "${file.name}". Please check your connection and try again.`
        )
      );
    };

    xhr.ontimeout = () => {
      reject(
        new Error(
          `Upload timed out for "${file.name}". The file may be too large or the network connection is slow.`
        )
      );
    };

    xhr.send(formData);
  });
}

export async function uploadProductImage(
  file: File,
  options: UploadProductImageOptions = {}
): Promise<UploadedProductImage> {
  const { timeoutMs = 300000, retries = 2, signal, onProgress } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal?.aborted) {
      throw new Error("Upload was cancelled.");
    }

    try {
      if (typeof window !== "undefined" && typeof XMLHttpRequest !== "undefined" && onProgress) {
        return await uploadWithXHR(file, timeoutMs, signal, onProgress);
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      if (signal) {
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
                `"${file.name}" exceeds the server's maximum upload limit (250 MB for video / 50 MB for image).`
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

        onProgress?.(100, file.size, file.size);
        return result.data as UploadedProductImage;
      } catch (err: any) {
        clearTimeout(timer);
        throw err;
      }
    } catch (err: any) {
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
