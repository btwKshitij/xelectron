import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AppSidebar } from "@/components/admin/navigation/app-sidebar"
import { CategoryEditor } from "@/components/admin/products/category-editor"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import * as categoriesController from "@/lib/server/controllers/categories.controller"
import * as productsController from "@/lib/server/controllers/products.controller"

export const metadata: Metadata = { title: "Edit category | Xelectron Admin" }

export default async function EditCategoryPage({ params }: PageProps<"/dashboard/products/categories/[categoryId]">) {
  const { categoryId } = await params
  const [category, products, categories] = await Promise.all([
    categoriesController.getCategory(categoryId),
    productsController.listProducts(),
    categoriesController.listCategories(),
  ])

  if (!category) notFound()

  return <TooltipProvider><SidebarProvider className="min-h-svh"><AppSidebar /><SidebarInset><CategoryEditor category={{ id: category.id, title: category.title, slug: category.slug, parentId: category.parentId, visible: category.visible, description: category.description, image: category.image, productIds: category.products.map((product: any) => product.id) }} products={products.map((product: any) => ({ id: product.id, title: product.name, slug: product.slug, price: product.price, image: product.mainImage }))} categories={categories.map((item: any) => ({ id: item.id, title: item.title }))} /></SidebarInset></SidebarProvider></TooltipProvider>
}

