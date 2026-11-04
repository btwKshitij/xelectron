"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const CreatorVideos = dynamic(() => import("./creator-videos-section"), {
  ssr: false,
  loading: () => <div className="h-[640px]" aria-hidden="true" />,
});

export default function LazyCreatorVideos() {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setReady(true);
        observer.disconnect();
      }
    }, { rootMargin: "400px" });
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={container}>{ready ? <CreatorVideos /> : <div className="h-[640px]" aria-hidden="true" />}</div>;
}
