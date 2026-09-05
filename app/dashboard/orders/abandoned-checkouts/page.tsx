import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, ShoppingCart } from "lucide-react";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { listOpenAbandonedCheckouts } from "@/lib/server/controllers/abandoned-checkouts.controller";
import { readAbandonedCheckoutItems } from "@/lib/server/dal/abandoned-checkouts.dal";

export const metadata: Metadata = {
  title: "Abandoned checkouts | Xelectron Admin",
  description: "Review abandoned checkouts and recovery status.",
};

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const timestamp = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export default async function AbandonedCheckoutsPage() {
  const checkouts = await listOpenAbandonedCheckouts();

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h1 className="flex items-center gap-2 text-lg font-semibold"><ShoppingCart className="size-4" /> Abandoned checkouts</h1>
                <p className="mt-1 text-xs text-black/55">Checkouts started by customers but not yet completed.</p>
              </div>
              <span className="text-xs text-black/55">{checkouts.length} open</span>
            </div>

            <section className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
              {checkouts.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <ShoppingCart className="mx-auto size-6 text-black/35" />
                  <h2 className="mt-3 text-sm font-semibold">No abandoned checkouts to show</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-black/55">Checkout activity will appear here when a customer leaves checkout without placing their order.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                    <thead className="bg-black/[0.025] text-black/65">
                      <tr>
                        {['Customer', 'Products', 'Total', 'Last activity', ''].map((heading: string) => <th key={heading} className="border-b border-black/10 px-4 py-2.5 font-medium">{heading}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {checkouts.map((checkout: any) => {
                        const items = readAbandonedCheckoutItems(checkout.items);
                        const firstItem = items[0];
                        const customer = checkout.customerName || checkout.email || "Guest checkout";
                        return (
                          <tr key={checkout.id} className="hover:bg-black/[0.02]">
                            <td className="border-b border-black/10 px-4 py-3 font-medium">
                              <p>{customer}</p>
                              {checkout.email && checkout.customerName ? <p className="mt-0.5 font-normal text-black/55">{checkout.email}</p> : null}
                            </td>
                            <td className="border-b border-black/10 px-4 py-3">
                              <p className="max-w-72 truncate font-medium">{firstItem?.name ?? "Products unavailable"}</p>
                              <p className="mt-0.5 text-black/55">{checkout.itemCount} {checkout.itemCount === 1 ? "item" : "items"}</p>
                            </td>
                            <td className="border-b border-black/10 px-4 py-3 font-medium">{money.format(checkout.total)}</td>
                            <td className="border-b border-black/10 px-4 py-3 text-black/65"><span className="inline-flex items-center gap-1"><Clock3 className="size-3" />{timestamp.format(checkout.lastActivityAt)}</span></td>
                            <td className="border-b border-black/10 px-4 py-3 text-right"><Link prefetch={false} href={`/dashboard/orders/abandoned-checkouts/${checkout.id}`} className="font-medium text-[#005BD3] hover:underline">View</Link></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
