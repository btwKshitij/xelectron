"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

export type ProductTableItem = {
  id: string;
  slug: string;
  name: string;
  price: string;
  mainImage: string;
  quantity: number;
  category: { title: string } | null;
};

export function ProductsTable({ products }: { products: ProductTableItem[] }) {
  const router = useRouter();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category?.title || "Electronics"))].sort(),
    [products]
  );
  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const category = product.category?.title || "Electronics";
      const matchesCategory = categoryFilter === "all" || category === categoryFilter;
      const matchesQuery = !normalizedQuery || [product.name, category, product.price, "Xelectron"]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [categoryFilter, products, searchQuery]);

  const selectedVisibleCount = filteredProducts.filter((product) => selectedIds.has(product.id)).length;
  const isAllVisibleSelected = filteredProducts.length > 0 && selectedVisibleCount === filteredProducts.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedVisibleCount > 0 && !isAllVisibleSelected;
    }
  }, [isAllVisibleSelected, selectedVisibleCount]);

  function toggleProduct(productId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function selectVisibleProducts() {
    setSelectedIds((current) => {
      const next = new Set(current);
      filteredProducts.forEach((product) => next.add(product.id));
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((current) => {
      const next = new Set(current);
      filteredProducts.forEach((product) => {
        if (isAllVisibleSelected) next.delete(product.id);
        else next.add(product.id);
      });
      return next;
    });
  }

  async function deleteSelectedProducts() {
    const productIds = Array.from(selectedIds);
    if (productIds.length === 0) return;

    const productLabel = productIds.length === 1 ? "this product" : `${productIds.length} products`;
    if (!window.confirm(`Delete ${productLabel}? This cannot be undone.`)) return;

    setIsDeleting(true);
    setDeleteError("");
    try {
      const results = await Promise.all(
        productIds.map(async (productId) => {
          try {
            const response = await fetch(`/api/products/${encodeURIComponent(productId)}`, { method: "DELETE" });
            return { productId, success: response.ok };
          } catch {
            return { productId, success: false };
          }
        })
      );
      const failedIds = results.filter((result) => !result.success).map((result) => result.productId);

      setSelectedIds(new Set(failedIds));
      if (failedIds.length > 0) {
        setDeleteError(`${failedIds.length} product${failedIds.length === 1 ? "" : "s"} could not be deleted. Please try again.`);
      }
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="mt-4 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-black/10 px-4 py-3">
        <span className="inline-flex items-center gap-1 text-xs font-medium">All products</span>
        <div className="flex min-w-52 flex-1 items-center gap-2 text-sm text-black/50">
          <Search className="size-4" />
          <input
            aria-label="Search and filter products"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search and filter"
            className="w-full bg-transparent outline-none placeholder:text-black/45"
          />
        </div>
        {selectedIds.size > 0 ? (
          <>
            <div className="inline-flex items-center gap-2 rounded-md bg-black/[0.05] px-2.5 py-1 text-xs font-medium">
              {selectedIds.size} selected
              <button type="button" onClick={() => setSelectedIds(new Set())} className="rounded p-0.5 text-black/55 hover:bg-black/10" aria-label="Clear selected products"><X className="size-3.5" /></button>
            </div>
            <button type="button" onClick={deleteSelectedProducts} disabled={isDeleting} className="inline-flex h-7 items-center gap-1.5 rounded-md bg-red-600 px-2.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"><Trash2 className="size-3.5" /> {isDeleting ? "Deleting…" : "Delete"}</button>
          </>
        ) : null}
        <div className="relative">
          <button
            type="button"
            aria-label="Filter products"
            aria-expanded={isFilterOpen}
            onClick={() => {
              setIsFilterOpen((open) => !open);
              setIsMoreOpen(false);
            }}
            className="rounded-md p-1.5 text-black/55 hover:bg-black/5"
          >
            <SlidersHorizontal className="size-4" />
          </button>
          {isFilterOpen ? (
            <div className="absolute right-0 top-full z-10 mt-2 w-56 rounded-lg border border-black/10 bg-white p-3 shadow-lg">
              <label className="grid gap-1.5 text-xs font-medium text-black/70">
                Category
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-8 rounded-md border border-black/15 bg-white px-2 text-xs outline-none focus:border-black/40">
                  <option value="all">All categories</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => { setCategoryFilter("all"); setIsFilterOpen(false); }} className="mt-3 text-xs font-medium text-black/60 hover:text-black">Clear filter</button>
            </div>
          ) : null}
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="More product options"
            aria-expanded={isMoreOpen}
            onClick={() => {
              setIsMoreOpen((open) => !open);
              setIsFilterOpen(false);
            }}
            className="rounded-md p-1.5 text-black/55 hover:bg-black/5"
          >
            <MoreHorizontal className="size-4" />
          </button>
          {isMoreOpen ? (
            <div className="absolute right-0 top-full z-10 mt-2 w-44 rounded-lg border border-black/10 bg-white p-1 shadow-lg">
              <button type="button" onClick={() => { selectVisibleProducts(); setIsMoreOpen(false); }} className="w-full rounded-md px-2.5 py-2 text-left text-xs font-medium hover:bg-black/[0.05]">Select all shown</button>
              <button type="button" onClick={() => { setSelectedIds(new Set()); setIsMoreOpen(false); }} className="w-full rounded-md px-2.5 py-2 text-left text-xs font-medium hover:bg-black/[0.05]">Clear selection</button>
            </div>
          ) : null}
        </div>
      </div>
      {deleteError ? <p role="alert" className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800">{deleteError}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
          <thead className="bg-black/[0.025] text-black/65">
            <tr>
              {["", "Product", "Status", "Price", "Category", "Stock", "Actions"].map(
                (heading, index) => (
                  <th key={`${heading}-${index}`} className="border-b border-black/10 px-3 py-2.5 font-medium">
                    {index === 0 ? <input ref={selectAllRef} type="checkbox" checked={isAllVisibleSelected} onChange={toggleSelectAll} aria-label="Select all products" /> : heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const itemSlugOrId = product.slug || product.id;
              const isSelected = selectedIds.has(product.id);
              return (
                <tr key={product.id} className={`transition-colors hover:bg-black/[0.02] ${isSelected ? "bg-[#0a7ae6]/[0.04]" : ""}`}>
                  <td className="border-b border-black/10 px-3 py-2"><input type="checkbox" checked={isSelected} onChange={() => toggleProduct(product.id)} aria-label={`Select ${product.name}`} /></td>
                  <td className="border-b border-black/10 px-3 py-2">
                    <Link prefetch={false} href={`/dashboard/products/${itemSlugOrId}`} className="flex items-center gap-3 font-medium text-black hover:text-[#0a7ae6] hover:underline">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-black/10 bg-[#fafafa]"><Image src={product.mainImage || "/category-smartphone.png"} alt={product.name} fill className="object-contain p-1" /></div>
                      <span className="max-w-[220px] truncate">{product.name}</span>
                    </Link>
                  </td>
                  <td className="border-b border-black/10 px-3 py-2"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">Active</span></td>
                  <td className="border-b border-black/10 px-3 py-2 font-medium">{product.price}</td>
                  <td className="border-b border-black/10 px-3 py-2">{product.category?.title || "Electronics"}</td>
                  <td className="border-b border-black/10 px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        product.quantity === 0
                          ? "bg-red-100 text-red-800"
                          : product.quantity <= 5
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {product.quantity === 0 ? "Out of stock" : `${product.quantity} in stock`}
                    </span>
                  </td>
                  <td className="border-b border-black/10 px-3 py-2"><Link prefetch={false} href={`/product/${itemSlugOrId}`} target="_blank" className="rounded border border-black/10 bg-white px-2 py-1 text-[11px] font-medium text-black/70 hover:bg-black/5">Store</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filteredProducts.length === 0 ? <p className="px-4 py-8 text-center text-sm text-black/55">No products match your search or filter.</p> : null}
      <div className="flex items-center gap-1 border-t border-black/10 px-3 py-2 text-xs text-black/60">
        <button type="button" disabled aria-label="Previous page" className="rounded-md bg-black/5 p-1 opacity-40"><ChevronLeft className="size-4" /></button>
        <button type="button" disabled aria-label="Next page" className="rounded-md bg-black/5 p-1 opacity-40"><ChevronRight className="size-4" /></button>
        <span className="ml-1">1–{filteredProducts.length} of {products.length}</span>
      </div>
    </section>
  );
}
