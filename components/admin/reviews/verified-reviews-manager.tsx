"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Star,
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
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import type { VerifiedReviewItem } from "@/lib/server/controllers/verified-reviews.controller";
import { uploadProductImage } from "@/lib/client/upload-product-image";

interface VerifiedReviewsManagerProps {
  initialReviews: VerifiedReviewItem[];
  products: { id: string; name: string; slug: string }[];
}

const POSITION_PRESETS = [
  {
    name: "Top Left",
    desktopTop: "25%",
    desktopLeft: "28%",
    mobileTop: "18%",
    mobileLeft: "25%",
    cardSide: "right" as const,
  },
  {
    name: "Top Right",
    desktopTop: "25%",
    desktopLeft: "76%",
    mobileTop: "50%",
    mobileLeft: "18%",
    cardSide: "left" as const,
  },
  {
    name: "Center Left",
    desktopTop: "50%",
    desktopLeft: "16%",
    mobileTop: "80%",
    mobileLeft: "18%",
    cardSide: "right" as const,
  },
  {
    name: "Center",
    desktopTop: "50%",
    desktopLeft: "38%",
    mobileTop: "48%",
    mobileLeft: "50%",
    cardSide: "right" as const,
  },
  {
    name: "Center Right",
    desktopTop: "48%",
    desktopLeft: "55%",
    mobileTop: "20%",
    mobileLeft: "75%",
    cardSide: "right" as const,
  },
  {
    name: "Bottom Right",
    desktopTop: "62%",
    desktopLeft: "82%",
    mobileTop: "50%",
    mobileLeft: "82%",
    cardSide: "left" as const,
  },
];

