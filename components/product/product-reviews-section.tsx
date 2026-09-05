"use client";

import { useState, useRef } from "react";
import {
  Star,
  SlidersHorizontal,
  Image as ImageIcon,
  X,
  ChevronDown,
  Check,
  ArrowLeft,
  Upload,
  Camera,
} from "lucide-react";

export type CustomerReview = {
  id: string;
  author: string;
  verified: boolean;
  date: string;
  rating: number;
  content: string;
  image?: string;
  imageCount?: number;
};

interface ProductReviewsSectionProps {
  productId?: string;
  productName?: string;
  rating?: number;
  reviewsCount?: string | number;
  initialReviews?: CustomerReview[];
}

export default function ProductReviewsSection({
  productId,
  productName = "Product",
  rating = 5,
  reviewsCount = 0,
  initialReviews,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<CustomerReview[]>(initialReviews || []);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "photos" | "5star" | "4star">("all");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Multi-step modal states (Steps: 1 -> 2 -> 3 -> 4 -> 5)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [reviewText, setReviewText] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetModal = () => {
    setIsWriteOpen(false);
    setStep(1);
    setUserRating(0);
    setHoverRating(null);
    setPhotoPreview("");
    setReviewText("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setIsSubmitting(false);
  };

  const handleRatingSelect = (selectedStar: number) => {
    setUserRating(selectedStar);
    setTimeout(() => {
      setStep(2);
    }, 200);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    const authorName = lastName.trim() ? `${firstName.trim()} ${lastName.trim().charAt(0)}.` : firstName.trim();

    const newRevData = {
      author: authorName,
      rating: userRating,
      content: reviewText.trim() || "Great quality and smooth experience!",
      image: photoPreview || undefined,
      verified: true,
      productId,
    };

    let createdRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      author: authorName,
      verified: true,
      date: new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }),
      rating: userRating,
      content: reviewText.trim() || "Great quality and smooth experience!",
      image: photoPreview || undefined,
    };

    try {
      if (productId) {
        const res = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRevData),
        });
        const data = await res.json();
        if (data.success && data.review) {
          createdRev = {
            id: data.review.id,
            author: data.review.author,
            verified: data.review.verified,
            date: data.review.date || new Date(data.review.createdAt).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }),
            rating: data.review.rating,
            content: data.review.content,
            image: data.review.image || undefined,
            imageCount: data.review.imageCount || undefined,
          };
        }
      }
    } catch {}

    setReviews([createdRev, ...reviews]);
    setIsSubmitting(false);
    setStep(5);
    setTimeout(() => {
      resetModal();
    }, 1500);
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterMode === "photos") return Boolean(r.image);
    if (filterMode === "5star") return r.rating === 5;
    if (filterMode === "4star") return r.rating === 4;
    return true;
  });

  return (
    <section id="product-reviews" className="mt-16 sm:mt-24 pt-10 border-t border-slate-200 scroll-mt-24">
      <div className="max-w-[1440px] mx-auto">
        {/* TOP REVIEW HEADER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 sm:pb-8">
          {/* Left: Star rating & Reviews count */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 sm:size-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className="inline-flex items-center gap-1 text-sm sm:text-base font-bold text-slate-900 hover:text-[#0a7ae6] transition cursor-pointer"
            >
              <span>{reviews.length} Reviews</span>
              <ChevronDown className="size-4 text-slate-500" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setUserRating(0);
                setHoverRating(null);
                setIsWriteOpen(true);
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer active:scale-95"
            >
              Write a review
            </button>

            {/* Filter Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterMenuOpen((prev) => !prev)}
                title="Filter reviews"
                className={`flex size-9 sm:size-10 items-center justify-center rounded-lg border transition cursor-pointer ${
                  isFilterMenuOpen || filterMode !== "all"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="size-4" />
              </button>

              {/* Filter Dropdown Menu */}
              {isFilterMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => { setFilterMode("all"); setIsFilterMenuOpen(false); }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg ${
                      filterMode === "all" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>All Reviews</span>
                    {filterMode === "all" && <Check className="size-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFilterMode("photos"); setIsFilterMenuOpen(false); }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg ${
                      filterMode === "photos" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>With Photos</span>
                    {filterMode === "photos" && <Check className="size-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFilterMode("5star"); setIsFilterMenuOpen(false); }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg ${
                      filterMode === "5star" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>5 Stars Only</span>
                    {filterMode === "5star" && <Check className="size-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFilterMode("4star"); setIsFilterMenuOpen(false); }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg ${
                      filterMode === "4star" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>4 Stars Only</span>
                    {filterMode === "4star" && <Check className="size-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MULTI-STEP WRITE A REVIEW MODAL (LOOX / CROSSBEATS EXACT REPLICA) */}
        {isWriteOpen && (
          <div
            onClick={resetModal}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[500px] bg-white rounded-[28px] shadow-2xl p-6 sm:p-9 flex flex-col justify-between h-[450px] sm:h-[470px] overflow-hidden animate-in zoom-in-95 duration-200"
            >
              {/* Close Button Top-Left */}
              <button
                type="button"
                onClick={resetModal}
                className="absolute top-5 left-5 size-8 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer z-10"
              >
                <X className="size-4" />
              </button>

              {/* ──────────────── STEP 1: RATING ──────────────── */}
              {step === 1 && (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center animate-in fade-in duration-300">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    How would you rate this item?
                  </h3>

                  {/* 5 Big Gold Stars */}
                  <div className="my-8 flex items-center justify-center gap-2.5 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isHighlighted =
                        (hoverRating !== null ? hoverRating : userRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => handleRatingSelect(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-115 active:scale-95"
                        >
                          <Star
                            className={`size-10 sm:size-12 stroke-[1.5] transition-colors duration-150 ${
                              isHighlighted
                                ? "fill-amber-400 text-amber-400"
                                : "text-amber-400 fill-transparent"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Subtext labels below stars */}
                  <div className="flex items-center justify-between w-full max-w-[270px] text-xs font-semibold text-slate-600 px-1">
                    <span>Dislike it</span>
                    <span>Love it!</span>
                  </div>
                </div>
              )}

              {/* ──────────────── STEP 2: ADD PHOTOS ──────────────── */}
              {step === 2 && (
                <div className="flex-1 flex flex-col items-center justify-between w-full pt-4 animate-in fade-in duration-300">
                  <div className="text-center">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Show it off
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                      We&apos;d love to see it in action!
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {photoPreview ? (
                    <div className="my-auto relative w-44 h-32 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group shadow-2xs">
                      <img
                        src={photoPreview}
                        alt="Review upload preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoPreview("")}
                        className="absolute top-2 right-2 size-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="my-auto">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2.5 rounded-full bg-[#181d24] hover:bg-black px-8 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <Camera className="size-4" />
                        <span>Add photos</span>
                      </button>
                    </div>
                  )}

                  {/* Bottom Navigation Bar */}
                  <div className="w-full pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 transition cursor-pointer"
                    >
                      <ArrowLeft className="size-4" /> Back
                    </button>

                    {/* Progress 4 Bars */}
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 w-7 sm:w-9 rounded-full bg-slate-900 transition-colors" />
                      <div className="h-1 w-7 sm:w-9 rounded-full bg-slate-900 transition-colors" />
                      <div className="h-1 w-7 sm:w-9 rounded-full bg-slate-200 transition-colors" />
                      <div className="h-1 w-7 sm:w-9 rounded-full bg-slate-200 transition-colors" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 transition cursor-pointer"
                    >
                      {photoPreview ? "Next" : "Skip"}
                    </button>
                  </div>
                </div>
              )}

              {/* ──────────────── STEP 3: TELL US MORE ──────────────── */}
              {step === 3 && (
                <div className="flex-1 flex flex-col items-center justify-between w-full pt-4 animate-in fade-in duration-300">
                  <div className="w-full text-center">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                      Tell us more!
                    </h3>

                    <textarea
                      rows={5}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience"
                      className="w-full rounded-2xl border border-slate-300 p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none resize-none transition bg-slate-50/50"
                    />
                  </div>

                  {/* Bottom Navigation Bar */}
                  <div className="w-full pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 transition cursor-pointer"
                    >
                      <ArrowLeft className="size-4" /> Back
                    </button>

                    {/* Progress 4 Bars */}
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 w-7 sm:w-9 rounded-full bg-slate-900 transition-colors" />
                      <div className="h-1 w-7 sm:w-9 rounded-full bg-slate-900 transition-colors" />
                      <div className="h-1 w-7 sm:w-9 rounded-full bg-slate-900 transition-colors" />
                      <div className="h-1 w-7 sm:w-9 rounded-full bg-slate-200 transition-colors" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="rounded-lg bg-slate-900 px-6 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-black transition active:scale-95 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* ──────────────── STEP 4: ABOUT YOU ──────────────── */}
              {step === 4 && (
                <form
                  onSubmit={handleFinalSubmit}
                  className="flex-1 flex flex-col items-center justify-between w-full pt-4 animate-in fade-in duration-300"
                >
                  <div className="w-full">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center mb-4">
                      About you
                    </h3>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-1">
                            First name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 mb-1">
                            Last name
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-900 mb-1">
                          Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                        />
                      </div>

                      <p className="text-[10.5px] text-slate-400 text-center leading-relaxed px-1">
                        By submitting, I acknowledge the Terms of Service and Privacy Policy and that my review will be publicly posted and shared online
                      </p>
                    </div>
                  </div>

                  {/* Bottom Navigation Bar */}
                  <div className="w-full pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 transition cursor-pointer"
                    >
                      <ArrowLeft className="size-4" /> Back
                    </button>

                    {/* Progress 4 Bars */}
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 w-7 sm:w-9 rounded-full bg-slate-900 transition-colors" />
                      <div className="h-1 w-7 sm:w-9 rounded-full bg-slate-900 transition-colors" />
                      <div className="h-1 w-7 sm:w-9 rounded-full bg-slate-900 transition-colors" />
                      <div className="h-1 w-7 sm:w-9 rounded-full bg-slate-900 transition-colors" />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-slate-900 px-6 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-black transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? "Submitting..." : "Done"}
                    </button>
                  </div>
                </form>
              )}

              {/* ──────────────── STEP 5: SUCCESS CELEBRATION ──────────────── */}
              {step === 5 && (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95 duration-200">
                  <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                    <Check className="size-8 stroke-[3]" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    Thank you!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                    Your review has been submitted and posted successfully.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVIEWS GRID OR EMPTY STATE */}
        {filteredReviews.length === 0 ? (
          <div className="my-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <Star className="size-6 fill-amber-400 text-amber-400" />
            </div>
            <h4 className="text-base font-bold text-slate-900">No reviews yet</h4>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Be the first to share your experience with this product.
            </p>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setUserRating(0);
                setHoverRating(null);
                setIsWriteOpen(true);
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0a7ae6] transition active:scale-95 cursor-pointer"
            >
              Write the first review
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-4 gap-4 space-y-4">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="break-inside-avoid rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col mb-4"
              >
              {/* Optional Photo with +1 badge */}
              {rev.image && (
                <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={rev.image}
                    alt={`${rev.author} customer review`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  {rev.imageCount && (
                    <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                      <ImageIcon className="size-3" /> +{rev.imageCount}
                    </span>
                  )}
                </div>
              )}

              {/* Card Body */}
              <div className="p-4 sm:p-4.5 space-y-2">
                {/* Author with verified checkmark */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {rev.author}
                    </span>
                    {rev.verified && (
                      <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-black text-white" title="Verified Buyer">
                        <Check className="size-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                    {rev.date}
                  </span>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-0.5">
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

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                  {rev.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
);
}
