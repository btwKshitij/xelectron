import type { Metadata } from "next"

import { AppSidebar } from "@/components/admin/navigation/app-sidebar"
import { CategoryEditor } from "@/components/admin/products/category-editor"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import * as categoriesController from "@/lib/server/controllers/categories.controller"
import * as productsController from "@/lib/server/controllers/products.controller"

export const metadata: Metadata = { title: "Add category | Xelectron Admin" }

export default async function NewCategoryPage() {
  const [products, categories] = await Promise.all([productsController.listProducts(), categoriesController.listCategories()])
  return <TooltipProvider><SidebarProvider className="min-h-svh"><AppSidebar /><SidebarInset><CategoryEditor products={products.map((product: any) => ({ id: product.id, title: product.name, slug: product.slug, price: product.price, image: product.mainImage }))} categories={categories.map((category: any) => ({ id: category.id, title: category.title }))} /></SidebarInset></SidebarProvider></TooltipProvider>
}

