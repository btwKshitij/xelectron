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
  Package,
  ArrowUpRight,
  Check,
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
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
}

function deliveryStage(status: string | null) {
  const value = (status || "").toLowerCase();
  if (value === "cancelled") return { step: -1, title: "Shipment cancelled", description: "This shipment was cancelled in Delhivery. Contact the store for the next steps for your order." };
  if (/rto|return|cancel|fail|undeliver|exception|lost/.test(value)) return { step: -1, title: status || "Delivery update", description: "There is an update to your delivery. See the latest courier activity below." };
  if (value === "delivered") return { step: 3, title: "Your parcel has arrived", description: "Delhivery has marked your shipment as delivered." };
  if (value.includes("out for delivery") || value === "dispatched") return { step: 2, title: "Out for delivery", description: "Your parcel is with the delivery agent for the final part of its journey." };
  if (/in transit|in-transit|picked up/.test(value)) return { step: 1, title: "Your parcel is on its way", description: "Your parcel is travelling through the Delhivery network." };
  if (value === "manifested") return { step: 0, title: "Getting your parcel ready", description: "Your shipment is registered with Delhivery and is awaiting collection. We will show the next update when the courier scans it." };
  return { step: -1, title: status || "Waiting for a courier update", description: "Follow the latest updates from Delhivery below." };
}

function cleanLocation(location: string | null) {
  return location?.replace(/_/g, " ").replace(/\bGW\b/g, "Gateway") || "";
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

  const stage = deliveryStage(data?.status || null);
  const steps = ["Preparing", "In transit", "Out for delivery", "Delivered"];
  const scans = [...(data?.scans || [])].sort((a, b) => {
    const first = Date.parse(a.occurredAt || "");
    const second = Date.parse(b.occurredAt || "");
    return Number.isFinite(first) && Number.isFinite(second) ? second - first : 0;
  });

  return (
    <div className="min-h-[75vh] bg-[#f6f8fb] py-8 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link prefetch={false} href="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"><ArrowLeft className="size-4" />My orders</Link>
          <button type="button" onClick={() => fetchTracking(true)} disabled={loading || refreshing} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50"><RefreshCw className={`size-3.5 ${refreshing ? "motion-safe:animate-spin" : ""}`} />{refreshing ? "Updating..." : "Refresh tracking"}</button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Your delivery</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Track your order</h1>
          </div>
          {loading ? <div role="status" className="flex min-h-80 flex-col items-center justify-center gap-4 text-sm text-slate-500"><RefreshCw className="size-6 motion-safe:animate-spin text-blue-600" />Loading your delivery updates...</div> : <>
            {error && <div role="alert" className="mx-6 mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertCircle className="mt-0.5 size-5 shrink-0" /><div><p className="font-semibold">We could not refresh your tracking</p><p className="mt-1">{error}</p>{data && <p className="mt-1 text-xs">Showing the last available update.</p>}</div></div>}
            {data && <>
              <div className="grid lg:grid-cols-[1fr_280px]">
                <section className="px-6 py-8 sm:p-8">
                  <div className="mb-5 flex items-center gap-3">
                    <span className={`flex size-12 items-center justify-center rounded-2xl ${stage.step === 3 ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>{stage.step === 3 ? <CheckCircle2 className="size-6" /> : <Package className="size-6" />}</span>
                    <span className="text-xs font-medium text-slate-500">{data.carrier || "Delhivery"}</span>
                  </div>
                  <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">{data.found ? stage.title : "Waiting for tracking to begin"}</h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">{data.found ? stage.description : "A tracking number has been assigned. We will show your parcel's progress once Delhivery confirms its status."}</p>
                  {data.found && stage.step >= 0 && <ol aria-label="Delivery progress" className="mt-8 grid grid-cols-4">
                    {steps.map((label, index) => <li key={label} aria-current={index === stage.step ? "step" : undefined} className="relative">
                      <div className="flex items-center"><span className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 ${index <= stage.step ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-300"}`}>{index < stage.step ? <Check className="size-3.5" /> : <span className={`size-2 rounded-full ${index === stage.step ? "bg-white" : "bg-slate-200"}`} />}</span>{index < steps.length - 1 && <span className={`h-0.5 w-full ${index < stage.step ? "bg-blue-600" : "bg-slate-100"}`} />}</div>
                      <p className={`mt-3 pr-2 text-[11px] leading-4 sm:text-xs ${index === stage.step ? "font-semibold text-blue-700" : index < stage.step ? "text-slate-700" : "text-slate-400"}`}>{label}</p>
                    </li>)}
                  </ol>}
                </section>
                <aside className="border-t border-slate-100 bg-slate-50/60 p-6 sm:p-8 lg:border-l lg:border-t-0">
                  <p className="flex items-center gap-2 text-xs font-medium text-slate-500"><CalendarClock className="size-4" />{stage.step === 3 ? "Delivery update" : "Estimated arrival"}</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{stage.step === 3 ? "Delivered" : data.estimatedDelivery || "Not available yet"}</p>
                  {!data.estimatedDelivery && stage.step !== 3 && <p className="mt-2 text-xs leading-5 text-slate-500">An estimate will appear when provided by the courier.</p>}
                  <div className="mt-6 border-t border-slate-200/70 pt-5"><p className="text-xs text-slate-500">Tracking number</p><p className="mt-2 break-all font-mono text-sm font-medium text-slate-800">{data.trackingNumber}</p></div>
                  <a href={`https://www.delhivery.com/tracking?uniqueIdentifier=${encodeURIComponent(data.trackingNumber)}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">Track on Delhivery <ArrowUpRight className="size-3.5" /></a>
                </aside>
              </div>
              <section className="border-t border-slate-100 px-6 py-7 sm:px-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-sm font-semibold text-slate-900">Delivery activity</h2><p className="text-[11px] text-slate-400">All times in IST</p></div>
                {scans.length ? <ol className="mt-6">
                  {scans.map((scan, index) => <li key={`${scan.status}-${scan.occurredAt}-${index}`} className="relative ml-2 border-l border-slate-200 pb-6 pl-6 last:border-transparent last:pb-0">
                    <span className={`absolute -left-[5px] top-1 size-[9px] rounded-full ring-4 ring-white ${index === 0 ? "bg-blue-600" : "bg-slate-300"}`} />
                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4"><p className={`text-sm font-medium ${index === 0 ? "text-slate-900" : "text-slate-600"}`}>{scan.status.toLowerCase() === "manifested" ? "Shipment registered with Delhivery" : scan.status}</p><p className="shrink-0 text-xs text-slate-400">{formatDateTime(scan.occurredAt)}</p></div>
                    {scan.location && <p className="mt-2 flex items-start gap-1 text-xs leading-5 text-slate-500"><MapPin className="mt-0.5 size-3.5 shrink-0" />{cleanLocation(scan.location)}</p>}
                    {scan.instructions && scan.status.toLowerCase() !== "manifested" && <p className="mt-1 text-xs leading-5 text-slate-500">{scan.instructions}</p>}
                  </li>)}
                </ol> : <p className="mt-4 text-sm text-slate-500">No courier activity yet. Check back after the next scan.</p>}
              </section>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:px-8"><p className="text-xs text-slate-500">{data.updatedAt ? `Last courier update: ${formatDateTime(data.updatedAt)} IST` : "Updates appear as your parcel is scanned."}</p><Link href="/orders" className="text-xs font-semibold text-blue-600 hover:underline">View my orders</Link></div>
            </>}
            {!data && <div className="px-6 py-8"><Link href="/orders" className="text-sm font-semibold text-blue-600">Return to my orders</Link></div>}
          </>}
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
