import type { Metadata } from "next";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { AddProductForm } from "@/components/admin/products/add-product-form";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import * as categoriesController from "@/lib/server/controllers/categories.controller";

export const metadata: Metadata = {
  title: "Add product | Xelectron Admin",
  description: "Create a new product in the Xelectron admin dashboard.",
};

export default async function AddProductPage() {
  const categories = await categoriesController.listCategories();

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <main className="min-h-full bg-[#f5f5f5] p-4 text-black sm:p-5">
            <AddProductForm categories={categories.map((c: any) => ({ id: c.id, title: c.title }))} />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
