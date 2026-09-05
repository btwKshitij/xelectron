import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/server/dal/auth"
import { updateBanner, deleteBanner } from "@/lib/server/controllers/banners.controller"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  try {
    const body = await request.json()
    const updated = await updateBanner(id, body)
    try {
      revalidatePath("/")
      revalidatePath("/dashboard/banners")
      revalidatePath("/api/banners")
    } catch (revalErr) {
      console.error("Revalidation error:", revalErr)
    }
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update banner:", error)
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  try {
    await deleteBanner(id)
    try {
      revalidatePath("/")
      revalidatePath("/dashboard/banners")
      revalidatePath("/api/banners")
    } catch (revalErr) {
      console.error("Revalidation error:", revalErr)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete banner:", error)
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 })
  }
}
