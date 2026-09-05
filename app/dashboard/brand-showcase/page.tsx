import type { Metadata } from "next";
import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { listBrandShowcaseItems } from "@/lib/server/controllers/brand-showcase.controller";
import * as categoriesController from "@/lib/server/controllers/categories.controller";
import { BrandShowcaseManager } from "@/components/admin/brand-showcase/brand-showcase-manager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Brand Showcase | XElectron Admin",
};

export default async function BrandShowcasePage() {
  const [items, categories] = await Promise.all([
    listBrandShowcaseItems(false),
    categoriesController.listCategories().catch(() => []),
  ]);

  const mappedCategories = categories.map((c: any) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
  }));

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <BrandShowcaseManager initialItems={items} categories={mappedCategories} />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
