import type { Metadata } from "next"

import { AmountOffProductsEditor } from "@/components/admin/discounts/amount-off-products-editor"
import { AppSidebar } from "@/components/admin/navigation/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  title: "Create discount | Xelectron Admin",
  description: "Create an amount-off-products discount for Xelectron.",
}

export default function CreateDiscountPage() {
  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset><AmountOffProductsEditor /></SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

