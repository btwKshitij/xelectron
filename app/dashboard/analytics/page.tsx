import type { Metadata } from "next";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAnalyticsData } from "@/lib/server/controllers/dashboard.controller";
import { AnalyticsView } from "@/components/admin/analytics/analytics-view";

export const metadata: Metadata = {
  title: "Analytics & Reports | Xelectron Admin",
  description: "Review sales performance, date filtering, and download detailed store reports.",
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) || {};
  const selectedRange = resolvedSearchParams.range || "all";
  const analytics = await getAnalyticsData(selectedRange);

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-6">
            <AnalyticsView
              analytics={analytics}
              selectedRange={selectedRange}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
