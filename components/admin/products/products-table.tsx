"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

export type ProductTableItem = {
  id: string;
  slug: string;
  name: string;
  price: string;
  mainImage: string;
  quantity: number;
  category: { title: string } | null;
  showInBestSellers?: boolean;
};

export function ProductsTable({ products }: { products: ProductTableItem[] }) {
  const router = useRouter();
  const selectAllRef = useRef<HTMLInputElement>(null);

  const [productList, setProductList] = useState<ProductTableItem[]>(products);
  const [tabFilter, setTabFilter] = useState<"all" | "best-sellers" | "standard">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [bestSellerDropdown, setBestSellerDropdown] = useState<"all" | "best-sellers" | "standard">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [updatingBestSellerId, setUpdatingBestSellerId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setProductList(products);
  }, [products]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "best-sellers" || tab === "bestsellers") {
        setTabFilter("best-sellers");
      } else if (tab === "standard") {
        setTabFilter("standard");
      }
    }
  }, []);

  const categories = useMemo(
    () => [...new Set(productList.map((product) => product.category?.title || "Electronics"))].sort(),
    [productList]
  );

  const bestSellerCount = useMemo(
    () => productList.filter((p) => Boolean(p.showInBestSellers)).length,
    [productList]
  );
  const standardCount = productList.length - bestSellerCount;

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return productList.filter((product) => {
      const category = product.category?.title || "Electronics";
      const isBest = Boolean(product.showInBestSellers);

      const matchesCategory = categoryFilter === "all" || category === categoryFilter;

      const matchesTab =
        tabFilter === "all"
          ? true
          : tabFilter === "best-sellers"
            ? isBest
            : !isBest;

      const matchesDropdown =
        bestSellerDropdown === "all"
          ? true
          : bestSellerDropdown === "best-sellers"
            ? isBest
            : !isBest;

      const matchesQuery =
        !normalizedQuery ||
        [
          product.name,
          category,
          product.price,
          "Xelectron",
          isBest ? "best seller bestseller popular top" : "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesTab && matchesDropdown && matchesQuery;
    });
  }, [productList, searchQuery, categoryFilter, tabFilter, bestSellerDropdown]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  // Reset page to 1 when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, tabFilter, bestSellerDropdown, pageSize]);

  // Adjust page if items count shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const startItem = filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredProducts.length);

  const selectedPageCount = paginatedProducts.filter((product) => selectedIds.has(product.id)).length;
  const isAllPageSelected = paginatedProducts.length > 0 && selectedPageCount === paginatedProducts.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedPageCount > 0 && !isAllPageSelected;
    }
  }, [isAllPageSelected, selectedPageCount]);

  function toggleProduct(productId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function selectCurrentPageProducts() {
    setSelectedIds((current) => {
      const next = new Set(current);
      paginatedProducts.forEach((product) => next.add(product.id));
      return next;
    });
  }

  function selectAllFilteredProducts() {
    setSelectedIds((current) => {
      const next = new Set(current);
      filteredProducts.forEach((product) => next.add(product.id));
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (isAllPageSelected) {
        paginatedProducts.forEach((product) => next.delete(product.id));
      } else {
        paginatedProducts.forEach((product) => next.add(product.id));
      }
      return next;
    });
  }

  async function toggleBestSeller(productId: string, newValue: boolean) {
    const target = productList.find((p) => p.id === productId);
    if (!target) return;

    setUpdatingBestSellerId(productId);
    // Optimistic update
    setProductList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, showInBestSellers: newValue } : p))
    );

    try {
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showInBestSellers: newValue }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update best seller status");
      }

      toast.success(
        newValue
          ? `Added "${target.name}" to Best Sellers`
          : `Removed "${target.name}" from Best Sellers`
      );
      router.refresh();
    } catch (err: any) {
      // Revert optimistic update
      setProductList((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, showInBestSellers: !newValue } : p))
      );
      toast.error(err.message || "Failed to update best seller status");
    } finally {
      setUpdatingBestSellerId(null);
    }
  }

  async function bulkSetBestSeller(newValue: boolean) {
    const productIds = Array.from(selectedIds);
    if (productIds.length === 0) return;

    setIsBulkUpdating(true);
    // Optimistic update
    setProductList((prev) =>
      prev.map((p) => (productIds.includes(p.id) ? { ...p, showInBestSellers: newValue } : p))
    );

    try {
      const results = await Promise.all(
        productIds.map(async (productId) => {
          try {
            const response = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ showInBestSellers: newValue }),
            });
            return { productId, success: response.ok };
          } catch {
            return { productId, success: false };
          }
        })
      );

      const failedIds = results.filter((r) => !r.success).map((r) => r.productId);
      if (failedIds.length > 0) {
        toast.error(`Could not update ${failedIds.length} product(s).`);
      } else {
        toast.success(
          newValue
            ? `Added ${productIds.length} product(s) to Best Sellers`
            : `Removed ${productIds.length} product(s) from Best Sellers`
        );
      }
      setSelectedIds(new Set());
      router.refresh();
    } finally {
      setIsBulkUpdating(false);
    }
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
      {/* TABS & SEARCH BAR HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-2.5">
        {/* VIEW TABS */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTabFilter("all")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
              tabFilter === "all"
                ? "bg-black text-white shadow-2xs"
                : "text-black/65 hover:bg-black/5 hover:text-black"
            }`}
          >
            <span>All products</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                tabFilter === "all" ? "bg-white/20 text-white" : "bg-black/10 text-black/60"
              }`}
            >
              {productList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabFilter("best-sellers")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
              tabFilter === "best-sellers"
                ? "bg-amber-500 text-white shadow-2xs"
                : "text-black/65 hover:bg-amber-50 hover:text-amber-800"
            }`}
          >
            <Flame className={`size-3.5 ${tabFilter === "best-sellers" ? "fill-white text-white" : "text-amber-600"}`} />
            <span>Best sellers</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                tabFilter === "best-sellers" ? "bg-white/25 text-white" : "bg-amber-100 text-amber-800"
              }`}
            >
              {bestSellerCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabFilter("standard")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
              tabFilter === "standard"
                ? "bg-black text-white shadow-2xs"
                : "text-black/65 hover:bg-black/5 hover:text-black"
            }`}
          >
            <span>Standard</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                tabFilter === "standard" ? "bg-white/20 text-white" : "bg-black/10 text-black/60"
              }`}
            >
              {standardCount}
            </span>
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:min-w-[280px]">
          <div className="flex min-w-44 flex-1 items-center gap-2 text-sm text-black/50">
            <Search className="size-4 shrink-0" />
            <input
              aria-label="Search and filter products"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent text-xs text-black outline-none placeholder:text-black/45"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="rounded p-0.5 text-black/40 hover:text-black"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          {/* BULK ACTION BAR */}
          {selectedIds.size > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="inline-flex items-center gap-1 rounded-md bg-black/[0.05] px-2 py-1 text-xs font-medium text-black">
                <span>{selectedIds.size} sel</span>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="rounded p-0.5 text-black/55 hover:bg-black/10"
                  aria-label="Clear selected products"
                >
                  <X className="size-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => bulkSetBestSeller(true)}
                disabled={isBulkUpdating}
                className="inline-flex h-7 items-center gap-1 rounded-md bg-amber-500 px-2 text-xs font-medium text-white transition hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
                title="Add all selected products to Best Sellers"
              >
                <Flame className="size-3 fill-white" />
                <span>+ Best Seller</span>
              </button>

              <button
                type="button"
                onClick={() => bulkSetBestSeller(false)}
                disabled={isBulkUpdating}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-black/15 bg-white px-2 text-xs font-medium text-black/75 transition hover:bg-black/5 disabled:opacity-50 cursor-pointer"
                title="Remove all selected products from Best Sellers"
              >
                <span>- Remove</span>
              </button>

              <button
                type="button"
                onClick={deleteSelectedProducts}
                disabled={isDeleting}
                className="inline-flex h-7 items-center gap-1 rounded-md bg-red-600 px-2 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 cursor-pointer"
              >
                <Trash2 className="size-3" /> {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          ) : null}

          {/* FILTER DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              aria-label="Filter products"
              aria-expanded={isFilterOpen}
              onClick={() => {
                setIsFilterOpen((open) => !open);
                setIsMoreOpen(false);
              }}
              className={`rounded-md p-1.5 transition cursor-pointer ${
                isFilterOpen || categoryFilter !== "all" || bestSellerDropdown !== "all"
                  ? "bg-black/10 text-black font-semibold"
                  : "text-black/55 hover:bg-black/5"
              }`}
            >
              <SlidersHorizontal className="size-4" />
            </button>
            {isFilterOpen ? (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsFilterOpen(false)}
                />
                <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-black/10 bg-white p-4 shadow-xl shadow-black/10 ring-1 ring-black/5 space-y-3.5 animate-in fade-in-0 zoom-in-95 duration-100">
                  <div className="flex items-center justify-between border-b border-black/10 pb-2">
                    <span className="text-xs font-semibold text-black">Filter Products</span>
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="rounded p-0.5 text-black/40 hover:text-black cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>

                  <label className="grid gap-1.5 text-xs font-medium text-black/75">
                    <span>Category</span>
                    <div className="relative">
                      <select
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value)}
                        className="w-full appearance-none rounded-lg border border-black/15 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-black shadow-2xs outline-none transition focus:border-black/50 cursor-pointer"
                      >
                        <option value="all">All categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-black/45" />
                    </div>
                  </label>

                  <label className="grid gap-1.5 text-xs font-medium text-black/75">
                    <span>Best Seller Status</span>
                    <div className="relative">
                      <select
                        value={bestSellerDropdown}
                        onChange={(event) => setBestSellerDropdown(event.target.value as any)}
                        className="w-full appearance-none rounded-lg border border-black/15 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-black shadow-2xs outline-none transition focus:border-black/50 cursor-pointer"
                      >
                        <option value="all">All products</option>
                        <option value="best-sellers">Best sellers only</option>
                        <option value="standard">Standard only</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-black/45" />
                    </div>
                  </label>

                  <div className="flex items-center justify-between border-t border-black/10 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFilter("all");
                        setBestSellerDropdown("all");
                        setIsFilterOpen(false);
                      }}
                      className="text-xs font-medium text-black/60 hover:text-black cursor-pointer"
                    >
                      Reset all
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-black/80 cursor-pointer"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* MORE OPTIONS DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              aria-label="More product options"
              aria-expanded={isMoreOpen}
              onClick={() => {
                setIsMoreOpen((open) => !open);
                setIsFilterOpen(false);
              }}
              className="rounded-md p-1.5 text-black/55 hover:bg-black/5 cursor-pointer"
            >
              <MoreHorizontal className="size-4" />
            </button>
            {isMoreOpen ? (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMoreOpen(false)}
                />
                <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-black/10 bg-white p-1.5 shadow-xl shadow-black/10 ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-black/40">
                    Bulk Selection
                  </div>
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        selectCurrentPageProducts();
                        setIsMoreOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-black/75 hover:bg-black/[0.06] hover:text-black cursor-pointer"
                    >
                      <span>Select this page</span>
                      <span className="text-[11px] text-black/40 font-normal">({paginatedProducts.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        selectAllFilteredProducts();
                        setIsMoreOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-black/75 hover:bg-black/[0.06] hover:text-black cursor-pointer"
                    >
                      <span>Select all matching</span>
                      <span className="text-[11px] text-black/40 font-normal">({filteredProducts.length})</span>
                    </button>
                    <div className="my-1 border-t border-black/10" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIds(new Set());
                        setIsMoreOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <span>Clear selection</span>
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {deleteError ? (
        <p role="alert" className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800">
          {deleteError}
        </p>
      ) : null}

      {/* SELECTION SCOPE BANNER */}
      {isAllPageSelected && filteredProducts.length > paginatedProducts.length ? (
        <div className="border-b border-black/10 bg-[#0a7ae6]/[0.06] px-4 py-2 text-center text-xs text-black/75">
          {selectedIds.size >= filteredProducts.length ? (
            <span>
              All <strong className="font-semibold text-black">{filteredProducts.length}</strong> products matching current filter are selected.{" "}
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="font-medium text-[#0a7ae6] underline hover:text-[#0861b5] cursor-pointer"
              >
                Clear selection
              </button>
            </span>
          ) : (
            <span>
              All <strong className="font-semibold text-black">{paginatedProducts.length}</strong> products on this page are selected.{" "}
              <button
                type="button"
                onClick={selectAllFilteredProducts}
                className="font-medium text-[#0a7ae6] underline hover:text-[#0861b5] cursor-pointer"
              >
                Select all {filteredProducts.length} products
              </button>
            </span>
          )}
        </div>
      ) : null}

      {/* PRODUCTS TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
          <thead className="bg-black/[0.025] text-black/65">
            <tr>
              {["", "Product", "Status", "Price", "Category", "Best Seller", "Stock", "Actions"].map(
                (heading, index) => (
                  <th key={`${heading}-${index}`} className="border-b border-black/10 px-3 py-2.5 font-medium">
                    {index === 0 ? (
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={isAllPageSelected}
                        onChange={toggleSelectAll}
                        aria-label="Select all products on this page"
                      />
                    ) : (
                      heading
                    )}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => {
              const itemSlugOrId = product.slug || product.id;
              const isSelected = selectedIds.has(product.id);
              const isBestSeller = Boolean(product.showInBestSellers);
              const isUpdatingThis = updatingBestSellerId === product.id;

              return (
                <tr
                  key={product.id}
                  className={`transition-colors hover:bg-black/[0.02] ${
                    isSelected ? "bg-[#0a7ae6]/[0.04]" : ""
                  }`}
                >
                  <td className="border-b border-black/10 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProduct(product.id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </td>

                  <td className="border-b border-black/10 px-3 py-2">
                    <Link
                      prefetch={false}
                      href={`/dashboard/products/${itemSlugOrId}`}
                      className="flex items-center gap-3 font-medium text-black hover:text-[#0a7ae6] hover:underline"
                    >
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-black/10 bg-[#fafafa]">
                        <Image
                          src={product.mainImage || "/category-smartphone.png"}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <span className="max-w-[220px] truncate">{product.name}</span>
                    </Link>
                  </td>

                  <td className="border-b border-black/10 px-3 py-2">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                      Active
                    </span>
                  </td>

                  <td className="border-b border-black/10 px-3 py-2 font-medium">
                    {product.price}
                  </td>

                  <td className="border-b border-black/10 px-3 py-2">
                    {product.category?.title || "Electronics"}
                  </td>

                  {/* BEST SELLER QUICK TOGGLE COLUMN */}
                  <td className="border-b border-black/10 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleBestSeller(product.id, !isBestSeller)}
                      disabled={isUpdatingThis}
                      className={`group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                        isBestSeller
                          ? "border border-amber-300/90 bg-amber-50 text-amber-900 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                          : "border border-black/10 bg-black/[0.03] text-black/55 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
                      }`}
                      title={
                        isBestSeller
                          ? "Currently displayed in Best Sellers. Click to remove."
                          : "Click to add to Best Sellers carousel and shop filter."
                      }
                    >
                      {isUpdatingThis ? (
                        <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : isBestSeller ? (
                        <>
                          <Flame className="size-3 text-amber-600 fill-amber-500 group-hover:hidden" />
                          <X className="hidden size-3 text-red-600 group-hover:inline-block" />
                          <span className="group-hover:hidden">Best Seller</span>
                          <span className="hidden group-hover:inline-block">Remove</span>
                        </>
                      ) : (
                        <>
                          <Plus className="size-3 text-black/40 group-hover:text-amber-600" />
                          <span>Add to Best</span>
                        </>
                      )}
                    </button>
                  </td>

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

                  <td className="border-b border-black/10 px-3 py-2">
                    <Link
                      prefetch={false}
                      href={`/product/${itemSlugOrId}`}
                      target="_blank"
                      className="rounded border border-black/10 bg-white px-2 py-1 text-[11px] font-medium text-black/70 hover:bg-black/5"
                    >
                      Store
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-black/55">
          <p className="font-medium">No products match your search or filter.</p>
          {tabFilter === "best-sellers" ? (
            <p className="mt-1 text-xs text-black/45">
              Switch to the &quot;All products&quot; tab to add products to Best Sellers.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* INTERACTIVE PAGINATION FOOTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-black/10 px-4 py-3 text-xs text-black/65">
        {/* Left: Range and rows-per-page */}
        <div className="flex flex-wrap items-center gap-3">
          <span>
            {filteredProducts.length === 0 ? (
              "0 products"
            ) : (
              <>
                Showing <strong className="font-semibold text-black">{startItem}–{endItem}</strong> of{" "}
                <strong className="font-semibold text-black">{filteredProducts.length}</strong>{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </>
            )}
          </span>

          <div className="relative flex items-center gap-1.5 border-l border-black/10 pl-3">
            <span className="text-black/55">Rows:</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPageSizeOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={isPageSizeOpen}
                className="inline-flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-2.5 py-1 text-xs font-medium text-black shadow-2xs transition hover:border-black/30 hover:bg-black/[0.02] cursor-pointer focus:outline-none"
              >
                <span>{pageSize} per page</span>
                <ChevronDown
                  className={`size-3 text-black/50 transition-transform duration-200 ${
                    isPageSizeOpen ? "rotate-180 text-black" : ""
                  }`}
                />
              </button>

              {isPageSizeOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsPageSizeOpen(false)}
                  />
                  <div className="absolute bottom-full left-0 z-40 mb-2 w-36 rounded-xl border border-black/10 bg-white p-1.5 shadow-xl shadow-black/10 ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-black/40">
                      Rows Per Page
                    </div>
                    <div className="space-y-0.5">
                      {[10, 25, 50, 100].map((size) => {
                        const isSelected = pageSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              setPageSize(size);
                              setIsPageSizeOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                              isSelected
                                ? "bg-black text-white shadow-xs"
                                : "text-black/75 hover:bg-black/[0.06] hover:text-black"
                            }`}
                          >
                            <span>{size} per page</span>
                            {isSelected ? (
                              <Check className="size-3.5 text-white stroke-[2.5]" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right: Navigation Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="inline-flex size-7 items-center justify-center rounded border border-black/15 bg-white text-black/70 transition hover:bg-black/5 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isFirst = pageNum === 1;
              const isLast = pageNum === totalPages;
              const isNearCurrent = Math.abs(pageNum - currentPage) <= 1;

              if (!isFirst && !isLast && !isNearCurrent) {
                if (pageNum === 2 && currentPage > 3) {
                  return (
                    <span key="ellipsis-start" className="px-1 text-black/35 select-none">
                      …
                    </span>
                  );
                }
                if (pageNum === totalPages - 1 && currentPage < totalPages - 2) {
                  return (
                    <span key="ellipsis-end" className="px-1 text-black/35 select-none">
                      …
                    </span>
                  );
                }
                return null;
              }

              const isActive = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  aria-current={isActive ? "page" : undefined}
                  className={`min-w-[28px] h-7 rounded px-2 text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? "bg-black text-white"
                      : "border border-black/15 bg-white text-black/70 hover:bg-black/5"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="inline-flex size-7 items-center justify-center rounded border border-black/15 bg-white text-black/70 transition hover:bg-black/5 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
