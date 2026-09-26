"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If a chunk failed to load (due to a new deployment on the server),
    // automatically hard reload the page to load fresh chunks.
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      error?.message?.includes("Failed to load chunk") ||
      error?.message?.includes("Loading chunk") ||
      error?.message?.includes("turbopack");

    if (isChunkError) {
      const lastReloadKey = "xelectron_last_chunk_reload";
      const lastReload = sessionStorage.getItem(lastReloadKey);
      const now = Date.now();
      // Avoid infinite reload loop if server is genuinely down
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(lastReloadKey, now.toString());
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-semibold text-slate-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-600">
        A new version of the website is available or an unexpected error occurred.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[#0a7ae6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0866c2]"
        >
          Reload Page
        </button>
        <button
          onClick={() => reset()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
