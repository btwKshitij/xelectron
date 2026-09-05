import { db, createPrismaClient } from "@/lib/db"

export type CreatorVideoItem = {
  id: string
  title: string | null
  thumbnailUrl: string
  videoUrl: string | null
  productId: string | null
  product?: {
    id: string
    name: string
    slug: string
    mainImage: string
    price?: string
    oldPrice?: string | null
    discount?: string | null
    rating?: number
    reviewsCount?: string
    description?: string
  } | null
  sortOrder: number
  isActive: boolean
  isProductVideo?: boolean
  createdAt: Date
  updatedAt: Date
}

// ─── Raw SQL helper to map DB rows to CreatorVideoItem ──────────────────────

function mapRow(r: any): CreatorVideoItem {
  return {
    id: r.id,
    title: r.title,
    thumbnailUrl: r.thumbnail_url || r.thumbnailUrl,
    videoUrl: r.video_url || r.videoUrl,
    productId: r.product_id || r.productId,
    product: r.p_id
      ? {
          id: r.p_id,
          name: r.p_name,
          slug: r.p_slug,
          mainImage: r.p_main_image,
          price: r.p_price,
          oldPrice: r.p_old_price,
          discount: r.p_discount,
          rating: r.p_rating,
          reviewsCount: r.p_reviews_count,
          description: r.p_description,
        }
      : null,
    sortOrder: r.sort_order ?? r.sortOrder ?? 0,
    isActive: r.is_active ?? r.isActive ?? true,
    isProductVideo: r.is_product_video ?? r.isProductVideo ?? false,
    createdAt: new Date(r.created_at || r.createdAt),
    updatedAt: new Date(r.updated_at || r.updatedAt),
  }
}

const CREATOR_VIDEO_JOIN_SQL = `
  SELECT cv.*,
         p.id as p_id, p.name as p_name, p.slug as p_slug, p.main_image as p_main_image,
         p.price as p_price, p.old_price as p_old_price, p.discount as p_discount,
         p.rating as p_rating, p.reviews_count as p_reviews_count, p.description as p_description
  FROM "creator_videos" cv
  LEFT JOIN "products" p ON cv."product_id" = p."id"
`

// ─── List ALL homepage creator videos (admin dashboard) ─────────────────────
// Only returns videos where is_product_video = false (homepage videos).
// Videos added in the product edit form (is_product_video = true) are EXCLUDED.

export async function listCreatorVideos(): Promise<CreatorVideoItem[]> {
  try {
    const rows: any[] = await db.$queryRawUnsafe(`
      ${CREATOR_VIDEO_JOIN_SQL}
      WHERE cv."is_product_video" = false
      ORDER BY cv."sort_order" ASC
    `)
    return rows.map(mapRow)
  } catch {
    // Absolute fallback — column may not exist
    try {
      const rows: any[] = await db.$queryRawUnsafe(`
        ${CREATOR_VIDEO_JOIN_SQL}
        ORDER BY cv."sort_order" ASC
      `)
      return rows.map(mapRow)
    } catch {
      return []
    }
  }
}

// ─── List ACTIVE homepage creator videos (public homepage) ──────────────────
// Only returns active videos where is_product_video = false.

export async function listActiveCreatorVideos(): Promise<CreatorVideoItem[]> {
  try {
    const rows: any[] = await db.$queryRawUnsafe(`
      ${CREATOR_VIDEO_JOIN_SQL}
      WHERE cv."is_product_video" = false AND cv."is_active" = true
      ORDER BY cv."sort_order" ASC
    `)
    return rows.map(mapRow)
  } catch {
    try {
      const rows: any[] = await db.$queryRawUnsafe(`
        ${CREATOR_VIDEO_JOIN_SQL}
        WHERE cv."is_active" = true
        ORDER BY cv."sort_order" ASC
      `)
      return rows.map(mapRow)
    } catch {
      return []
    }
  }
}

// ─── Create a homepage creator video ────────────────────────────────────────
// Always sets is_product_video = false. These are homepage-only videos.

export async function createCreatorVideo(data: {
  title?: string
  thumbnailUrl: string
  videoUrl?: string
  productId?: string
  sortOrder?: number
  isActive?: boolean
}) {
  try {
    const id = `cv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    await db.$executeRawUnsafe(
      `INSERT INTO "creator_videos" ("id", "product_id", "title", "thumbnail_url", "video_url", "is_product_video", "sort_order", "is_active", "created_at", "updated_at")
       VALUES ($1, $2, $3, $4, $5, false, $6, $7, now(), now())`,
      id,
      data.productId || null,
      data.title || null,
      data.thumbnailUrl,
      data.videoUrl || null,
      data.sortOrder ?? 0,
      data.isActive ?? true
    )

    // Return the created video with product join
    const rows: any[] = await db.$queryRawUnsafe(`
      ${CREATOR_VIDEO_JOIN_SQL}
      WHERE cv."id" = $1
    `, id)
    if (rows.length > 0) return mapRow(rows[0])

    // Minimal fallback
    return {
      id,
      title: data.title || null,
      thumbnailUrl: data.thumbnailUrl,
      videoUrl: data.videoUrl || null,
      productId: data.productId || null,
      product: null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
      isProductVideo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (err) {
    console.error("Failed to create creator video:", err)
    throw err
  }
}

// ─── Update a creator video ─────────────────────────────────────────────────

export async function updateCreatorVideo(
  id: string,
  data: Partial<{
    title: string
    thumbnailUrl: string
    videoUrl: string
    productId: string | null
    sortOrder: number
    isActive: boolean
  }>
) {
  const setClauses: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (data.title !== undefined) {
    setClauses.push(`"title" = $${paramIndex++}`)
    values.push(data.title)
  }
  if (data.thumbnailUrl !== undefined) {
    setClauses.push(`"thumbnail_url" = $${paramIndex++}`)
    values.push(data.thumbnailUrl)
  }
  if (data.videoUrl !== undefined) {
    setClauses.push(`"video_url" = $${paramIndex++}`)
    values.push(data.videoUrl)
  }
  if (data.productId !== undefined) {
    setClauses.push(`"product_id" = $${paramIndex++}`)
    values.push(data.productId)
  }
  if (data.sortOrder !== undefined) {
    setClauses.push(`"sort_order" = $${paramIndex++}`)
    values.push(data.sortOrder)
  }
  if (data.isActive !== undefined) {
    setClauses.push(`"is_active" = $${paramIndex++}`)
    values.push(data.isActive)
  }

  setClauses.push(`"updated_at" = now()`)

  if (setClauses.length > 0) {
    values.push(id)
    await db.$executeRawUnsafe(
      `UPDATE "creator_videos" SET ${setClauses.join(", ")} WHERE "id" = $${paramIndex}`,
      ...values
    )
  }

  // Return the updated video
  const rows: any[] = await db.$queryRawUnsafe(`
    ${CREATOR_VIDEO_JOIN_SQL}
    WHERE cv."id" = $1
  `, id)
  if (rows.length > 0) return mapRow(rows[0])

  return { id, ...data } as any
}

// ─── Delete a creator video ─────────────────────────────────────────────────

export async function deleteCreatorVideo(id: string) {
  await db.$executeRawUnsafe(`DELETE FROM "creator_videos" WHERE "id" = $1`, id)
  return { success: true }
}
