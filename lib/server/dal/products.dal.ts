import { db } from "@/lib/db";
import { deleteMultipleProductMedia } from "@/lib/server/r2";

// ─── Include Helpers ──────────────────────────────────────────────────────────

const fullProductInclude = {
  colors: true,
  variants: { orderBy: { sortOrder: "asc" as const } },
  features: true,
  specs: true,
  faqs: true,
  banners: { orderBy: { sortOrder: "asc" as const } },
  media: { orderBy: { sortOrder: "asc" as const } },
  category: { select: { id: true, title: true, slug: true } },
  dealOfTheDay: true,
  creatorVideos: { orderBy: { sortOrder: "asc" as const } },
};

const baseProductInclude = {
  colors: true,
  features: true,
  specs: true,
  media: { orderBy: { sortOrder: "asc" as const } },
  category: { select: { id: true, title: true, slug: true } },
  dealOfTheDay: true,
};

export async function syncProductVariants(
  productId: string,
  variants?: { name: string; sku?: string; price?: string; stock?: number; colorHex?: string; image?: string; sortOrder?: number }[]
) {
  if (variants === undefined) return;
  try {
    if (db.productVariant) {
      await db.productVariant.deleteMany({ where: { productId } });
      const validVariants = variants.filter((v) => v && v.name && v.name.trim());
      if (validVariants.length > 0) {
        await db.productVariant.createMany({
          data: validVariants.map((v, idx) => ({
            productId,
            name: v.name.trim(),
            sku: v.sku?.trim() || null,
            price: v.price ? String(v.price).trim() : null,
            stock: typeof v.stock === "number" ? v.stock : 0,
            colorHex: v.colorHex?.trim() || null,
            image: v.image?.trim() || null,
            sortOrder: typeof v.sortOrder === "number" ? v.sortOrder : idx,
          })),
        });
      }
    }
  } catch (err) {
    console.error("Failed to sync product variants:", err);
  }
}

export async function syncProductColors(
  productId: string,
  colors?: { name: string; bgHex: string; borderHex?: string | null }[]
) {
  if (colors === undefined) return;
  try {
    if (db.productColor) {
      await db.productColor.deleteMany({ where: { productId } });
      const validColors = colors.filter((c) => c && c.name && c.name.trim());
      if (validColors.length > 0) {
        await db.productColor.createMany({
          data: validColors.map((c) => ({
            productId,
            name: c.name.trim(),
            bgHex: c.bgHex?.trim() || "#000000",
            borderHex: c.borderHex?.trim() || null,
          })),
        });
      }
    }
  } catch (err) {
    console.error("Failed to sync product colors:", err);
  }
}

