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
  paymentVerified?: boolean | null;
  shippingAddress?: string | null;
  internalNotes?: string | null;
}): boolean {
  // 1. If payment is verified, it is a valid paid order
  if (order.paymentVerified === true) {
    return true;
  }

  // 2. If it is Cash on Delivery, it is a valid placed order awaiting payment on delivery
  const address = order.shippingAddress || "";
  const notes = order.internalNotes || "";

  const isCod =
    /\[Payment:\s*COD/i.test(address) ||
    /Payment method:\s*COD/i.test(notes) ||
    /\bCOD\b/i.test(notes);

  return isCod;
}

/**
 * Prisma WHERE clause filter to query only orders that are Paid or COD.
 */
export const paidOrCodOrderPrismaFilter = {
  OR: [
    { paymentVerified: true },
    { shippingAddress: { contains: "[Payment: COD", mode: "insensitive" as const } },
    { shippingAddress: { contains: "COD Verified", mode: "insensitive" as const } },
    { internalNotes: { contains: "Payment method: COD", mode: "insensitive" as const } },
    { internalNotes: { contains: "COD", mode: "insensitive" as const } },
  ],
};
