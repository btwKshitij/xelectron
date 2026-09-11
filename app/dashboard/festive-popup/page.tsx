import type { Metadata } from "next";
import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getFestivePopupSettings } from "@/lib/server/controllers/festive-popup.controller";
import FestivePopupEditor from "@/components/admin/festive-popup/festive-popup-editor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Festive Offer Popup | XElectron Admin",
};

export default async function FestivePopupPage() {
  const settings = await getFestivePopupSettings();

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 p-6 lg:p-8 max-w-7xl">
            <FestivePopupEditor initialSettings={settings} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
