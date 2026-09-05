import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { EditProductForm } from "@/components/admin/products/edit-product-form";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import * as categoriesController from "@/lib/server/controllers/categories.controller";
import * as productsController from "@/lib/server/controllers/products.controller";

interface ProductEditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductEditPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await productsController.getProduct(id);
  return {
    title: product ? `${product.name} | Xelectron Admin` : "Product not found | Xelectron Admin",
    description: product ? `Edit product details for ${product.name}` : "Product not found.",
  };
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    productsController.getProduct(id),
    categoriesController.listCategories(),
  ]);

  if (!product) notFound();

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-5">
            <EditProductForm
              product={product}
              categories={categories.map((c: any) => ({ id: c.id, title: c.title }))}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