export async function syncProductFaqs(
  productId: string,
  faqs?: { question: string; answer: string }[]
) {
  if (!faqs) return;
  try {
    if (db.productFaq) {
      await db.productFaq.deleteMany({ where: { productId } });
      const validFaqs = faqs.filter((f) => f.question?.trim() || f.answer?.trim());
      if (validFaqs.length > 0) {
        await db.productFaq.createMany({
          data: validFaqs.map((f) => ({
            productId,
            question: f.question.trim(),
            answer: f.answer.trim(),
          })),
        });
      }
      return;
    }
  } catch {}

  try {
    await db.$executeRawUnsafe(`DELETE FROM "product_faqs" WHERE "product_id" = $1`, productId);
    const validFaqs = faqs.filter((f) => f.question?.trim() || f.answer?.trim());
    for (const f of validFaqs) {
      const id = `faq_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      await db.$executeRawUnsafe(
        `INSERT INTO "product_faqs" ("id", "question", "answer", "product_id") VALUES ($1, $2, $3, $4)`,
        id,
        f.question.trim(),
        f.answer.trim(),
        productId
      );
    }
  } catch {}
}

export async function syncProductBanners(
  productId: string,
  banners?: { imageUrl: string; mobileImageUrl?: string | null; title?: string | null; sortOrder?: number }[]
) {
  if (!banners) return;
  try {
    if (db.productBanner) {
      await db.productBanner.deleteMany({ where: { productId } });
      const validBanners = banners.filter((b) => b.imageUrl?.trim());
      if (validBanners.length > 0) {
        await db.productBanner.createMany({
          data: validBanners.map((b, idx) => ({
            productId,
            imageUrl: b.imageUrl.trim(),
            mobileImageUrl: b.mobileImageUrl?.trim() || null,
            title: b.title?.trim() || null,
            sortOrder: typeof b.sortOrder === "number" ? b.sortOrder : idx,
          })),
        });
      }
      return;
    }
  } catch {}

  try {
    await db.$executeRawUnsafe(`DELETE FROM "product_banners" WHERE "product_id" = $1`, productId);
    const validBanners = banners.filter((b) => b.imageUrl?.trim());
    for (let idx = 0; idx < validBanners.length; idx++) {
      const b = validBanners[idx];
      const id = `bnr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const sortOrder = typeof b.sortOrder === "number" ? b.sortOrder : idx;
      await db.$executeRawUnsafe(
        `INSERT INTO "product_banners" ("id", "image_url", "mobile_image_url", "title", "sort_order", "created_at", "product_id") VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
        id,
        b.imageUrl.trim(),
        b.mobileImageUrl?.trim() || null,
        b.title?.trim() || null,
        sortOrder,
        productId
      );
    }
  } catch {}
}

export async function syncProductCreatorVideos(
  productId: string,
  creatorVideos?: { title?: string | null; thumbnailUrl: string; videoUrl?: string | null; sortOrder?: number; isActive?: boolean }[]
) {
  if (creatorVideos === undefined) return;

  // Step 1: Delete ONLY product videos (is_product_video=true) for this product.
  // Use raw SQL to guarantee we never accidentally delete homepage creator videos.
  try {
    await db.$executeRawUnsafe(
      `DELETE FROM "creator_videos" WHERE "product_id" = $1 AND "is_product_video" = true`,
      productId
    );
  } catch {
    // If the column doesn't exist yet, delete by product_id only as last resort
    try {
      await db.$executeRawUnsafe(
        `DELETE FROM "creator_videos" WHERE "product_id" = $1`,
        productId
      );
    } catch {}
  }

  // Step 2: Insert new product videos with is_product_video=true, using raw SQL
  // to guarantee the flag is always set correctly.
  const validVideos = (creatorVideos || []).filter((v) => v && (v.thumbnailUrl?.trim() || v.videoUrl?.trim() || v.title?.trim()));
  for (let idx = 0; idx < validVideos.length; idx++) {
    const v = validVideos[idx]!;
    try {
      await db.$executeRawUnsafe(
        `INSERT INTO "creator_videos" ("id", "product_id", "title", "thumbnail_url", "video_url", "is_product_video", "sort_order", "is_active", "created_at", "updated_at")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, true, $5, $6, now(), now())`,
        productId,
        v.title?.trim() || null,
        v.thumbnailUrl?.trim() || "/creator-projector.png",
        v.videoUrl?.trim() || null,
        typeof v.sortOrder === "number" ? v.sortOrder : idx,
        v.isActive ?? true
      );
    } catch (insertErr) {
      // Fallback: try with cuid-style id
      try {
        const cuid = `cv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        await db.$executeRawUnsafe(
          `INSERT INTO "creator_videos" ("id", "product_id", "title", "thumbnail_url", "video_url", "is_product_video", "sort_order", "is_active", "created_at", "updated_at")
           VALUES ($1, $2, $3, $4, $5, true, $6, $7, now(), now())`,
          cuid,
          productId,
          v.title?.trim() || null,
          v.thumbnailUrl?.trim() || "/creator-projector.png",
          v.videoUrl?.trim() || null,
          typeof v.sortOrder === "number" ? v.sortOrder : idx,
          v.isActive ?? true
        );
      } catch (e2) {
        console.error("Failed to insert product video:", e2);
      }
    }
  }
}

