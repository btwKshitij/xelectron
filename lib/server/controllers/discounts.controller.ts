import type { DiscountType } from "@prisma/client";

import * as discountsDal from "@/lib/server/dal/discounts.dal";

type CreateDiscountInput = {
  code?: string | null;
  type?: DiscountType;
  value?: number;
  appliesTo?: string;
  eligibleProductIds?: string | string[] | null;
  eligibleCategoryIds?: string | string[] | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
};

export function listDiscounts() {
  return discountsDal.getAllDiscounts();
}

export async function createDiscount(input: CreateDiscountInput) {
  const code = input.code?.trim().toUpperCase() || null;
  const value = Number(input.value);

  if (!input.type || !Number.isFinite(value) || value <= 0) {
    throw new Error("Enter a valid discount value");
  }
  if (input.type === "PERCENTAGE" && value > 100) {
    throw new Error("Percentage discounts cannot exceed 100%");
  }
  if (code) {
    const existing = await discountsDal.getDiscountByCode(code);
    if (existing) throw new Error("This discount code already exists");
  }

  const eligibleProductIds = Array.isArray(input.eligibleProductIds)
    ? input.eligibleProductIds.join(",")
    : input.eligibleProductIds || null;

  const eligibleCategoryIds = Array.isArray(input.eligibleCategoryIds)
    ? input.eligibleCategoryIds.join(",")
    : input.eligibleCategoryIds || null;

  return discountsDal.createDiscount({
    code,
    type: input.type,
    value,
    appliesTo: input.appliesTo || (eligibleProductIds ? "SPECIFIC_PRODUCTS" : "ALL_PRODUCTS"),
    eligibleProductIds,
    eligibleCategoryIds,
    startDate: input.startDate ? new Date(input.startDate) : new Date(),
    endDate: input.endDate ? new Date(input.endDate) : null,
    isActive: input.isActive ?? true,
  });
}

export function deleteDiscount(id: string) {
  return discountsDal.deleteDiscount(id);
}
