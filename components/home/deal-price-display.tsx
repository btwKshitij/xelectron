import { formatINR, parsePriceNumber } from "@/lib/format-price";

export function dealDiscountPercent(price: string, reference?: string | null) {
  const current = parsePriceNumber(price);
  const original = parsePriceNumber(reference);
  return current > 0 && original > current ? Math.round((1 - current / original) * 100) : 0;
}

export function DealPriceDisplay({ price, regularPrice, mrp, compact = false, dark = false }: {
  price: string;
  regularPrice?: string | null;
  mrp?: string | null;
  compact?: boolean;
  dark?: boolean;
}) {
  const discount = dealDiscountPercent(price, mrp || regularPrice);
  const comparisons = [{ label: "Regular Price", value: regularPrice }, { label: "MRP", value: mrp }];
  return (
    <div className={`flex flex-wrap items-center ${compact ? "gap-x-3 gap-y-3" : "gap-x-5 gap-y-4"}`}>
      <div>
        <span className="sr-only">Deal price: </span>
        <p className={`${compact ? "text-3xl" : "text-4xl sm:text-5xl"} font-extrabold leading-none tracking-tight tabular-nums ${dark ? "text-white" : "text-slate-950"}`}>{formatINR(price)}</p>
        <p className={`mt-2 font-bold uppercase text-[#0a7ae6] ${compact ? "text-[10px]" : "text-xs sm:text-sm"}`}>Limited-time offer</p>
      </div>
      {comparisons.map(({ label, value }) => value ? (
        <div key={label} className={`border-l ${compact ? "pl-3" : "pl-4"} ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <p className={`${compact ? "text-[10px]" : "text-xs sm:text-sm"} font-semibold ${dark ? "text-slate-200" : "text-slate-950"}`}>{label}</p>
          <p className={`mt-1 font-bold tabular-nums ${compact ? "text-base" : "text-xl sm:text-2xl"} ${dark ? "text-slate-300" : "text-slate-600"}`}>
            <span className={parsePriceNumber(value) > parsePriceNumber(price) ? "line-through decoration-red-600 decoration-2" : ""}>{formatINR(value)}</span>
          </p>
        </div>
      ) : null)}
      {discount > 0 ? <span title={mrp ? "Discount off MRP" : "Discount off regular price"} className={`rounded-2xl bg-green-100 font-extrabold text-green-700 ${compact ? "px-3 py-2 text-lg" : "px-4 py-3 text-2xl"}`}>{discount}% OFF<span className="sr-only"> {mrp ? "MRP" : "regular price"}</span></span> : null}
    </div>
  );
}
