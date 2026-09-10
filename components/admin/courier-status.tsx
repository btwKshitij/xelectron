"use client";

import { AlertCircle, ArrowUpRight, Clock3, MapPin, RefreshCw, Truck } from "lucide-react";

type Scan = { status: string; location: string | null; occurredAt: string | null; instructions: string | null };
type Props = {
  trackingNumber: string;
  trackingUrl: string;
  details: { found: boolean; status: string | null; updatedAt: string | null; instructions?: string | null; location: string | null; scans: Scan[] } | null;
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onRemove?: () => void;
  removing: boolean;
};

function timestamp(value: string) {
  return new Date(/[zZ]$|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}+05:30`);
}
function dateLabel(value: string | null) {
  if (!value) return "";
  const date = timestamp(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(date);
}
function eventTitle(scan: Scan) {
  if (/\bcancelled\b|\bcanceled\b/i.test(scan.instructions || "")) return "Shipment cancelled";
  return scan.status === "Manifested" ? "Shipment registered" : scan.status === "Not Picked" ? "Awaiting collection" : scan.status;
}

export function CourierStatus({ trackingNumber, trackingUrl, details, loading, error, onRefresh, onRemove, removing }: Props) {
  const cancelled = details?.status === "Cancelled";
  const delivered = details?.status === "Delivered";
  const scans = [...(details?.scans || [])].sort((a, b) => (b.occurredAt ? timestamp(b.occurredAt).getTime() : 0) - (a.occurredAt ? timestamp(a.occurredAt).getTime() : 0));
  const status = details?.found ? details.status || "Status received" : loading ? "Checking status" : "Awaiting courier update";
  function event(scan: Scan, index: number) {
    return <li key={`${scan.occurredAt}-${index}`} className="relative ml-1 border-l border-slate-200 pb-5 pl-5 last:border-transparent last:pb-0">
      <span className={`absolute -left-[4.5px] top-1 size-2 rounded-full ring-4 ring-white ${index === 0 ? cancelled ? "bg-amber-500" : "bg-blue-500" : "bg-slate-300"}`} />
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4"><p className="text-xs font-semibold text-slate-800">{eventTitle(scan)}</p><time className="shrink-0 text-[11px] text-slate-400">{dateLabel(scan.occurredAt)}</time></div>
      {scan.location && <p className="mt-1.5 flex items-start gap-1 text-[11px] leading-5 text-slate-500"><MapPin className="mt-1 size-3 shrink-0" />{scan.location.replace(/_/g, " ").replace(/\bGW\b/g, "Gateway")}</p>}
      {scan.instructions && <p className="mt-1 text-[11px] leading-5 text-slate-500">{scan.instructions}</p>}
    </li>;
  }
  return <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
      <div className="flex items-center gap-2"><Truck className="size-4 text-slate-400" /><h3 className="text-sm font-semibold text-slate-900">Courier activity</h3></div>
      <div className="flex items-center gap-1"><button type="button" onClick={onRefresh} disabled={loading} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50"><RefreshCw className={`size-3.5 ${loading ? "motion-safe:animate-spin" : ""}`} />{loading ? "Refreshing" : "Refresh"}</button><a href={trackingUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-blue-600 hover:bg-blue-50">Delhivery <ArrowUpRight className="size-3.5" /></a></div>
    </div>
    <div className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cancelled ? "bg-amber-50 text-amber-800" : delivered ? "bg-emerald-50 text-emerald-800" : "bg-blue-50 text-blue-700"}`}><span className={`size-1.5 rounded-full ${cancelled ? "bg-amber-500" : delivered ? "bg-emerald-500" : "bg-blue-500"}`} />{status}</span><p className="mt-2 text-xs text-slate-500">{cancelled ? "Cancelled by the seller in Delhivery." : details?.instructions || "Updates appear when the courier scans your parcel."}</p></div>
        <div className="text-xs sm:text-right"><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{cancelled ? "Cancelled AWB" : "Tracking number"}</p><p className="mt-1 font-mono text-slate-600">{trackingNumber}</p></div>
      </div>
      {error && <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800"><AlertCircle className="size-4 shrink-0" />{error}</p>}
      {scans.length > 0 && <div className="mt-5 border-t border-slate-100 pt-4"><div className="mb-4 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Latest event</p><span className="text-[10px] text-slate-400">Times in IST</span></div><ol>{event(scans[0], 0)}</ol>{scans.length > 1 && <details className="mt-4"><summary className="w-fit cursor-pointer text-xs font-medium text-slate-500 hover:text-blue-600">View {scans.length - 1} earlier {scans.length === 2 ? "event" : "events"}</summary><ol className="mt-4">{scans.slice(1).map((scan, index) => event(scan, index + 1))}</ol></details>}</div>}
      {onRemove && details && !details.found && <button type="button" onClick={onRemove} disabled={removing} className="mt-3 text-xs font-medium text-red-700 underline disabled:opacity-50">Remove invalid AWB</button>}
    </div>
    <div className="flex items-center gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[10px] text-slate-400 sm:px-5"><Clock3 className="size-3" />{details?.updatedAt ? `Last courier update: ${dateLabel(details.updatedAt)} IST` : "Waiting for the first courier update"}</div>
  </section>;
}
