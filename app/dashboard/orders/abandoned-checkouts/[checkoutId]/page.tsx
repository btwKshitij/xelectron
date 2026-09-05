import Link from "next/link";
import { Clock3, ShoppingCart } from "lucide-react";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAbandonedCheckout } from "@/lib/server/controllers/abandoned-checkouts.controller";
import { readAbandonedCheckoutItems } from "@/lib/server/dal/abandoned-checkouts.dal";

export default async function AbandonedCheckoutDetailPage({ params }: PageProps<"/dashboard/orders/abandoned-checkouts/[checkoutId]">) {
  const { checkoutId } = await params;
  let checkout: Awaited<ReturnType<typeof getAbandonedCheckout>> | null = null;
  try {
    checkout = await getAbandonedCheckout(checkoutId);
  } catch {
    checkout = null;
  }

  const items = checkout ? readAbandonedCheckoutItems(checkout.items) : [];
  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
  const timestamp = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-5">
            <div className="mx-auto max-w-3xl">
              <Link prefetch={false} href="/dashboard/orders/abandoned-checkouts" className="text-xs text-black/55 underline underline-offset-2 hover:text-black">Back to abandoned checkouts</Link>
              {!checkout ? (
                <section className="mt-3 rounded-xl border border-black/10 bg-white px-4 py-12 text-center shadow-sm">
                  <ShoppingCart className="mx-auto size-6 text-black/45" />
                  <h1 className="mt-3 text-sm font-semibold">Checkout not found</h1>
                  <p className="mx-auto mt-2 max-w-md text-sm text-black/55">This checkout may have been completed or removed.</p>
                </section>
              ) : (
                <>
                  <header className="mt-3 flex flex-wrap items-end justify-between gap-3">
                    <div><h1 className="text-lg font-semibold">Abandoned checkout</h1><p className="mt-1 text-xs text-black/55">Started {timestamp.format(checkout.createdAt)}</p></div>
                    <span className="inline-flex items-center gap-1 text-xs text-black/55"><Clock3 className="size-3.5" />Last active {timestamp.format(checkout.lastActivityAt)}</span>
                  </header>
                  <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
                      <div className="border-b border-black/10 px-4 py-3"><h2 className="text-sm font-semibold">Products</h2></div>
                      <div className="divide-y divide-black/10">
                        {items.map((item) => <div key={item.productId} className="flex items-center justify-between gap-4 px-4 py-3"><div><Link prefetch={false} href={`/dashboard/products/${item.slug}`} className="font-medium hover:underline">{item.name}</Link><p className="mt-0.5 text-xs text-black/55">{item.category} · Quantity {item.quantity}</p></div><span className="shrink-0 font-medium">{money.format(item.unitPrice * item.quantity)}</span></div>)}
                      </div>
                      <div className="flex justify-between border-t border-black/10 px-4 py-3 text-sm font-semibold"><span>Total</span><span>{money.format(checkout.total)}</span></div>
                    </section>
                    <aside className="rounded-xl border border-black/10 bg-white p-4 shadow-sm"><h2 className="text-sm font-semibold">Customer</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-black/55">Name</dt><dd className="mt-0.5 font-medium">{checkout.customerName || "Not provided"}</dd></div><div><dt className="text-black/55">Email</dt><dd className="mt-0.5 font-medium">{checkout.email || "Not provided"}</dd></div><div><dt className="text-black/55">Phone</dt><dd className="mt-0.5 font-medium">{checkout.phone || "Not provided"}</dd></div></dl></aside>
                  </div>
                </>
              )}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
