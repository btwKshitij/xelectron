"use client";

import { orderedTopics, getCategoryOrder } from "@/lib/shared/category-order";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
    return { ...category, title: orderedTopics[index]?.title ?? category.title, order: index };
  }).sort((a, b) => a.order - b.order);

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

        <Carousel opts={{ align: "start", slidesToScroll: 1, breakpoints: { "(min-width: 640px)": { active: false } } }} aria-label="Shop by category">
          <CarouselContent className="-ml-3 py-2 sm:-ml-4 sm:flex-wrap">
            {displayCategories.map(category => (
              <CarouselItem key={category.id} className="basis-1/2 pl-3 sm:basis-1/4 sm:pl-4">
                <Link href={`/shop?filter=${encodeURIComponent(category.slug)}`} prefetch={false} className="group flex h-[190px] flex-col items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 text-center transition-colors hover:border-[#0a7ae6] sm:h-[230px] sm:p-5">
                  <div className="relative h-[120px] w-full sm:h-[155px]">
                    <CategoryCardImage category={category} />
                  </div>
                  <h3 className="mt-2 text-xs font-semibold leading-snug text-slate-800 group-hover:text-[#0a7ae6] sm:text-sm">{category.title}</h3>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-4 flex items-center justify-center gap-3 sm:hidden">
            <CarouselPrevious className="static size-11 translate-y-0" />
            <span className="text-xs text-slate-500">Explore categories</span>
            <CarouselNext className="static size-11 translate-y-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}

