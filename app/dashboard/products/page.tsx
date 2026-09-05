import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  Download,
  Plus,
  Tag,
  Upload,
} from "lucide-react";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { ProductsTable } from "@/components/admin/products/products-table";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import * as productsController from "@/lib/server/controllers/products.controller";

export const metadata: Metadata = {
  title: "Products | Xelectron Admin",
  description: "Manage Xelectron products, collections, and inventory.",
};

export default async function ProductsPage() {
  const dbProducts = await productsController.listCatalogProducts();

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="flex items-center gap-2 text-lg font-semibold">
                <Tag className="size-4" /> Products ({dbProducts.length})
              </h1>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-black/[0.06] px-3 text-xs font-medium hover:bg-black/10"
                >
                  <Download className="size-3.5" /> Export
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-black/[0.06] px-3 text-xs font-medium hover:bg-black/10"
                >
                  <Upload className="size-3.5" /> Import
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-black/[0.06] px-3 text-xs font-medium hover:bg-black/10"
                >
                  More actions <ChevronDown className="size-3.5" />
                </button>
                <Link prefetch={false}
                  href="/dashboard/products/new"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-medium text-white hover:bg-black/80"
                >
                  <Plus className="size-3.5" /> Add product
                </Link>
              </div>
            </div>

            <section className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
              <div className="grid grid-cols-2 divide-x divide-y divide-black/10 sm:grid-cols-2 lg:grid-cols-4 lg:divide-y-0">
                <div className="flex items-center gap-2 px-4 py-4 text-xs font-medium">
                  <CalendarDays className="size-4" /> 30 days
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-black/65 underline decoration-dotted underline-offset-4">
                    Average sell-through rate
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    0.01% <span className="font-normal text-black/45">—</span>
                  </p>
                  <div className="mt-2 h-0.5 w-11 bg-[#55c5f7]" />
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-black/65 underline decoration-dotted underline-offset-4">
                    Products by days of inventory remaining
                  </p>
                  <p className="mt-1 text-sm text-black/55">No data</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-black/65 underline decoration-dotted underline-offset-4">
                    ABC product analysis
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    ₹0.00 <span className="font-normal text-black/55">C</span>
                  </p>
                  <div className="mt-2 h-0.5 w-11 bg-[#55c5f7]" />
                </div>
              </div>
            </section>

            <ProductsTable
              products={dbProducts.map((product: any) => ({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                mainImage: product.mainImage,
                quantity: product.quantity,
                category: product.category ? { title: product.category.title } : null,
              }))}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
