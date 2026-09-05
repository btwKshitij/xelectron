import type { Metadata } from "next"

import { AppSidebar } from "@/components/admin/navigation/app-sidebar"
import { NavbarProductsManager } from "@/components/admin/products/navbar-products-manager"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import * as productsController from "@/lib/server/controllers/products.controller"

type NavbarPageProduct = {
  id: string
  name: string
  mainImage: string
  showInNavbar?: boolean
  showInWarrantyMenu?: boolean
}

export const metadata: Metadata = {
  title: "Navbar products | Xelectron Admin",
  description: "Choose the products displayed in the storefront navigation menu.",
}

// Category assignments can change from the Categories screen. Always read the
// current product/category relations when this management screen is opened.
export const dynamic = "force-dynamic"

export default async function NavbarProductsPage() {
  const products = await productsController.listProducts()

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <NavbarProductsManager initialProducts={products.map((product: NavbarPageProduct) => ({
            id: product.id,
            name: product.name,
            mainImage: product.mainImage,
            showInNavbar: product.showInNavbar ?? false,
            showInWarrantyMenu: product.showInWarrantyMenu ?? false,
          }))} />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
