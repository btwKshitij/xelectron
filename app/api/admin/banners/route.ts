import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/server/dal/auth"
import { listBanners, createBanner } from "@/lib/server/controllers/banners.controller"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await verifySession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const banners = await listBanners()
  return NextResponse.json(banners)
}

export async function POST(request: Request) {
  const session = await verifySession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!body.src || !body.title) {
      return NextResponse.json({ error: "Title and Image URL (src) are required." }, { status: 400 })
    }

    const banner = await createBanner({
      title: body.title,
      category: body.category,
      caption: body.caption,
      src: body.src,
      mobileSrc: body.mobileSrc,
      alt: body.alt || body.title,
      cta: body.cta,
      linkUrl: body.linkUrl,
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    })

    try {
      revalidatePath("/")
      revalidatePath("/dashboard/banners")
      revalidatePath("/api/banners")
    } catch (revalErr) {
      console.error("Revalidation error:", revalErr)
    }

    return NextResponse.json(banner, { status: 201 })
  } catch (error: any) {
    console.error("Failed to create banner:", error)
    return NextResponse.json({ error: error?.message || "Failed to create banner" }, { status: 500 })
  }
}
