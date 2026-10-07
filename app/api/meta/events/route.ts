import { after, NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { money } from "@/lib/analytics";
import { getCurrentUser } from "@/lib/server/dal/auth";
import { isMetaCapiConfigured, metaRequestContext, sendMetaEvent } from "@/lib/server/meta-capi";

/**
 * First-party Meta CAPI relay. The browser sends only event metadata plus the
 * event_id it already used for the pixel; identity comes from the server
 * session, product data is re-validated against the catalog, and the Meta
 * access token never leaves the server. Purchase is deliberately not accepted
 * here — the order backend sends it from verified order state.
 */

const MAX_BODY_BYTES = 8 * 1024;
const RATE_LIMIT = { windowMs: 60_000, max: 120 };
const SITE_HOST = (() => { try { return new URL(process.env.SITE_URL || "https://www.xelectron.com").host; } catch { return ""; } })();

const contentSchema = z.object({
  id: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(999),
  item_price: z.number().min(0).max(10_000_000),
});
const customDataSchema = z.strictObject({
  content_ids: z.array(z.string().min(1).max(100)).max(50).optional(),
  content_type: z.literal("product").optional(),
  content_name: z.string().max(200).optional(),
  content_category: z.string().max(100).optional(),
  contents: z.array(contentSchema).max(50).optional(),
  num_items: z.number().int().min(0).max(9999).optional(),
  value: z.number().min(0).max(100_000_000).optional(),
  currency: z.literal("INR").optional(),
  search_string: z.string().max(100).optional(),
});
const bodySchema = z.strictObject({
  event_name: z.enum(["PageView", "ViewContent", "Search", "AddToWishlist", "AddToCart", "InitiateCheckout", "AddPaymentInfo"]),
  event_id: z.string().regex(/^[a-z]+_[A-Za-z0-9-]{8,80}$/),
  event_source_url: z.url().max(2048),
  custom_data: customDataSchema.default({}),
});
const PRODUCT_EVENTS = new Set(["ViewContent", "AddToWishlist", "AddToCart", "InitiateCheckout", "AddPaymentInfo"]);

function requestHost(request: NextRequest) {
  return request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
}

function sameOrigin(request: NextRequest) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === requestHost(request);
  } catch {
    return false;
  }
}

const buckets = new Map<string, { count: number; reset: number }>();
function rateLimited(key: string) {
  const now = Date.now();
  if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + RATE_LIMIT.windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT.max;
}

export async function POST(request: NextRequest) {
  if (!isMetaCapiConfigured()) return NextResponse.json({ ok: false, skipped: "not_configured" }, { status: 202 });
  if (!sameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });

  const context = metaRequestContext(request);
  if (rateLimited(context.ip || "unknown")) return NextResponse.json({ ok: false }, { status: 429 });

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ ok: false }, { status: 413 });
  let json: unknown;
  try { json = JSON.parse(raw); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const { event_name, event_id, event_source_url, custom_data } = parsed.data;

  // The source URL must be one of our own pages.
  const sourceHost = new URL(event_source_url).host;
  if (sourceHost !== requestHost(request) && sourceHost !== SITE_HOST) return NextResponse.json({ ok: false }, { status: 400 });

  // Rebuild product data from the catalog: unknown IDs are dropped and prices cannot exceed list price.
  let customData: Record<string, unknown> = {};
  if (PRODUCT_EVENTS.has(event_name)) {
    const requested = custom_data.contents || [];
    if (!requested.length) return NextResponse.json({ ok: false }, { status: 400 });
    const ids = [...new Set(requested.map(item => item.id))];
    const products = await db.product.findMany({ where: { id: { in: ids } }, select: { id: true, price: true } });
    const catalog = new Map<string, number>(products.map((product: { id: string; price: string }) => [product.id, money(product.price)]));
    const contents = requested
      .filter(item => catalog.has(item.id))
      .map(item => {
        const listPrice = catalog.get(item.id) || 0;
        return { id: item.id, quantity: item.quantity, item_price: listPrice ? Math.min(money(item.item_price), listPrice) : money(item.item_price) };
      });
    if (!contents.length) return NextResponse.json({ ok: false, skipped: "unknown_products" }, { status: 202 });
    customData = {
      content_ids: contents.map(item => item.id),
      content_type: "product",
      contents,
      num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
      value: money(contents.reduce((sum, item) => sum + item.item_price * item.quantity, 0)),
      currency: "INR",
      ...(contents.length === 1 && custom_data.content_name ? { content_name: custom_data.content_name } : {}),
      ...(contents.length === 1 && custom_data.content_category ? { content_category: custom_data.content_category } : {}),
    };
  } else if (event_name === "Search") {
    const term = (custom_data.search_string || "").trim();
    if (!term) return NextResponse.json({ ok: false }, { status: 400 });
    customData = { search_string: term };
  }

  // Identity comes from the server session only; raw PII from the browser is never accepted.
  const user = await getCurrentUser().catch(() => null);
  const customer = user ? { id: user.id, email: user.email, phone: user.phone, name: user.name } : {};

  after(() => sendMetaEvent({ eventName: event_name, eventId: event_id, eventSourceUrl: event_source_url, customer, context, customData }));
  return NextResponse.json({ ok: true });
}
