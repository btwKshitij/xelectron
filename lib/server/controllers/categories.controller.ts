import * as categoriesDal from "@/lib/server/dal/categories.dal";
import type { Prisma } from "@prisma/client";

// ─── List ────────────────────────────────────────────────────────────────────

export async function listCategories() {
  return categoriesDal.getAllCategories();
}

// ─── Get One ─────────────────────────────────────────────────────────────────

export async function getCategory(idOrSlug: string) {
  const byId = await categoriesDal.getCategoryById(idOrSlug);
  if (byId) return byId;
  return categoriesDal.getCategoryBySlug(idOrSlug);
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createCategory(data: Prisma.CategoryCreateInput) {
  if (!data.title || !data.slug) {
    throw new Error("Missing required fields: title, slug");
  }

  const existing = await categoriesDal.getCategoryBySlug(data.slug);
  if (existing) {
    throw new Error(`Category with slug "${data.slug}" already exists`);
  }

  return categoriesDal.createCategory(data);
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateCategory(
  id: string,
  data: Prisma.CategoryUpdateInput
) {
  const existing = await categoriesDal.getCategoryById(id);
  if (!existing) {
    throw new Error("Category not found");
  }
  return categoriesDal.updateCategory(id, data);
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteCategory(id: string) {
  const existing = await categoriesDal.getCategoryById(id);
  if (!existing) {
    throw new Error("Category not found");
  }

  // Keep direct deletion consistent with the bulk action: linked products are
  // moved to an available category before the source category is removed.
  return categoriesDal.deleteCategories([id]);
}

export async function deleteCategories(ids: string[], reassignProductsToId?: string) {
  const uniqueIds = [...new Set(ids.filter((id) => typeof id === "string" && id.trim()))];

  if (uniqueIds.length === 0) {
    throw new Error("Select at least one category to delete.");
  }

  return categoriesDal.deleteCategories(uniqueIds, reassignProductsToId);
}
