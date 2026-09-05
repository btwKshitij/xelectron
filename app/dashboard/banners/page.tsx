import type { Metadata } from "next"
import { AppSidebar } from "@/components/admin/navigation/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { listBanners } from "@/lib/server/controllers/banners.controller"
import { BannerManager } from "@/components/admin/banners/banner-manager"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Hero Banners | XElectron Admin",
}

export default async function BannersPage() {
  const banners = await listBanners()

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <BannerManager initialBanners={banners} />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
