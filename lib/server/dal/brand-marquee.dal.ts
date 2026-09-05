import { db, createPrismaClient } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { defaultBrandMarqueeItems } from "@/lib/shared/default-brand-marquee";

function getDelegate() {
  if (db && (db as any).brandMarqueeItem) {
    return (db as any).brandMarqueeItem;
  }
  try {
    const freshClient = createPrismaClient();
    return (freshClient as any).brandMarqueeItem;
  } catch {
    return null;
  }
}

async function ensureTableExists() {
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "brand_marquee_items" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "logo_url" TEXT,
        "color" TEXT NOT NULL DEFAULT '#000000',
        "link_url" TEXT,
        "sort_order" INTEGER NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Ensure column exists for already created tables
    await db.$executeRawUnsafe(`
      ALTER TABLE "brand_marquee_items" ADD COLUMN IF NOT EXISTS "logo_url" TEXT;
    `);
  } catch {
    // Ignore errors if table creation fails or not connected
  }
}

export async function getAllBrandMarqueeItems(onlyActive = false) {
  const delegate = getDelegate();
  if (delegate && typeof delegate.findMany === "function") {
    try {
      const items = await delegate.findMany({
        where: onlyActive ? { isActive: true } : undefined,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      if (items && items.length > 0) return items;
    } catch {
      // Fallback
    }
  }

  try {
    await ensureTableExists();
    const query = onlyActive
      ? `SELECT "id", "name", "logo_url" as "logoUrl", "color", "link_url" as "linkUrl", "sort_order" as "sortOrder", "is_active" as "isActive", "created_at" as "createdAt", "updated_at" as "updatedAt" FROM "brand_marquee_items" WHERE "is_active" = true ORDER BY "sort_order" ASC, "created_at" ASC`
      : `SELECT "id", "name", "logo_url" as "logoUrl", "color", "link_url" as "linkUrl", "sort_order" as "sortOrder", "is_active" as "isActive", "created_at" as "createdAt", "updated_at" as "updatedAt" FROM "brand_marquee_items" ORDER BY "sort_order" ASC, "created_at" ASC`;

    const rawItems: any[] = await db.$queryRawUnsafe(query);
    if (rawItems && rawItems.length > 0) {
      return rawItems;
    }
  } catch {
    // Return defaults if database is not reachable or empty
  }

  return defaultBrandMarqueeItems.map((item, idx) => ({
    id: `default-${idx + 1}`,
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export async function getBrandMarqueeItemById(id: string) {
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
    await ensureTableExists();
    const raw: any[] = await db.$queryRawUnsafe(
      `SELECT "id", "name", "logo_url" as "logoUrl", "color", "link_url" as "linkUrl", "sort_order" as "sortOrder", "is_active" as "isActive", "created_at" as "createdAt", "updated_at" as "updatedAt" FROM "brand_marquee_items" WHERE "id" = $1 LIMIT 1`,
      id
    );
    return raw && raw.length > 0 ? raw[0] : null;
  } catch {
    return null;
  }
}

export async function createBrandMarqueeItem(
  data: Prisma.BrandMarqueeItemCreateInput
) {
  const delegate = getDelegate();
  if (delegate && typeof delegate.create === "function") {
    try {
      return await delegate.create({ data });
    } catch {
      // Fallback to raw SQL
    }
  }

  await ensureTableExists();
  const id = `marquee_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const name = String(data.name || "");
  const logoUrl = data.logoUrl ? String(data.logoUrl) : null;
  const color = String(data.color || "#000000");
  const linkUrl = data.linkUrl ? String(data.linkUrl) : null;
  const sortOrder = Number(data.sortOrder) || 0;
  const isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;
  const now = new Date();

  await db.$executeRawUnsafe(
    `INSERT INTO "brand_marquee_items" ("id", "name", "logo_url", "color", "link_url", "sort_order", "is_active", "created_at", "updated_at")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    id,
    name,
    logoUrl,
    color,
    linkUrl,
    sortOrder,
    isActive,
    now,
    now
  );

  return {
    id,
    name,
    logoUrl,
    color,
    linkUrl,
    sortOrder,
    isActive,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateBrandMarqueeItem(
  id: string,
  data: Prisma.BrandMarqueeItemUpdateInput
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

  await ensureTableExists();
  const existing = await getBrandMarqueeItemById(id);
  const name = data.name !== undefined ? String(data.name) : existing?.name || "";
  const logoUrl = data.logoUrl !== undefined ? (data.logoUrl ? String(data.logoUrl) : null) : existing?.logoUrl || null;
  const color = data.color !== undefined ? String(data.color) : existing?.color || "#000000";
  const linkUrl = data.linkUrl !== undefined ? (data.linkUrl ? String(data.linkUrl) : null) : existing?.linkUrl || null;
  const sortOrder = data.sortOrder !== undefined ? Number(data.sortOrder) : existing?.sortOrder || 0;
  const isActive = data.isActive !== undefined ? Boolean(data.isActive) : existing?.isActive ?? true;
  const now = new Date();

  await db.$executeRawUnsafe(
    `UPDATE "brand_marquee_items"
     SET "name" = $1, "logo_url" = $2, "color" = $3, "link_url" = $4, "sort_order" = $5, "is_active" = $6, "updated_at" = $7
     WHERE "id" = $8`,
    name,
    logoUrl,
    color,
    linkUrl,
    sortOrder,
    isActive,
    now,
    id
  );

  return {
    id,
    name,
    logoUrl,
    color,
    linkUrl,
    sortOrder,
    isActive,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
}

export async function deleteBrandMarqueeItem(id: string) {
  const delegate = getDelegate();
  if (delegate && typeof delegate.delete === "function") {
    try {
      return await delegate.delete({ where: { id } });
    } catch {
      // Fallback
    }
  }

  await ensureTableExists();
  await db.$executeRawUnsafe(
    `DELETE FROM "brand_marquee_items" WHERE "id" = $1`,
    id
  );
  return { id };
}

export async function seedBrandMarqueeDefaults() {
  await ensureTableExists();
  const delegate = getDelegate();
  if (delegate && typeof delegate.deleteMany === "function") {
    try {
      await delegate.deleteMany({});
      const created = [];
      for (const item of defaultBrandMarqueeItems) {
        const res = await delegate.create({ data: item });
        created.push(res);
      }
      return created;
    } catch {
      // Fallback
    }
  }

  await db.$executeRawUnsafe(`DELETE FROM "brand_marquee_items"`);
  const created = [];
  for (const item of defaultBrandMarqueeItems) {
    const res = await createBrandMarqueeItem(item);
    created.push(res);
  }
  return created;
}
