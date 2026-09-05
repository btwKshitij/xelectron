import { NextResponse } from "next/server"
import { listActiveBanners } from "@/lib/server/controllers/banners.controller"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const banners = await listActiveBanners()
    return NextResponse.json(banners, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      },
    })
  } catch (error) {
    console.error("Failed to list active banners:", error)
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
  }
}
