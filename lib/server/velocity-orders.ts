import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

function appendPaymentNote(existingNotes: string | null, note: string) {
  return existingNotes ? `${existingNotes}\n${note}` : note;
}

/**
 * Records a verified Velocity payment exactly once. The conditional status
 * transition makes webhook retries safe and prevents stock being decremented
 * more than once.
 */
export async function confirmVelocityOrder(orderId: string, paymentId?: string) {
  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return { found: false, confirmed: false, order: null };
    if (order.status !== "PENDING") {
      return { found: true, confirmed: false, order };
    }

    for (const item of order.items) {
      const stockUpdate = await tx.product.updateMany({
        where: { id: item.productId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });

      if (stockUpdate.count !== 1) {
        throw new Error(`Insufficient stock for Velocity order ${orderId}`);
      }
    }

    const note = paymentId
      ? `Velocity payment confirmed: ${paymentId}`
      : "Velocity payment confirmed";
    const confirmedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        internalNotes: appendPaymentNote(order.internalNotes, note),
      },
    });

    return { found: true, confirmed: true, order: confirmedOrder };
  });
}

/** Records a terminal payment failure without cancelling an already-paid order. */
export async function cancelVelocityOrder(orderId: string, paymentId?: string) {
  const note = paymentId
    ? `Velocity payment failed: ${paymentId}`
    : "Velocity payment failed";

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PENDING") return { found: Boolean(order), cancelled: false };

  await db.order.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      internalNotes: appendPaymentNote(order.internalNotes, note),
    },
  });

  return { found: true, cancelled: true };
}
