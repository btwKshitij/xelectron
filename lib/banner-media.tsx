import React, { useRef, useEffect } from "react";

export function isYouTubeUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
}

export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const regExp =
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=)|img\.youtube\.com\/vi\/)([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export function getYouTubeEmbedUrl(
  url?: string | null,
  autoPlay = true,
  mute = true,
  loop = true
): string {
  const ytId = extractYouTubeId(url);
  if (!ytId) return url || "";
  const params = new URLSearchParams({
    autoplay: autoPlay ? "1" : "0",
    mute: mute ? "1" : "0",
    controls: "1",
    rel: "0",
    playsinline: "1",
    enablejsapi: "1",
    cc_load_policy: "0",
    iv_load_policy: "3",
  });
  if (loop) {
    params.set("loop", "1");
    params.set("playlist", ytId);
  }
  return `https://www.youtube-nocookie.com/embed/${ytId}?${params.toString()}`;
}

export function getYouTubeThumbnail(url?: string | null): string {
  const ytId = extractYouTubeId(url);
  if (!ytId) return "";
  return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
}

export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".m4v") ||
    clean.endsWith(".mkv") ||
    clean.endsWith(".avi") ||
    clean.includes("video")
  );
}

export type BannerMediaType = "youtube" | "video" | "image" | "empty";

export function getBannerMediaType(url?: string | null): BannerMediaType {
  if (!url || !url.trim()) return "empty";
  if (isYouTubeUrl(url)) return "youtube";
  if (isVideoUrl(url)) return "video";
  return "image";
}

export function BannerMediaView({
  url,
  alt = "Banner media",
  className = "",
  videoClassName = "w-full h-full object-cover",
  iframeClassName = "w-full h-full border-0",
  imageClassName = "w-full h-full object-cover",
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  aspectRatio = "aspect-16/9",
}: {
  url?: string | null;
  alt?: string;
  className?: string;
  videoClassName?: string;
  iframeClassName?: string;
  imageClassName?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  aspectRatio?: string;
}) {
  const type = getBannerMediaType(url);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (type === "video" && videoRef.current && autoPlay) {
      videoRef.current.defaultMuted = muted;
      videoRef.current.muted = muted;
      videoRef.current.play().catch(() => {});
    }
  }, [type, autoPlay, muted, url]);

  if (type === "empty" || !url) return null;

  if (type === "youtube") {
    return (
      <div className={`relative w-full ${aspectRatio} overflow-hidden ${className}`}>
        <iframe
          src={getYouTubeEmbedUrl(url, autoPlay, muted, loop)}
          title={alt}
          className={iframeClassName}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className={`relative w-full overflow-hidden ${className}`}>
        <video
          ref={videoRef}
          src={url}
          preload="metadata"
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          controls={controls}
          className={videoClassName}
        />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={imageClassName}
      loading="lazy"
    />
  );
}
