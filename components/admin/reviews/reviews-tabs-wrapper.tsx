"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Star, MessageSquare, ExternalLink } from "lucide-react";
import { VerifiedReviewsManager } from "@/components/admin/reviews/verified-reviews-manager";
import { ReviewsManager, type AdminReviewItem } from "@/components/admin/reviews/reviews-manager";
import type { VerifiedReviewItem } from "@/lib/server/controllers/verified-reviews.controller";

interface ReviewsTabsWrapperProps {
  initialTab?: string;
  verifiedReviews: VerifiedReviewItem[];
  productReviews: AdminReviewItem[];
  products: { id: string; name: string; slug: string; mainImage?: string }[];
}

export function ReviewsTabsWrapper({
  initialTab,
  verifiedReviews,
  productReviews,
  products,
}: ReviewsTabsWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTabParam = searchParams.get("tab") || initialTab || "homepage";

  const [activeTab, setActiveTab] = useState<"homepage" | "products">(
    currentTabParam === "products" ? "products" : "homepage"
  );

  const handleTabChange = (tab: "homepage" | "products") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/dashboard/reviews?${params.toString()}`, { scroll: false });
  };

  const activeHomepageCount = verifiedReviews.filter((r) => r.isActive).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* TOP NAVIGATION BREADCRUMB & STORE PREVIEW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
          <Link prefetch={false} href="/dashboard" className="hover:text-slate-900 transition">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Reviews Management</span>
        </div>

        <Link prefetch={false}
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0a7ae6] hover:underline"
        >
          <span>View Homepage Showcase</span>
          <ExternalLink className="size-3" />
        </Link>
      </div>

      {/* SEGMENTED TAB SWITCHER */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => handleTabChange("homepage")}
          className={`inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
            activeTab === "homepage"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
          }`}
        >
          <Star className={`size-4 ${activeTab === "homepage" ? "text-amber-400 fill-amber-400" : "text-slate-500"}`} />
          <span>Homepage Verified Reviews</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              activeTab === "homepage"
                ? "bg-white/20 text-white"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {activeHomepageCount} Active
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("products")}
          className={`inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
            activeTab === "products"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
          }`}
        >
          <MessageSquare className={`size-4 ${activeTab === "products" ? "text-blue-400" : "text-slate-500"}`} />
          <span>Product Catalog Reviews</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              activeTab === "products"
                ? "bg-white/20 text-white"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {productReviews.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT */}
      <div>
        {activeTab === "homepage" ? (
          <VerifiedReviewsManager
            initialReviews={verifiedReviews}
            products={products}
          />
        ) : (
          <ReviewsManager
            initialReviews={productReviews}
            products={products}
          />
        )}
      </div>
    </div>
  );
}