export function VerifiedReviewsManager({
  initialReviews,
  products,
}: VerifiedReviewsManagerProps) {
  const [reviews, setReviews] = useState<VerifiedReviewItem[]>(initialReviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<VerifiedReviewItem | null>(null);
  const [showCanvasPreview, setShowCanvasPreview] = useState(false);
  const [previewActiveIndex, setPreviewActiveIndex] = useState<number | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showAdvancedLayout, setShowAdvancedLayout] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formProduct, setFormProduct] = useState("");
  const [formAvatar, setFormAvatar] = useState("");
  const [formText, setFormText] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formSize, setFormSize] = useState<"sm" | "md" | "lg">("md");
  const [formCardSide, setFormCardSide] = useState<"left" | "right">("right");
  const [formPreset, setFormPreset] = useState<string>("Top Left");
  const [formDesktopTop, setFormDesktopTop] = useState("25%");
  const [formDesktopLeft, setFormDesktopLeft] = useState("28%");
  const [formMobileTop, setFormMobileTop] = useState("18%");
  const [formMobileLeft, setFormMobileLeft] = useState("25%");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter === "active" && !r.isActive) return false;
      if (statusFilter === "hidden" && r.isActive) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesProduct = r.product.toLowerCase().includes(q);
        const matchesText = r.text.toLowerCase().includes(q);
        if (!matchesName && !matchesProduct && !matchesText) return false;
      }
      return true;
    });
  }, [reviews, searchQuery, statusFilter]);

  // Metrics
  const totalCount = reviews.length;
  const activeCount = reviews.filter((r) => r.isActive).length;
  const avgRating =
    totalCount > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
      : "5.0";
  const uniqueProducts = new Set(reviews.map((r) => r.product.trim().toLowerCase())).size;

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingReview(null);
    setFormName("");
    setFormProduct(products[0]?.name || "Arc Buds");
    setFormAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80");
    setFormText("");
    setFormRating(5);
    setFormSize("md");
    setFormCardSide("right");

    // Auto-pick next slot from presets
    const nextPreset = POSITION_PRESETS[reviews.length % POSITION_PRESETS.length];
    setFormPreset(nextPreset.name);
    setFormDesktopTop(nextPreset.desktopTop);
    setFormDesktopLeft(nextPreset.desktopLeft);
    setFormMobileTop(nextPreset.mobileTop);
    setFormMobileLeft(nextPreset.mobileLeft);
    setFormCardSide(nextPreset.cardSide);

    setFormIsActive(true);
    setShowAdvancedLayout(false);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (rev: VerifiedReviewItem) => {
    setEditingReview(rev);
    setFormName(rev.name);
    setFormProduct(rev.product);
    setFormAvatar(rev.avatar);
    setFormText(rev.text);
    setFormRating(rev.rating);
    setFormSize(rev.size);
    setFormCardSide(rev.cardSide);

    const matchedPreset = POSITION_PRESETS.find(
      (p) => p.desktopTop === rev.desktopTop && p.desktopLeft === rev.desktopLeft
    );
    setFormPreset(matchedPreset ? matchedPreset.name : "Custom");
    setFormDesktopTop(rev.desktopTop);
    setFormDesktopLeft(rev.desktopLeft);
    setFormMobileTop(rev.mobileTop);
    setFormMobileLeft(rev.mobileLeft);
    setFormIsActive(rev.isActive);
    setShowAdvancedLayout(false);
    setIsModalOpen(true);
  };

  // Apply position preset
  const handleSelectPreset = (presetName: string) => {
    setFormPreset(presetName);
    const found = POSITION_PRESETS.find((p) => p.name === presetName);
    if (found) {
      setFormDesktopTop(found.desktopTop);
      setFormDesktopLeft(found.desktopLeft);
      setFormMobileTop(found.mobileTop);
      setFormMobileLeft(found.mobileLeft);
      setFormCardSide(found.cardSide);
    }
  };

  // Handle Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadProductImage(file);
      setFormAvatar(uploaded.url);
      toast.success("Avatar image uploaded!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/verified-reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isActive: !currentStatus } : r))
        );
        toast.success(
          !currentStatus ? "Review is now live on homepage" : "Review hidden from homepage"
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Error updating review status");
    }
  };

  // Delete Review
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this verified buyer review?")) return;

    try {
      const res = await fetch(`/api/admin/verified-reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        toast.success("Review deleted successfully");
      } else {
        toast.error("Failed to delete review");
      }
    } catch {
      toast.error("Error deleting review");
    }
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (!confirm("Reset verified reviews to the original 6 default reviews? This replaces all existing items.")) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/verified-reviews/seed", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
        toast.success("Reset to 6 default reviews successfully!");
      } else {
        toast.error("Failed to reset defaults");
      }
    } catch {
      toast.error("Error resetting defaults");
    } finally {
      setIsResetting(false);
    }
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formProduct.trim() || !formText.trim()) {
      toast.error("Please fill in customer name, product, and review quote.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: formName.trim(),
      product: formProduct.trim(),
      avatar: formAvatar.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      text: formText.trim(),
      rating: formRating,
      size: formSize,
      cardSide: formCardSide,
      desktopTop: formDesktopTop,
      desktopLeft: formDesktopLeft,
      mobileTop: formMobileTop,
      mobileLeft: formMobileLeft,
      isActive: formIsActive,
    };

    try {
      if (editingReview) {
        const res = await fetch(`/api/admin/verified-reviews/${editingReview.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setReviews((prev) => prev.map((r) => (r.id === editingReview.id ? data : r)));
          toast.success("Review updated successfully!");
          setIsModalOpen(false);
        } else {
          toast.error(data.error || "Failed to update review.");
        }
      } else {
        const res = await fetch("/api/admin/verified-reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setReviews((prev) => [data, ...prev]);
          toast.success("Review added successfully!");
          setIsModalOpen(false);
        } else {
          toast.error(data.error || "Failed to create review.");
        }
      }
    } catch {
      toast.error("An error occurred while saving the review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER & PRIMARY ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-normal mb-1">
            <span>Storefront Homepage</span>
            <span>/</span>
            <span className="text-slate-800 font-medium">Real reviews from verified buyers</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
              Homepage Verified Reviews
            </h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/80">
              {activeCount} Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-normal">
            Control customer reviews and ratings displayed in the &quot;Real reviews from verified buyers&quot; section on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCanvasPreview(!showCanvasPreview)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition cursor-pointer ${
              showCanvasPreview
                ? "border-blue-500 bg-blue-50 text-[#0a7ae6]"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Monitor className="size-3.5" />
            <span>{showCanvasPreview ? "Hide Preview" : "Preview Canvas"}</span>
          </button>

          <button
            type="button"
            disabled={isResetting}
            onClick={handleResetDefaults}
            title="Reset to original default reviews"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isResetting ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-[#0a7ae6] transition cursor-pointer active:scale-95"
          >
            <Plus className="size-4" />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* METRIC STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Reviews</span>
            <Star className="size-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-800">{totalCount}</span>
            <span className="text-xs text-slate-400 font-normal">Reviews</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Live on Homepage</span>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-emerald-600">{activeCount}</span>
            <span className="text-xs text-slate-400 font-normal">/ {totalCount} Active</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Average Rating</span>
            <Star className="size-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-800">{avgRating}</span>
            <span className="text-xs text-amber-500 font-medium">★★★★★</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Products Featured</span>
            <CheckCircle2 className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-800">{uniqueProducts}</span>
            <span className="text-xs text-slate-400 font-normal">Products</span>
          </div>
        </div>
      </div>

      {/* OPTIONAL LIVE INTERACTIVE CANVAS PREVIEW */}
      {showCanvasPreview && (
        <div className="rounded-2xl border border-blue-200/80 bg-linear-to-b from-blue-50/40 via-white to-slate-50/50 p-5 shadow-sm space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900">
                Interactive Homepage Canvas Preview
              </h3>
            </div>
            <Link prefetch={false}
              href="/"
              target="_blank"
              className="text-xs font-semibold text-[#0a7ae6] hover:underline inline-flex items-center gap-1"
            >
              <span>View live homepage</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>

          <div className="relative min-h-[340px] w-full rounded-2xl border border-slate-200/80 bg-white p-4 overflow-hidden select-none">
            {reviews.filter((r) => r.isActive).map((rev, idx) => {
              const isSelected = previewActiveIndex === idx;
              let bubbleClass = "w-12 h-12";
              if (rev.size === "md") bubbleClass = "w-16 h-16";
              if (rev.size === "lg") bubbleClass = "w-20 h-20";

              return (
                <div
                  key={rev.id}
                  className={`absolute transition-all duration-300 ${isSelected ? "z-40" : "z-10"}`}
                  style={{
                    top: rev.desktopTop,
                    left: rev.desktopLeft,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setPreviewActiveIndex(isSelected ? null : idx)}
                    onMouseEnter={() => setPreviewActiveIndex(idx)}
                    className={`relative overflow-hidden rounded-full border-2 bg-slate-100 shadow-md transition-all cursor-pointer ${bubbleClass} ${
                      isSelected
                        ? "border-[#0a7ae6] ring-4 ring-blue-500/30 scale-110 shadow-blue-500/20"
                        : "border-white hover:scale-105"
                    }`}
                  >
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="h-full w-full object-cover pointer-events-none"
                    />
                  </button>

                  {/* Popover Preview */}
                  {isSelected && (
                    <div
                      className={`absolute z-50 w-72 pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${
                        rev.cardSide === "left"
                          ? "right-full mr-3 top-1/2 -translate-y-1/2"
                          : "left-full ml-3 top-1/2 -translate-y-1/2"
                      }`}
                    >
                      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-900">
                            {rev.name}
                          </p>
                          <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-700">
                            {rev.product}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500 mb-1.5">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="size-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-xs italic text-slate-700 leading-relaxed">
                          &quot;{rev.text}&quot;
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, location, product, or quote..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0a7ae6] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 focus:border-[#0a7ae6] focus:outline-none"
          >
            <option value="all">All Reviews ({reviews.length})</option>
            <option value="active">Live on Homepage ({activeCount})</option>
            <option value="hidden">Hidden ({totalCount - activeCount})</option>
          </select>
        </div>
      </div>

      {/* REVIEWS GRID */}
      {filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <MessageSquare className="mx-auto size-10 text-slate-400 mb-3" />
          <h3 className="text-base font-medium text-slate-800">No verified reviews found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-normal">
            Try adjusting your search keywords, or add a new review using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden bg-white shadow-2xs hover:shadow-md ${
                rev.isActive ? "border-slate-200" : "border-slate-200/60 opacity-75"
              }`}
            >
              <div className="p-4 space-y-3">
                {/* Header: Avatar, Name, and Status toggle */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative size-11 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 shrink-0">
                      <img
                        src={rev.avatar}
                        alt={rev.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                        {rev.name}
                      </h4>
                      <span className="inline-block mt-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] font-medium text-emerald-700 truncate max-w-[170px]">
                        {rev.product}
                      </span>
                    </div>
                  </div>

                  {/* Active Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(rev.id, rev.isActive)}
                    title={rev.isActive ? "Live on homepage (Click to hide)" : "Hidden (Click to show)"}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium cursor-pointer transition ${
                      rev.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {rev.isActive ? (
                      <>
                        <Eye className="size-3 text-emerald-600" />
                        <span>Live</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="size-3 text-slate-400" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Star rating */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400" />
                  ))}
                  <span className="text-[11px] font-medium text-slate-500 ml-1">
                    {rev.rating}.0
                  </span>
                </div>

                {/* Review quote */}
                <p className="text-xs text-slate-700 italic leading-relaxed line-clamp-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100 font-normal">
                  &quot;{rev.text}&quot;
                </p>
              </div>

              {/* Bottom Actions: Edit and Delete */}
              <div className="px-4 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-normal">Verified Buyer</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(rev)}
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium px-2 py-1 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
                  >
                    <Pencil className="size-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(rev.id)}
                    className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CLEAN & SIMPLE ADD / EDIT REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4">
            {/* Modal Title (No AI logo, clean Star icon) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Star className="size-4 text-amber-500 fill-amber-500" />
                <h3 className="text-base font-semibold text-slate-800">
                  {editingReview ? "Edit Verified Review" : "Add Verified Review"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Customer Name and Location */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Customer Name & Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muskan A., Mumbai"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0a7ae6] focus:outline-none"
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Product *
                </label>
                <input
                  type="text"
                  required
                  list="products-datalist"
                  placeholder="e.g. Arc Buds"
                  value={formProduct}
                  onChange={(e) => setFormProduct(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0a7ae6] focus:outline-none"
                />
                <datalist id="products-datalist">
                  {products.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                  <option value="Arc Buds" />
                  <option value="Blaze B1100" />
                  <option value="Blaze B2000" />
                  <option value="Lumex Pro" />
                  <option value="iProjector 3" />
                  <option value="Techno Smart" />
                </datalist>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rating *</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      className="p-0.5 cursor-pointer hover:scale-110 transition"
                    >
                      <Star
                        className={`size-5 ${
                          star <= formRating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-medium text-slate-600">{formRating} / 5</span>
                </div>
              </div>

              {/* Review Quote */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Review Quote *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Customer feedback quote..."
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0a7ae6] focus:outline-none font-normal"
                />
              </div>

              {/* Customer Photo */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Customer Photo</label>
                <div className="flex items-center gap-3">
                  <div className="relative size-11 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                    <img
                      src={formAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="avatar-file-input"
                    />
                    <label
                      htmlFor="avatar-file-input"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition shrink-0"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="size-3 animate-spin text-[#0a7ae6]" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="size-3 text-slate-500" />
                          <span>Upload</span>
                        </>
                      )}
                    </label>
                    <input
                      type="url"
                      placeholder="or paste image URL..."
                      value={formAvatar}
                      onChange={(e) => setFormAvatar(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#0a7ae6] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="active-checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="size-4 rounded text-[#0a7ae6] focus:ring-[#0a7ae6] cursor-pointer"
                />
                <label htmlFor="active-checkbox" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Show on Homepage (Active)
                </label>
              </div>

              {/* Optional Advanced Layout Options (Collapsed by default) */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowAdvancedLayout(!showAdvancedLayout)}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center gap-1"
                >
                  <span>{showAdvancedLayout ? "− Hide position options" : "+ Position & size options (optional)"}</span>
                </button>

                {showAdvancedLayout && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 animate-in fade-in duration-150">
                    <div>
                      <span className="block text-[11px] font-medium text-slate-600 mb-1">Avatar Bubble Size</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["sm", "md", "lg"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFormSize(s)}
                            className={`rounded-lg border py-1 text-[11px] font-medium transition cursor-pointer ${
                              formSize === s
                                ? "border-[#0a7ae6] bg-blue-50 text-[#0a7ae6]"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {s === "sm" ? "Small" : s === "md" ? "Medium" : "Large"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] font-medium text-slate-600 mb-1">Canvas Position</span>
                      <p className="mb-2 text-[11px] text-slate-500">Positions adjust automatically when reviews overlap or more than six reviews are live.</p>
                      <div className="grid grid-cols-3 gap-1">
                        {POSITION_PRESETS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleSelectPreset(p.name)}
                            className={`rounded-lg border px-1.5 py-1 text-[10px] font-medium transition cursor-pointer truncate ${
                              formPreset === p.name
                                ? "border-[#0a7ae6] bg-blue-50 text-[#0a7ae6]"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-medium text-white hover:bg-[#0a7ae6] transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : editingReview ? "Update Review" : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
