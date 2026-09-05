import type { DiscountType } from "@prisma/client";

import { db } from "@/lib/db";

export type CreateDiscountInput = {
  code?: string | null;
  type: DiscountType;
  value: number;
  appliesTo?: string;
  eligibleProductIds?: string | null;
  eligibleCategoryIds?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  isActive?: boolean;
};

export function getAllDiscounts() {
  return db.discount.findMany({ orderBy: { createdAt: "desc" } });
}

export function getDiscountByCode(code: string) {
  return db.discount.findUnique({ where: { code } });
}

export function createDiscount(data: CreateDiscountInput) {
  return db.discount.create({
    data: {
      code: data.code ? data.code.trim().toUpperCase() : null,
      type: data.type,
      value: data.value,
      appliesTo: data.appliesTo || "ALL_PRODUCTS",
      eligibleProductIds: data.eligibleProductIds || null,
      eligibleCategoryIds: data.eligibleCategoryIds || null,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : null,
      isActive: data.isActive ?? true,
    },
  });
}

export async function incrementDiscountUsage(code: string) {
  try {
    const formattedCode = code.trim().toUpperCase();
    const existing = await db.discount.findFirst({
      where: {
        OR: [{ code: formattedCode }, { id: code }],
      },
    });
    if (existing) {
      return db.discount.update({
        where: { id: existing.id },
        data: { usageCount: { increment: 1 } },
      });
    }
  } catch (error) {
    console.error("Failed to increment discount usage:", error);
  }
}

export function deleteDiscount(id: string) {
  return db.discount.delete({ where: { id } });
}
