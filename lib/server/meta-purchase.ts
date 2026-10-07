import "server-only";
import { db } from "@/lib/db";
import { money } from "@/lib/analytics";
import { isOrderPaidOrCod } from "@/lib/server/orders-filter";
import { isMetaCapiConfigured, sendMetaEvent, type MetaRequestContext } from "@/lib/server/meta-capi";

/** Written to internalNotes after a successful send so webhook retries and confirmation polling stay quiet. */
export const META_PURCHASE_MARKER = "Meta Purchase event sent";
const DEFAULT_ORIGIN = process.env.SITE_URL || "https://www.xelectron.com";

type PurchaseItem = { productId: string; quantity: number; unitPrice: number; product: { name: string; category: { title: string } | null } };

/**
 * Authoritative server-side Purchase. Safe to call from every confirmation path
 * (payment verify, webhooks, COD placement): it only sends for paid/COD orders,
 * uses the deterministic `purchase_<orderId>` event_id, and records a marker so
 * the order is reported once. Never throws.
 */
export async function sendMetaPurchase(orderId: string, context: MetaRequestContext = {}, sourcePath = "/checkout") {
  try {
    if (!orderId || !isMetaCapiConfigured()) return false;
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: { select: { name: true, category: { select: { title: true } } } } } } },
    });
    if (!order || order.status === "CANCELLED" || !isOrderPaidOrCod(order) || !order.items.length) return false;
    if (order.internalNotes?.includes(META_PURCHASE_MARKER)) return false;

    const items = order.items as PurchaseItem[];
    const contents = items.map(item => ({ id: item.productId, quantity: item.quantity, item_price: money(item.unitPrice) }));
    const origin = (context.origin || DEFAULT_ORIGIN).replace(/\/$/, "");
    const result = await sendMetaEvent({
      eventName: "Purchase",
      eventId: `purchase_${order.id}`,
      eventSourceUrl: `${origin}${sourcePath}`,
      // Meta rejects events older than 7 days; webhook-confirmed orders use their creation time when recent.
      eventTime: Math.floor(Math.max(order.createdAt.getTime(), Date.now() - 6 * 24 * 3600 * 1000) / 1000),
      context,
      customer: {
        id: order.userId,
        email: order.customerEmail,
        phone: order.customerPhone,
        name: order.customerName,
        city: order.city,
        state: order.state,
        zip: order.pincode,
        country: order.country,
      },
      customData: {
        content_ids: contents.map(item => item.id),
        content_type: "product",
        contents,
        num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
        order_id: order.id,
        value: money(order.total),
        currency: "INR",
        ...(items.length === 1 ? { content_name: items[0].product.name, content_category: items[0].product.category?.title || "Uncategorized" } : {}),
      },
    });

    if (result.ok) {
      await db.order.update({
        where: { id: order.id },
        data: { internalNotes: order.internalNotes ? `${order.internalNotes}\n${META_PURCHASE_MARKER}` : META_PURCHASE_MARKER },
      });
    }
    return result.ok;
  } catch (error) {
    // Analytics must never affect order confirmation.
    console.error(`[Meta CAPI] Purchase for order ${orderId} failed:`, error instanceof Error ? error.message : error);
    return false;
  }
}
