import type { Metadata } from "next";
import { headers } from "next/headers";
import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { listBrandMarqueeItems } from "@/lib/server/controllers/brand-marquee.controller";
import { BrandMarqueeManager } from "@/components/admin/brand-marquee/brand-marquee-manager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Brand Platforms Marquee | XElectron Admin",
};

export default async function BrandMarqueeAdminPage() {
  await headers();
  const items = await listBrandMarqueeItems(false).catch(() => []);
  const dynamicKey = items.map((i: any) => `${i.id}_${i.isActive}_${i.sortOrder}`).join("_") || Date.now();

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <BrandMarqueeManager key={dynamicKey} initialItems={items} />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
