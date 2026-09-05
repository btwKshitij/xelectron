"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

type TrackingScan = {
  status: string;
  location: string | null;
  occurredAt: string | null;
  instructions: string | null;
};

type TrackingData = {
  found: boolean;
  trackingNumber: string;
  status: string | null;
  statusType: string | null;
  location: string | null;
  updatedAt: string | null;
  estimatedDelivery: string | null;
  carrier: string;
  scans: TrackingScan[];
};

function formatDateTime(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function TrackingContent({ orderId }: { orderId: string }) {
  const [data, setData] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTracking = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/tracking`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Unable to load shipment tracking.");
      }
      setData(json.data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load shipment tracking.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    const initialRequest = window.setTimeout(() => {
      void fetchTracking();
    }, 0);
    return () => window.clearTimeout(initialRequest);
  }, [fetchTracking]);

  return (
    <div className="min-h-[70vh] bg-slate-50/60 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0a7ae6] hover:underline"
        >
          <ArrowLeft className="size-3.5" /> Back to My Orders
        </Link>

        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-br from-[#f4f9ff] to-white px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#0a7ae6]">
                  <Truck className="size-5" />
                  <span className="text-xs font-bold uppercase tracking-[0.16em]">Secure shipment tracking</span>
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Track your delivery</h1>
                <p className="mt-1 text-sm text-slate-600">Live updates are retrieved securely from your courier.</p>
              </div>
              <button
                type="button"
                onClick={() => fetchTracking(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh status
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {loading ? (
              <div className="flex min-h-56 items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-[#0a7ae6] border-t-transparent" />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                <AlertCircle className="mx-auto size-7 text-amber-600" />
                <h2 className="mt-3 font-semibold text-slate-900">Tracking is not ready yet</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{error}</p>
                <Link href="/orders" className="mt-5 inline-flex text-sm font-semibold text-[#0a7ae6] hover:underline">Return to My Orders</Link>
              </div>
            ) : data && !data.found ? (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 text-center sm:p-8">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white text-[#0a7ae6] shadow-sm ring-8 ring-blue-100/50">
                  <Truck className="size-6" />
                </div>
                <span className="mt-5 inline-flex rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0a7ae6]">
                  AWB generated
                </span>
                <h2 className="mt-3 text-xl font-bold text-slate-900">Your parcel is being handed to {data.carrier}</h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                  Tracking number <span className="font-mono font-semibold text-slate-900">{data.trackingNumber}</span> is ready. The courier will show its first live update after the parcel is manifested and scanned.
                </p>
                <button
                  type="button"
                  onClick={() => fetchTracking(true)}
                  disabled={refreshing}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0a7ae6] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#086ac9] disabled:opacity-60"
                >
                  <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} /> Check for courier update
                </button>
              </div>
            ) : data ? (
              <div className="space-y-6">
                <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle2 className="size-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Current courier update</span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-slate-900">{data.status || "Shipment update received"}</h2>
                      {data.statusType && <p className="mt-1 text-sm text-slate-600">{data.statusType}</p>}
                    </div>
                    <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2 font-mono text-xs font-bold text-slate-700">
                      {data.trackingNumber}
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                    {data.location && <div className="flex items-center gap-2"><MapPin className="size-4 text-emerald-600" />{data.location}</div>}
                    {formatDateTime(data.updatedAt) && <div className="flex items-center gap-2"><CalendarClock className="size-4 text-emerald-600" />Updated {formatDateTime(data.updatedAt)}</div>}
                    {data.estimatedDelivery && <div className="flex items-center gap-2"><Truck className="size-4 text-emerald-600" />Estimated delivery: {data.estimatedDelivery}</div>}
                  </div>
                </section>

                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Shipment journey</h2>
                  {data.scans.length > 0 ? (
                    <ol className="mt-4 space-y-4 border-l-2 border-slate-100 pl-5">
                      {data.scans.map((scan, index) => (
                        <li key={`${scan.status}-${scan.occurredAt || index}`} className="relative">
                          <span className="absolute -left-[1.82rem] top-1.5 size-3 rounded-full border-2 border-white bg-[#0a7ae6] shadow-sm" />
                          <p className="text-sm font-semibold text-slate-900">{scan.status}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {[scan.location, formatDateTime(scan.occurredAt)].filter(Boolean).join(" · ")}
                          </p>
                          {scan.instructions && <p className="mt-1 text-xs text-slate-600">{scan.instructions}</p>}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">The courier has received the shipment status but has not provided scan history yet.</p>
                  )}
                </section>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 text-xs text-slate-500 sm:px-8">
            <ShieldCheck className="size-4 text-emerald-600" /> Courier information is fetched securely without exposing your shipment account details.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <TrackingContent orderId={id} />
      <Footer />
    </main>
  );
}
