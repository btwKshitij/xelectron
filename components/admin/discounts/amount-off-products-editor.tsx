"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgePercent, CalendarDays, ChevronRight, Clock3, Plus, Sparkles, Tag, Trash2, X } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type DiscountMethod = "code" | "automatic";
type ValueType = "percentage" | "fixed";
type EligibilityType = "ALL_PRODUCTS" | "SPECIFIC_PRODUCTS";

function SectionCard({ children }: { children: React.ReactNode }) {
  return <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">{children}</section>;
}

const inputClass = "h-9 w-full rounded-lg border border-black/25 bg-white px-3 text-sm outline-none transition focus:border-black/55 focus:ring-2 focus:ring-black/5";

type DiscountProduct = { id: string; name: string; price?: string | number };

export function TargetPickerDialog({
  open,
  onOpenChange,
  selectedIds,
  onAdd,
}: {
  kind: "products";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onAdd: (ids: string[]) => void;
}) {
  const [products, setProducts] = useState<DiscountProduct[]>([]);
  const [draftIds, setDraftIds] = useState(selectedIds);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setDraftIds(selectedIds);
    fetch("/api/products")
      .then((response) => response.json())
      .then((payload) => setProducts(Array.isArray(payload.data) ? payload.data : []))
      .catch(() => setProducts([]));
  }, [open, selectedIds]);

  function toggle(id: string) {
    setDraftIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(560px,calc(100vw-2rem))] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[560px]">
        <DialogHeader className="border-b border-black/10 px-5 py-4">
          <DialogTitle className="text-base font-semibold">Select eligible products</DialogTitle>
          <DialogDescription className="text-xs text-black/55">
            Choose which products this coupon code can be applied to.
          </DialogDescription>
        </DialogHeader>
        <div className="border-b border-black/10 p-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-9 w-full rounded-lg border border-black/20 px-3 text-xs outline-none focus:border-black/50"
          />
        </div>
        <div className="max-h-[340px] overflow-y-auto p-2">
          {filtered.map((product) => (
            <label
              key={product.id}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent px-3 py-2.5 hover:bg-black/[0.03]"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={draftIds.includes(product.id)}
                  onChange={() => toggle(product.id)}
                  className="size-4 accent-black"
                />
                <span className="text-xs font-medium text-slate-800">{product.name}</span>
              </div>
            </label>
          ))}
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-black/55">No products found.</p>
          ) : null}
        </div>
        <DialogFooter className="flex-row justify-between items-center border-t border-black/10 px-5 py-3 bg-slate-50">
          <span className="text-xs text-black/60">{draftIds.length} products selected</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-8 rounded-lg border border-black/15 px-3 text-xs font-medium hover:bg-black/[0.03]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onAdd(draftIds);
                onOpenChange(false);
              }}
              className="h-8 rounded-lg bg-black px-3 text-xs font-medium text-white hover:bg-black/80"
            >
              Apply selection
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AmountOffProductsEditor() {
  const router = useRouter();
  const [method, setMethod] = useState<DiscountMethod>("code");
  const [valueType, setValueType] = useState<ValueType>("percentage");
  const [code, setCode] = useState("");
  const [value, setValue] = useState("");

  // Eligibility & Product Selection
  const [eligibility, setEligibility] = useState<EligibilityType>("ALL_PRODUCTS");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<DiscountProduct[]>([]);

  // Expiration & Dates
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setAllProducts(j.data);
      })
      .catch(() => {});
  }, []);

  const numericValue = Number(value);
  const isValueValid =
    Number.isFinite(numericValue) && numericValue > 0 && (valueType !== "percentage" || numericValue <= 100);
  const canSave =
    isValueValid &&
    (method === "automatic" || code.trim().length > 0) &&
    (eligibility === "ALL_PRODUCTS" || selectedProductIds.length > 0) &&
    !isSaving;

  function generateCode() {
    setCode(`XELECTRON-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
  }

  async function saveDiscount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    setIsSaving(true);
    setError("");
    try {
      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: method === "code" ? code : null,
          type: valueType === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT",
          value: numericValue,
          appliesTo: eligibility,
          eligibleProductIds: eligibility === "SPECIFIC_PRODUCTS" ? selectedProductIds.join(",") : null,
          startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          endDate: hasEndDate && endDate ? new Date(endDate).toISOString() : null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not create the discount");

      router.push("/dashboard/discounts");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not create the discount");
    } finally {
      setIsSaving(false);
    }
  }

  const selectedProductNames = allProducts.filter((p) => selectedProductIds.includes(p.id));

  return (
    <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-5">
      <form className="mx-auto max-w-[970px]" onSubmit={saveDiscount}>
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-1.5 text-lg font-semibold">
              <Tag className="size-4" />
              <ChevronRight className="size-4 text-black/45" /> Create discount
            </h1>
            <p className="mt-1 text-xs text-black/55">
              Create product or order discount codes with product eligibility and expiration date controls.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/discounts"
              className="inline-flex h-8 items-center rounded-lg bg-black/[0.06] px-3 text-xs font-medium transition hover:bg-black/10"
            >
              Discard
            </Link>
            <button
              type="submit"
              disabled={!canSave}
              className="inline-flex h-8 items-center rounded-lg bg-black px-3 text-xs font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/15 cursor-pointer"
            >
              {isSaving ? "Creating…" : "Create discount"}
            </button>
          </div>
        </header>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {/* Method */}
            <SectionCard>
              <h2 className="text-sm font-semibold">Discount method</h2>
              <div className="mt-4 inline-flex overflow-hidden rounded-lg border border-black/15">
                <button
                  type="button"
                  onClick={() => setMethod("code")}
                  className={`h-9 px-3 text-xs font-medium cursor-pointer ${
                    method === "code" ? "bg-black/[0.12]" : "bg-white hover:bg-black/[0.03]"
                  }`}
                >
                  Discount code
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("automatic")}
                  className={`h-9 border-l border-black/15 px-3 text-xs font-medium cursor-pointer ${
                    method === "automatic" ? "bg-black/[0.12]" : "bg-white hover:bg-black/[0.03]"
                  }`}
                >
                  Automatic discount
                </button>
              </div>
              {method === "code" ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="discount-code" className="text-xs font-semibold text-black/75">
                      Discount code
                    </label>
                    <button
                      type="button"
                      onClick={generateCode}
                      className="text-xs font-medium text-[#005BD3] hover:underline cursor-pointer"
                    >
                      Generate code
                    </button>
                  </div>
                  <input
                    id="discount-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER25"
                    className={`${inputClass} mt-1.5 uppercase font-mono`}
                  />
                  <p className="mt-1.5 text-xs text-black/55">Customers enter this code at checkout.</p>
                </div>
              ) : (
                <p className="mt-4 text-xs text-black/60">This discount is applied automatically when a customer qualifies.</p>
              )}
            </SectionCard>

            {/* Value */}
            <SectionCard>
              <h2 className="text-sm font-semibold">Discount value</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
                <label className="grid gap-1.5 text-xs font-semibold text-black/75">
                  Type
                  <select
                    value={valueType}
                    onChange={(event) => setValueType(event.target.value as ValueType)}
                    className={inputClass}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed amount (₹)</option>
                  </select>
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-black/75">
                  Value
                  <div className="relative">
                    <input
                      aria-label="Discount value"
                      inputMode="decimal"
                      value={value}
                      onChange={(event) => setValue(event.target.value)}
                      placeholder={valueType === "percentage" ? "10" : "500"}
                      className={`${inputClass} pr-9`}
                    />
                    <span className="pointer-events-none absolute right-3 top-2 text-sm text-black/50">
                      {valueType === "percentage" ? "%" : "₹"}
                    </span>
                  </div>
                </label>
              </div>
              {value && !isValueValid ? (
                <p className="mt-2 text-xs text-red-700">
                  Enter a valid {valueType === "percentage" ? "percentage from 1 to 100" : "amount"}.
                </p>
              ) : null}
            </SectionCard>

            {/* Eligibility Selection */}
            <SectionCard>
              <h2 className="text-sm font-semibold">Eligibility (Applies to)</h2>
              <p className="mt-0.5 text-xs text-black/55">Choose whether this discount applies to all products or only specific items.</p>
              
              <div className="mt-3 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="radio"
                    name="eligibility"
                    checked={eligibility === "ALL_PRODUCTS"}
                    onChange={() => setEligibility("ALL_PRODUCTS")}
                    className="size-4 accent-black"
                  />
                  <span>All products in store</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="radio"
                    name="eligibility"
                    checked={eligibility === "SPECIFIC_PRODUCTS"}
                    onChange={() => setEligibility("SPECIFIC_PRODUCTS")}
                    className="size-4 accent-black"
                  />
                  <span>Specific products only</span>
                </label>
              </div>

              {eligibility === "SPECIFIC_PRODUCTS" && (
                <div className="mt-4 border-t border-black/10 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Selected Products</span>
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#005BD3] hover:underline cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      Browse products
                    </button>
                  </div>

                  {selectedProductIds.length === 0 ? (
                    <div className="mt-2 rounded-lg border border-dashed border-black/20 p-4 text-center">
                      <p className="text-xs text-slate-500">No specific products selected.</p>
                      <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="mt-2 inline-flex h-7 items-center rounded-md bg-black px-2.5 text-xs font-medium text-white hover:bg-black/80"
                      >
                        Select products
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                      {selectedProductNames.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-md border border-black/10 bg-slate-50 px-3 py-1.5 text-xs"
                        >
                          <span className="font-medium text-slate-800 truncate mr-2">{p.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProductIds((curr) => curr.filter((id) => id !== p.id))
                            }
                            className="text-slate-400 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            {/* Active Dates & Expiration */}
            <SectionCard>
              <h2 className="text-sm font-semibold">Active dates & Expiration</h2>
              <p className="mt-0.5 text-xs text-black/55">Set start date and optional coupon expiration date.</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-semibold text-black/75">
                  <span>Start date</span>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-2.5 size-4 text-black/45" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </label>

                {hasEndDate && (
                  <label className="grid gap-1.5 text-xs font-semibold text-black/75">
                    <span>Expiration date</span>
                    <div className="relative">
                      <Clock3 className="pointer-events-none absolute left-3 top-2.5 size-4 text-red-500" />
                      <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`${inputClass} pl-9 border-red-300 focus:border-red-500`}
                      />
                    </div>
                  </label>
                )}
              </div>

              <label className="mt-3 flex items-center gap-2 text-xs font-medium text-black/75 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasEndDate}
                  onChange={(e) => setHasEndDate(e.target.checked)}
                  className="size-4 rounded accent-black"
                />
                <span>Set expiration date (coupon expires automatically after this date)</span>
              </label>
            </SectionCard>

            {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{error}</p> : null}
          </div>

          <aside className="space-y-4">
            <SectionCard>
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#005BD3]/10 text-[#005BD3]">
                <BadgePercent className="size-5" />
              </div>
              <h2 className="mt-4 text-sm font-semibold">
                {method === "code" ? code || "Your discount code" : "Automatic discount"}
              </h2>
              <p className="mt-1 text-xs text-black/60">
                {value ? `${value}${valueType === "percentage" ? "%" : " ₹"} off` : "Set a discount value"}
              </p>
              <dl className="mt-6 space-y-2.5 border-t border-black/10 pt-4 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-black/55">Method</dt>
                  <dd className="font-semibold">{method === "code" ? "Code" : "Automatic"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-black/55">Applies to</dt>
                  <dd className="font-semibold">
                    {eligibility === "ALL_PRODUCTS"
                      ? "All products"
                      : `${selectedProductIds.length} specific products`}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-black/55">Active from</dt>
                  <dd className="font-semibold">{startDate || "Today"}</dd>
                </div>
                {hasEndDate && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-red-600 font-medium">Expires on</dt>
                    <dd className="font-bold text-red-600">{endDate}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-black/55">Status</dt>
                  <dd className="font-semibold text-emerald-700">Active</dd>
                </div>
              </dl>
            </SectionCard>
            <SectionCard>
              <div className="flex items-start gap-2.5">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-[#005BD3]" />
                <p className="text-xs leading-relaxed text-black/65">
                  Coupon expiry dates prevent indefinite discount usage and drive campaign urgency.
                </p>
              </div>
            </SectionCard>
          </aside>
        </div>
      </form>

      <TargetPickerDialog
        kind="products"
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedIds={selectedProductIds}
        onAdd={setSelectedProductIds}
      />
    </main>
  );
}
