export function getCategoryFallbackImage(slug?: string, title?: string): string {
  const normalized = `${slug || ""} ${title || ""}`.toLowerCase();
  if (normalized.includes("frame") || normalized.includes("photo") || normalized.includes("dpf")) {
    return "/category-frame.png";
  }
  if (normalized.includes("tv") || normalized.includes("television") || normalized.includes("display")) {
    return "/category-tv.png";
  }
  if (normalized.includes("projector")) {
    return "/category-projector.png";
  }
  if (
    normalized.includes("headphone") ||
    normalized.includes("audio") ||
    normalized.includes("earbud") ||
    normalized.includes("soundbar")
  ) {
    return "/category-headphones.png";
  }
  if (normalized.includes("speaker")) {
    return "/category-speaker.png";
  }
  if (normalized.includes("camera") || normalized.includes("dashcam")) {
    return "/category-camera.png";
  }
  if (normalized.includes("phone") || normalized.includes("smartphone")) {
    return "/category-smartphone.png";
  }
  if (normalized.includes("laptop")) {
    return "/category-laptop.png";
  }
  if (normalized.includes("monitor")) {
    return "/category-monitor.png";
  }
  if (normalized.includes("accessori")) {
    return "/category-accessories.png";
  }
  return "/category-smartphone.png";
}

export function resolveCategoryImage(image?: string | null, slug?: string, title?: string): string {
  const fallback = getCategoryFallbackImage(slug, title);
  if (!image || typeof image !== "string" || image.trim() === "") {
    return fallback;
  }
  const cleanImage = image.trim();
  if (
    cleanImage.includes("xelectron.com/wp-content") ||
    cleanImage.startsWith("http://") ||
    cleanImage.startsWith("https://")
  ) {
    return fallback;
  }
  return cleanImage;
}
