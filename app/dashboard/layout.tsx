import type { ReactNode } from "react"
import { connection } from "next/server"
import { redirect } from "next/navigation"

import { verifySession } from "@/lib/server/dal/auth"
import "./dashboard.css"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await connection()
  const session = await verifySession()
  
  if (!session) {
    redirect("/login")
  }

  if (session.role !== "ADMIN") {
    redirect("/")
  }

  return <div className="dashboard-shell">{children}</div>
}
