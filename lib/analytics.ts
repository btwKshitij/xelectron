/** Platform-neutral GTM contract. Only allowlisted measurement fields leave the app. */
export type AnalyticsProduct = {
  id: string;
  name: string;
  price: string | number;
  category: string;
  quantity?: number;
  brand?: string;
  variant?: string;
  oldPrice?: string | number | null;
};

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_category: string;
  price: number;
  quantity: number;
  item_brand?: string;
  item_variant?: string;
  discount?: number;
  item_list_id?: string;
  item_list_name?: string;
  index?: number;
  google_business_vertical: "retail";
};

export type Ecommerce = {
  items: AnalyticsItem[];
  currency?: "INR";
  value?: number;
  coupon?: string;
  shipping_tier?: string;
  payment_type?: string;
  transaction_id?: string;
  tax?: number;
  shipping?: number;
  item_list_id?: string;
  item_list_name?: string;
};

export type Purchase = Ecommerce & { transaction_id: string; currency: "INR"; value: number };
type EcommerceEvent = "view_item_list" | "select_item" | "view_item" | "add_to_cart" | "view_cart" | "remove_from_cart" | "begin_checkout" | "add_shipping_info" | "add_payment_info" | "add_to_wishlist" | "purchase";

declare global {
  interface Window { dataLayer: unknown[] }
}

export function money(value: string | number | null | undefined): number {
  const number = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) ? Math.round(Math.max(0, number) * 100) / 100 : 0;
}

export function analyticsItem(product: AnalyticsProduct, index?: number, listId?: string, listName?: string): AnalyticsItem {
  const price = money(product.price);
  const oldPrice = money(product.oldPrice);
  return {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    price,
    quantity: Math.max(1, Math.trunc(product.quantity ?? 1)),
    ...(product.brand ? { item_brand: product.brand } : {}),
    ...(product.variant ? { item_variant: product.variant } : {}),
    ...(oldPrice > price ? { discount: money(oldPrice - price) } : {}),
    ...(index !== undefined ? { index } : {}),
    ...(listId ? { item_list_id: listId, item_list_name: listName } : {}),
    google_business_vertical: "retail",
  };
}

function push(value: unknown) {
  if (typeof window === "undefined" || window.location.pathname.startsWith("/dashboard")) return false;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(value);
    return true;
  } catch { return false; } // Analytics must never break a business action.
}

export function trackEcommerce(event: EcommerceEvent, ecommerce: Ecommerce) {
  if (ecommerce.items.some(item => !item.item_id || !item.item_name || !item.item_category || !Number.isFinite(item.price) || !Number.isInteger(item.quantity) || item.quantity < 1)) return false;
  if (ecommerce.value !== undefined && (!Number.isFinite(ecommerce.value) || !ecommerce.currency)) return false;
  push({ ecommerce: null });
  return push({ event, ecommerce });
}

export function cartEcommerce(products: AnalyticsProduct[], extra: Partial<Ecommerce> = {}): Ecommerce {
  const items = products.map(product => analyticsItem(product));
  return { currency: "INR", value: money(items.reduce((sum, item) => sum + item.price * item.quantity, 0)), ...extra, items };
}

export function cartChanges(previous: AnalyticsProduct[], current: AnalyticsProduct[]) {
  const added: AnalyticsProduct[] = [];
  const removed: AnalyticsProduct[] = [];
  for (const item of current) {
    const change = (item.quantity ?? 1) - (previous.find(old => old.id === item.id)?.quantity ?? 0);
    if (change > 0) added.push({ ...item, quantity: change });
  }
  for (const item of previous) {
    const change = (item.quantity ?? 1) - (current.find(next => next.id === item.id)?.quantity ?? 0);
    if (change > 0) removed.push({ ...item, quantity: change });
  }
  return { added, removed };
}

const purchases = new Set<string>();
export function rememberOrderContext(orderId: string, products: AnalyticsProduct[], coupon = "") {
  if (!orderId || typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(`xelectron-order-context:${orderId}`, JSON.stringify({
      coupon: /^[A-Za-z0-9_-]{1,100}$/.test(coupon) ? coupon : "",
      variants: products.filter(item => item.variant).map(item => ({ id: item.id, variant: item.variant })),
    }));
  } catch { /* Optional selected options; backend revenue remains authoritative. */ }
}

export async function trackPurchase(purchase?: Purchase | null) {
  if (!purchase?.transaction_id || !purchase.items.length || typeof window === "undefined") return;
  const send = () => {
    const key = `xelectron-purchase:${purchase.transaction_id}`;
    if (purchases.has(key)) return;
    try { if (window.localStorage.getItem(key)) return; } catch { /* memory fallback */ }
    let payload = purchase;
    try {
      const context = JSON.parse(window.sessionStorage.getItem(`xelectron-order-context:${purchase.transaction_id}`) || "null") as { coupon: string; variants: { id: string; variant: string }[] } | null;
      if (context) payload = {
        ...purchase,
        coupon: purchase.coupon || context.coupon,
        items: purchase.items.map(item => {
          const selected = context.variants.find(option => option.id === item.item_id);
          return selected ? { ...item, item_variant: selected.variant } : item;
        }),
      };
    } catch { /* A redirect may return in a different tab without session context. */ }
    if (!trackEcommerce("purchase", payload)) return;
    purchases.add(key);
    try { window.localStorage.setItem(key, "1"); } catch { /* storage may be disabled */ }
  };
  // Serialize confirmations from multiple tabs as well as refreshes/revisits.
  try {
    if (navigator.locks) await navigator.locks.request(`purchase:${purchase.transaction_id}`, send);
    else send();
  } catch { send(); }
}

export function safeSearchTerm(term: string) {
  return term.trim().slice(0, 100).replace(/\S+@\S+\.\S+/g, "[redacted]").replace(/(?:\+?\d[\s().-]*){7,}/g, "[redacted]");
}

export function trackSearch(term: string) {
  const search_term = safeSearchTerm(term);
  if (search_term) push({ event: "search", search_term });
}

export function trackPromotion(id: string, name: string, slot: string, creative?: string) {
  push({ ecommerce: null });
  push({ event: "select_promotion", ecommerce: { promotion_id: id, promotion_name: name, creative_slot: slot, ...(creative ? { creative_name: creative } : {}) } });
}

export function trackBulkLead() {
  push({ event: "generate_lead", lead_type: "bulk_order", form_name: "Corporate Procurement Enquiry", page_type: "bulk_orders" });
}

export function pageType(path: string) {
  if (path === "/") return "home";
  if (path.startsWith("/product")) return "product";
  if (path.startsWith("/shop")) return "shop";
  if (path.includes("velocity-callback")) return "confirmation";
  if (path.startsWith("/checkout")) return "checkout";
  if (path.startsWith("/bulk-order")) return "bulk_orders";
  return "content";
}

export function trackPageView(location: string, title: string, type: string) {
  const url = new URL(location);
  // Do not expose payment return state, order IDs, email, or other query data.
  const clean = new URL(url.pathname, url.origin);
  for (const key of ["filter", "category", "product", "id"]) {
    const value = url.searchParams.get(key);
    if (value && /^[a-zA-Z0-9_-]+$/.test(value) && !url.pathname.startsWith("/checkout")) clean.searchParams.set(key, value);
  }
  push({ event: "page_view", page_location: clean.href, page_title: title, page_type: type });
}
