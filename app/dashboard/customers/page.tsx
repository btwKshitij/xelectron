import type { Metadata } from "next";
import { Plus, UserRound } from "lucide-react";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { CustomerTableRows } from "@/components/admin/customers/customer-table-rows";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCustomersForDashboard } from "@/lib/server/controllers/dashboard.controller";

export const metadata: Metadata = {
  title: "Customers | Xelectron Admin",
  description: "Review customer profiles, orders, and spending in Xelectron.",
};

export default async function CustomersPage() {
  const customers = await getCustomersForDashboard();

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="flex items-center gap-2 text-lg font-semibold"><UserRound className="size-4" /> Customers</h1>
                <p className="mt-1 text-xs text-black/55">Customers saved in your database.</p>
              </div>
              <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-medium text-white hover:bg-black/80"><Plus className="size-3.5" /> Add customer</button>
            </div>

            <section className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
              {customers.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <h2 className="text-sm font-semibold">No customers yet</h2>
                  <p className="mt-2 text-sm text-black/55">Customer accounts will appear here after they are created.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                    <thead className="bg-black/[0.025] text-black/65">
                      <tr>
                        {['', 'Customer name', 'Email', 'Phone', 'Orders', 'Amount spent', 'Joined'].map((heading, index) => (
                          <th key={`${heading}-${index}`} className={`border-b border-black/10 px-3 py-2.5 font-medium ${index === 4 || index === 5 ? 'text-right' : ''}`}>{index === 0 ? <input type="checkbox" aria-label="Select all customers" /> : heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody><CustomerTableRows customers={customers} /></tbody>
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
