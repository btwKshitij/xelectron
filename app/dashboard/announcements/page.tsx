import type { Metadata } from "next";
import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { AnnouncementManager } from "@/components/admin/announcements/announcement-manager";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  getAnnouncementSettings,
  listAnnouncements,
} from "@/lib/server/controllers/announcements.controller";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Announcements | XElectron Admin",
};

export default async function AnnouncementsPage() {
  const [announcements, settings] = await Promise.all([
    listAnnouncements(),
    getAnnouncementSettings(),
  ]);

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <AnnouncementManager
            initialAnnouncements={announcements}
            initialTickerEnabled={settings.tickerEnabled}
          />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
