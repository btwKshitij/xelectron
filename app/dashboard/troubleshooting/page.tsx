import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getTroubleshootingContent } from "@/lib/server/dal/troubleshooting.dal";
import { TroubleshootingEditor } from "@/components/admin/troubleshooting/troubleshooting-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Troubleshooting | XElectron Admin" };

export default async function Page() {
  const content = await getTroubleshootingContent();
  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset><TroubleshootingEditor initialContent={content} /></SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
