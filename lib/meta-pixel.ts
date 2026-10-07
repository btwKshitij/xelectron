/**
 * Meta Pixel browser layer.
 *
 * Every browser event is paired with a server-side Conversions API copy through
 * the first-party relay at /api/meta/events, using ONE shared event_id so Meta
 * deduplicates the pair. Purchase is the exception: the order backend sends it
 * from verified order state and the browser copy reuses `purchase_<orderId>`.
 *
 * The CAPI access token never reaches this file or the browser.
 */
import type { Ecommerce } from "@/lib/analytics";

export type MetaEventName =
  | "PageView" | "ViewContent" | "Search" | "AddToWishlist"
  | "AddToCart" | "InitiateCheckout" | "AddPaymentInfo" | "Purchase";

export type MetaContent = { id: string; quantity: number; item_price: number };

export type MetaCustomData = {
  content_ids?: string[];
  content_type?: "product";
  content_name?: string;
  content_category?: string;
  contents?: MetaContent[];
  num_items?: number;
  value?: number;
  currency?: "INR";
  order_id?: string;
  search_string?: string;
};

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: unknown;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
const RELAY_ENDPOINT = "/api/meta/events";
/** Query keys that are safe to include in event_source_url (never payment state, order IDs, or email). */
export const TRACKED_QUERY_KEYS = ["filter", "category", "product", "id"] as const;
/** Purchase is sent by the order backend; everything else is relayed from the browser. */
const RELAYED_EVENTS = new Set<MetaEventName>([
  "PageView", "ViewContent", "Search", "AddToWishlist", "AddToCart", "InitiateCheckout", "AddPaymentInfo",
]);

export function metaEnabled() {
  return Boolean(PIXEL_ID) && typeof window !== "undefined" && !window.location.pathname.startsWith("/dashboard");
}

export function metaEventId(prefix: string) {
  const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix.toLowerCase()}_${id}`;
}

let initialized = false;
/** Installs the official fbevents loader once (idempotent) and inits the pixel. */
function ensurePixel() {
  if (initialized) return true;
  if (!metaEnabled()) return false;
  try {
    if (!window.fbq) {
      const stub = ((...args: unknown[]) => {
        if (stub.callMethod) stub.callMethod(...args);
        else stub.queue.push(args);
      }) as Fbq;
      stub.queue = [];
      stub.push = stub;
      stub.loaded = true;
      stub.version = "2.0";
      window.fbq = stub;
      window._fbq = stub;
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
    }
    window.fbq("init", PIXEL_ID);
    initialized = true;
    return true;
  } catch {
    return false;
  }
}

/** Current page URL with only allowlisted query keys (plus fbclid, which Meta needs for click attribution). */
export function metaSourceUrl() {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  const clean = new URL(url.pathname, url.origin);
  for (const key of TRACKED_QUERY_KEYS) {
    const value = url.searchParams.get(key);
    if (value && /^[a-zA-Z0-9_-]+$/.test(value) && !url.pathname.startsWith("/checkout")) clean.searchParams.set(key, value);
  }
  const fbclid = url.searchParams.get("fbclid");
  if (fbclid && /^[A-Za-z0-9_-]{1,255}$/.test(fbclid)) clean.searchParams.set("fbclid", fbclid);
  return clean.href;
}

/** Maps the GA4 ecommerce contract onto Meta's product data contract. */
export function metaCustomData(ecommerce: Ecommerce): MetaCustomData {
  const contents = ecommerce.items.map(item => ({ id: item.item_id, quantity: item.quantity, item_price: item.price }));
  const subtotal = contents.reduce((sum, item) => sum + item.item_price * item.quantity, 0);
  const data: MetaCustomData = {
    content_ids: contents.map(item => item.id),
    content_type: "product",
    contents,
    num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
    value: ecommerce.value ?? Math.round(subtotal * 100) / 100,
    currency: "INR",
  };
  if (ecommerce.items.length === 1) {
    data.content_name = ecommerce.items[0].item_name;
    data.content_category = ecommerce.items[0].item_category;
  }
  return data;
}

function relay(body: { event_name: MetaEventName; event_id: string; event_source_url: string; custom_data: MetaCustomData }) {
  try {
    void fetch(RELAY_ENDPOINT, {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => { /* Tracking must never surface as a user-facing error. */ });
  } catch { /* fetch unavailable */ }
}

/**
 * Fires the browser pixel event and relays the same event_id to the backend.
 * Returns the event_id used, or "" when Meta tracking is disabled on this page.
 */
export function trackMeta(eventName: MetaEventName, customData: MetaCustomData = {}, options: { eventId?: string; sourceUrl?: string } = {}) {
  if (!ensurePixel()) return "";
  const eventId = options.eventId || metaEventId(eventName);
  try {
    window.fbq?.("track", eventName, customData, { eventID: eventId });
  } catch { /* pixel blocked */ }
  if (RELAYED_EVENTS.has(eventName)) {
    relay({ event_name: eventName, event_id: eventId, event_source_url: options.sourceUrl || metaSourceUrl(), custom_data: customData });
  }
  return eventId;
}
