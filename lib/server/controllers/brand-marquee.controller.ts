import * as brandMarqueeDal from "@/lib/server/dal/brand-marquee.dal";
import type { Prisma } from "@prisma/client";

export type BrandMarqueeItemDTO = {
  id: string;
  name: string;
  logoUrl?: string | null;
  color: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function formatItem(item: any): BrandMarqueeItemDTO {
  return {
    id: item.id,
    name: item.name,
    logoUrl: item.logoUrl || null,
    color: item.color || "#000000",
    linkUrl: item.linkUrl || null,
    sortOrder: item.sortOrder ?? 0,
    isActive: item.isActive ?? true,
    createdAt: item.createdAt?.toISOString?.() || new Date(item.createdAt || Date.now()).toISOString(),
    updatedAt: item.updatedAt?.toISOString?.() || new Date(item.updatedAt || Date.now()).toISOString(),
  };
}

export async function listBrandMarqueeItems(onlyActive = false) {
  const items = await brandMarqueeDal.getAllBrandMarqueeItems(onlyActive);
  return items.map(formatItem);
}

export async function getBrandMarqueeItem(id: string) {
  const item = await brandMarqueeDal.getBrandMarqueeItemById(id);
  return item ? formatItem(item) : null;
}

export async function createBrandMarqueeItem(
  data: Prisma.BrandMarqueeItemCreateInput
) {
  if (!data.name) {
    throw new Error("Brand Name is required");
  }
  const item = await brandMarqueeDal.createBrandMarqueeItem(data);
  return formatItem(item);
}

export async function updateBrandMarqueeItem(
  id: string,
  data: Prisma.BrandMarqueeItemUpdateInput
) {
  const existing = await brandMarqueeDal.getBrandMarqueeItemById(id);
  if (!existing) {
    throw new Error("Brand marquee item not found");
  }
  const updated = await brandMarqueeDal.updateBrandMarqueeItem(id, data);
  return formatItem(updated);
}

export async function deleteBrandMarqueeItem(id: string) {
  const existing = await brandMarqueeDal.getBrandMarqueeItemById(id);
  if (!existing) {
    throw new Error("Brand marquee item not found");
  }
  return brandMarqueeDal.deleteBrandMarqueeItem(id);
}

export async function seedBrandMarqueeDefaults() {
  const items = await brandMarqueeDal.seedBrandMarqueeDefaults();
  return items.map(formatItem);
}
