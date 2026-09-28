import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { verifySession } from "@/lib/server/dal/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST() {
  const session = await verifySession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    revalidatePath("/", "layout")
    revalidatePath("/dashboard", "layout")
    revalidatePath("/dashboard/products", "page")
    revalidatePath("/dashboard/products", "layout")
    revalidatePath("/dashboard/banners", "page")
    revalidatePath("/api/banners")
    revalidatePath("/api/products")
    revalidatePath("/shop", "layout")
    revalidatePath("/shop", "page")
    revalidatePath("/checkout", "page")
    revalidatePath("/product", "layout")

    return NextResponse.json(
      {
        success: true,
        message: "Next.js cache successfully cleared across all pages and layouts",
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    )
  } catch (error: any) {
    console.error("Clear cache failed:", error)
    return NextResponse.json({ error: error?.message || "Failed to clear cache" }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
