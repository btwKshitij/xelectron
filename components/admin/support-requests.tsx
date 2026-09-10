"use client";

import { useState } from "react";
import { Search, Inbox, ChevronDown, ArrowUpRight, MessageSquare, ShieldCheck, SlidersHorizontal } from "lucide-react";

export type SupportRequestRow = { id: string; kind: string; createdAt: string; details: Record<string, unknown> };
const text = (value: unknown): string => value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
const label = (key: string) => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/^./, character => character.toUpperCase());
const kindLabel = (kind: string) => label(kind.toLowerCase());
function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(date));
}

export function SupportRequests({ requests }: { requests: SupportRequestRow[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("ALL");
  const kinds = Array.from(new Set(requests.map(request => request.kind)));
  const filtered = requests.filter(request => (kind === "ALL" || request.kind === kind) && [request.id, request.kind, ...Object.values(request.details).map(text)].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  const counts = (value: string) => value === "ALL" ? requests.length : requests.filter(request => request.kind === value).length;
  return <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-8 sm:py-9">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Customer care</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Support requests</h1><p className="mt-2 text-sm text-slate-500">Review customer questions, product issues and warranty registrations.</p></div>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><Inbox className="size-5 text-blue-500" /><div><p className="text-xl font-semibold leading-none text-slate-900">{requests.length}</p><p className="mt-1 text-[11px] text-slate-400">Latest requests</p></div></div>
    </div>
    <div className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4 sm:p-5">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" /><input aria-label="Search support requests" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by customer, phone, email or reference..." className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" /></div>
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Request type filters"><SlidersHorizontal className="mr-1 size-3.5 text-slate-400" />{["ALL", ...kinds].map(value => <button type="button" key={value} aria-pressed={kind === value} onClick={() => setKind(value)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${kind === value ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>{value === "ALL" ? "All requests" : kindLabel(value)}<span className={kind === value ? "text-slate-300" : "text-slate-400"}>{counts(value)}</span></button>)}</div>
      </div>
      <div className="flex justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3 text-[11px] text-slate-400"><span aria-live="polite">{filtered.length} {filtered.length === 1 ? "request" : "requests"}</span><span>Newest first &middot; Times in IST</span></div>
      <div className="divide-y divide-slate-100">
        {filtered.map(request => {
          const name = text(request.details.name) || "Customer";
          const phone = text(request.details.phone);
          const email = text(request.details.email);
          const preview = text(request.details.requestType || request.details.subject || request.details.issueDetails || request.details.message);
          const tone = request.kind === "COMPLAINT" ? "bg-amber-50 text-amber-700" : request.kind === "WARRANTY" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700";
          const Icon = request.kind === "WARRANTY" ? ShieldCheck : MessageSquare;
          return <details key={request.id} className="group">
            <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-5 transition-colors hover:bg-slate-50/60 focus-visible:outline-2 focus-visible:outline-blue-500 sm:px-5 [&::-webkit-details-marker]:hidden">
              <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon className="size-4" /></span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-slate-900">{name}</span><span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${tone}`}>{kindLabel(request.kind)}</span></div><p className="mt-1 truncate text-xs text-slate-500">{preview || phone || email || "View request details"}</p><p className="mt-2 text-[11px] text-slate-400 sm:hidden">{dateLabel(request.createdAt)}</p></div>
              <time className="hidden shrink-0 pt-1 text-[11px] text-slate-400 sm:block">{dateLabel(request.createdAt)}</time><ChevronDown className="mt-1 size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div className="border-t border-slate-100 bg-slate-50/40 px-4 pb-5 pt-4 sm:pl-[72px] sm:pr-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="break-all text-[10px] text-slate-400">Reference <span className="font-mono">{request.id}</span></p><div className="flex gap-3">{phone && /^[+\d\s()-]+$/.test(phone) && <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">Call customer <ArrowUpRight className="size-3" /></a>}{email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <a href={`mailto:${email}`} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">Email customer <ArrowUpRight className="size-3" /></a>}</div></div>
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{Object.entries(request.details).map(([key, value]) => <div key={key} className={/message|issueDetails|address|description/i.test(key) ? "sm:col-span-2" : ""}><dt className="text-[11px] font-medium text-slate-400">{label(key)}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{text(value) || "Not provided"}</dd></div>)}</dl>
            </div>
          </details>;
        })}
        {!filtered.length && <div className="px-5 py-16 text-center"><Inbox className="mx-auto size-8 text-slate-300" /><h2 className="mt-4 text-sm font-semibold text-slate-800">{requests.length ? "No matching requests" : "No support requests yet"}</h2><p className="mt-2 text-xs text-slate-500">{requests.length ? "Try another search or request type." : "New customer submissions will appear here."}</p>{requests.length > 0 && <button type="button" onClick={() => { setQuery(""); setKind("ALL"); }} className="mt-4 text-xs font-semibold text-blue-600">Clear filters</button>}</div>}
      </div>
      <p className="border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400">Showing the latest 200 submissions. Expand a request to see all submitted details.</p>
    </div>
  </div>;
}
