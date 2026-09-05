import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Settings2, Tag } from "lucide-react";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { DiscountsTable } from "@/components/admin/discounts/discounts-table";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import * as discountsController from "@/lib/server/controllers/discounts.controller";

export const metadata: Metadata = {
  title: "Discounts | Xelectron Admin",
  description: "Manage discounts and automatic offers for Xelectron.",
};

export default async function DiscountsPage() {
  const discounts = await discountsController.listDiscounts();

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="flex items-center gap-2.5 text-xl font-medium text-[#1a1a1a]"><Settings2 className="size-5" /> Discounts</h1>
                <p className="mt-1 text-sm text-black/55">Create and manage discounts for your online store.</p>
              </div>
              <Link href="/dashboard/discounts/new" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-medium text-white hover:bg-black/80"><Plus className="size-3.5" /> Create discount</Link>
            </div>
            {discounts.length ? <DiscountsTable discounts={discounts.map((discount: any) => ({ ...discount, createdAt: discount.createdAt.toISOString() }))} /> : (
              <section className="mt-4 rounded-xl border border-black/10 bg-white px-4 py-14 text-center shadow-sm">
                <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-[#005BD3]/10 text-[#005BD3]"><Tag className="size-5" /></div>
                <h2 className="mt-4 text-sm font-semibold">Create your first discount</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/55">Offer a percentage or fixed amount off across all products with a customer code or an automatic discount.</p>
                <Link href="/dashboard/discounts/new" className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-medium text-white hover:bg-black/80"><Plus className="size-3.5" /> Create discount</Link>
              </section>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
