"use client";

import { useEffect } from "react";

export default function ChunkErrorHandler() {
  useEffect(() => {
    const handleChunkError = (text: string) => {
      if (
        text.includes("ChunkLoadError") ||
        text.includes("Failed to load chunk") ||
        text.includes("Loading chunk")
      ) {
        const lastReloadKey = "xelectron_last_chunk_reload";
        const lastReload = sessionStorage.getItem(lastReloadKey);
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem(lastReloadKey, now.toString());
          window.location.reload();
        }
      }
    };

    const onError = (e: ErrorEvent) => {
      handleChunkError(e?.message || "");
    };

    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason = String(e?.reason?.message || e?.reason || "");
      handleChunkError(reason);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
