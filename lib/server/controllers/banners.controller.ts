import { db } from "@/lib/db"
import { banners as defaultBanners } from "@/components/home/content"

export type HeroBannerItem = {
  id: string
  title: string
  category: string | null
  caption: string | null
  src: string
  mobileSrc: string | null
  alt: string
  cta: string | null
  linkUrl: string | null
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export async function ensureDefaultBannersSeeded() {
  try {
    const count = await (db as any).heroBanner.count()
    if (count === 0) {
      for (let index = 0; index < defaultBanners.length; index++) {
        const b = defaultBanners[index]
        await (db as any).heroBanner.create({
          data: {
            title: b.title,
            category: b.category || null,
            caption: b.caption || null,
            src: b.src,
            mobileSrc: b.mobileSrc || b.src,
            alt: b.alt,
            cta: b.cta || "Shop now",
            linkUrl: b.linkUrl || "/shop",
            sortOrder: index,
            isActive: true,
          },
        })
      }
    }
  } catch (error) {
    console.error("Default banners seeding check failed:", error)
  }
}

export async function listBanners() {
  await ensureDefaultBannersSeeded()
  return (db as any).heroBanner.findMany({
    orderBy: { sortOrder: "asc" },
  })
}

export async function listActiveBanners() {
  await ensureDefaultBannersSeeded()
  return (db as any).heroBanner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })
}

export async function createBanner(data: {
  title: string
  category?: string
  caption?: string
  src: string
  mobileSrc?: string
  alt: string
  cta?: string
  linkUrl?: string
  sortOrder?: number
  isActive?: boolean
}) {
  return (db as any).heroBanner.create({
    data: {
      title: data.title,
      category: data.category || null,
      caption: data.caption || null,
      src: data.src,
      mobileSrc: data.mobileSrc || null,
      alt: data.alt,
      cta: data.cta || "Shop now",
      linkUrl: data.linkUrl || "/shop",
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  })
}

export async function updateBanner(
  id: string,
  data: Partial<{
    title: string
    category: string
    caption: string
    src: string
    mobileSrc: string
    alt: string
    cta: string
    linkUrl: string
    sortOrder: number
    isActive: boolean
  }>
) {
  return (db as any).heroBanner.update({
    where: { id },
    data,
  })
}

export async function deleteBanner(id: string) {
  return (db as any).heroBanner.delete({
    where: { id },
  })
}
