import { getDiscountByCode } from "@/lib/server/dal/discounts.dal";
import { calculateOrderPricing } from "@/lib/shared/order-pricing";
import { getProductById, getProductBySlug } from "@/lib/server/dal/products.dal";
import { parsePriceNumber } from "@/lib/format-price";

// Capture the coupon definition now; later edits must not rewrite order history.
export async function captureOrderPricing(order: {
  total: number; items: { productId?: string; unitPrice: number; quantity: number }[]; discountCode?: string;
}) {
  const now = new Date();
  const dealSavings = await Promise.all(order.items.map(async (item) => {
    if (!item.productId) return 0;
    const product = await getProductById(item.productId) || await getProductBySlug(item.productId);
    const deal = product?.dealOfTheDay;
    if (!product || !deal?.isActive || (deal.endsAt && new Date(deal.endsAt) <= now)) return 0;
    const dealPrice = parsePriceNumber(deal.dealPrice);
    // Only attribute savings when the saved item actually uses this deal price.
    if (dealPrice <= 0 || Math.abs(item.unitPrice - dealPrice) > 0.005) return 0;
    return Math.max(0, parsePriceNumber(product.price) - item.unitPrice) * item.quantity;
  }));
  const dealDiscountAmount = Math.round(dealSavings.reduce((sum, amount) => sum + amount, 0) * 100) / 100;
  const code = typeof order.discountCode === "string" ? order.discountCode.trim().toUpperCase() : "";
  if (!code) return { ...calculateOrderPricing(order), dealDiscountAmount };
  const discount = await getDiscountByCode(code);
  const legacyPercent = ["WELCOME10", "XELECTRON10", "SAVE10"].includes(code) ? 10
    : ["SAVE20", "FESTIVE20"].includes(code) ? 20 : undefined;
  return { ...calculateOrderPricing(order, {
    code, type: discount?.type || (legacyPercent ? "PERCENTAGE" : undefined),
    value: discount?.value ?? legacyPercent,
  }), dealDiscountAmount };
}
