import "server-only";
import crypto from "node:crypto";
import { money } from "@/lib/analytics";

/**
 * GA4 Measurement Protocol — server-side only, for events the browser cannot
 * emit (backend refunds). Browser ecommerce events stay on the GTM dataLayer;
 * nothing here duplicates them. The API secret never leaves the server.
 */

const MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || "";
const API_SECRET = process.env.GA4_API_SECRET || "";
const DEBUG = process.env.GA4_MP_DEBUG === "1";

export function isGa4MeasurementProtocolConfigured() {
  return Boolean(MEASUREMENT_ID && API_SECRET);
}

export type RefundOrder = {
  id: string;
  total: number;
  createdAt: Date;
  userId?: string | null;
  items: { productId: string; quantity: number; unitPrice: number; product?: { name?: string | null } | null }[];
};

/** Full refund of a paid order. Uses the original order id as transaction_id so GA4 nets it against the purchase. */
export async function sendGa4Refund(order: RefundOrder) {
  if (!isGa4MeasurementProtocolConfigured() || !order.items.length) return false;
  // A backend refund has no browser session; derive a stable client_id from the order so retries are consistent.
  const seed = crypto.createHash("sha256").update(order.id).digest();
  const clientId = `${seed.readUInt32BE(0)}.${Math.floor(order.createdAt.getTime() / 1000)}`;
  const endpoint = `https://www.google-analytics.com/${DEBUG ? "debug/" : ""}mp/collect?measurement_id=${encodeURIComponent(MEASUREMENT_ID)}&api_secret=${encodeURIComponent(API_SECRET)}`;
  const body = {
    client_id: clientId,
    ...(order.userId ? { user_id: String(order.userId) } : {}),
    non_personalized_ads: true,
    events: [{
      name: "refund",
      params: {
        engagement_time_msec: 1,
        transaction_id: order.id,
        currency: "INR",
        value: money(order.total),
        tax: 0,
        shipping: 0,
        items: order.items.map((item, index) => ({
          item_id: item.productId,
          item_name: item.product?.name || item.productId,
          price: money(item.unitPrice),
          quantity: item.quantity,
          index,
        })),
      },
    }],
  };
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    if (DEBUG) console.log("[GA4 MP] refund validation:", order.id, await response.text());
    else console.log(`[GA4 MP] refund ${order.id} status=${response.status}`);
    return response.ok;
  } catch (error) {
    console.error(`[GA4 MP] refund ${order.id} failed:`, error instanceof Error ? error.message : error);
    return false;
  }
}
