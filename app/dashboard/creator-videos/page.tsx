import type { Metadata } from "next"
import { AppSidebar } from "@/components/admin/navigation/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { listCreatorVideos } from "@/lib/server/controllers/creator-videos.controller"
import { CreatorVideoManager } from "@/components/admin/creator-videos/creator-video-manager"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Creator Videos | XElectron Admin",
}

export default async function CreatorVideosPage() {
  const videos = await listCreatorVideos()

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <CreatorVideoManager initialVideos={videos} />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
