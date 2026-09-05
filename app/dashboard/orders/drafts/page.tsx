import type { Metadata } from "next";

import { DraftOrdersManager } from "@/components/admin/orders/draft-orders-manager";
import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Drafts | Xelectron Admin",
  description: "Create draft orders and invoices in Xelectron.",
};

export default function DraftsPage() {
  return <TooltipProvider><SidebarProvider className="min-h-svh"><AppSidebar /><SidebarInset><DraftOrdersManager /></SidebarInset></SidebarProvider></TooltipProvider>;
}
