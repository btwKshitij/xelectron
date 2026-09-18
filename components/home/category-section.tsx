"use client";

import { orderedTopics, getCategoryOrder } from "@/lib/shared/category-order";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { categories as defaultCategories } from "@/components/home/content";
import { resolveCategoryImage, getCategoryFallbackImage } from "@/lib/shared/category-utils";

export type StorefrontCategory = {
  id: string;
  title: string;
  slug: string;
  image: string;
  sortOrder?: number;
};

function CategoryCardImage({ category }: { category: StorefrontCategory }) {
  const fallback = getCategoryFallbackImage(category.slug, category.title);
  const resolved = resolveCategoryImage(category.image, category.slug, category.title);
  const [imgSrc, setImgSrc] = useState(resolved);

  useEffect(() => {
    setImgSrc(resolved);
  }, [resolved]);

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
      className="object-contain"
      sizes="200px"
    />
  );
}

export default function CategorySection({ categories }: { categories?: StorefrontCategory[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sourceCategories =
    categories && categories.length > 0
      ? categories
      : defaultCategories.map((cat) => ({
          id: cat.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          title: cat.title,
          slug: cat.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          image: resolveCategoryImage(cat.src, cat.title, cat.title),
        }));

  const displayCategories = sourceCategories.map(category => {
    const index = getCategoryOrder(category);
    return { ...category, title: category.title, order: index };
  }).sort((a, b) => a.order - b.order);

  const categoryCount = displayCategories.length;

  // For smooth infinite looping in Embla, ensure there are at least 10 slides in the loop buffer
  const loopedCategories = (() => {
    if (displayCategories.length <= 1) return displayCategories;
    let items = [...displayCategories];
    while (items.length < 10) {
      items = [...items, ...displayCategories];
    }
    return items;
  })();

  // Auto-pause when not in viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-pause when browser tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Pause on touch / drag interaction
  useEffect(() => {
    if (!api) return;

    const onPointerDown = () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      setIsPaused(true);
    };

    const onPointerUp = () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = setTimeout(() => {
        setIsPaused(false);
      }, 2000);
    };

    try {
      api.on("pointerDown", onPointerDown);
      api.on("pointerUp", onPointerUp);
    } catch {}

    return () => {
      try {
        api.off("pointerDown", onPointerDown);
        api.off("pointerUp", onPointerUp);
      } catch {}
    };
  }, [api]);

  // Track slide index changes
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      try {
        if (typeof api.selectedScrollSnap === "function") {
          setSelectedIndex(api.selectedScrollSnap() ?? 0);
        }
      } catch {}
    };

    try {
      api.on("select", onSelect);
      api.on("reInit", onSelect);
    } catch {}

    return () => {
      try {
        api.off("select", onSelect);
      } catch {}
    };
  }, [api]);

  // Auto-move carousel timer (runs on all screens including desktop)
  useEffect(() => {
    if (!api || isPaused || !isInView || displayCategories.length <= 1) return;

    const timer = setInterval(() => {
      try {
        if (typeof api.canScrollNext === "function" && api.canScrollNext()) {
          api.scrollNext();
        } else if (typeof api.canScrollPrev === "function" && api.canScrollPrev()) {
          api.scrollTo(0);
        }
      } catch {}
    }, 3200);

    return () => clearInterval(timer);
  }, [api, isPaused, isInView, selectedIndex, displayCategories.length]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  if (!displayCategories || displayCategories.length === 0) return null;

  // On desktop, display 4 cards per row so there is always off-screen content to slide smoothly
  const itemBasisClass =
    categoryCount <= 3
      ? "basis-1/2 sm:basis-1/3 lg:basis-1/3"
      : "basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/4";

  const activeDotIndex =
    displayCategories.length > 0
      ? ((selectedIndex % displayCategories.length) + displayCategories.length) % displayCategories.length
      : 0;

  return (
    <section ref={sectionRef} className="bg-white px-4 pt-8 pb-5 sm:px-6 sm:py-14 lg:px-8">
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

        <div
          className="relative group/section"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: displayCategories.length > 1,
              watchDrag: true,
            }}
            className="w-full px-0 md:px-14"
            aria-label="Shop by category"
          >
            <CarouselContent className="-ml-3 py-2 sm:-ml-4">
              {loopedCategories.map((category, idx) => (
                <CarouselItem
                  key={`${category.id}-${idx}`}
                  className={cn("pl-3 sm:pl-4", itemBasisClass)}
                >
                  <Link
                    href={`/shop?filter=${encodeURIComponent(category.slug)}`}
                    prefetch={false}
                    className="group/card flex h-[190px] flex-col items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 text-center transition-all duration-200 hover:border-[#0a7ae6] hover:shadow-sm sm:h-[230px] sm:p-5"
                  >
                    <div className="relative h-[120px] w-full bg-white sm:h-[155px]">
                      <CategoryCardImage category={category} />
                    </div>
                    <h3 className="mt-2 text-xs font-semibold leading-snug text-slate-800 group-hover/card:text-[#0a7ae6] sm:text-sm">
                      {category.title}
                    </h3>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Desktop Prev / Next Navigation Arrows (Always visible on desktop, end-to-end) */}
            {displayCategories.length > 1 && (
              <>
                <CarouselPrevious className="hidden md:inline-flex left-0 h-10 w-10 border-slate-200 bg-white shadow-md hover:bg-slate-50 hover:border-[#0a7ae6] text-slate-700 hover:text-[#0a7ae6] transition-all z-10 cursor-pointer" />
                <CarouselNext className="hidden md:inline-flex right-0 h-10 w-10 border-slate-200 bg-white shadow-md hover:bg-slate-50 hover:border-[#0a7ae6] text-slate-700 hover:text-[#0a7ae6] transition-all z-10 cursor-pointer" />
              </>
            )}

            {/* SLIDE INDICATOR DOTS (Mobile only, hidden on desktop) */}
            {displayCategories.length > 1 && (
              <div className="mt-4 flex w-full items-center justify-center md:hidden" aria-hidden="true">
                <div className="flex items-center gap-1.5">
                  {displayCategories.map((category, idx) => (
                    <button
                      key={category.id || idx}
                      type="button"
                      onClick={() => {
                        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
                        setIsPaused(true);
                        if (api) {
                          const currentSnap = api.selectedScrollSnap?.() ?? 0;
                          let diff = (idx - (currentSnap % displayCategories.length)) % displayCategories.length;
                          if (diff > displayCategories.length / 2) diff -= displayCategories.length;
                          if (diff < -displayCategories.length / 2) diff += displayCategories.length;
                          api.scrollTo(currentSnap + diff);
                        }
                        resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), 2500);
                      }}
                      aria-label={`Go to ${category.title}`}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                        activeDotIndex === idx
                          ? "w-5 bg-[#0a7ae6]"
                          : "w-1.5 bg-slate-200 hover:bg-slate-300"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </Carousel>
        </div>
      </div>
    </section>
  );
}

