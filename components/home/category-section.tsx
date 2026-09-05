"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { categories as defaultCategories } from "@/components/home/content";
import { resolveCategoryImage, getCategoryFallbackImage } from "@/lib/shared/category-utils";

export type StorefrontCategory = {
  id: string;
  title: string;
  slug: string;
  image: string;
};

function CategoryCardImage({ category }: { category: StorefrontCategory }) {
  const fallback = getCategoryFallbackImage(category.slug, category.title);
  const resolved = resolveCategoryImage(category.image, category.slug, category.title);
  const [imgSrc, setImgSrc] = useState(resolved);

  return (
    <Image
      src={imgSrc}
      alt={category.title}
      fill
      unoptimized
      onError={() => {
        if (imgSrc !== fallback) {
          setImgSrc(fallback);
        }
      }}
      className="mix-blend-multiply object-contain filter drop-shadow-[0_4px_10px_rgba(15,23,42,0.08)]"
      sizes="200px"
    />
  );
}

export default function CategorySection({ categories }: { categories?: StorefrontCategory[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);

  const displayCategories =
    categories && categories.length > 0
      ? categories
      : defaultCategories.map((cat) => ({
          id: cat.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          title: cat.title,
          slug: cat.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          image: resolveCategoryImage(cat.src, cat.title, cat.title),
        }));

  // In phone view, exactly 2 cards per view
  const totalPages = Math.ceil(displayCategories.length / 2);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth === 0) return;
    const page = Math.round(scrollLeft / clientWidth);
    setActivePage(Math.min(Math.max(page, 0), totalPages - 1));
  }, [totalPages]);

  const scrollToPage = (pageIndex: number) => {
    if (!scrollRef.current) return;
    const targetLeft = pageIndex * scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });
    setActivePage(pageIndex);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (!displayCategories || displayCategories.length === 0) return null;

  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* SECTION HEADER */}
        <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0a7ae6]">
            Categories
          </p>
          <div className="inline-block relative">
            <h2 className="mt-1.5 text-2xl font-normal tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Shop by Category
            </h2>
            <div className="mt-2 h-0.5 w-12 rounded-full bg-[#0a7ae6] ml-auto" />
          </div>
        </div>

        {/* CATEGORIES STRIP (EXACTLY 2 CARDS PER VIEW ON MOBILE, FULL ROW ON DESKTOP) */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex w-full items-center justify-start gap-3 sm:gap-4 overflow-x-auto pt-2 pb-4 snap-x snap-mandatory lg:justify-between"
        >
          {displayCategories.map((category) => {
            return (
              <Link
                key={category.id}
                href={`/shop?filter=${encodeURIComponent(category.slug)}`}
                className="group flex w-[calc(50%-6px)] shrink-0 snap-start sm:w-auto sm:min-w-[150px] lg:min-w-0 lg:flex-1 flex-col items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-3.5 h-[165px] sm:h-[185px] lg:h-[205px] text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#0a7ae6] hover:shadow-md"
              >
                {/* CLEAN PRODUCT HERO IMAGE */}
                <div className="relative h-[110px] sm:h-[125px] lg:h-[140px] w-full flex items-center justify-center p-1">
                  <div className="relative h-full w-full transition-transform duration-300 ease-out group-hover:scale-105">
                    <CategoryCardImage category={category} />
                  </div>
                </div>

                {/* CATEGORY TITLE */}
                <h3 className="mt-1 text-xs sm:text-sm font-semibold text-slate-800 transition-colors duration-200 group-hover:text-[#0a7ae6] line-clamp-1 leading-tight w-full px-1">
                  {category.title}
                </h3>
              </Link>
            );
          })}
        </div>

        {/* MOBILE PAGINATION DASHES (MATCHING BANNER SECTION DESIGN) */}
        {totalPages > 1 && (
          <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3">
            {Array.from({ length: totalPages }).map((_, index) => {
              const isActive = index === activePage;
              return (
                <button
                  key={`cat-page-${index}`}
                  type="button"
                  aria-label={`Go to category page ${index + 1}`}
                  onClick={() => scrollToPage(index)}
                  className={`transition-all duration-300 cursor-pointer rounded-full ${
                    isActive
                      ? "w-6 h-1 bg-[#0a7ae6] shadow-[0_0_8px_rgba(10,122,230,0.7)]"
                      : "w-2.5 h-1 bg-slate-300 hover:bg-slate-400 hover:w-3.5"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

