import * as brandShowcaseDal from "@/lib/server/dal/brand-showcase.dal";
import type { Prisma } from "@prisma/client";

export type BrandShowcaseItemDTO = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function formatItem(item: any): BrandShowcaseItemDTO {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    image: item.image,
    linkUrl: item.linkUrl,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    createdAt: item.createdAt?.toISOString?.() || new Date(item.createdAt || Date.now()).toISOString(),
    updatedAt: item.updatedAt?.toISOString?.() || new Date(item.updatedAt || Date.now()).toISOString(),
  };
}

export async function listBrandShowcaseItems(onlyActive = false) {
  const items = await brandShowcaseDal.getAllBrandShowcaseItems(onlyActive);
  return items.map(formatItem);
}

export async function getBrandShowcaseItem(id: string) {
  const item = await brandShowcaseDal.getBrandShowcaseItemById(id);
  return item ? formatItem(item) : null;
}

export async function createBrandShowcaseItem(
  data: Prisma.BrandShowcaseItemCreateInput
) {
  if (!data.title || !data.image) {
    throw new Error("Title and Image are required");
  }
  const item = await brandShowcaseDal.createBrandShowcaseItem(data);
  return formatItem(item);
}

export async function updateBrandShowcaseItem(
  id: string,
  data: Prisma.BrandShowcaseItemUpdateInput
) {
  const existing = await brandShowcaseDal.getBrandShowcaseItemById(id);
  if (!existing) {
    throw new Error("Brand showcase item not found");
  }
  const updated = await brandShowcaseDal.updateBrandShowcaseItem(id, data);
  return formatItem(updated);
}

export async function deleteBrandShowcaseItem(id: string) {
  const existing = await brandShowcaseDal.getBrandShowcaseItemById(id);
  if (!existing) {
    throw new Error("Brand showcase item not found");
  }
  return brandShowcaseDal.deleteBrandShowcaseItem(id);
}

export async function seedBrandShowcaseDefaults() {
  const items = await brandShowcaseDal.seedBrandShowcaseDefaults();
  return items.map(formatItem);
}
