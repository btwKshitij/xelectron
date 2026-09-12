"use client";

import { orderedTopics, getCategoryOrder } from "@/lib/shared/category-order";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
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
      }, 1500);
    };

    api.on("pointerDown", onPointerDown);
    api.on("pointerUp", onPointerUp);

    return () => {
      api.off("pointerDown", onPointerDown);
      api.off("pointerUp", onPointerUp);
    };
  }, [api]);

  // Track slide index changes to reset timer
  useEffect(() => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };
    api.on("select", onSelect);
    api.on("reInit", () => {
      setScrollSnaps(api.scrollSnapList());
    });
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Auto-move carousel timer
  useEffect(() => {
    if (!api || isPaused || !isInView) return;

    const timer = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [api, isPaused, isInView, selectedIndex]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  if (!displayCategories || displayCategories.length === 0) return null;

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
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              slidesToScroll: 1,
              breakpoints: { "(min-width: 640px)": { active: false } },
            }}
            aria-label="Shop by category"
          >
            <CarouselContent className="-ml-3 py-2 sm:-ml-4 sm:flex-wrap">
              {displayCategories.map(category => (
                <CarouselItem key={category.id} className="basis-1/2 pl-3 sm:basis-1/4 sm:pl-4">
                  <Link href={`/shop?filter=${encodeURIComponent(category.slug)}`} prefetch={false} className="group flex h-[190px] flex-col items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 text-center transition-colors hover:border-[#0a7ae6] sm:h-[230px] sm:p-5">
                    <div className="relative h-[120px] w-full bg-white sm:h-[155px]">
                      <CategoryCardImage category={category} />
                    </div>
                    <h3 className="mt-2 text-xs font-semibold leading-snug text-slate-800 group-hover:text-[#0a7ae6] sm:text-sm">{category.title}</h3>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-3.5 flex w-full items-center justify-between px-1 sm:hidden">
              <button
                type="button"
                onClick={() => {
                  if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
                  setIsPaused(true);
                  api?.scrollPrev();
                  resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), 2000);
                }}
                aria-label="Previous categories"
                className="group flex size-9.5 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-sm transition-all hover:border-[#0a7ae6] hover:bg-slate-50 hover:text-[#0a7ae6] active:scale-90 active:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="size-4.5 stroke-[2.5] transition-transform group-hover:-translate-x-0.5" />
              </button>

              {/* SLIDE INDICATOR DOTS */}
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {(scrollSnaps.length > 0 ? scrollSnaps : displayCategories).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
                      setIsPaused(true);
                      api?.scrollTo(idx);
                      resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), 2000);
                    }}
                    aria-label={`Go to category ${idx + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                      selectedIndex === idx
                        ? "w-5 bg-[#0a7ae6]"
                        : "w-1.5 bg-slate-200 hover:bg-slate-300"
                    )}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
                  setIsPaused(true);
                  api?.scrollNext();
                  resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), 2000);
                }}
                aria-label="Next categories"
                className="group flex size-9.5 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-sm transition-all hover:border-[#0a7ae6] hover:bg-slate-50 hover:text-[#0a7ae6] active:scale-90 active:bg-slate-100 cursor-pointer"
              >
                <ChevronRight className="size-4.5 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}

