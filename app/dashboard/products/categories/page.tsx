import type { Metadata } from "next"

import { AppSidebar } from "@/components/admin/navigation/app-sidebar"
import { CategoryManager } from "@/components/admin/products/category-manager"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import * as categoriesController from "@/lib/server/controllers/categories.controller"

export const metadata: Metadata = {
  title: "Categories | Xelectron Admin",
  description: "Create and manage storefront product categories.",
}

export default async function CategoriesPage() {
  const categories = await categoriesController.listCategories()

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <CategoryManager
            initialCategories={categories.map((category: any) => ({
              id: category.id,
              title: category.title,
              slug: category.slug,
              parentId: category.parentId,
              visible: category.visible,
              productCount: category._count.products,
              image: category.image ?? category.products[0]?.mainImage ?? null,
            }))}
          />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

