const STORAGE_KEY = "xelectron-recently-viewed-products";
const UPDATED_EVENT = "xelectron-recently-viewed-updated";
const MAX_RECENT_PRODUCTS = 8;

export function getRecentlyViewedProductIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewedProduct(productId: string) {
  if (typeof window === "undefined" || !productId) return;

  const ids = [productId, ...getRecentlyViewedProductIds().filter((id) => id !== productId)]
    .slice(0, MAX_RECENT_PRODUCTS);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(UPDATED_EVENT));
  } catch {
    // Browsers can block local storage in private or restricted contexts.
  }
}

export const recentlyViewedProductsUpdatedEvent = UPDATED_EVENT;
