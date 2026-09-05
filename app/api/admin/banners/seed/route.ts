import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/server/dal/auth"
import { ensureDefaultBannersSeeded, listBanners } from "@/lib/server/controllers/banners.controller"

export const dynamic = "force-dynamic"

export async function POST() {
  const session = await verifySession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await ensureDefaultBannersSeeded()
  const banners = await listBanners()
  try {
    revalidatePath("/")
    revalidatePath("/dashboard/banners")
    revalidatePath("/api/banners")
  } catch (revalErr) {
    console.error("Revalidation error:", revalErr)
  }
  return NextResponse.json(banners)
}
