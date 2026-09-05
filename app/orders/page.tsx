"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format-price";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  User,
  ArrowLeft,
  ShoppingBag,
  Copy,
  Check,
  Search,
  MapPin,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  product?: {
    id: string;
    name: string;
    mainImage?: string;
    slug?: string;
  };
};

type OrderData = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  shippingAddress?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  city?: string;
  state?: string;
  pincode?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  items: OrderItem[];
};

function OrdersContent() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();

        if (isMounted) {
          if (res.status === 401) {
            setIsUnauthorized(true);
          } else if (json.success && Array.isArray(json.data)) {
            setOrders(json.data);
            setIsUnauthorized(false);
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsUnauthorized(true);
          setLoading(false);
        }
      }
    }

    fetchOrders();
    const refreshId = window.setInterval(fetchOrders, 15_000);
    return () => {
      isMounted = false;
      window.clearInterval(refreshId);
    };
  }, []);

  const handleCopyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(awb);
    toast.success("AWB / Tracking number copied to clipboard!");
    setTimeout(() => setCopiedAwb(null), 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="size-3.5" /> Delivered
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0a7ae6] border border-blue-200/60">
            <Truck className="size-3.5" /> Shipped & In Transit
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60">
            <Package className="size-3.5" /> Processing & Packing
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60">
            <CheckCircle2 className="size-3.5" /> Order Confirmed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
            <Clock className="size-3.5" /> Order Placed
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-[#0a7ae6] border-t-transparent" />
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10">
          <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-blue-50 text-[#0a7ae6] ring-8 ring-blue-50/50">
            <User className="size-9 stroke-[2]" />
          </div>

          <span className="inline-block rounded-full bg-blue-100/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#0a7ae6]">
            Sign In Required
          </span>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Track Your Orders
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Please sign in to your XElectron account to view your purchase history, live fulfillment status, and courier tracking.
          </p>

          <div className="mt-8 space-y-3">
            <Link prefetch={false}
              href="/login?redirectTo=/orders"
              className="block w-full rounded-xl bg-[#0a7ae6] py-3.5 text-center text-sm font-semibold text-white shadow-md shadow-[#0a7ae6]/20 transition-all hover:bg-[#086ac9]"
            >
              Sign In to Your Account
            </Link>

            <Link prefetch={false}
              href="/login?mode=signup&redirectTo=/orders"
              className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 pt-6 sm:pt-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Orders & Shipment Tracking</h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Track live courier status, view delivery details, and manage your purchases.
            </p>
          </div>
          <Link prefetch={false}
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0a7ae6] hover:underline"
          >
            <ArrowLeft className="size-3.5" /> Continue Shopping
          </Link>
        </div>

        {/* Orders List or Empty State */}
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ShoppingBag className="size-8 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No orders placed yet</h3>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm max-w-sm mx-auto">
              When you purchase products, your orders and live courier tracking links will show up here.
            </p>
            <div className="mt-6 flex justify-center">
              <Link prefetch={false}
                href="/shop"
                className="rounded-xl bg-[#0a7ae6] px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#086ac9]"
              >
                Explore Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              const awb = order.trackingNumber?.trim() || "";
              const hasTracking = Boolean(awb);
              const carrier = order.shippingCarrier?.trim() || "Courier partner";
              const estDelivery = order.estimatedDelivery?.trim() || "";
              const deliveryStatusUrl = `/orders/${order.id}/tracking`;
              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  {/* 1. ORDER HEADER */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="text-slate-400">Order ID:</span>{" "}
                        <span className="font-bold text-slate-900">
                          #XE-{order.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div className="hidden sm:block text-slate-300">•</div>
                      <div>
                        <span className="text-slate-400">Date:</span>{" "}
                        <span className="font-medium text-slate-700">{formattedDate}</span>
                      </div>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  {/* 2. SHIPPING & TRACKING HERO CARD */}
                  <div className="bg-blue-50/40 border-b border-slate-100 p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        {hasTracking ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Truck className="size-4 text-[#0a7ae6]" />
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                Fulfillment Courier: {carrier}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <span>AWB / Tracking No:</span>
                              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {awb}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyAwb(awb)}
                                className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
                                title="Copy AWB number"
                              >
                                {copiedAwb === awb ? (
                                  <Check className="size-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="size-3.5" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium pt-0.5">
                              <Calendar className="size-3.5" />
                              <span>
                                {estDelivery
                                  ? `Estimated Delivery: ${estDelivery}`
                                  : "Tracking updates will appear after the courier's first scan."}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <Package className="size-4 text-amber-600" />
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                Shipment preparation
                              </span>
                            </div>
                            <p className="max-w-lg text-xs leading-5 text-slate-600">
                              Your tracking number will appear here as soon as our team prepares your shipment.
                            </p>
                          </>
                        )}
                      </div>

                      {hasTracking && (
                        <Link prefetch={false}
                          href={deliveryStatusUrl}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0a7ae6] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#086ac9] transition-all"
                        >
                          <Search className="size-3.5" /> View Delivery Status
                        </Link>
                      )}
                    </div>

                    {/* Visual 5-Step Tracker */}
                    <div className="w-full pt-3 pb-1">
                      <div className="relative">
                        {/* Background Track Line (Centered precisely through middle of dots from 10% to 90%) */}
                        <div className="absolute top-3 sm:top-3.5 left-[10%] right-[10%] h-1 bg-slate-200 rounded-full overflow-hidden">
                          {/* Active Filled Progress Bar */}
                          <div
                            className="h-full bg-[#0a7ae6] transition-all duration-700 ease-out"
                            style={{
                              width: `${(
                                (order.status?.toUpperCase() === "DELIVERED"
                                  ? 4
                                  : order.status?.toUpperCase() === "SHIPPED"
                                  ? 3
                                  : order.status?.toUpperCase() === "PROCESSING"
                                  ? 2
                                  : order.status?.toUpperCase() === "CONFIRMED"
                                  ? 1
                                  : 0) / 4
                              ) * 100}%`,
                            }}
                          />
                        </div>

                        {/* 5 Step Nodes */}
                        <div className="relative z-10 grid grid-cols-5 text-center">
                          {[
                            { key: "PLACED", label: "Order Placed" },
                            { key: "CONFIRMED", label: "Confirmed" },
                            { key: "PROCESSING", label: "Packing" },
                            { key: "SHIPPED", label: "In Transit" },
                            { key: "DELIVERED", label: "Delivered" },
                          ].map((step, idx) => {
                            const currentIdx =
                              order.status?.toUpperCase() === "DELIVERED"
                                ? 4
                                : order.status?.toUpperCase() === "SHIPPED"
                                ? 3
                                : order.status?.toUpperCase() === "PROCESSING"
                                ? 2
                                : order.status?.toUpperCase() === "CONFIRMED"
                                ? 1
                                : 0;
                            const isCompleted = idx < currentIdx;
                            const isCurrent = idx === currentIdx;

                            return (
                              <div key={step.key} className="flex flex-col items-center">
                                <div
                                  className={`size-6 sm:size-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                                    isCompleted
                                      ? "bg-[#0a7ae6] text-white shadow-xs"
                                      : isCurrent
                                      ? "bg-[#0a7ae6] text-white ring-4 ring-blue-100 shadow-sm"
                                      : "bg-white text-slate-400 border-2 border-slate-300"
                                  }`}
                                >
                                  {isCompleted || isCurrent ? (
                                    <Check className="size-3.5 stroke-[3]" />
                                  ) : (
                                    <span>{idx + 1}</span>
                                  )}
                                </div>
                                <span
                                  className={`mt-2 text-[10px] sm:text-xs tracking-tight transition-colors leading-tight px-1 ${
                                    isCurrent
                                      ? "font-bold text-slate-900"
                                      : isCompleted
                                      ? "font-medium text-slate-700"
                                      : "font-normal text-slate-400"
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. ORDER ITEMS LIST */}
                  <div className="divide-y divide-slate-100 px-5 sm:px-6">
                    {order.items.map((item) => {
                      const image = item.product?.mainImage || "/category-smartphone.png";
                      const name = item.product?.name || "XElectron Product";
                      const slug = item.product?.slug || item.product?.id;

                      return (
                        <div key={item.id} className="flex items-center gap-4 py-4">
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white p-1 sm:size-20">
                            <Image
                              src={image}
                              alt={name}
                              fill
                              className="object-contain p-1"
                              sizes="80px"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            {slug ? (
                              <Link prefetch={false}
                                href={`/product/${slug}`}
                                className="truncate text-xs font-semibold text-slate-900 hover:text-[#0a7ae6] sm:text-sm block"
                              >
                                {name}
                              </Link>
                            ) : (
                              <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">{name}</p>
                            )}
                            <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                              Qty: {item.quantity} × {formatINR(item.unitPrice)}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-900 sm:text-sm">
                              {formatINR(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 4. SHIPPING ADDRESS & TOTAL FOOTER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-4 sm:px-6">
                    <div className="text-xs text-slate-600 flex items-start gap-1.5 max-w-lg">
                      <MapPin className="size-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-slate-900 font-semibold">Shipping Address: </strong>
                        <span>
                          {order.customerName ? `${order.customerName}, ` : ""}
                          {order.shippingAddress ? order.shippingAddress.replace(/\[Payment:\s*[A-Z_]+\]/gi, "").trim() : "Standard Address"}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs text-slate-500 font-normal mr-2">Total Amount Paid:</span>
                      <span className="text-[#0a7ae6] text-base font-bold">{formatINR(order.total)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-[#0a7ae6] border-t-transparent" />
        </div>
      }>
        <OrdersContent />
      </Suspense>
      <Footer />
    </main>
  );
}
