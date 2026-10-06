import { db } from "@/lib/db";
import { analyticsItem, money, type Purchase } from "@/lib/analytics";
import { isOrderPaidOrCod } from "@/lib/server/orders-filter";

/** Called only by authenticated/verified order confirmation handlers. Never returns PII. */
export async function getPurchaseAnalytics(orderId: string, coupon = ""): Promise<Purchase | null> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: { select: { id: true, name: true, category: { select: { title: true } } } } } } },
    });
    if (!order || order.status === "CANCELLED" || !isOrderPaidOrCod(order)) return null;
    return {
      transaction_id: order.id,
      currency: "INR",
      value: money(order.total),
      // Checkout currently uses free shipping and has no separately recorded tax.
      shipping: 0,
      coupon: (/^[A-Za-z0-9_-]{1,100}$/.test(coupon) ? coupon : "") || order.internalNotes?.match(/^Coupon applied: ([A-Za-z0-9_-]+)$/m)?.[1] || "",
      items: order.items.map((item: { productId: string; unitPrice: number; quantity: number; product: { name: string; category: { title: string } | null } }) => analyticsItem({
        id: item.productId,
        name: item.product.name,
        category: item.product.category?.title || "Uncategorized",
        price: item.unitPrice,
        quantity: item.quantity,
      })),
    };
  } catch {
    // Tracking lookup must not turn a successfully paid order into a failed checkout.
    return null;
  }
}
