import * as productsDal from "@/lib/server/dal/products.dal";
import * as discountsDal from "@/lib/server/dal/discounts.dal";
import { parsePriceNumber } from "@/lib/format-price";
import type { Discount } from "@prisma/client";

// Check before payment as well as order creation; browser totals are not authoritative.
export async function validateDealCheckout(
  items: { id?: string; productId?: string; quantity?: number }[],
  total: number,
  couponCode?: string,
) {
  const now = new Date();
  const lines = await Promise.all(items.map(async (item) => {
    const id = item.productId || item.id || "";
    const product = await productsDal.getProductById(id) || await productsDal.getProductBySlug(id);
    if (!product) throw new Error("Product not found. Please refresh your cart.");
    const quantity = item.quantity ?? 1;
    if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error("Invalid product quantity");
    const deal = product.dealOfTheDay;
    const isDeal = Boolean(deal?.isActive && (!deal.endsAt || new Date(deal.endsAt) > now));
    const price = parsePriceNumber(isDeal && deal?.dealPrice ? deal.dealPrice : product.price);
    return { product, isDeal, amount: price * quantity };
  }));
  if (!lines.some((line) => line.isDeal)) return;

  const code = couponCode?.trim().toUpperCase();
  const eligible = lines.filter((line) => !line.isDeal);
  if (code && eligible.length === 0) {
    throw new Error("Coupons cannot be applied to Deal of the Day products.");
  }
  let discountAmount = 0;
  if (code) {
    const discounts: Discount[] = await discountsDal.getAllDiscounts();
    const discount = discounts.find((entry) => entry.code?.toUpperCase() === code);
    // Match the legacy coupons currently offered by checkout.
    const legacyPercent = ["WELCOME10", "XELECTRON10"].includes(code) ? 10
      : ["SAVE20", "FESTIVE20"].includes(code) ? 20 : 0;
    if (discount && (!discount.isActive || (discount.startDate && discount.startDate > now) || (discount.endDate && discount.endDate < now))) {
      throw new Error("Coupon is inactive or expired.");
    }
    if (!discount && !legacyPercent) throw new Error("Invalid coupon code.");
    const allowedIds = discount?.eligibleProductIds?.split(",").map((id) => id.trim()).filter(Boolean);
    const eligibleSubtotal = eligible.reduce((sum, line) => sum + (
      !allowedIds?.length || allowedIds.includes(line.product.id) || allowedIds.includes(line.product.slug)
        ? line.amount : 0
    ), 0);
    discountAmount = discount?.type === "FIXED_AMOUNT"
      ? Math.min(eligibleSubtotal, discount.value)
      : Math.round(eligibleSubtotal * Math.min(100, discount?.value ?? legacyPercent) / 100);
  }
  const minimumTotal = lines.reduce((sum, line) => sum + line.amount, 0) - discountAmount;
  if (!Number.isFinite(total) || total < minimumTotal - 0.01) {
    throw new Error("Deal of the Day products cannot receive extra discounts. Please refresh your cart and reapply your coupon.");
  }
}
