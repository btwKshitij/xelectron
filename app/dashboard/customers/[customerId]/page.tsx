import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MoreHorizontal,
  PackageOpen,
  Phone,
  User,
  UserRound,
} from "lucide-react";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCustomerForDashboard } from "@/lib/server/controllers/dashboard.controller";

export const metadata: Metadata = {
  title: "Customer Detail | Xelectron Admin",
  description: "Review Xelectron customer profile and order history.",
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
});

function orderReference(id: string) {
  return `#${id.slice(-8).toUpperCase()}`;
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  const customer = await getCustomerForDashboard(customerId);
  if (!customer) notFound();

  const latestOrder = customer.orders[0];
  const lastShippingAddress = customer.orders.find((o: { shippingAddress: string | null }) => o.shippingAddress)?.shippingAddress;
  const cleanAddress = (lastShippingAddress || "").replace(/\[Payment:\s*[A-Z_]+\]/gi, "").trim();

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <main className="min-h-full flex-1 bg-[#f1f1f1] p-4 text-black sm:p-6">
            <div className="mx-auto max-w-6xl space-y-4">
              {/* Top Navigation & Action Header */}
              <div className="flex items-center gap-2">
                <Link prefetch={false}
                  href="/dashboard/customers"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white text-black/70 hover:bg-black/5 transition-colors"
                  title="Back to customers"
                >
                  <ArrowLeft className="size-4" />
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <UserRound className="size-5 text-slate-600" />
                    {customer.name}
                  </h1>
                  <p className="text-xs text-black/55">
                    Customer since {dateFormatter.format(new Date(customer.createdAt))}
                  </p>
                </div>
              </div>

              {/* Metric Banner Card */}
              <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-xs">
                <div className="grid grid-cols-1 divide-y divide-black/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-medium text-black/60">Amount spent</p>
                    <p className="mt-1 text-base font-bold text-slate-900">
                      {currencyFormatter.format(customer.amountSpent)}
                    </p>
                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-medium text-black/60">Orders</p>
                    <p className="mt-1 text-base font-bold text-slate-900">{customer.orders.length}</p>
                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-medium text-black/60">Customer since</p>
                    <p className="mt-1 text-base font-bold text-slate-900">
                      {dateFormatter.format(new Date(customer.createdAt))}
                    </p>
                  </div>
                </div>
              </section>

              {/* Main Content Layout (2-Column) */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
                {/* LEFT COLUMN: Last Order, Timeline (65%) */}
                <div className="space-y-5 lg:col-span-8">
                  {/* Last Order Placed Card */}
                  {latestOrder && (
                    <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-xs">
                      <div className="border-b border-black/10 px-5 py-3.5 flex items-center justify-between">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-black/75">
                          Last order placed
                        </h2>
                      </div>

                      <div className="p-5 space-y-4">
                        {/* Order Header Summary */}
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Link prefetch={false}
                                href={`/dashboard/orders/${latestOrder.id}`}
                                className="text-sm font-bold text-[#005BD3] hover:underline"
                              >
                                {orderReference(latestOrder.id)}
                              </Link>
                              {latestOrder.status === "CANCELLED" ? (
                                <span className="rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-900">
                                  Cancelled
                                </span>
                              ) : (
                                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-900">
                                  Paid
                                </span>
                              )}
                              {latestOrder.status === "DELIVERED" || latestOrder.status === "SHIPPED" ? (
                                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-900">
                                  Fulfilled
                                </span>
                              ) : (
                                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                                  Unfulfilled
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-black/55">
                              {dateFormatter.format(new Date(latestOrder.createdAt))} at{" "}
                              {timeFormatter.format(new Date(latestOrder.createdAt))} from Online Store
                            </p>
                          </div>
                          <p className="text-sm font-bold text-slate-900">
                            {currencyFormatter.format(latestOrder.total)}
                          </p>
                        </div>

                        {/* Order Items List */}
                        {latestOrder.items && latestOrder.items.length > 0 && (
                          <div className="divide-y divide-black/10 rounded-lg border border-black/10 bg-black/[0.01] p-3 space-y-3">
                            {latestOrder.items.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 pt-2 first:pt-0"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-white p-1">
                                    <Image
                                      src={item.product?.mainImage || "/category-smartphone.png"}
                                      alt={item.product?.name || "Product"}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-900 line-clamp-1">
                                      {item.product?.name || "Product Item"}
                                    </p>
                                    <span className="rounded-md bg-black/5 px-1.5 py-0.5 text-[10px] font-medium text-black/60">
                                      Qty: {item.quantity}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs font-semibold text-slate-900">
                                  {currencyFormatter.format((item.unitPrice || 0) * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Order Actions */}
                        <div className="flex items-center justify-end pt-2">
                          <Link prefetch={false}
                            href="/dashboard/orders"
                            className="inline-flex h-8 items-center rounded-lg border border-black/15 bg-white px-3 text-xs font-semibold text-black/80 hover:bg-black/5 transition-colors"
                          >
                            View all orders
                          </Link>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* All Orders Table Card */}
                  <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-xs">
                    <div className="border-b border-black/10 px-5 py-3.5 flex items-center justify-between">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-black/75">
                        Order history ({customer.orders.length})
                      </h2>
                    </div>
                    {customer.orders.length === 0 ? (
                      <div className="flex items-center gap-3 px-5 py-8 text-xs text-black/55">
                        <PackageOpen className="size-4" /> This customer has not placed any orders yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-black/10 text-xs">
                        {customer.orders.map((order: any) => (
                          <Link prefetch={false}
                            key={order.id}
                            href={`/dashboard/orders/${order.id}`}
                            className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-black/[0.04] cursor-pointer group"
                          >
                            <span className="font-bold text-black group-hover:underline">
                              {orderReference(order.id)}
                            </span>
                            <span className="text-black/55">
                              {dateFormatter.format(new Date(order.createdAt))} ·{" "}
                              <span className="font-semibold text-slate-800">{order.status}</span>
                            </span>
                            <span className="font-semibold text-slate-900">
                              {currencyFormatter.format(order.total)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </section>


                </div>

                {/* RIGHT COLUMN: Customer Details (35%) */}
                <div className="space-y-4 lg:col-span-4">
                  {/* Customer Info Card */}
                  <section className="rounded-xl border border-black/10 bg-white p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-black/10 pb-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-black/75 flex items-center gap-2">
                        <User className="size-4 text-black/60" /> Customer
                      </h2>
                      <button type="button" className="text-black/50 hover:text-black">
                        <MoreHorizontal className="size-4" />
                      </button>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-black/75">Contact information</p>
                      <a
                        href={`mailto:${customer.email}`}
                        className="flex items-center gap-1.5 text-xs text-[#005BD3] hover:underline"
                      >
                        <Mail className="size-3.5 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </a>
                      {customer.phone ? (
                        <a
                          href={`tel:${customer.phone}`}
                          className="flex items-center gap-1.5 text-xs text-black/80 hover:text-[#005BD3]"
                        >
                          <Phone className="size-3.5 shrink-0 text-black/60" />
                          <span>{customer.phone}</span>
                        </a>
                      ) : (
                        <p className="text-xs text-black/45">No phone number provided</p>
                      )}
                    </div>

                    <hr className="border-black/10" />

                    {/* Default Address */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-black/75">Default address</p>
                      <div className="text-xs text-black/80 space-y-0.5">
                        <p className="font-semibold text-slate-900">{customer.name}</p>
                        <p className="text-black/65 leading-relaxed">
                          {cleanAddress || "No default address saved"}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