async function loadMissingFaqsAndBanners(productId: string) {
  let faqs: any[] = [];
  let banners: any[] = [];
  let creatorVideos: any[] = [];
  let variants: any[] = [];

  try {
    if (db.productVariant) {
      variants = await db.productVariant.findMany({ where: { productId }, orderBy: { sortOrder: "asc" } });
    }
  } catch {}

  try {
    if (db.productFaq) {
      faqs = await db.productFaq.findMany({ where: { productId } });
    } else {
      faqs = await db.$queryRawUnsafe(`SELECT * FROM "product_faqs" WHERE "product_id" = $1`, productId);
    }
  } catch {}

  try {
    if (db.productBanner) {
      banners = await db.productBanner.findMany({ where: { productId }, orderBy: { sortOrder: "asc" } });
    } else {
      const rows = await db.$queryRawUnsafe(`SELECT * FROM "product_banners" WHERE "product_id" = $1 ORDER BY "sort_order" ASC`, productId);
      banners = Array.isArray(rows)
        ? rows.map((r: any) => ({
            id: r.id,
            imageUrl: r.image_url || r.imageUrl,
            mobileImageUrl: r.mobile_image_url || r.mobileImageUrl,
            title: r.title,
            sortOrder: r.sort_order ?? r.sortOrder ?? 0,
            productId: r.product_id || r.productId,
          }))
        : [];
    }
  } catch {}

  try {
    const rows: any[] = await db.$queryRawUnsafe(
      `SELECT * FROM "creator_videos" WHERE "product_id" = $1 AND "is_product_video" = true ORDER BY "sort_order" ASC`,
      productId
    );
    creatorVideos = Array.isArray(rows)
      ? rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          thumbnailUrl: r.thumbnail_url || r.thumbnailUrl,
          videoUrl: r.video_url || r.videoUrl,
          productId: r.product_id || r.productId,
          isProductVideo: true,
          sortOrder: r.sort_order ?? r.sortOrder ?? 0,
          isActive: r.is_active ?? r.isActive ?? true,
          createdAt: r.created_at || r.createdAt,
          updatedAt: r.updated_at || r.updatedAt,
        }))
      : [];
  } catch {
    // Fallback if is_product_video column doesn't exist
    try {
      if (db.creatorVideo) {
        creatorVideos = await db.creatorVideo.findMany({ where: { productId }, orderBy: { sortOrder: "asc" } });
      }
    } catch {}
  }

  return { faqs, banners, creatorVideos, variants };
}

async function safeFindMany(args: any) {
  try {
    return await db.product.findMany({ ...args, include: fullProductInclude });
  } catch (error: any) {
    try {
      const results = await db.product.findMany({ ...args, include: baseProductInclude });
      return await Promise.all(
        results.map(async (r: any) => {
          const extra = await loadMissingFaqsAndBanners(r.id);
          return {
            ...r,
            faqs: r.faqs ?? extra.faqs,
            banners: r.banners ?? extra.banners,
            creatorVideos: r.creatorVideos ?? extra.creatorVideos,
            variants: r.variants ?? extra.variants,
          };
        })
      );
    } catch {
      return await db.product.findMany({ ...args });
    }
  }
}

async function safeFindUnique(args: any) {
  try {
    return await db.product.findUnique({ ...args, include: fullProductInclude });
  } catch (error: any) {
    try {
      const result = await db.product.findUnique({ ...args, include: baseProductInclude });
      if (!result) return null;
      const extra = await loadMissingFaqsAndBanners(result.id);
      return {
        ...result,
        faqs: (result as any).faqs ?? extra.faqs,
        banners: (result as any).banners ?? extra.banners,
        creatorVideos: (result as any).creatorVideos ?? extra.creatorVideos,
        variants: (result as any).variants ?? extra.variants,
      };
    } catch {
      return await db.product.findUnique({ ...args });
    }
  }
}

