export function getYouTubeId(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.split("/")[1];
    if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
      id = url.pathname === "/watch"
        ? url.searchParams.get("v")
        : /^\/(shorts|embed|live|v)\//.test(url.pathname)
          ? url.pathname.split("/")[2]
          : null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function extractYouTubeThumbnail(value: string): string {
  const id = getYouTubeId(value);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : value.trim();
}

export function getInstagramPostUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (!["https:", "http:"].includes(url.protocol)) return null;
    if (!["instagram.com", "www.instagram.com", "m.instagram.com"].includes(url.hostname)) return null;
    const match = url.pathname.match(/^\/(?:[\w.]+\/)?(p|reel|reels|tv)\/([\w-]+)\/?$/);
    return match ? `https://www.instagram.com/p/${match[2]}/` : null;
  } catch {
    return null;
  }
}

export function thumbnailForVideoChange(previousVideo: string, thumbnail: string, nextVideo: string): string {
  const previousId = getYouTubeId(previousVideo);
  const nextId = getYouTubeId(nextVideo);
  let generatedThumbnail = !thumbnail.trim() || thumbnail.trim() === previousVideo.trim();
  try {
    const url = new URL(thumbnail);
    generatedThumbnail ||= !!previousId && ["img.youtube.com", "i.ytimg.com"].includes(url.hostname)
      && url.pathname.split("/")[2] === previousId;
  } catch { /* Custom local image paths stay unchanged. */ }
  if (!generatedThumbnail) return thumbnail;
  return nextId ? `https://img.youtube.com/vi/${nextId}/hqdefault.jpg` : "";
}
