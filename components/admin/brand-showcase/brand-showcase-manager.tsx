"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Upload,
  Loader2,
  X,
  RefreshCw,
  Search,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Layers,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import type { BrandShowcaseItemDTO } from "@/lib/server/controllers/brand-showcase.controller";
import { uploadProductImage } from "@/lib/client/upload-product-image";

export type CategoryOption = {
  id: string;
  title: string;
  slug: string;
};

export function BrandShowcaseManager({
  initialItems,
  categories: propCategories = [],
}: {
  initialItems: BrandShowcaseItemDTO[];
  categories?: CategoryOption[];
}) {
  const [items, setItems] = useState<BrandShowcaseItemDTO[]>(initialItems);
  const [categories, setCategories] = useState<CategoryOption[]>(propCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BrandShowcaseItemDTO | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formLinkUrl, setFormLinkUrl] = useState("");
  const [selectedLinkType, setSelectedLinkType] = useState<string>("");
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
    } else {
      fetch("/api/admin/brand-showcase")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setItems(data);
        })
        .catch(() => {});
    }

    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
    } else {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCategories(
              data.map((c: any) => ({
                id: c.id,
                title: c.title,
                slug: c.slug,
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [initialItems, propCategories]);

  const syncLinkTypeFromUrl = (url: string) => {
    if (!url) {
      setSelectedLinkType("");
      return;
    }
    if (url === "/shop") {
      setSelectedLinkType("/shop");
      return;
    }
    const matchedCategory = categories.find(
      (c) =>
        url === `/shop?filter=${c.slug}` ||
        url === `/shop?category=${c.slug}` ||
        url === `/categories/${c.slug}`
    );
    if (matchedCategory) {
      setSelectedLinkType(`/shop?filter=${matchedCategory.slug}`);
    } else {
      setSelectedLinkType("custom");
    }
  };

  const handleLinkTypeChange = (type: string) => {
    setSelectedLinkType(type);
    if (type === "custom") {
      // keep current formLinkUrl
    } else {
      setFormLinkUrl(type);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormSubtitle("");
    setFormImage("");
    setFormLinkUrl("");
    setSelectedLinkType("");
    setFormSortOrder(items.length);
    setFormIsActive(true);
    setShowUrlInput(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: BrandShowcaseItemDTO) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormSubtitle(item.subtitle || "");
    setFormImage(item.image);
    const link = item.linkUrl || "";
    setFormLinkUrl(link);
    syncLinkTypeFromUrl(link);
    setFormSortOrder(item.sortOrder);
    setFormIsActive(item.isActive);
    setShowUrlInput(false);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploaded = await uploadProductImage(file);
      setFormImage(uploaded.url);
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formImage.trim()) {
      toast.error("Please provide an image");
      return;
    }

    try {
      setIsSubmitting(true);
      const finalLinkUrl =
        selectedLinkType === "custom"
          ? formLinkUrl.trim() || null
          : selectedLinkType.trim() || null;

      const payload = {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim(),
        image: formImage.trim(),
        linkUrl: finalLinkUrl,
        sortOrder: Number(formSortOrder) || 0,
        isActive: formIsActive,
      };

      if (editingItem) {
        const res = await fetch(`/api/admin/brand-showcase/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to update item");
        }
        const updated = await res.json();
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? { ...i, ...updated } : i))
        );
        toast.success("Item updated");
      } else {
        const res = await fetch("/api/admin/brand-showcase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to create item");
        }
        const created = await res.json();
        setItems((prev) => [...prev, created]);
        toast.success("Item created successfully");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: BrandShowcaseItemDTO) => {
    try {
      const nextActive = !item.isActive;
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isActive: nextActive } : i))
      );
      const res = await fetch(`/api/admin/brand-showcase/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(nextActive ? "Item enabled" : "Item disabled");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const updated = newItems.map((item, idx) => ({ ...item, sortOrder: idx }));
    setItems(updated);

    try {
      await Promise.all([
        fetch(`/api/admin/brand-showcase/${updated[index].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: updated[index].sortOrder }),
        }),
        fetch(`/api/admin/brand-showcase/${updated[targetIndex].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: updated[targetIndex].sortOrder }),
        }),
      ]);
    } catch {
      // background sync
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/admin/brand-showcase/${deleteTargetId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete item");
      setItems((prev) => prev.filter((i) => i.id !== deleteTargetId));
      toast.success("Item removed");
      setDeleteTargetId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("Reset showcase cards to the 4 default items?")) return;
    try {
      const res = await fetch("/api/admin/brand-showcase/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset");
      setItems(data.data || []);
      toast.success("Reset to defaults");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset");
    }
  };

  const getDestinationLabel = (linkUrl?: string | null) => {
    if (!linkUrl) return null;
    if (linkUrl === "/shop") return { label: "All Products", type: "store" };
    const matchedCategory = categories.find(
      (c) =>
        linkUrl === `/shop?filter=${c.slug}` ||
        linkUrl === `/shop?category=${c.slug}` ||
        linkUrl === `/categories/${c.slug}`
    );
    if (matchedCategory) {
      return { label: matchedCategory.title, type: "category" };
    }
    return { label: linkUrl, type: "custom" };
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? item.isActive
        : !item.isActive;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-5 p-6 sm:p-8 max-w-[1400px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Layers className="size-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Brand Showcase
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Manage the interactive cards displayed under &ldquo;Fastest growing Consumer Electronics Brand in India&rdquo; on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSeedDefaults}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition"
          >
            <RefreshCw className="size-3.5 text-slate-400" />
            Reset to Defaults
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a7ae6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#096ecf] transition active:scale-95"
          >
            <Plus className="size-3.5" />
            Add Showcase Item
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search showcase items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0a7ae6] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              statusFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Active ({items.filter((i) => i.isActive).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("hidden")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              statusFilter === "hidden"
                ? "bg-amber-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Hidden ({items.filter((i) => !i.isActive).length})
          </button>
        </div>
      </div>

      {/* DATA TABLE FORMAT */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Order</th>
                <th className="py-3 px-4 w-28">Image</th>
                <th className="py-3 px-4 min-w-[200px]">Title &amp; Subtitle</th>
                <th className="py-3 px-4 min-w-[150px]">Destination</th>
                <th className="py-3 px-4 w-28 text-center">Status</th>
                <th className="py-3 px-4 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <p className="text-sm font-medium">No showcase items found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click &ldquo;Add Showcase Item&rdquo; to create your first card.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const dest = getDestinationLabel(item.linkUrl);
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-slate-50/60 ${
                        !item.isActive ? "bg-slate-50/40 opacity-70" : ""
                      }`}
                    >
                      {/* Order / Reorder */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 text-slate-400">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveOrder(index, "up")}
                            className="rounded p-0.5 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 disabled:hover:bg-transparent transition"
                            title="Move up"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <span className="w-4 text-center font-bold text-slate-600">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            disabled={index === items.length - 1}
                            onClick={() => handleMoveOrder(index, "down")}
                            className="rounded p-0.5 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 disabled:hover:bg-transparent transition"
                            title="Move down"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-2xs">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      </td>

                      {/* Title & Subtitle */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 text-sm">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                          {item.subtitle || "—"}
                        </p>
                      </td>

                      {/* Destination Category / Store / Custom Link */}
                      <td className="py-3 px-4">
                        {item.linkUrl && dest ? (
                          <Link prefetch={false}
                            href={item.linkUrl}
                            target="_blank"
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                              dest.type === "category"
                                ? "bg-blue-50 text-[#0a7ae6] hover:bg-blue-100/80"
                                : dest.type === "store"
                                ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {dest.type === "category" ? (
                              <Tag className="size-3 text-[#0a7ae6]" />
                            ) : dest.type === "store" ? (
                              <ShoppingBag className="size-3 text-indigo-600" />
                            ) : (
                              <ExternalLink className="size-3 text-slate-500" />
                            )}
                            <span className="truncate max-w-[160px]">{dest.label}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-xs">No link</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              item.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {item.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(item)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                            title={item.isActive ? "Hide from homepage" : "Show on homepage"}
                          >
                            {item.isActive ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4 text-emerald-600" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                            title="Edit"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(item.id)}
                            className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingItem ? "Edit Showcase Item" : "Add Showcase Item"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Home Cinema"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-2 focus:ring-[#0a7ae6]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Up to 300-inch 4K projection for movie nights"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {formImage ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
                      <Image
                        src={formImage}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormImage("")}
                        className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black transition"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-5 text-center hover:border-[#0a7ae6] cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition"
                    >
                      {isUploading ? (
                        <Loader2 className="size-5 animate-spin text-[#0a7ae6]" />
                      ) : (
                        <>
                          <Upload className="size-5 text-slate-400 mb-1" />
                          <p className="text-xs font-semibold text-slate-700">
                            Click to upload image file
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            PNG, JPG, or WEBP recommended
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowUrlInput((prev) => !prev)}
                      className="text-[#0a7ae6] hover:underline font-semibold"
                    >
                      {showUrlInput ? "Hide custom URL" : "Or enter custom Image URL"}
                    </button>
                  </div>

                  {showUrlInput && (
                    <input
                      type="text"
                      placeholder="https://... or /banner-projector.png"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* DESTINATION CATEGORY / STORE DROPDOWN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Category / Store Link
                </label>
                <div className="space-y-2">
                  <select
                    value={selectedLinkType}
                    onChange={(e) => handleLinkTypeChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0a7ae6] focus:outline-none"
                  >
                    <option value="">No link (Display only)</option>
                    <option value="/shop">All Store Products</option>
                    {categories.length > 0 && (
                      <optgroup label="Shop by Category">
                        {categories.map((cat) => (
                          <option key={cat.id} value={`/shop?filter=${cat.slug}`}>
                            {cat.title}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <option value="custom">Custom URL...</option>
                  </select>

                  {selectedLinkType === "custom" && (
                    <input
                      type="text"
                      placeholder="e.g. /repair-replacement or https://..."
                      value={formLinkUrl}
                      onChange={(e) => setFormLinkUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsActiveToggle"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-[#0a7ae6] focus:ring-[#0a7ae6]"
                />
                <label
                  htmlFor="formIsActiveToggle"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Visible on Homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a7ae6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#096ecf] transition disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="size-3 animate-spin" />}
                  {editingItem ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 text-center">
            <h3 className="text-sm font-bold text-slate-900">Delete Showcase Item?</h3>
            <p className="mt-1 text-xs text-slate-500">
              Are you sure you want to remove this item from the showcase?
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition shadow-2xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}