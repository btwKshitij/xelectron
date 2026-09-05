"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";

export type BrandShowcaseItem = {
  id: string | number;
  title: string;
  subtitle: string;
  image: string;
  linkUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export const defaultBrandShowcaseItems: BrandShowcaseItem[] = [
  {
    id: "1",
    title: "Smart Home Cinema",
    subtitle: "Up to 300-inch 4K projection for movie nights",
    image: "/banner-projector.png",
    linkUrl: "/shop?filter=projectors",
  },
  {
    id: "2",
    title: "Ultra HD Smart TVs",
    subtitle: "Vivid color clarity and cinematic surround sound",
    image: "/hero-banner-tv.png",
    linkUrl: "/shop?filter=tv",
  },
  {
    id: "3",
    title: "Portable Projection",
    subtitle: "Rotatable angle, auto keystone & built-in apps",
    image: "/hero-banner-techno-projector.png",
    linkUrl: "/shop?filter=projectors",
  },
  {
    id: "4",
    title: "Android C9 Plus Cinema",
    subtitle: "True 1080p FHD with high lumen optical brilliance",
    image: "/hero-banner-projector-c9.png",
    linkUrl: "/shop?filter=projectors",
  },
];

export default function BrandSetupSection({
  items: propItems,
}: {
  items?: BrandShowcaseItem[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState(0);

  const displayItems =
    propItems && propItems.length > 0 ? propItems : defaultBrandShowcaseItems;

  return (
    <section className="overflow-hidden bg-white pt-12 sm:pt-16 lg:pt-20 pb-4 sm:pb-6 text-slate-900">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-10">
          <h2 className="mt-2 text-[2rem] font-normal leading-[0.96] tracking-tight md:text-[clamp(2.5rem,4vw,3.5rem)] text-slate-900">
            Fastest growing Consumer Electronics Brand in India
          </h2>
        </div>

        {/* MOBILE VIEW (SWIPER) */}
        <div className="md:hidden">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Swipe to explore
          </p>
          <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pr-2">
            {displayItems.map((item, index) => {
              const cardContent = (
                <article className="relative min-w-[76vw] snap-start overflow-hidden rounded-[10px] bg-slate-950">
                  <div className="relative h-[370px] w-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="78vw"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                        XElectron
                      </p>
                      <h3 className="mt-2 text-[1.4rem] font-bold leading-[1.1] text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-[0.9rem] leading-5 text-white/70">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </article>
              );

              return item.linkUrl ? (
                <Link prefetch={false} key={item.id} href={item.linkUrl} className="block shrink-0">
                  {cardContent}
                </Link>
              ) : (
                <div key={item.id} className="block shrink-0">
                  {cardContent}
                </div>
              );
            })}
          </div>
        </div>

        {/* DESKTOP ACCORDION VIEW */}
        <div className="hidden h-[320px] w-full gap-[0.5px] transition-all duration-500 md:flex md:h-[400px] lg:h-[460px] lg:gap-2">
          {displayItems.map((item, index) => {
            const isActive = hoveredIndex === index;
            const cardElement = (
              <div
                onMouseEnter={() => setHoveredIndex(index)}
                className={`group relative h-full cursor-pointer overflow-hidden rounded-[10px] transition-all duration-500 ease-in-out ${
                  isActive ? "flex-[12] lg:flex-[16]" : "flex-[1]"
                }`}
              >
                <div
                  className={`absolute inset-0 z-10 bg-slate-900/10 transition-opacity duration-500 ease-in-out group-hover:bg-transparent ${
                    isActive ? "opacity-0" : "opacity-100"
                  }`}
                />

                <div
                  className={`absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ease-in-out ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />

                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  unoptimized
                  className={`object-cover transition-transform duration-700 ease-in-out ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                  sizes="(max-width: 767px) 100vw, 50vw"
                />

                <div
                  className={`absolute bottom-6 right-6 z-30 flex flex-col justify-end text-right transition-all duration-500 ease-in-out md:bottom-10 md:right-10 ${
                    isActive ? "translate-y-0 opacity-100 delay-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  <h3 className="mb-2 whitespace-nowrap text-2xl font-bold text-white drop-shadow-md md:text-3xl lg:text-4xl">
                    {item.title}
                  </h3>
                  <p className="whitespace-nowrap text-sm font-medium text-white/90 drop-shadow md:text-base">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );

            return item.linkUrl ? (
              <Link prefetch={false}
                key={item.id}
                href={item.linkUrl}
                className={`h-full transition-all duration-500 ease-in-out ${
                  isActive ? "flex-[12] lg:flex-[16]" : "flex-[1]"
                }`}
              >
                {cardElement}
              </Link>
            ) : (
              <div
                key={item.id}
                className={`h-full transition-all duration-500 ease-in-out ${
                  isActive ? "flex-[12] lg:flex-[16]" : "flex-[1]"
                }`}
              >
                {cardElement}
              </div>
            );
          })}
        </div>

        {/* STATEMENT SCROLL REVEAL (LEFT-ALIGNED, SINGLE LINE 2013) */}
        <div className="mt-8 w-full sm:mt-12 md:mt-16 flex flex-col items-start text-left">
          <ScrollReveal
            baseOpacity={0.25}
            wordAnimationEnd="bottom 45%"
            containerClassName="w-full max-w-none text-left flex flex-col items-start"
            textClassName="w-full text-left text-[clamp(2rem,4.3vw,3.8rem)] leading-[1.1] font-semibold tracking-tight"
          >
            <span className="block text-left whitespace-normal sm:whitespace-nowrap">
              Trusted by <span className="text-[#0a7ae6]">1 Crore+</span> Indians since 2013.
            </span>
            <span className="block text-left">Built for India.</span>
            <span className="block text-left">
              Tested for Indian conditions.
            </span>
            <span className="block text-left">
              Serviced across <span className="text-[#0a7ae6]">200+ Cities.</span>
            </span>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
