"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageType, trackPageView } from "@/lib/analytics";

export default function PageTracking() {
  const pathname = usePathname();
  const params = useSearchParams();
  const last = useRef("");
  // Only product/category query changes are meaningful page changes here.
  const route = `${pathname}?${["filter", "category", "product", "id"].map(key => params.get(key) || "").join("|")}`;
  useEffect(() => {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/reset-password")) return;
    let timer: ReturnType<typeof setTimeout>;
    // Wait for committed content and streamed metadata to settle.
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (last.current === route || document.visibilityState !== "visible") return;
        last.current = route;
        trackPageView(window.location.href, document.title, params.has("filter") && pathname === "/shop" ? "category" : pageType(pathname));
      }, 150);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => { clearTimeout(timer); observer.disconnect(); document.removeEventListener("visibilitychange", schedule); };
  }, [pathname, params, route]);
  return null;
}
