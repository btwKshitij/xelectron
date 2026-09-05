"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Loader2,
  X,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
  Check,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import type { BrandMarqueeItemDTO } from "@/lib/server/controllers/brand-marquee.controller";
import { uploadProductImage } from "@/lib/client/upload-product-image";

export function BrandMarqueeManager({
  initialItems = [],
}: {
  initialItems?: BrandMarqueeItemDTO[];
}) {
  const [items, setItems] = useState<BrandMarqueeItemDTO[]>(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BrandMarqueeItemDTO | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");

  // Form state
  const [formName, setFormName] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [showManualUrl, setShowManualUrl] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
    } else {
      fetch("/api/admin/brand-marquee")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setItems(data);
        })
        .catch(() => {});
    }
  }, [initialItems]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormLogoUrl("");
    setFormIsActive(true);
    setShowManualUrl(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BrandMarqueeItemDTO) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormLogoUrl(item.logoUrl || "");
    setFormIsActive(item.isActive);
    setShowManualUrl(Boolean(item.logoUrl && !item.logoUrl.startsWith("/")));
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadProductImage(file);
      setFormLogoUrl(uploaded.url);
      toast.success("Logo uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload logo image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter a brand title/name");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        logoUrl: formLogoUrl.trim() ? formLogoUrl.trim() : null,
        isActive: formIsActive,
      };

      if (editingItem) {
        const res = await fetch(`/api/admin/brand-marquee/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update brand");
        }
        const updated = await res.json();
        setItems((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        toast.success(`Updated "${updated.name}"`);
      } else {
        const res = await fetch("/api/admin/brand-marquee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            sortOrder: items.length,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create brand");
        }
        const created = await res.json();
        setItems((prev) => [...prev, created]);
        toast.success(`Created "${created.name}"`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: BrandMarqueeItemDTO) => {
    const newStatus = !item.isActive;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isActive: newStatus } : i))
    );

    try {
      const res = await fetch(`/api/admin/brand-marquee/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`${item.name} is now ${newStatus ? "Visible" : "Hidden"}`);
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isActive: item.isActive } : i))
      );
      toast.error("Failed to update visibility");
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/brand-marquee/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete brand");
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Brand deleted successfully");
      setDeleteTargetId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("Reset all platforms to default list (Amazon, Flipkart, Myntra, etc.)? Any custom additions will be replaced.")) {
      return;
    }
    setIsSeeding(true);
    try {
      const res = await fetch("/api/admin/brand-marquee/seed", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to reset defaults");
      const data = await res.json();
      setItems(data.data || []);
      toast.success("Successfully reset brand platforms to defaults");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset defaults");
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? item.isActive
        : !item.isActive;
    return matchesSearch && matchesStatus;
  });

  const activeMarqueeItems = items.filter((i) => i.isActive);
  const displayMarqueeList =
    activeMarqueeItems.length > 0
      ? [...activeMarqueeItems, ...activeMarqueeItems, ...activeMarqueeItems]
      : [];

  return (
    <div className="w-full max-w-full space-y-6 p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div className="min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0a7ae6]">
              <Sparkles className="size-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
              Brand Platforms Marquee
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Customize the scrolling &quot;Available on all major platforms&quot; marquee on your storefront. Add platform titles and upload brand logos.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            {isSeeding ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a7ae6] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#086ac9] transition-colors"
          >
            <Plus className="size-4" />
            <span>Add Brand Platform</span>
          </button>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="w-full rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/70 to-white p-4 sm:p-5 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600">
              Storefront Live Preview
            </span>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {activeMarqueeItems.length} active platform{activeMarqueeItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="relative w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white py-6 sm:py-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent" />
          
          <div className="mb-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
              Available on all major platforms
            </p>
          </div>

          {activeMarqueeItems.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-3">No active brands to display</p>
          ) : (
            <div className="flex w-max items-center gap-10 sm:gap-16 preview-marquee-scroll py-2">
              {displayMarqueeList.map((b, i) => (
                <div key={`${b.id}-${i}`} className="shrink-0 flex items-center justify-center">
                  {b.logoUrl ? (
                    <div className="relative h-10 sm:h-12 max-w-[160px] flex items-center">
                      <Image
                        src={b.logoUrl}
                        alt={b.name}
                        width={180}
                        height={50}
                        unoptimized
                        className="h-full w-auto object-contain select-none"
                      />
                    </div>
                  ) : (
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight select-none text-slate-900">
                      {b.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search brand title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-1 focus:ring-[#0a7ae6]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              statusFilter === "active"
                ? "bg-[#0a7ae6] text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active ({items.filter((i) => i.isActive).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("hidden")}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              statusFilter === "hidden"
                ? "bg-slate-200 text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Hidden ({items.filter((i) => !i.isActive).length})
          </button>
        </div>
      </div>

      {/* Brand Items Table */}
      <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <Layers className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No platforms found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              {searchQuery
                ? "Try searching for a different brand name or clear your search query."
                : "Get started by adding a brand platform or resetting to defaults."}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 text-xs font-semibold text-[#0a7ae6] hover:underline"
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0a7ae6] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#086ac9]"
              >
                <Plus className="size-3.5" />
                <span>Add Platform</span>
              </button>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 pl-6 pr-4 w-1/3">Brand / Title</th>
                  <th className="py-3.5 px-4 w-1/3">Brand Logo</th>
                  <th className="py-3.5 px-4 w-1/6 text-center">Visibility</th>
                  <th className="py-3.5 pl-3 pr-6 w-1/6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Brand Title */}
                    <td className="py-3.5 pl-6 pr-4">
                      <span className="font-bold text-slate-900 text-sm">
                        {item.name}
                      </span>
                    </td>

                    {/* Logo Preview */}
                    <td className="py-3.5 px-4">
                      {item.logoUrl ? (
                        <div className="relative h-9 w-32 rounded-lg border border-slate-200/80 bg-white p-1.5 flex items-center justify-center overflow-hidden shadow-2xs">
                          <Image
                            src={item.logoUrl}
                            alt={item.name}
                            width={120}
                            height={35}
                            unoptimized
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-slate-800">
                          {item.name}
                        </span>
                      )}
                    </td>

                    {/* Active Status */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {item.isActive ? (
                          <>
                            <Eye className="size-3.5" />
                            <span>Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="size-3.5" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-3 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Edit Platform"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(item.id)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete Platform"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingItem ? "Edit Brand Platform" : "Add Brand Platform"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-5">
              {/* Brand Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Platform / Brand Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon, Flipkart, Reliance Digital"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#0a7ae6] focus:outline-none focus:ring-1 focus:ring-[#0a7ae6]"
                />
              </div>

              {/* Logo Upload Section */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Brand Logo
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowManualUrl(!showManualUrl)}
                    className="text-[11px] text-[#0a7ae6] hover:underline font-medium"
                  >
                    {showManualUrl ? "Upload File" : "Enter Image URL"}
                  </button>
                </div>

                {formLogoUrl ? (
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                    <div className="relative h-14 w-36 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-2 overflow-hidden">
                      <Image
                        src={formLogoUrl}
                        alt="Brand Logo Preview"
                        width={140}
                        height={50}
                        unoptimized
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="text-xs font-semibold text-[#0a7ae6] hover:underline"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormLogoUrl("")}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove Logo
                      </button>
                    </div>
                  </div>
                ) : showManualUrl ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={formLogoUrl}
                      onChange={(e) => setFormLogoUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-[#0a7ae6] focus:outline-none focus:ring-1 focus:ring-[#0a7ae6]"
                    />
                    <p className="text-[11px] text-slate-400">
                      Paste a direct image URL (PNG, SVG, or JPG).
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white p-6 text-center cursor-pointer hover:border-[#0a7ae6] hover:bg-blue-50/20 transition-all"
                  >
                    {isUploading ? (
                      <Loader2 className="size-6 animate-spin text-[#0a7ae6] mb-1.5" />
                    ) : (
                      <Upload className="size-6 text-slate-400 mb-1.5" />
                    )}
                    <span className="text-xs font-semibold text-slate-700">
                      {isUploading ? "Uploading logo..." : "Click to upload brand logo"}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      PNG, SVG, JPG, WebP supported
                    </span>
                  </div>
                )}
              </div>

              {/* Visibility Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Visibility Status
                </label>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition-colors ${
                    formIsActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  {formIsActive ? <Check className="size-4" /> : <EyeOff className="size-4" />}
                  {formIsActive ? "Visible in Marquee" : "Hidden"}
                </button>
              </div>

              {/* Modal Live Preview */}
              {formName.trim() && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Preview in Marquee
                  </span>
                  <div className="mt-2 flex items-center justify-center">
                    {formLogoUrl ? (
                      <div className="relative h-12 w-44 flex items-center justify-center">
                        <Image
                          src={formLogoUrl}
                          alt={formName}
                          width={180}
                          height={50}
                          unoptimized
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <span className="text-2xl font-extrabold tracking-tight select-none text-slate-900">
                        {formName}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a7ae6] px-5 py-2 text-xs font-semibold text-white hover:bg-[#086ac9] shadow-2xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                  <span>{editingItem ? "Save Changes" : "Add Brand"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">Delete Brand Platform?</h3>
            <p className="mt-2 text-xs text-slate-500">
              Are you sure you want to remove this brand platform from the scrolling marquee?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTargetId)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scrollLeftPreview {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .preview-marquee-scroll {
          animation: scrollLeftPreview 25s linear infinite;
        }
        .preview-marquee-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
