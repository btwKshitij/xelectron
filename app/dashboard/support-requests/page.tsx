import { SupportRequests, type SupportRequestRow } from "@/components/admin/support-requests";
import { db } from "@/lib/db";
import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export const dynamic = "force-dynamic";
export default async function Page() {
  const requests = await db.supportRequest.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const rows: SupportRequestRow[] = requests.map((request: { id: string; kind: string; createdAt: Date; details: unknown }) => ({
    id: request.id, kind: request.kind, createdAt: request.createdAt.toISOString(),
    details: request.details && typeof request.details === "object" && !Array.isArray(request.details) ? request.details as Record<string, unknown> : { details: request.details },
  }));
  return <TooltipProvider><SidebarProvider><AppSidebar /><SidebarInset className="bg-slate-50/50"><SupportRequests requests={rows} /></SidebarInset></SidebarProvider></TooltipProvider>;
}
