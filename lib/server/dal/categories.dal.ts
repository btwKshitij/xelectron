import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getAllCategories() {
  try {
    return await db.category.findMany({
      include: {
        _count: { select: { products: true } },
        children: { select: { id: true, title: true, slug: true } },
        products: { select: { mainImage: true }, take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });
  } catch {
    // Gracefully handle in-memory Prisma client that hasn't reloaded sortOrder yet
    const categories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
        children: { select: { id: true, title: true, slug: true } },
        products: { select: { mainImage: true }, take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { title: "asc" },
    });

    try {
      const rawOrders: { id: string; sort_order: number }[] = await db.$queryRawUnsafe(
        'SELECT "id", "sort_order" FROM "categories"'
      );
      const orderMap = new Map(rawOrders.map((r) => [r.id, Number(r.sort_order) || 0]));
      return categories
        .map((cat: any) => ({
          ...cat,
          sortOrder: orderMap.get(cat.id) ?? 0,
        }))
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    } catch {
      return categories;
    }
  }
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
  try {
    return await db.category.create({ data });
  } catch {
    const { sortOrder, ...rest } = data as any;
    const created = await db.category.create({ data: rest });
    if (typeof sortOrder === "number") {
      await db.$executeRawUnsafe(
        'UPDATE "categories" SET "sort_order" = $1 WHERE "id" = $2',
        sortOrder,
        created.id
      ).catch(() => {});
      return { ...created, sortOrder };
    }
    return created;
  }
}

export async function updateCategory(
  id: string,
  data: Prisma.CategoryUpdateInput
) {
  try {
    return await db.category.update({ where: { id }, data });
  } catch {
    const { sortOrder, ...rest } = data as any;
    const updated = Object.keys(rest).length > 0
      ? await db.category.update({ where: { id }, data: rest })
      : await db.category.findUnique({ where: { id } });
    if (typeof sortOrder === "number") {
      await db.$executeRawUnsafe(
        'UPDATE "categories" SET "sort_order" = $1 WHERE "id" = $2',
        sortOrder,
        id
      ).catch(() => {});
      return { ...updated, sortOrder };
    }
    return updated;
  }
}

export async function reorderCategories(items: { id: string; sortOrder: number }[]) {
  try {
    return await db.$transaction(
      items.map((item) =>
        db.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
  } catch {
    // Fallback to raw SQL when running dev server has not reloaded generated Prisma client yet
    return await db.$transaction(
      items.map((item) =>
        db.$executeRawUnsafe(
          'UPDATE "categories" SET "sort_order" = $1 WHERE "id" = $2',
          item.sortOrder,
          item.id
        )
      )
    );
  }
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