async function safeFindFirst(args: any) {
  try {
    return await db.product.findFirst({ ...args, include: fullProductInclude });
  } catch (error: any) {
    try {
      const result = await db.product.findFirst({ ...args, include: baseProductInclude });
      if (!result) return null;
      const extra = await loadMissingFaqsAndBanners(result.id);
      return {
        ...result,
        faqs: (result as any).faqs ?? extra.faqs,
        banners: (result as any).banners ?? extra.banners,
        creatorVideos: (result as any).creatorVideos ?? extra.creatorVideos,
        variants: (result as any).variants ?? extra.variants,
      };
    } catch {
      return await db.product.findFirst({ ...args });
    }
  }
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getAllProducts() {
  return safeFindMany({
    orderBy: { createdAt: "desc" },
  });
}

/** Products explicitly chosen in the dashboard to appear in the home carousel. */
export async function getBestSellerProducts() {
  return safeFindMany({
    where: { showInBestSellers: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function countNavbarProducts(excludeProductId?: string) {
  return db.product.count({
    where: {
      showInNavbar: true,
      ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
    },
  });
}

export async function countWarrantyMenuProducts(excludeProductId?: string) {
  return db.product.count({
    where: {
      showInWarrantyMenu: true,
      ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
    },
  });
}

/** Minimal query used by the navbar toggle. Avoids loading the full product editor payload. */
export async function getProductNavbarPlacement(id: string) {
  return db.product.findUnique({
    where: { id },
    select: { id: true, slug: true, showInNavbar: true },
  });
}

/** Minimal mutation used by the navbar toggle. */
export async function setProductNavbarPlacement(id: string, showInNavbar: boolean) {
  return db.product.update({
    where: { id },
    data: { showInNavbar },
    select: { id: true, slug: true, showInNavbar: true },
  });
}

/** Minimal query used by the warranty menu toggle. */
export async function getProductWarrantyMenuPlacement(id: string) {
  return db.product.findUnique({
    where: { id },
    select: { id: true, slug: true, showInWarrantyMenu: true },
  });
}

/** Minimal mutation used by the warranty menu toggle. */
export async function setProductWarrantyMenuPlacement(id: string, showInWarrantyMenu: boolean) {
  return db.product.update({
    where: { id },
    data: { showInWarrantyMenu },
    select: { id: true, slug: true, showInWarrantyMenu: true },
  });
}

export async function getProductById(id: string) {
  return safeFindUnique({
    where: { id },
  });
}

/** Exact slug lookup for uniqueness checks. Product page resolution may use a fuzzy fallback. */
export async function getProductByExactSlug(slug: string) {
  return safeFindUnique({
    where: { slug },
  });
}

export async function getProductBySlug(slug: string) {
  const exact = await getProductByExactSlug(slug);
  if (exact) return exact;

  // Fallback for long or shortened slug variations
  const prefix = slug.slice(0, 30);
  return safeFindFirst({
    where: {
      OR: [
        { slug: { startsWith: prefix } },
        { name: { contains: prefix, mode: "insensitive" } },
      ],
    },
  });
}

export async function getProductsByCategory(categorySlug: string) {
  return safeFindMany({
    where: { category: { slug: categorySlug } },
    orderBy: { createdAt: "desc" },
  });
}

export async function searchProducts(query: string) {
  const searchTerm = query.trim();
  if (!searchTerm) return [];

  return safeFindMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { category: { title: { contains: searchTerm, mode: "insensitive" } } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRelatedProducts(categoryId: string, excludeProductId: string, limit = 4) {
  return db.product.findMany({
    where: {
      categoryId,
      id: { not: excludeProductId },
    },
    include: {
      colors: true,
      features: true,
      specs: true,
      media: { orderBy: { sortOrder: "asc" } },
      category: { select: { id: true, title: true, slug: true } },
      dealOfTheDay: true,
    },
    take: limit,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export type CreateProductInput = {
  name: string;
  slug: string;
  categoryId: string;
  price: string;
  oldPrice?: string | null;
  discount?: string | null;
  rating?: number;
  reviewsCount?: string;
  description: string;
  mainImage: string;
  shippingNotice: string;
  quantity?: number;
  sku?: string | null;
  showInBestSellers?: boolean;
  showInNavbar?: boolean;
  showInWarrantyMenu?: boolean;
  colors?: { name: string; bgHex: string; borderHex?: string | null }[];
  variants?: { name: string; sku?: string; price?: string; stock?: number; colorHex?: string; image?: string; sortOrder?: number }[];
  features?: string[];
  specs?: { label: string; value: string }[];
  faqs?: { question: string; answer: string }[];
  banners?: { imageUrl: string; mobileImageUrl?: string | null; title?: string | null; sortOrder?: number }[];
  creatorVideos?: { title?: string | null; thumbnailUrl: string; videoUrl?: string | null; sortOrder?: number; isActive?: boolean }[];
  media?: { key: string; url: string; mimeType: string; sortOrder: number }[];
};

export type UpdateProductInput = Partial<CreateProductInput> & {
  name?: string;
  categoryId?: string;
  price?: string;
  oldPrice?: string | null;
  discount?: string | null;
  rating?: number;
  reviewsCount?: string;
  description?: string;
  mainImage?: string;
  shippingNotice?: string;
  quantity?: number;
  sku?: string | null;
  showInBestSellers?: boolean;
  showInNavbar?: boolean;
  showInWarrantyMenu?: boolean;
  colors?: { name: string; bgHex: string; borderHex?: string | null }[];
  variants?: { name: string; sku?: string; price?: string; stock?: number; colorHex?: string; image?: string; sortOrder?: number }[];
  /** New files to append. Existing product media is never replaced during an edit. */
  newMedia?: { key: string; url: string; mimeType: string; sortOrder: number }[];
  mediaOrder?: { id: string; sortOrder: number }[];
  /** Existing product media records to remove. */
  removeMediaIds?: string[];
};

export async function createProduct(data: CreateProductInput) {
  const { colors, variants, features, specs, faqs, banners, creatorVideos, media, ...productData } = data;

  try {
    const created = await db.product.create({
      data: {
        ...productData,
        colors: colors ? { create: colors } : undefined,
        features: features
          ? { create: features.map((f) => ({ featureText: f })) }
          : undefined,
        specs: specs?.length
          ? {
              create: specs
                .filter((s) => s.label?.trim() || s.value?.trim())
                .map((s) => ({
                  label: s.label.trim(),
                  value: s.value.trim(),
                })),
            }
          : undefined,
        faqs: faqs?.length
          ? {
              create: faqs
                .filter((f) => f.question?.trim() || f.answer?.trim())
                .map((f) => ({
                  question: f.question.trim(),
                  answer: f.answer.trim(),
                })),
            }
          : undefined,
        banners: banners?.length
          ? {
              create: banners
                .filter((b) => b.imageUrl?.trim())
                .map((b, idx) => ({
                  imageUrl: b.imageUrl.trim(),
                  mobileImageUrl: b.mobileImageUrl?.trim() || null,
                  title: b.title?.trim() || null,
                  sortOrder: typeof b.sortOrder === "number" ? b.sortOrder : idx,
                })),
            }
          : undefined,
        media: media?.length ? { create: media } : undefined,
      },
      include: fullProductInclude,
    });

    if (creatorVideos?.length) await syncProductCreatorVideos(created.id, creatorVideos);
    if (variants?.length) await syncProductVariants(created.id, variants);
    if (colors?.length) await syncProductColors(created.id, colors);

    return created;
  } catch (error: any) {
    if (
      String(error?.message || "").includes("Unknown argument `faqs`") ||
      String(error?.message || "").includes("Unknown argument `banners`") ||
      String(error?.message || "").includes("Unknown field `faqs`") ||
      String(error?.message || "").includes("Unknown field `banners`") ||
      String(error?.message || "").includes("Unknown argument") ||
      String(error?.message || "").includes("Unknown field")
    ) {
      const created = await db.product.create({
        data: {
          ...productData,
          colors: colors ? { create: colors } : undefined,
          features: features
            ? { create: features.map((f) => ({ featureText: f })) }
            : undefined,
          specs: specs?.length
            ? {
                create: specs
                  .filter((s) => s.label?.trim() || s.value?.trim())
                  .map((s) => ({
                    label: s.label.trim(),
                    value: s.value.trim(),
                  })),
              }
            : undefined,
          media: media?.length ? { create: media } : undefined,
        },
        include: baseProductInclude,
      });

      if (faqs?.length) await syncProductFaqs(created.id, faqs);
      if (banners?.length) await syncProductBanners(created.id, banners);
      if (creatorVideos?.length) await syncProductCreatorVideos(created.id, creatorVideos);
      if (variants?.length) await syncProductVariants(created.id, variants);
      if (colors?.length) await syncProductColors(created.id, colors);

      const extra = await loadMissingFaqsAndBanners(created.id);
      return { ...created, faqs: extra.faqs, banners: extra.banners, creatorVideos: extra.creatorVideos };
    }
    throw error;
  }
}

export async function updateProduct(
  id: string,
  data: UpdateProductInput
) {
  const { categoryId, newMedia, mediaOrder, removeMediaIds, features, specs, faqs, banners, creatorVideos, variants, colors, ...productData } = data;

  if (removeMediaIds && removeMediaIds.length > 0) {
    try {
      const mediaRecords = await db.productMedia.findMany({
        where: { id: { in: removeMediaIds } },
        select: { key: true, url: true },
      });
      const keys = mediaRecords.flatMap((m: any) => [m.key, m.url]);
      await deleteMultipleProductMedia(keys);
    } catch (err) {
      console.error("Failed to delete removed product media from R2:", err);
    }
  }

  const mediaChanges =
    newMedia?.length || mediaOrder?.length || removeMediaIds?.length
      ? {
          // Nested `create` appends new rows. Reordering and deletion target only this product's relation.
          create: newMedia?.length ? newMedia : undefined,
          update: mediaOrder?.length
            ? mediaOrder.map(({ id: mediaId, sortOrder }) => ({
                where: { id: mediaId },
                data: { sortOrder },
              }))
            : undefined,
          deleteMany: removeMediaIds?.length
            ? { id: { in: removeMediaIds } }
            : undefined,
        }
      : undefined;

  try {
    const updated = await db.product.update({
      where: { id },
      data: {
        ...productData,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        media: mediaChanges,
        features: features !== undefined ? {
          deleteMany: {},
          create: features.map((f) => ({ featureText: f }))
        } : undefined,
        specs: specs !== undefined ? {
          deleteMany: {},
          create: specs
            .filter((s) => s.label?.trim() || s.value?.trim())
            .map((s) => ({
              label: s.label.trim(),
              value: s.value.trim(),
            })),
        } : undefined,
        faqs: faqs !== undefined ? {
          deleteMany: {},
          create: faqs
            .filter((f) => f.question?.trim() || f.answer?.trim())
            .map((f) => ({
              question: f.question.trim(),
              answer: f.answer.trim(),
            })),
        } : undefined,
        banners: banners !== undefined ? {
          deleteMany: {},
          create: banners
            .filter((b) => b.imageUrl?.trim())
            .map((b, idx) => ({
              imageUrl: b.imageUrl.trim(),
              mobileImageUrl: b.mobileImageUrl?.trim() || null,
              title: b.title?.trim() || null,
              sortOrder: typeof b.sortOrder === "number" ? b.sortOrder : idx,
            })),
        } : undefined,
      },
      include: fullProductInclude,
    });

    if (creatorVideos !== undefined) await syncProductCreatorVideos(id, creatorVideos);
    if (variants !== undefined) await syncProductVariants(id, variants);
    if (colors !== undefined) await syncProductColors(id, colors);

    return updated;
  } catch (error: any) {
    if (
      String(error?.message || "").includes("Unknown argument `faqs`") ||
      String(error?.message || "").includes("Unknown argument `banners`") ||
      String(error?.message || "").includes("Unknown field `faqs`") ||
      String(error?.message || "").includes("Unknown field `banners`") ||
      String(error?.message || "").includes("Unknown argument") ||
      String(error?.message || "").includes("Unknown field")
    ) {
      const updated = await db.product.update({
        where: { id },
        data: {
          ...productData,
          category: categoryId ? { connect: { id: categoryId } } : undefined,
          media: mediaChanges,
          features: features !== undefined ? {
            deleteMany: {},
            create: features.map((f) => ({ featureText: f }))
          } : undefined,
          specs: specs !== undefined ? {
            deleteMany: {},
            create: specs
              .filter((s) => s.label?.trim() || s.value?.trim())
              .map((s) => ({
                label: s.label.trim(),
                value: s.value.trim(),
              })),
          } : undefined,
        },
        include: baseProductInclude,
      });

      if (faqs !== undefined) await syncProductFaqs(id, faqs);
      if (banners !== undefined) await syncProductBanners(id, banners);
      if (creatorVideos !== undefined) await syncProductCreatorVideos(id, creatorVideos);

      const extra = await loadMissingFaqsAndBanners(id);
      return { ...updated, faqs: extra.faqs, banners: extra.banners, creatorVideos: extra.creatorVideos };
    }
    throw error;
  }
}

export async function deleteProduct(id: string) {
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        media: true,
        banners: true,
        creatorVideos: true,
      },
    });
    if (product) {
      const keysToDelete: (string | null | undefined)[] = [];
      if (product.mainImage) keysToDelete.push(product.mainImage);
      for (const m of product.media) {
        if (m.key) keysToDelete.push(m.key);
        if (m.url) keysToDelete.push(m.url);
      }
      for (const b of product.banners) {
        if (b.imageUrl) keysToDelete.push(b.imageUrl);
        if (b.mobileImageUrl) keysToDelete.push(b.mobileImageUrl);
      }
      for (const v of product.creatorVideos) {
        if (v.thumbnailUrl) keysToDelete.push(v.thumbnailUrl);
        if (v.videoUrl) keysToDelete.push(v.videoUrl);
      }
      await deleteMultipleProductMedia(keysToDelete);
    }
  } catch (err) {
    console.error("Failed to cleanup R2 media for product:", err);
  }

  return db.product.delete({
    where: { id },
  });
}

export async function decrementProductStock(productId: string, quantityToDecrement: number) {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { quantity: true },
  });
  if (!product) throw new Error("Product not found");
  if (product.quantity < quantityToDecrement) throw new Error("Insufficient stock");

  return db.product.update({
    where: { id: productId },
    data: { quantity: { decrement: quantityToDecrement } },
  });
}
