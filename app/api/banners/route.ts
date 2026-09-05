import { NextResponse } from "next/server"
import { listActiveBanners } from "@/lib/server/controllers/banners.controller"

export const revalidate = 60

export async function GET() {
  try {
    const banners = await listActiveBanners()
    return NextResponse.json(banners, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Failed to list active banners:", error)
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
  }
}
