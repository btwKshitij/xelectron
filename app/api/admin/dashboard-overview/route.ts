import { NextResponse } from "next/server"
import { verifySession } from "@/lib/server/dal/auth"
import { getDashboardOverview } from "@/lib/server/controllers/dashboard.controller"

export async function GET(request: Request) {
  const session = await verifySession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") || "last30"

  const data = await getDashboardOverview(range)
  return NextResponse.json(data)
}
