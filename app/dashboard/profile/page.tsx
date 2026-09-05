import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { AdminProfileClient } from "@/components/admin/profile/admin-profile-client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAdminProfile } from "@/lib/server/controllers/users.controller";
import { requireAdmin } from "@/lib/server/dal/auth";

export default async function ProfilePage() {
  const admin = await requireAdmin();
  const profile = await getAdminProfile(admin.id);

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <AdminProfileClient initialProfile={profile} />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
