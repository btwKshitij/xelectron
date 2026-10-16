export type OrderPricing = {
  version: 1;
  subtotal: number;
  discountAmount: number;
  discountCode: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "UNRECORDED" | "NONE";
  discountValue: number | null;
  // Deal savings are already included in subtotal (the saved item prices).
  dealDiscountAmount?: number;
  shippingAmount: number | null;
  additionalAmount: number;
  inferred: boolean;
};

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function getDiscountRows(pricing: OrderPricing) {
  const rows: { label: string; amount: number }[] = [];
  if ((pricing.dealDiscountAmount ?? 0) > 0) {
    rows.push({ label: "Deal of the Day discount", amount: pricing.dealDiscountAmount! });
  }
  if (pricing.discountAmount > 0) {
    rows.push({ label: pricing.discountCode ? `Coupon discount (${pricing.discountCode})` : "Discount (source not recorded)", amount: pricing.discountAmount });
  }
  return rows;
}

export function calculateOrderPricing(
  order: { total: number; items: { unitPrice: number; quantity: number }[]; internalNotes?: string | null },
  coupon?: { code: string; type?: "PERCENTAGE" | "FIXED_AMOUNT"; value?: number },
  historical = false,
): OrderPricing {
  const subtotal = money(order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
  const difference = money(subtotal - order.total);
  const discountAmount = Math.max(0, difference);
  const code = coupon?.code || order.internalNotes?.match(/(?:^|\n)Coupon applied:\s*([A-Za-z0-9_-]+)/i)?.[1] || null;
  return {
    version: 1, subtotal, discountAmount,
    discountCode: discountAmount > 0 ? code : null,
    discountType: discountAmount > 0 ? coupon?.type || "UNRECORDED" : "NONE",
    discountValue: discountAmount > 0 ? coupon?.value ?? null : null,
    shippingAmount: historical || difference < 0 ? null : 0,
    additionalAmount: Math.max(0, -difference), inferred: historical,
  };
}

export function getOrderPricing(order: {
  total: number; items: { unitPrice: number; quantity: number }[];
  internalNotes?: string | null; pricingSummary?: OrderPricing | null;
}): OrderPricing {
  return order.pricingSummary?.version === 1 ? order.pricingSummary : calculateOrderPricing(order, undefined, true);
}
