"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BadgePlus, FilePenLine, ShoppingBag, Trash2 } from "lucide-react";

import {
  deleteDraftOrder,
  readDraftOrders,
  type DraftOrder,
} from "@/lib/draft-orders";
import { formatINR } from "@/lib/format-price";

function DraftIllustration() {
  return (
    <div className="relative mx-auto size-44 sm:size-52" aria-hidden="true">
      <div className="absolute inset-3 rounded-full bg-black/[0.04]" />
      <div className="absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4f4f4]" />
      <div className="absolute left-1/2 top-[52%] h-12 w-36 -translate-x-1/2 rounded-b-[999px] bg-[#3aa6a1]" />
      <div className="absolute left-1/2 top-[14%] h-32 w-24 -translate-x-1/2 rounded-t-md bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <div className="absolute right-0 top-0 h-7 w-7 rotate-45 translate-x-1 -translate-y-1 bg-[#ececec]" />
        <div className="absolute left-2 top-3 h-12 w-12 rounded-sm bg-black/5"><div className="absolute left-1.5 top-1.5 h-7 w-9 rounded-sm bg-[#ea6a57]" /><div className="absolute left-[10px] top-1.5 h-2 w-4 rounded-b-sm bg-[#d94d3b]" /></div>
        <div className="absolute right-2 top-9 h-1.5 w-9 rounded-full bg-black/15" />
        <div className="absolute right-2 top-12 flex gap-1.5"><span className="size-2 rounded-full bg-[#d94d3b]" /><span className="size-2 rounded-full bg-black/10" /><span className="size-2 rounded-full bg-black/10" /></div>
        <div className="absolute left-2 top-20 h-1.5 w-5 rounded-full bg-black/10" /><div className="absolute left-8 top-20 h-1.5 w-5 rounded-full bg-black/10" /><div className="absolute left-2 top-24 h-1.5 w-10 rounded-full bg-black/10" /><div className="absolute right-2 top-20 h-1.5 w-5 rounded-full bg-black/10" /><div className="absolute right-2 top-24 h-1.5 w-7 rounded-full bg-black/10" />
      </div>
    </div>
  );
}

function draftTotal(draft: DraftOrder) {
  return draft.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

export function DraftOrdersManager() {
  const [drafts, setDrafts] = useState<DraftOrder[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDrafts(readDraftOrders());
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const sortedDrafts = useMemo(
    () => [...drafts].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)),
    [drafts]
  );

  function removeDraft(id: string) {
    if (!window.confirm("Delete this draft order?")) return;
    deleteDraftOrder(id);
    setDrafts((current) => current.filter((draft) => draft.id !== id));
  }

  return (
    <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold"><BadgePlus className="size-4" />Drafts</h1>
          <p className="mt-1 text-xs text-black/55">Saved draft orders on this device.</p>
        </div>
        <Link href="/dashboard/orders/create-order" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-medium text-white hover:bg-black/80"><ShoppingBag className="size-3.5" />Create draft order</Link>
      </div>

      {!ready ? <section className="mt-4 rounded-xl border border-black/10 bg-white px-4 py-10 text-center text-sm text-black/55 shadow-sm">Loading drafts…</section> : null}

      {ready && sortedDrafts.length === 0 ? (
        <section className="mt-4 flex min-h-[calc(100vh-12rem)] items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
          <div className="max-w-md px-6 py-16 text-center"><DraftIllustration /><h2 className="mt-8 text-base font-semibold text-black/80">Manually create orders and invoices</h2><p className="mt-2 text-sm leading-5 text-black/65">Use draft orders to take orders over the phone, email invoices to customers, and collect payments.</p><Link href="/dashboard/orders/create-order" className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-xs font-medium text-white hover:bg-black/80"><ShoppingBag className="size-3.5" />Create draft order</Link></div>
        </section>
      ) : null}

      {ready && sortedDrafts.length > 0 ? (
        <section className="mt-4 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3"><h2 className="text-sm font-semibold">Draft orders</h2><span className="text-xs text-black/55">{sortedDrafts.length} saved</span></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm">
              <thead className="bg-black/[0.025] text-xs text-black/60">
                <tr>
                  <th className="border-b border-black/10 px-4 py-2.5 font-medium">Draft</th>
                  <th className="border-b border-black/10 px-4 py-2.5 font-medium">Customer & Contact</th>
                  <th className="border-b border-black/10 px-4 py-2.5 font-medium">Shipping Address</th>
                  <th className="border-b border-black/10 px-4 py-2.5 font-medium">Items</th>
                  <th className="border-b border-black/10 px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="border-b border-black/10 px-4 py-2.5 font-medium">Last updated</th>
                  <th className="border-b border-black/10 px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedDrafts.map((draft) => (
                  <tr key={draft.id} className="hover:bg-black/[0.02]">
                    <td className="border-b border-black/10 px-4 py-3">
                      <span className="font-medium">#{draft.id.slice(-6).toUpperCase()}</span>
                      <span className="mt-1 block text-xs text-black/50">Draft</span>
                    </td>
                    <td className="border-b border-black/10 px-4 py-3">
                      <p className="font-medium text-slate-900">{draft.customerName || "No customer name"}</p>
                      {draft.customerPhone && (
                        <p className="text-xs text-slate-600 mt-0.5">{draft.customerPhone}</p>
                      )}
                      {draft.customerEmail && (
                        <p className="text-xs text-slate-500">{draft.customerEmail}</p>
                      )}
                    </td>
                    <td className="border-b border-black/10 px-4 py-3 max-w-[200px]">
                      {draft.shippingAddress ? (
                        <p className="text-xs text-slate-700 line-clamp-2" title={draft.shippingAddress}>
                          {[draft.shippingAddress, draft.city, draft.state, draft.pincode].filter(Boolean).join(", ")}
                        </p>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="border-b border-black/10 px-4 py-3">
                      {draft.items.reduce((sum, item) => sum + item.quantity, 0)} {draft.items.length === 1 ? "item" : "items"}
                    </td>
                    <td className="border-b border-black/10 px-4 py-3 text-right font-medium">
                      {formatINR(draftTotal(draft))}
                    </td>
                    <td className="border-b border-black/10 px-4 py-3 text-black/65 text-xs">
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(draft.updatedAt))}
                    </td>
                    <td className="border-b border-black/10 px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/orders/create-order?draft=${encodeURIComponent(draft.id)}`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/15 px-3 text-xs font-medium hover:bg-black/[0.03]"
                        >
                          <FilePenLine className="size-3.5" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeDraft(draft.id)}
                          aria-label={`Delete draft ${draft.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
