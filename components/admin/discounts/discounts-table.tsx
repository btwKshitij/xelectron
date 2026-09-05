"use client";

import { useState } from "react";
import { Trash2, Clock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export type DiscountTableItem = {
  id: string;
  code: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  appliesTo?: string;
  eligibleProductIds?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
};

function discountValue(discount: DiscountTableItem) {
  return discount.type === "PERCENTAGE" ? `${discount.value}% off` : `₹${discount.value.toLocaleString("en-IN")} off`;
}

export function DiscountsTable({ discounts }: { discounts: DiscountTableItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function deleteDiscount(discount: DiscountTableItem) {
    if (!window.confirm(`Delete ${discount.code || "this automatic discount"}? This cannot be undone.`)) return;
    setDeletingId(discount.id);
    setError("");
    try {
      const response = await fetch(`/api/discounts/${discount.id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not delete the discount");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete the discount");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-4 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      {error ? <p role="alert" className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-black/[0.025] text-xs text-black/65">
            <tr>
              {["Discount Code", "Applies To", "Status", "Value", "Usage", "Expiration / Validity", ""].map((heading) => (
                <th key={heading || "actions"} className="border-b border-black/10 px-4 py-3 font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount) => {
              const isExpired = discount.endDate ? new Date(discount.endDate) < new Date() : false;
              const hasSpecificProducts = Boolean(discount.eligibleProductIds || discount.appliesTo === "SPECIFIC_PRODUCTS");

              return (
                <tr key={discount.id} className="transition-colors hover:bg-black/[0.02]">
                  <td className="border-b border-black/10 px-4 py-3">
                    <p className="font-semibold text-black font-mono tracking-wide">{discount.code || "Automatic discount"}</p>
                    <p className="mt-0.5 text-xs text-black/50">ID: {discount.id.slice(-6)}</p>
                  </td>
                  <td className="border-b border-black/10 px-4 py-3">
                    {hasSpecificProducts ? (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                        Specific products
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        All products
                      </span>
                    )}
                  </td>
                  <td className="border-b border-black/10 px-4 py-3">
                    {isExpired ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                        Expired
                      </span>
                    ) : discount.isActive ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-black/[0.07] px-2.5 py-0.5 text-xs font-medium text-black/65">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="border-b border-black/10 px-4 py-3 font-semibold text-slate-900">
                    {discountValue(discount)}
                  </td>
                  <td className="border-b border-black/10 px-4 py-3 text-xs text-slate-600">
                    {discount.usageCount} times
                  </td>
                  <td className="border-b border-black/10 px-4 py-3 text-xs">
                    {discount.endDate ? (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock className={`size-3.5 ${isExpired ? "text-red-500" : "text-slate-400"}`} />
                        <span>Expires {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(discount.endDate))}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">No expiration date</span>
                    )}
                  </td>
                  <td className="border-b border-black/10 px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={deletingId === discount.id}
                      onClick={() => deleteDiscount(discount)}
                      className="inline-flex size-8 items-center justify-center rounded-md text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300 cursor-pointer"
                      aria-label={`Delete ${discount.code || "automatic discount"}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
