"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowDown, X, Search, Loader2, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { LATEST_LAUNCH_LIMIT } from "@/lib/latest-launch";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Product = { id: string; name: string; image: string; category: string };

export function LatestLaunchManager({ products, initialIds }: { products: Product[]; initialIds: string[] }) {
  const [ids, setIds] = useState(initialIds);
  const [savedIds, setSavedIds] = useState(initialIds);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const selected = ids.flatMap((id) => products.filter((product) => product.id === id));
  const available = products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  const dirty = JSON.stringify(ids) !== JSON.stringify(savedIds);

  function move(index: number, offset: number) {
    setIds((previous) => {
      const next = [...previous];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/latest-launch", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productIds: ids }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save products");
      setSavedIds([...ids]);
      toast.success("Latest Launch updated on the homepage");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save products");
    } finally { setSaving(false); }
  }

  function thumbnail(product: Product) {
    return <div className="relative size-14 shrink-0 rounded-lg bg-slate-50">{product.image && <Image src={product.image} alt={product.name} fill sizes="56px" className="object-contain p-1" />}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Latest Launch</h1>
          <p className="mt-1.5 text-sm text-slate-500">Choose up to four products for your homepage.</p>
        </div>
        <Link prefetch={false} href="/" target="_blank" className="inline-flex items-center gap-1.5 rounded-md py-2 text-xs text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600">View homepage<ExternalLink className="size-3.5" /></Link>
      </header>

      <section aria-label="Homepage products" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2.5"><h2 className="text-sm font-semibold text-slate-900">Products</h2><span className="text-xs tabular-nums text-slate-500">{ids.length} / {LATEST_LAUNCH_LIMIT}</span></div>
          <button type="button" disabled={saving} onClick={() => { setQuery(""); setPickerOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50"><Plus className="size-3.5" />{ids.length === LATEST_LAUNCH_LIMIT ? "Change products" : "Add products"}</button>
        </div>
        <div className="divide-y divide-slate-100">
          {selected.map((product, index) => (
            <div key={product.id} className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">
              <span className="w-3 shrink-0 text-xs tabular-nums text-slate-400">{index + 1}</span>
              {thumbnail(product)}
              <div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-medium leading-5 text-slate-900">{product.name}</p><p className="mt-1 text-xs text-slate-500">{product.category}</p></div>
              <div className="flex shrink-0 flex-col items-center sm:flex-row">
                <button type="button" title="Move up" aria-label={`Move ${product.name} up`} disabled={saving || index === 0} onClick={() => move(index, -1)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-25"><ArrowUp className="size-4" /></button>
                <button type="button" title="Move down" aria-label={`Move ${product.name} down`} disabled={saving || index === ids.length - 1} onClick={() => move(index, 1)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-25"><ArrowDown className="size-4" /></button>
                <button type="button" title="Remove product" aria-label={`Remove ${product.name}`} disabled={saving} onClick={() => setIds(previous => previous.filter(id => id !== product.id))} className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-25"><X className="size-4" /></button>
              </div>
            </div>
          ))}
        </div>
        {ids.length === 0 && <div className="px-6 py-12 text-center"><p className="text-sm font-medium text-slate-900">No products selected</p><p className="mt-2 text-xs text-slate-500">Add products above, or save to hide this homepage section.</p></div>}
      </section>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p role="status" className="text-xs text-slate-500">{dirty ? "You have unsaved changes." : "Products appear in the order shown above."}</p>
        <button type="button" disabled={saving || !dirty} onClick={save} className="inline-flex min-w-28 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40">{saving && <Loader2 className="size-3.5 animate-spin" />}{saving ? "Saving..." : "Save changes"}</button>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="px-5 pb-4 pt-5 pr-12"><DialogTitle>Choose products</DialogTitle><DialogDescription>Select up to four. Uncheck a product to replace it.</DialogDescription></DialogHeader>
          <div className="px-5 pb-4"><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-slate-400" /><input aria-label="Search products" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products..." className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></div>
          <div className="max-h-[min(50dvh,420px)] overflow-y-auto overscroll-contain border-y border-slate-100" data-lenis-prevent>
            {available.map(product => {
              const checked = ids.includes(product.id);
              const disabled = saving || (!checked && ids.length >= LATEST_LAUNCH_LIMIT);
              return <label key={product.id} className={`flex items-center gap-3 px-5 py-3 ${disabled ? "opacity-45" : "cursor-pointer hover:bg-slate-50"}`}>
                <input type="checkbox" checked={checked} disabled={disabled} onChange={() => setIds(previous => previous.includes(product.id) ? previous.filter(id => id !== product.id) : previous.length < LATEST_LAUNCH_LIMIT ? [...previous, product.id] : previous)} className="size-4 shrink-0 accent-blue-600" />
                {thumbnail(product)}<span className="min-w-0"><span className="block text-sm font-medium leading-5 text-slate-900">{product.name}</span><span className="mt-1 block text-xs text-slate-500">{product.category}</span></span>
              </label>;
            })}
            {available.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">No matching products.</p>}
          </div>
          <div className="flex items-center justify-between px-5 py-4"><span role="status" className="text-xs text-slate-500">{ids.length} of {LATEST_LAUNCH_LIMIT} selected</span><button type="button" onClick={() => setPickerOpen(false)} className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Done</button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
