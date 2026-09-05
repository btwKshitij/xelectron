import { db, createPrismaClient } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

export const defaultBrandShowcaseItems = [
  {
    title: "Smart Home Cinema",
    subtitle: "Up to 300-inch 4K projection for movie nights",
    image: "/banner-projector.png",
    linkUrl: "/shop?filter=projectors",
    sortOrder: 0,
    isActive: true,
  },
  {
    title: "Ultra HD Smart TVs",
    subtitle: "Vivid color clarity and cinematic surround sound",
    image: "/hero-banner-tv.png",
    linkUrl: "/shop?filter=tv",
    sortOrder: 1,
    isActive: true,
  },
  {
    title: "Portable Projection",
    subtitle: "Rotatable angle, auto keystone & built-in apps",
    image: "/hero-banner-techno-projector.png",
    linkUrl: "/shop?filter=projectors",
    sortOrder: 2,
    isActive: true,
  },
  {
    title: "Android C9 Plus Cinema",
    subtitle: "True 1080p FHD with high lumen optical brilliance",
    image: "/hero-banner-projector-c9.png",
    linkUrl: "/shop?filter=projectors",
    sortOrder: 3,
    isActive: true,
  },
];

function getDelegate() {
  if (db && (db as any).brandShowcaseItem) {
    return (db as any).brandShowcaseItem;
  }
  try {
    const freshClient = createPrismaClient();
    return (freshClient as any).brandShowcaseItem;
  } catch {
    return null;
  }
}

export async function getAllBrandShowcaseItems(onlyActive = false) {
  const delegate = getDelegate();
  if (delegate && typeof delegate.findMany === "function") {
    try {
      const items = await delegate.findMany({
        where: onlyActive ? { isActive: true } : undefined,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
      if (items && items.length > 0) return items;
    } catch {
      // Fallback to raw SQL
    }
  }

  try {
    const query = onlyActive
      ? `SELECT "id", "title", "subtitle", "image", "link_url" as "linkUrl", "sort_order" as "sortOrder", "is_active" as "isActive", "created_at" as "createdAt", "updated_at" as "updatedAt" FROM "brand_showcase_items" WHERE "is_active" = true ORDER BY "sort_order" ASC, "created_at" DESC`
      : `SELECT "id", "title", "subtitle", "image", "link_url" as "linkUrl", "sort_order" as "sortOrder", "is_active" as "isActive", "created_at" as "createdAt", "updated_at" as "updatedAt" FROM "brand_showcase_items" ORDER BY "sort_order" ASC, "created_at" DESC`;

    const rawItems: any[] = await db.$queryRawUnsafe(query);
    if (rawItems && rawItems.length > 0) {
      return rawItems;
    }
  } catch {
    // Return defaults if database is not reachable
  }

  return defaultBrandShowcaseItems.map((item, idx) => ({
    id: `default-${idx + 1}`,
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export async function getBrandShowcaseItemById(id: string) {
  const delegate = getDelegate();
  if (delegate && typeof delegate.findUnique === "function") {
    try {
      const item = await delegate.findUnique({ where: { id } });
      if (item) return item;
    } catch {
      // Fallback
    }
  }

  try {
    const raw: any[] = await db.$queryRawUnsafe(
      `SELECT "id", "title", "subtitle", "image", "link_url" as "linkUrl", "sort_order" as "sortOrder", "is_active" as "isActive", "created_at" as "createdAt", "updated_at" as "updatedAt" FROM "brand_showcase_items" WHERE "id" = $1 LIMIT 1`,
      id
    );
    return raw && raw.length > 0 ? raw[0] : null;
  } catch {
    return null;
  }
}

export async function createBrandShowcaseItem(
  data: Prisma.BrandShowcaseItemCreateInput
) {
  const delegate = getDelegate();
  if (delegate && typeof delegate.create === "function") {
    try {
      return await delegate.create({ data });
    } catch {
      // Fallback to raw SQL
    }
  }

  const id = `showcase_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const title = String(data.title || "");
  const subtitle = String(data.subtitle || "");
  const image = String(data.image || "");
  const linkUrl = data.linkUrl ? String(data.linkUrl) : null;
  const sortOrder = Number(data.sortOrder) || 0;
  const isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;
  const now = new Date();

  await db.$executeRawUnsafe(
    `INSERT INTO "brand_showcase_items" ("id", "title", "subtitle", "image", "link_url", "sort_order", "is_active", "created_at", "updated_at")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    id,
    title,
    subtitle,
    image,
    linkUrl,
    sortOrder,
    isActive,
    now,
    now
  );

  return {
    id,
    title,
    subtitle,
    image,
    linkUrl,
    sortOrder,
    isActive,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateBrandShowcaseItem(
  id: string,
  data: Prisma.BrandShowcaseItemUpdateInput
) {
  const delegate = getDelegate();
  if (delegate && typeof delegate.update === "function") {
    try {
      return await delegate.update({
        where: { id },
        data,
      });
    } catch {
      // Fallback to raw SQL
    }
  }

  const existing = await getBrandShowcaseItemById(id);
  const title = data.title !== undefined ? String(data.title) : existing?.title || "";
  const subtitle = data.subtitle !== undefined ? String(data.subtitle) : existing?.subtitle || "";
  const image = data.image !== undefined ? String(data.image) : existing?.image || "";
  const linkUrl = data.linkUrl !== undefined ? (data.linkUrl ? String(data.linkUrl) : null) : existing?.linkUrl || null;
  const sortOrder = data.sortOrder !== undefined ? Number(data.sortOrder) : existing?.sortOrder || 0;
  const isActive = data.isActive !== undefined ? Boolean(data.isActive) : existing?.isActive ?? true;
  const now = new Date();

  await db.$executeRawUnsafe(
    `UPDATE "brand_showcase_items"
     SET "title" = $1, "subtitle" = $2, "image" = $3, "link_url" = $4, "sort_order" = $5, "is_active" = $6, "updated_at" = $7
     WHERE "id" = $8`,
    title,
    subtitle,
    image,
    linkUrl,
    sortOrder,
    isActive,
    now,
    id
  );

  return {
    id,
    title,
    subtitle,
    image,
    linkUrl,
    sortOrder,
    isActive,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
}

export async function deleteBrandShowcaseItem(id: string) {
  const delegate = getDelegate();
  if (delegate && typeof delegate.delete === "function") {
    try {
      return await delegate.delete({ where: { id } });
    } catch {
      // Fallback
    }
  }

  await db.$executeRawUnsafe(
    `DELETE FROM "brand_showcase_items" WHERE "id" = $1`,
    id
  );
  return { id };
}

export async function seedBrandShowcaseDefaults() {
  const delegate = getDelegate();
  if (delegate && typeof delegate.deleteMany === "function") {
    try {
      await delegate.deleteMany({});
      const created = [];
      for (const item of defaultBrandShowcaseItems) {
        const res = await delegate.create({ data: item });
        created.push(res);
      }
      return created;
    } catch {
      // Fallback
    }
  }

  await db.$executeRawUnsafe(`DELETE FROM "brand_showcase_items"`);
  const created = [];
  for (const item of defaultBrandShowcaseItems) {
    const res = await createBrandShowcaseItem(item);
    created.push(res);
  }
  return created;
}
