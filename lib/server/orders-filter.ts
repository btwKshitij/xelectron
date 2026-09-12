/**
 * Centralized filter utilities for Orders.
 *
 * Store Business Rule:
 * An order ONLY belongs in the primary "Orders" section if:
 * 1. It is PAID (paymentVerified === true), OR
 * 2. It is CASH ON DELIVERY (COD).
 *
 * Unpaid online checkout attempts (e.g. unverified Velocity BNPL or incomplete card/UPI)
 * must NOT appear in the Orders section. They are treated as abandoned checkouts.
 */

export function isOrderPaidOrCod(order: {
  status?: string | null;
  paymentVerified?: boolean | null;
  shippingAddress?: string | null;
  internalNotes?: string | null;
}): boolean {
  // 1. If payment is verified, it is a valid paid order
  if (order.paymentVerified === true) {
    return true;
  }

  // 2. Any order in confirmed, processing, shipped or delivered status
  const status = (order.status || "").toUpperCase();
  if (["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(status)) {
    return true;
  }

  // 3. If it is Cash on Delivery, it is a valid placed order awaiting payment on delivery
  const address = order.shippingAddress || "";
  const notes = order.internalNotes || "";

  const isCod =
    /\[Payment:\s*COD/i.test(address) ||
    /Payment method:\s*COD/i.test(notes) ||
    /\bCOD\b/i.test(notes);

  return isCod;
}

/**
 * Prisma WHERE clause filter to query only orders that are Paid, Confirmed, or COD.
 */
export const paidOrCodOrderPrismaFilter = {
  OR: [
    { paymentVerified: true },
    { status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as any } },
    { shippingAddress: { contains: "[Payment: COD", mode: "insensitive" as const } },
    { shippingAddress: { contains: "COD Verified", mode: "insensitive" as const } },
    { internalNotes: { contains: "Payment method: COD", mode: "insensitive" as const } },
    { internalNotes: { contains: "COD", mode: "insensitive" as const } },
  ],
};
