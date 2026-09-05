"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Download,
  Filter,
  Plus,
  TrendingUp,
  Package,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import { formatINR } from "@/lib/format-price";

type AnalyticsData = {
  range: string;
  grossSales: number;
  totalOrders: number;
  ordersFulfilled: number;
  returningCustomerRate: number;
  averageOrderValue: number;
  salesByProduct: { id: string; name: string; totalSales: number; quantity: number }[];
  allOrdersCount: number;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function AnalyticsView({
  analytics,
  selectedRange,
}: {
  analytics: AnalyticsData;
  selectedRange: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [customTo, setCustomTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [isExporting, setIsExporting] = useState(false);

  const rangePresets = [
    { label: "All time", value: "all" },
    { label: "Today", value: "today" },
    { label: "Last 7 days", value: "last7" },
    { label: "Last 30 days", value: "last30" },
    { label: "Last 90 days", value: "days_90" },
    { label: "Quarter to date", value: "quarter" },
  ];

  function handleSelectPreset(val: string) {
    setShowCustomRange(false);
    router.push(`/dashboard/analytics?range=${val}`);
  }

  function handleApplyCustom() {
    router.push(`/dashboard/analytics?range=custom&from=${customFrom}&to=${customTo}`);
  }

  async function handleDownloadReport() {
    try {
      setIsExporting(true);
      const res = await fetch(`/api/admin/analytics/export?range=${selectedRange}`);
      if (!res.ok) throw new Error("Failed to generate CSV export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `xelectron-sales-report-${selectedRange}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Unable to download report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Top Header & Action Row */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
            <BarChart3 className="size-5 text-[#0a7ae6]" />
            Analytics & Sales Reports
          </h1>
          <p className="mt-1 text-xs text-black/55">
            Monitor real-time revenue, order fulfillment, product performance, and download comprehensive reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={isExporting}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="size-4 text-emerald-600" />
            {isExporting ? "Generating CSV..." : "Download Report (CSV)"}
          </button>

          <Link prefetch={false}
            href="/dashboard/orders/create-order"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-black px-3.5 text-xs font-semibold text-white hover:bg-black/80 transition"
          >
            <Plus className="size-3.5" />
            New order
          </Link>
        </div>
      </header>

      {/* Date Range Selection Bar */}
      <section className="rounded-xl border border-black/10 bg-white p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <CalendarDays className="size-3.5 text-slate-400" />
              Date range:
            </span>

            <div className="inline-flex items-center rounded-lg border border-black/15 bg-slate-50 p-0.5">
              {rangePresets.map((preset) => {
                const isActive = selectedRange === preset.value && !showCustomRange;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleSelectPreset(preset.value)}
                    className={`h-7 rounded-md px-2.5 text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? "bg-black text-white shadow-2xs"
                        : "text-slate-700 hover:text-black hover:bg-white/60"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowCustomRange(!showCustomRange)}
              className={`h-8 rounded-lg border px-3 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                showCustomRange
                  ? "border-black bg-black text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Filter className="size-3.5" />
              Custom dates
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Active view: <strong className="text-slate-900 capitalize">{selectedRange.replace("days_", "Last " + "").replace("last", "Last ")}</strong>
          </div>
        </div>

        {/* Custom Date Range Picker Drawer */}
        {showCustomRange && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/70 p-3 rounded-lg">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <span>From:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs outline-none focus:border-black"
              />
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <span>To:</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs outline-none focus:border-black"
              />
            </label>

            <button
              type="button"
              onClick={handleApplyCustom}
              className="h-8 rounded-md bg-[#0a7ae6] px-3 text-xs font-semibold text-white hover:bg-blue-600 transition cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        )}
      </section>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <section className="rounded-xl border border-black/10 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gross Sales</span>
            <TrendingUp className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatINR(analytics.grossSales)}</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <span className="inline-flex size-1.5 rounded-full bg-emerald-500" />
            Includes all completed & active orders
          </div>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Orders</span>
            <Package className="size-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.totalOrders}</p>
          <div className="mt-2.5 text-[11px] text-slate-500 font-medium">
            {analytics.ordersFulfilled} fulfilled & shipped
          </div>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Order Value</span>
            <BarChart3 className="size-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatINR(analytics.averageOrderValue)}</p>
          <div className="mt-2.5 text-[11px] text-slate-500 font-medium">
            Per customer checkout basket
          </div>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Returning Customers</span>
            <Users className="size-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{analytics.returningCustomerRate}%</p>
          <div className="mt-2.5 text-[11px] text-slate-500 font-medium">
            Repeat buyer retention rate
          </div>
        </section>
      </div>

      {/* Main Charts & Product Sales Table */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        {/* Left Column: Top Selling Products */}
        <section className="rounded-xl border border-black/10 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-3.5 bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top Selling Products</h2>
              <p className="text-xs text-slate-500">Ranked by total revenue generated in this time period.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {analytics.salesByProduct.length} items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/40 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-2.5">Product</th>
                  <th className="px-4 py-2.5 text-center">Units Sold</th>
                  <th className="px-5 py-2.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.salesByProduct.map((prod, idx) => (
                  <tr key={prod.id || idx} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="grid size-5 place-items-center rounded-full bg-slate-100 font-mono text-[10px] text-slate-600">
                          {idx + 1}
                        </span>
                        <span className="truncate max-w-[280px]">{prod.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">
                      {prod.quantity}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-[#0a7ae6]">
                      {formatINR(prod.totalSales)}
                    </td>
                  </tr>
                ))}
                {analytics.salesByProduct.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-xs text-slate-400">
                      No product sales recorded in this time range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: Financial & Fulfillment Summary */}
        <section className="rounded-xl border border-black/10 bg-white p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Financial & Operations Summary
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Gross Sales</span>
              <span className="font-bold text-slate-900">{formatINR(analytics.grossSales)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Shipping & Handling</span>
              <span className="font-semibold text-emerald-600">Free (₹0)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Taxes (GST 18%)</span>
              <span className="font-medium text-slate-500">Included</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Total Orders Processed</span>
              <span className="font-bold text-slate-900">{analytics.allOrdersCount}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Orders Dispatched / Delivered</span>
              <span className="font-bold text-emerald-700">{analytics.ordersFulfilled}</span>
            </div>
            <div className="flex items-center justify-between py-2 pt-3 font-bold text-sm">
              <span className="text-slate-900">Net Realized Revenue</span>
              <span className="text-[#0a7ae6]">{formatINR(analytics.grossSales)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">Need full ledger?</span>
              <button
                type="button"
                onClick={handleDownloadReport}
                className="text-xs font-bold text-[#0a7ae6] hover:underline cursor-pointer flex items-center gap-1"
              >
                Download CSV <Download className="size-3" />
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Exports full itemized order lines, SKUs, and transaction records.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
