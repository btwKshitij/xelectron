import type { Metadata } from "next";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  CalendarDays,
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  ArrowLeft,
} from "lucide-react";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Reports Center | Xelectron Admin",
  description: "Download detailed store and sales reports in CSV format.",
};

const reportCards = [
  {
    id: "sales-overview",
    title: "Complete Sales & Revenue Report",
    description: "Export all gross sales, net revenue, order totals, and fulfillment status.",
    icon: TrendingUp,
    range: "all",
    badge: "Financials",
  },
  {
    id: "last-30-days",
    title: "Monthly Sales Report (Last 30 Days)",
    description: "Itemized transactions and metrics for the past 30 days.",
    icon: CalendarDays,
    range: "last30",
    badge: "Monthly",
  },
  {
    id: "last-7-days",
    title: "Weekly Performance Report (Last 7 Days)",
    description: "Recent week summary of sales volume and units dispatched.",
    icon: ShoppingBag,
    range: "last7",
    badge: "Weekly",
  },
  {
    id: "today",
    title: "Today's Daily Sales Log",
    description: "Real-time orders placed today with customer and item details.",
    icon: Package,
    range: "today",
    badge: "Daily Log",
  },
];

export default function ReportsPage() {
  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-6">
            <div className="mx-auto max-w-5xl space-y-6">
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href="/dashboard/analytics"
                      className="text-xs font-semibold text-slate-500 hover:text-black flex items-center gap-1"
                    >
                      <ArrowLeft className="size-3" /> Back to Analytics
                    </Link>
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="size-5 text-emerald-600" />
                    Reports Center
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate and download itemized CSV spreadsheet exports for your store accounting and inventory.
                  </p>
                </div>
              </header>

              <div className="grid gap-4 sm:grid-cols-2">
                {reportCards.map((report) => {
                  const Icon = report.icon;
                  return (
                    <div
                      key={report.id}
                      className="rounded-xl border border-black/10 bg-white p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                            <Icon className="size-5" />
                          </div>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                            {report.badge}
                          </span>
                        </div>
                        <h2 className="mt-3 text-sm font-bold text-slate-900">{report.title}</h2>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{report.description}</p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">CSV Export</span>
                        <a
                          href={`/api/admin/analytics/export?range=${report.range}`}
                          download
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-semibold text-white hover:bg-black/80 transition"
                        >
                          <Download className="size-3.5" />
                          Download CSV
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
