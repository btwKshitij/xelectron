"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
  Plus,
  ExternalLink,
  ImageIcon,
  X,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export type AdminReviewItem = {
  id: string;
  author: string;
  rating: number;
  date?: string | null;
  title?: string | null;
  content: string;
  image?: string | null;
  imageCount?: number | null;
  verified: boolean;
  isApproved: boolean;
  productId: string;
  createdAt: string | Date;
  product?: {
    id: string;
    name: string;
    slug: string;
    mainImage?: string | null;
  } | null;
};

interface ReviewsManagerProps {
  initialReviews: AdminReviewItem[];
  products: { id: string; name: string; slug: string; mainImage?: string }[];
}

export function ReviewsManager({ initialReviews, products }: ReviewsManagerProps) {
  const [reviews, setReviews] = useState<AdminReviewItem[]>(initialReviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [photoFilter, setPhotoFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  // Add form state
  const [formProductId, setFormProductId] = useState(products[0]?.id || "");
  const [formAuthor, setFormAuthor] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formVerified, setFormVerified] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Metrics
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";
  const photoReviewsCount = reviews.filter((r) => Boolean(r.image)).length;
  const verifiedCount = reviews.filter((r) => r.verified).length;

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // Product Filter
      if (selectedProduct !== "all" && rev.productId !== selectedProduct) {
        return false;
      }
      // Rating Filter
      if (selectedRating !== "all" && rev.rating !== Number(selectedRating)) {
        return false;
      }
      // Photo Filter
      if (photoFilter === "with-photo" && !rev.image) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAuthor = rev.author.toLowerCase().includes(q);
        const matchesContent = rev.content.toLowerCase().includes(q);
        const matchesProduct = rev.product?.name?.toLowerCase().includes(q);
        if (!matchesAuthor && !matchesContent && !matchesProduct) {
          return false;
        }
      }
      return true;
    });
  }, [reviews, selectedProduct, selectedRating, photoFilter, searchQuery]);

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer review?")) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        toast.success("Review deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete review");
      }
    } catch {
      toast.error("Failed to delete review");
    }
  };

  // Handle Toggle Verified
  const handleToggleVerified = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, verified: !currentStatus } : r))
        );
        toast.success(
          !currentStatus ? "Marked as Verified Buyer" : "Removed Verified status"
        );
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Handle Create Review
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductId || !formAuthor.trim() || !formContent.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formProductId,
          author: formAuthor.trim(),
          rating: formRating,
          title: formTitle.trim() || undefined,
          content: formContent.trim(),
          image: formImage.trim() || undefined,
          verified: formVerified,
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        const prod = products.find((p) => p.id === formProductId);
        const newRevWithProduct: AdminReviewItem = {
          ...data.review,
          product: prod
            ? { id: prod.id, name: prod.name, slug: prod.slug, mainImage: prod.mainImage }
            : null,
        };
        setReviews([newRevWithProduct, ...reviews]);
        toast.success("New review created successfully");
        setIsAddModalOpen(false);
        setFormAuthor("");
        setFormTitle("");
        setFormContent("");
        setFormImage("");
      } else {
        toast.error(data.error || "Failed to create review");
      }
    } catch {
      toast.error("An error occurred while creating the review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Link href="/dashboard" className="hover:text-slate-900 transition">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Reviews</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Product Reviews
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#0a7ae6] border border-blue-200/60">
              {totalReviews} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage, moderate, and inspect customer ratings and feedback across all products.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0a7ae6] transition cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="size-4" />
          <span>Add New Review</span>
        </button>
      </div>

      {/* METRIC STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Average Rating</span>
            <Star className="size-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{avgRating}</span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Reviews</span>
            <MessageSquare className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalReviews}</span>
            <span className="text-xs text-emerald-600 font-bold">100% Active</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>With Customer Photos</span>
            <ImageIcon className="size-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{photoReviewsCount}</span>
            <span className="text-xs text-slate-400">
              ({totalReviews > 0 ? Math.round((photoReviewsCount / totalReviews) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Verified Buyers</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{verifiedCount}</span>
            <span className="text-xs text-slate-400">
              ({totalReviews > 0 ? Math.round((verifiedCount / totalReviews) * 100) : 0}%)
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reviewer, review content, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0a7ae6] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Product Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 focus:border-[#0a7ae6] focus:outline-none"
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Rating Dropdown */}
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 focus:border-[#0a7ae6] focus:outline-none"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {/* Photos filter */}
          <select
            value={photoFilter}
            onChange={(e) => setPhotoFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 focus:border-[#0a7ae6] focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="with-photo">With Photos Only</option>
          </select>
        </div>
      </div>

      {/* REVIEWS LIST TABLE / CARDS */}
      {filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <MessageSquare className="mx-auto size-10 text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No reviews found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filters, or create a new review using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Product Header */}
                <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative size-9 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                      <Image
                        src={rev.product?.mainImage || "/category-projector.png"}
                        alt={rev.product?.name || "Product"}
                        fill
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {rev.product?.name || "Product"}
                      </h4>
                      <Link
                        href={`/product/${rev.product?.slug || rev.product?.id || rev.productId}`}
                        target="_blank"
                        className="text-[11px] text-[#0a7ae6] hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <span>View on Store</span>
                        <ExternalLink className="size-2.5" />
                      </Link>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleVerified(rev.id, rev.verified)}
                    title={rev.verified ? "Verified Buyer (Click to unverify)" : "Unverified (Click to verify)"}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                      rev.verified
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {rev.verified ? <ShieldCheck className="size-3 text-emerald-600" /> : <ShieldAlert className="size-3 text-slate-400" />}
                    <span>{rev.verified ? "Verified" : "Unverified"}</span>
                  </button>
                </div>

                {/* Review Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {rev.date || (rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "")}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{rev.author}</h5>
                    {rev.title && (
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{rev.title}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line line-clamp-4">
                      {rev.content}
                    </p>
                  </div>

                  {/* Photo Preview if attached */}
                  {rev.image && (
                    <div
                      onClick={() => setSelectedPreviewImage(rev.image!)}
                      className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100 cursor-pointer group border border-slate-200/80"
                    >
                      <img
                        src={rev.image}
                        alt="Customer upload"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                        <ImageIcon className="size-3.5" /> View Photo
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/40">
                <span className="text-[11px] text-slate-400">ID: {rev.id.slice(0, 8)}...</span>
                <button
                  type="button"
                  onClick={() => handleDelete(rev.id)}
                  className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold hover:bg-rose-50 px-2 py-1 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL PHOTO PREVIEW MODAL */}
      {selectedPreviewImage && (
        <div
          onClick={() => setSelectedPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
          >
            <button
              type="button"
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute top-4 right-4 z-10 size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition"
            >
              <X className="size-4" />
            </button>
            <img
              src={selectedPreviewImage}
              alt="Full customer review photo"
              className="max-h-[75vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* ADD REVIEW MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[#0a7ae6]" />
                <h3 className="text-base font-bold text-slate-900">Add Customer Review</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              {/* Product Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Product *</label>
                <select
                  required
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0a7ae6] focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vicky V."
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0a7ae6] focus:outline-none"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rating *</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      className="p-0.5 cursor-pointer hover:scale-110 transition"
                    >
                      <Star
                        className={`size-6 ${
                          star <= formRating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-700">{formRating} / 5 Stars</span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headline (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Cinema hall experience right at home"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0a7ae6] focus:outline-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Content *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed customer experience feedback..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0a7ae6] focus:outline-none"
                />
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/projector-photo.jpg"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0a7ae6] focus:outline-none"
                />
              </div>

              {/* Verified Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="verified-checkbox"
                  checked={formVerified}
                  onChange={(e) => setFormVerified(e.target.checked)}
                  className="size-4 rounded text-[#0a7ae6] focus:ring-[#0a7ae6]"
                />
                <label htmlFor="verified-checkbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Mark as Verified Buyer Badge
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-[#0a7ae6] transition shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
