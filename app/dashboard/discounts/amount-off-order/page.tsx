import type { Metadata } from "next"

import { AmountOffOrderEditor } from "@/components/admin/discounts/basic-discount-editor"
import { AppSidebar } from "@/components/admin/navigation/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = { title: "Create order discount | Xelectron Admin", description: "Create an amount-off-order discount for Xelectron." }

export default function AmountOffOrderPage() {
  return <TooltipProvider><SidebarProvider className="min-h-svh"><AppSidebar /><SidebarInset><AmountOffOrderEditor /></SidebarInset></SidebarProvider></TooltipProvider>
}

