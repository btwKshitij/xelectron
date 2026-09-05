"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import { useCart } from "@/components/providers/cart-provider";

type VelocityOrderData = {
  id: string;
  orderNumber: string;
  total: number;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
};

type VelocityVerificationResponse = {
  success?: boolean;
  pending?: boolean;
  paymentStatus?: string;
  error?: string;
  data?: VelocityOrderData;
};

function VelocityCallbackContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<VelocityOrderData | null>(null);

  const state = searchParams.get("state");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;
    let retryCount = 0;

    async function verifyAndConfirm() {
      try {
        const res = await fetch("/api/payment/velocity/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state, orderId }),
        });

        const json = (await res.json()) as VelocityVerificationResponse;
        if (isMounted) {
          if (json.pending) {
            retryCount += 1;
            if (retryCount <= 20) {
              setPendingMessage(
                json.paymentStatus === "success"
                  ? "Payment received. Waiting for Velocity's signed confirmation…"
                  : "Checking your Velocity payment status…"
              );
              retryTimeout = setTimeout(verifyAndConfirm, 3000);
              return;
            }

            setError(
              "We could not receive Velocity's payment confirmation yet. Your order remains pending; please check again shortly."
            );
            setLoading(false);
            return;
          }

          if (json.success && json.data) {
            setOrderData(json.data);
            clearCart();

            if (typeof window !== "undefined" && json.data.id) {
              try {
                const existing = JSON.parse(
                  localStorage.getItem("xelectron_guest_orders") || "[]"
                );
                if (!existing.includes(json.data.id)) {
                  existing.unshift(json.data.id);
                  localStorage.setItem(
                    "xelectron_guest_orders",
                    JSON.stringify(existing.slice(0, 20))
                  );
                }
              } catch {}
            }
          } else {
            setError(json.error || "Could not confirm Velocity EMI payment.");
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setError("Network error while verifying payment status.");
          setLoading(false);
        }
      }
    }

    verifyAndConfirm();

    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [state, orderId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="size-12 animate-spin rounded-full border-4 border-[#0a7ae6] border-t-transparent mb-4" />
        <h2 className="text-base font-bold text-slate-800">
          {pendingMessage || "Confirming Velocity EMI Approval…"}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Please do not refresh or close this window.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Package className="size-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Payment Verification Issue</h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">{error}</p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link prefetch={false}
              href="/checkout"
              className="w-full rounded-xl bg-[#0a7ae6] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#086ac9] transition"
            >
              Return to Checkout
            </Link>
            <Link prefetch={false}
              href="/"
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl sm:p-10">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="size-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-bold text-[#0a7ae6] mb-3">
          <ShieldCheck className="size-3.5" /> Velocity No-Cost EMI Approved
        </span>

        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Thank you for your order!
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your order has been confirmed and placed with Velocity EMI financing.
        </p>

        {orderData?.orderNumber && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-left space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="font-semibold text-slate-500">Order Number</span>
              <span className="font-mono font-bold text-slate-900">{orderData.orderNumber}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="font-semibold text-slate-500">Total Financed</span>
              <span className="font-bold text-[#0a7ae6]">
                ₹{Number(orderData.total || 0).toLocaleString("en-IN")}
              </span>
            </div>

            {orderData?.shippingCarrier ? <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="font-semibold text-slate-500">Delivery Partner</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Truck className="size-3.5 text-emerald-600" /> {orderData.shippingCarrier}
              </span>
            </div> : null}

            {orderData?.trackingNumber && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Delhivery AWB</span>
                <a
                  href={orderData.trackingUrl || `https://track.delhivery.com/p/${orderData.trackingNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-bold text-[#0a7ae6] hover:underline flex items-center gap-1"
                >
                  {orderData.trackingNumber} <ExternalLink className="size-3" />
                </a>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link prefetch={false}
            href="/orders"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0a7ae6] py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#0a7ae6]/25 transition hover:bg-[#086ac9]"
          >
            <span>View Order Status</span>
            <ArrowRight className="size-4" />
          </Link>
          <Link prefetch={false}
            href="/"
            className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 py-3.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VelocityCallbackPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="size-10 animate-spin rounded-full border-4 border-[#0a7ae6] border-t-transparent" />
          </div>
        }
      >
        <VelocityCallbackContent />
      </Suspense>
    </>
  );
}
