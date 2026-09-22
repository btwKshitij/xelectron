import { db, createPrismaClient } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

export type VerifiedReviewEntity = {
  id: string;
  name: string;
  product: string;
  avatar: string;
  text: string;
  rating: number;
  size: "sm" | "md" | "lg";
  cardSide: "left" | "right";
  desktopTop: string;
  desktopLeft: string;
  mobileTop: string;
  mobileLeft: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const defaultVerifiedBuyerReviews = [
  {
    name: "MUSKAN A., MUMBAI",
    product: "Arc Buds",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    text: "It is actually a good product just got it and it looks amazing connectivity is good and head moving sound is good.",
    rating: 5,
    size: "md" as const,
    cardSide: "right" as const,
    desktopTop: "25%",
    desktopLeft: "28%",
    mobileTop: "18%",
    mobileLeft: "25%",
    sortOrder: 0,
    isActive: true,
  },
  {
    name: "NIKHIL G., PUNE",
    product: "Blaze B1100",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    text: "Audio output is clean and powerful. Surround effect works nicely once speakers are placed properly. Took a bit of adjustment, but after that the experience is great.",
    rating: 5,
    size: "sm" as const,
    cardSide: "right" as const,
    desktopTop: "48%",
    desktopLeft: "55%",
    mobileTop: "20%",
    mobileLeft: "75%",
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "ASIYA N., BANGALORE",
    product: "Lumex Pro",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    text: "The XElectron Lumex Pro offers great value with built-in streaming apps, autofocus, and a large projection size, making it ideal for casual movie nights in dark rooms. While the brightness and color accuracy aren't top-tier and the sound is basic, it delivers solid performance for its price.",
    rating: 5,
    size: "lg" as const,
    cardSide: "left" as const,
    desktopTop: "62%",
    desktopLeft: "82%",
    mobileTop: "50%",
    mobileLeft: "82%",
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "DAVID R., DELHI",
    product: "iProjector 3",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    text: "Reliable and consistent. XElectron keeps getting better with every generation.",
    rating: 5,
    size: "sm" as const,
    cardSide: "left" as const,
    desktopTop: "25%",
    desktopLeft: "76%",
    mobileTop: "50%",
    mobileLeft: "18%",
    sortOrder: 3,
    isActive: true,
  },
  {
    name: "TARA S., HYDERABAD",
    product: "Techno Smart",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    text: "XElectron always delivers. Sound quality and picture sharpness is just next level.",
    rating: 5,
    size: "sm" as const,
    cardSide: "right" as const,
    desktopTop: "50%",
    desktopLeft: "16%",
    mobileTop: "80%",
    mobileLeft: "18%",
    sortOrder: 4,
    isActive: true,
  },
  {
    name: "RAMKUMAR T., CHENNAI",
    product: "Blaze B2000",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    text: "Been using it daily for movies and music. No complaints at all, truly premium.",
    rating: 5,
    size: "lg" as const,
    cardSide: "right" as const,
    desktopTop: "50%",
    desktopLeft: "38%",
    mobileTop: "48%",
    mobileLeft: "50%",
    sortOrder: 5,
    isActive: true,
  },
];

let tableInitialized = false;

async function ensureTableExists() {
  if (tableInitialized) return;
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "verified_buyer_reviews" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "product" TEXT NOT NULL,
        "avatar" TEXT NOT NULL,
        "text" TEXT NOT NULL,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "size" TEXT NOT NULL DEFAULT 'md',
        "card_side" TEXT NOT NULL DEFAULT 'right',
        "desktop_top" TEXT NOT NULL DEFAULT '50%',
        "desktop_left" TEXT NOT NULL DEFAULT '50%',
        "mobile_top" TEXT NOT NULL DEFAULT '50%',
        "mobile_left" TEXT NOT NULL DEFAULT '50%',
        "sort_order" INTEGER NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "verified_buyer_reviews_is_active_sort_order_idx" 
      ON "verified_buyer_reviews"("is_active", "sort_order");
    `);
    tableInitialized = true;
  } catch {
    // Suppress if already exists or permission issues
  }
}

function getDelegate() {
  if (db && (db as any).verifiedBuyerReview) {
    return (db as any).verifiedBuyerReview;
  }
  try {
    const freshClient = createPrismaClient();
    return (freshClient as any).verifiedBuyerReview;
  } catch {
    return null;
  }
}

function mapRow(r: any): VerifiedReviewEntity {
  return {
    id: String(r.id),
    name: String(r.name || ""),
    product: String(r.product || ""),
    avatar: String(r.avatar || ""),
    text: String(r.text || ""),
    rating: Number(r.rating ?? 5),
    size: (r.size === "sm" || r.size === "lg" ? r.size : "md") as "sm" | "md" | "lg",
    cardSide: (r.card_side || r.cardSide) === "left" ? "left" : "right",
    desktopTop: String(r.desktop_top || r.desktopTop || "50%"),
    desktopLeft: String(r.desktop_left || r.desktopLeft || "50%"),
    mobileTop: String(r.mobile_top || r.mobileTop || "50%"),
    mobileLeft: String(r.mobile_left || r.mobileLeft || "50%"),
    sortOrder: Number(r.sort_order ?? r.sortOrder ?? 0),
    isActive: Boolean(r.is_active ?? r.isActive ?? true),
    createdAt: new Date(r.created_at || r.createdAt || Date.now()),
    updatedAt: new Date(r.updated_at || r.updatedAt || Date.now()),
  };
}

export async function getAllVerifiedReviews(onlyActive = false): Promise<VerifiedReviewEntity[]> {
  await ensureTableExists();

  const delegate = getDelegate();
  if (delegate && typeof delegate.findMany === "function") {
    try {
      const items = await delegate.findMany({
        where: onlyActive ? { isActive: true } : undefined,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
      if (items) {
        return items.map(mapRow);
      }
    } catch {
      // Fall back to raw SQL
    }
  }

  try {
    const query = onlyActive
      ? `SELECT * FROM "verified_buyer_reviews" WHERE "is_active" = true ORDER BY "sort_order" ASC, "created_at" DESC`
      : `SELECT * FROM "verified_buyer_reviews" ORDER BY "sort_order" ASC, "created_at" DESC`;

    const rawRows: any[] = await db.$queryRawUnsafe(query);
    if (rawRows) {
      return rawRows.map(mapRow);
    }
  } catch {
    // Database query failed
  }

  // Reading reviews must never reset saved reviews when none are active or
  // when the database is temporarily unavailable. Seeding is an admin action.
  return [];
}

export async function getVerifiedReviewById(id: string): Promise<VerifiedReviewEntity | null> {
  await ensureTableExists();

  const delegate = getDelegate();
  if (delegate && typeof delegate.findUnique === "function") {
    try {
      const item = await delegate.findUnique({ where: { id } });
      if (item) return mapRow(item);
    } catch {
      // Fallback
    }
  }

  try {
    const raw: any[] = await db.$queryRawUnsafe(
      `SELECT * FROM "verified_buyer_reviews" WHERE "id" = $1 LIMIT 1`,
      id
    );
    return raw && raw.length > 0 ? mapRow(raw[0]) : null;
  } catch {
    return null;
  }
}

export async function createVerifiedReview(data: {
  name: string;
  product: string;
  avatar: string;
  text: string;
  rating?: number;
  size?: "sm" | "md" | "lg";
  cardSide?: "left" | "right";
  desktopTop?: string;
  desktopLeft?: string;
  mobileTop?: string;
  mobileLeft?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<VerifiedReviewEntity> {
  await ensureTableExists();

  const id = `rev_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const name = String(data.name || "").trim();
  const product = String(data.product || "").trim();
  const avatar = String(data.avatar || "").trim();
  const text = String(data.text || "").trim();
  const rating = typeof data.rating === "number" ? Math.max(1, Math.min(5, data.rating)) : 5;
  const size = data.size === "sm" || data.size === "lg" ? data.size : "md";
  const cardSide = data.cardSide === "left" ? "left" : "right";
  const desktopTop = data.desktopTop || "50%";
  const desktopLeft = data.desktopLeft || "50%";
  const mobileTop = data.mobileTop || "50%";
  const mobileLeft = data.mobileLeft || "50%";
  const sortOrder = typeof data.sortOrder === "number" ? data.sortOrder : 0;
  const isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;
  const now = new Date();

  const delegate = getDelegate();
  if (delegate && typeof delegate.create === "function") {
    try {
      const created = await delegate.create({
        data: {
          id,
          name,
          product,
          avatar,
          text,
          rating,
          size,
          cardSide,
          desktopTop,
          desktopLeft,
          mobileTop,
          mobileLeft,
          sortOrder,
          isActive,
        },
      });
      return mapRow(created);
    } catch {
      // Fall back to raw SQL
    }
  }

  await db.$executeRawUnsafe(
    `INSERT INTO "verified_buyer_reviews" (
      "id", "name", "product", "avatar", "text", "rating", "size", "card_side",
      "desktop_top", "desktop_left", "mobile_top", "mobile_left",
      "sort_order", "is_active", "created_at", "updated_at"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    id,
    name,
    product,
    avatar,
    text,
    rating,
    size,
    cardSide,
    desktopTop,
    desktopLeft,
    mobileTop,
    mobileLeft,
    sortOrder,
    isActive,
    now,
    now
  );

  return {
    id,
    name,
    product,
    avatar,
    text,
    rating,
    size,
    cardSide,
    desktopTop,
    desktopLeft,
    mobileTop,
    mobileLeft,
    sortOrder,
    isActive,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateVerifiedReview(
  id: string,
  data: Partial<{
    name: string;
    product: string;
    avatar: string;
    text: string;
    rating: number;
    size: "sm" | "md" | "lg";
    cardSide: "left" | "right";
    desktopTop: string;
    desktopLeft: string;
    mobileTop: string;
    mobileLeft: string;
    sortOrder: number;
    isActive: boolean;
  }>
): Promise<VerifiedReviewEntity> {
  await ensureTableExists();

  const delegate = getDelegate();
  if (delegate && typeof delegate.update === "function") {
    try {
      const updated = await delegate.update({
        where: { id },
        data,
      });
      return mapRow(updated);
    } catch {
      // Fall back
    }
  }

  const existing = await getVerifiedReviewById(id);
  const name = data.name !== undefined ? String(data.name) : existing?.name || "";
  const product = data.product !== undefined ? String(data.product) : existing?.product || "";
  const avatar = data.avatar !== undefined ? String(data.avatar) : existing?.avatar || "";
  const text = data.text !== undefined ? String(data.text) : existing?.text || "";
  const rating = data.rating !== undefined ? Number(data.rating) : existing?.rating ?? 5;
  const size = data.size !== undefined ? data.size : existing?.size || "md";
  const cardSide = data.cardSide !== undefined ? data.cardSide : existing?.cardSide || "right";
  const desktopTop = data.desktopTop !== undefined ? data.desktopTop : existing?.desktopTop || "50%";
  const desktopLeft = data.desktopLeft !== undefined ? data.desktopLeft : existing?.desktopLeft || "50%";
  const mobileTop = data.mobileTop !== undefined ? data.mobileTop : existing?.mobileTop || "50%";
  const mobileLeft = data.mobileLeft !== undefined ? data.mobileLeft : existing?.mobileLeft || "50%";
  const sortOrder = data.sortOrder !== undefined ? Number(data.sortOrder) : existing?.sortOrder || 0;
  const isActive = data.isActive !== undefined ? Boolean(data.isActive) : existing?.isActive ?? true;
  const now = new Date();

  await db.$executeRawUnsafe(
    `UPDATE "verified_buyer_reviews" SET
      "name" = $1,
      "product" = $2,
      "avatar" = $3,
      "text" = $4,
      "rating" = $5,
      "size" = $6,
      "card_side" = $7,
      "desktop_top" = $8,
      "desktop_left" = $9,
      "mobile_top" = $10,
      "mobile_left" = $11,
      "sort_order" = $12,
      "is_active" = $13,
      "updated_at" = $14
     WHERE "id" = $15`,
    name,
    product,
    avatar,
    text,
    rating,
    size,
    cardSide,
    desktopTop,
    desktopLeft,
    mobileTop,
    mobileLeft,
    sortOrder,
    isActive,
    now,
    id
  );

  return {
    id,
    name,
    product,
    avatar,
    text,
    rating,
    size,
    cardSide,
    desktopTop,
    desktopLeft,
    mobileTop,
    mobileLeft,
    sortOrder,
    isActive,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
}

export async function deleteVerifiedReview(id: string): Promise<{ id: string }> {
  await ensureTableExists();

  const delegate = getDelegate();
  if (delegate && typeof delegate.delete === "function") {
    try {
      await delegate.delete({ where: { id } });
      return { id };
    } catch {
      // Fall back
    }
  }

  await db.$executeRawUnsafe(`DELETE FROM "verified_buyer_reviews" WHERE "id" = $1`, id);
  return { id };
}

export async function seedVerifiedReviewsDefaults(): Promise<VerifiedReviewEntity[]> {
  await ensureTableExists();

  const delegate = getDelegate();
  if (delegate && typeof delegate.deleteMany === "function") {
    try {
      await delegate.deleteMany({});
      const createdItems: VerifiedReviewEntity[] = [];
      for (const item of defaultVerifiedBuyerReviews) {
        const res = await delegate.create({ data: item });
        createdItems.push(mapRow(res));
      }
      return createdItems;
    } catch {
      // Fall back
    }
  }

  await db.$executeRawUnsafe(`DELETE FROM "verified_buyer_reviews"`);
  const createdItems: VerifiedReviewEntity[] = [];
  for (const item of defaultVerifiedBuyerReviews) {
    const res = await createVerifiedReview(item);
    createdItems.push(res);
  }
  return createdItems;
}
