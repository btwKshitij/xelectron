import { after } from "next/server";
import { db } from "@/lib/db";
import { notifyOrderSms } from "@/lib/server/sms/notifications";
import type { Prisma } from "@prisma/client";

/**
 * Razorpay order lifecycle.
 *
 * The order row is created (status PENDING, paymentVerified false) before the
 * Razorpay popup opens, so a customer who pays and then loses the browser
 * (UPI app switch, closed tab, dropped connection) still has an order on file.
 * Either the browser's verify call or the Razorpay webhook then confirms it.
 * The PENDING -> CONFIRMED transition happens exactly once, so both paths are
 * safe to run in any order and stock is only decremented once.
 */

export const RAZORPAY_PAYMENT_NOTE = "Payment method: ONLINE_RAZORPAY";
const RAZORPAY_ORDER_NOTE_PREFIX = "Razorpay Order ID: ";

export function razorpayOrderNote(razorpayOrderId: string) {
  return `${RAZORPAY_ORDER_NOTE_PREFIX}${razorpayOrderId}`;
}

const orderInclude = {
  items: {
    include: {
      product: { select: { id: true, name: true, mainImage: true, slug: true } },
    },
  },
} satisfies Prisma.OrderInclude;

export type RazorpayOrderRecord = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

function appendNote(existing: string | null, note: string) {
  return existing ? `${existing}\n${note}` : note;
}

/** Store the Razorpay order id on the pending order so webhooks can find it. */
export async function attachRazorpayOrderId(orderId: string, razorpayOrderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, select: { internalNotes: true } });
  if (!order) return;
  await db.order.update({
    where: { id: orderId },
    data: { internalNotes: appendNote(order.internalNotes, razorpayOrderNote(razorpayOrderId)) },
  });
}

/** Cancel a pending order whose Razorpay checkout could not be started. */
export async function cancelPendingRazorpayOrder(orderId: string, reason: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, select: { status: true, internalNotes: true } });
  if (!order || order.status !== "PENDING") return;
  await db.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED", internalNotes: appendNote(order.internalNotes, reason) },
  });
}

/**
 * Locate the order for a Razorpay payment: by our order id (when the browser
 * sends it back) or by the Razorpay order id recorded in the internal notes.
 */
export async function findRazorpayOrder(
  dbOrderId?: string | null,
  razorpayOrderId?: string | null
): Promise<RazorpayOrderRecord | null> {
  if (dbOrderId) {
    const order = await db.order.findUnique({ where: { id: dbOrderId }, include: orderInclude });
    if (order && (!razorpayOrderId || order.internalNotes?.includes(razorpayOrderNote(razorpayOrderId)))) {
      return order;
    }
  }
  if (razorpayOrderId) {
    return db.order.findFirst({
      where: { internalNotes: { contains: razorpayOrderNote(razorpayOrderId) } },
      include: orderInclude,
    });
  }
  return null;
}

export type ConfirmRazorpayOrderDetails = {
  paymentId?: string | null;
  razorpayOrderId?: string | null;
  method?: string | null;
  source: "verify" | "webhook";
};

/**
 * Mark a pending order as paid exactly once. Returns `confirmed: false` when
 * the order was already confirmed by the other path (or is not pending).
 */
export async function confirmRazorpayOrder(orderId: string, details: ConfirmRazorpayOrderDetails) {
  const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: orderInclude });
    if (!order) return { found: false, confirmed: false, order: null as RazorpayOrderRecord | null };
    if (order.status !== "PENDING" || order.paymentVerified) {
      return { found: true, confirmed: false, order };
    }

    const claimed = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING", paymentVerified: false },
      data: { status: "CONFIRMED", paymentVerified: true },
    });
    if (claimed.count !== 1) {
      return { found: true, confirmed: false, order: await tx.order.findUnique({ where: { id: orderId }, include: orderInclude }) };
    }

    // Stock was checked but not reserved when the pending order was created.
    // The customer has paid, so decrement unconditionally and let admins
    // resolve any oversell manually.
    for (const item of order.items) {
      await tx.product.updateMany({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    const methodNote = details.method ? ` (Method: ${details.method.toUpperCase()})` : "";
    const orderNote = details.razorpayOrderId ? ` | Order ID: ${details.razorpayOrderId}` : "";
    const note = `Paid via Razorpay. Payment ID: ${details.paymentId || "unknown"}${orderNote}${methodNote} [confirmed by ${details.source}]`;

    const confirmed = await tx.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        paymentVerified: true,
        internalNotes: appendNote(order.internalNotes, note),
      },
      include: orderInclude,
    });
    return { found: true, confirmed: true, order: confirmed };
  });

  if (result.confirmed && result.order) {
    await notifyOrderSms(result.order.id, "paid");
  }
  return result;
}

/** Send the customer + staff confirmation email in the background. */
export function queueRazorpayOrderEmail(order: RazorpayOrderRecord) {
  after(() => import("@/lib/server/mail")
    .then(({ sendOrderConfirmationEmail }) =>
      sendOrderConfirmationEmail({
        id: order.id,
        customerName: order.customerName ?? undefined,
        customerEmail: order.customerEmail ?? undefined,
        customerPhone: order.customerPhone ?? undefined,
        shippingAddress: order.shippingAddress ?? undefined,
        city: order.city ?? undefined,
        state: order.state ?? undefined,
        pincode: order.pincode ?? undefined,
        paymentMethod: "Razorpay (Online Paid)",
        total: order.total,
        trackingNumber: order.trackingNumber ?? undefined,
        trackingUrl: order.trackingUrl ?? undefined,
        estimatedDelivery: order.estimatedDelivery ?? undefined,
        items: order.items?.map((item) => ({
          name: item.product?.name || "Product",
          quantity: item.quantity,
          price: item.unitPrice,
          unitPrice: item.unitPrice,
        })),
      })
    )
    .catch((err) => console.warn("Failed to send Razorpay order email:", err)));
}
