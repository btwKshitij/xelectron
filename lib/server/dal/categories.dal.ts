import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getAllCategories() {
  return db.category.findMany({
    include: {
      _count: { select: { products: true } },
      children: { select: { id: true, title: true, slug: true } },
      products: { select: { mainImage: true }, take: 1, orderBy: { createdAt: "desc" } },
    },
    orderBy: { title: "asc" },
  });
}

export async function getCategoryById(id: string) {
  return db.category.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true } },
      products: {
        include: { colors: true, features: true, specs: true },
      },
      children: true,
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: {
      _count: { select: { products: true } },
      products: {
        include: { colors: true, features: true, specs: true },
      },
      children: true,
    },
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function createCategory(
  data: Prisma.CategoryCreateInput
) {
  return db.category.create({ data });
}

export async function updateCategory(
  id: string,
  data: Prisma.CategoryUpdateInput
) {
  return db.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return db.category.delete({ where: { id } });
}

export async function deleteCategories(ids: string[], reassignProductsToId?: string) {
  return db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const categories = await transaction.category.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        title: true,
        _count: { select: { products: true } },
        children: { select: { id: true } },
      },
    });

    if (categories.length !== ids.length) {
      throw new Error("One or more selected categories no longer exist.");
    }

    const productsMoved = categories.reduce((total, category) => total + category._count.products, 0);

    if (productsMoved > 0) {
      const destinationCategory = reassignProductsToId
        ? await transaction.category.findUnique({
            where: { id: reassignProductsToId },
            select: { id: true, title: true },
          })
        : await transaction.category.findFirst({
            where: { id: { notIn: ids } },
            select: { id: true, title: true },
            orderBy: { title: "asc" },
          });

      if (!destinationCategory || ids.includes(destinationCategory.id)) {
        throw new Error("Keep one category available to receive the linked products.");
      }

      await transaction.product.updateMany({
        where: { categoryId: { in: ids } },
        data: { categoryId: destinationCategory.id },
      });
    }

    const childCategoryIds = categories
      .flatMap((category) => category.children.map((child) => child.id))
      .filter((childId) => !ids.includes(childId));

    if (childCategoryIds.length > 0) {
      await transaction.category.updateMany({
        where: { id: { in: childCategoryIds } },
        data: { parentId: null },
      });
    }

    const deletion = await transaction.category.deleteMany({ where: { id: { in: ids } } });
    return { deleted: deletion.count, productsMoved, childrenPromoted: childCategoryIds.length };
  });
}
