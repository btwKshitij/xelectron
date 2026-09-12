"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { BestSellerItem } from "@/components/home/best-sellers-data";
import { formatINR } from "@/lib/format-price";
import { Plus } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { toast } from "sonner";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function SpecificationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 gap-3 border-t border-slate-200/80 py-1.5 sm:py-2 xl:py-2.5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="text-[12px] sm:text-[13px] xl:text-[14px] font-medium text-slate-600 truncate">{label}</div>
      <div className="text-right text-[12px] sm:text-[13px] xl:text-[14px] font-semibold text-slate-900 truncate">{value}</div>
    </div>
  );
}

function MobileBestSellers({ items }: { items: BestSellerItem[] }) {
  const { addItem } = useCart();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // In phone view, one product per view
  const totalPages = items.length;

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    if (container.clientWidth === 0) return;
    const idx = Math.round(container.scrollLeft / (container.clientWidth + 12));
    setActivePageIndex(Math.min(Math.max(idx, 0), totalPages - 1));
  }, [totalPages]);

  const scrollToPage = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    container.scrollTo({
      left: index * (container.clientWidth + 12),
      behavior: "smooth",
    });
    setActivePageIndex(index);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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

  const handleTouchStart = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 1500);
  };

  // Auto-move best sellers timer
  useEffect(() => {
    if (totalPages <= 1 || isPaused || !isInView) return;

    const timer = setInterval(() => {
      setActivePageIndex((prev) => {
        const nextIndex = (prev + 1) % totalPages;
        if (scrollRef.current) {
          const container = scrollRef.current;
          container.scrollTo({
            left: nextIndex * (container.clientWidth + 12),
            behavior: "smooth",
          });
        }
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [totalPages, isPaused, isInView, activePageIndex]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section ref={sectionRef} className="block lg:hidden bg-white py-10 px-4 sm:px-6 text-slate-900 overflow-hidden">
      <div className="mx-auto max-w-md sm:max-w-xl">
        {/* SECTION HEADER */}
        <div className="mb-6 flex flex-col items-center text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0a7ae6]">
            Best Sellers
          </p>
          <div className="inline-block relative">
            <h2 className="mt-1.5 text-2xl font-normal tracking-tight text-slate-900 sm:text-3xl">
              Shop Best Sellers
            </h2>
            <div className="mt-2 h-0.5 w-12 rounded-full bg-[#0a7ae6] ml-auto" />
          </div>
        </div>

        {/* ONE PRODUCT PER VIEW SWIPABLE TRACK */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth"
        >
          {items.map((item) => {
            const cleanPrice = item.price.split(".")[0].replace(/[^\d]/g, "");
            const numPrice = parseInt(cleanPrice || "3000", 10);
            const cleanOldPrice = item.oldPrice ? item.oldPrice.split(".")[0].replace(/[^\d]/g, "") : "";
            const numOld = cleanOldPrice ? parseInt(cleanOldPrice, 10) : 0;
            const calculatedDiscount =
              item.discount ||
              (numOld > numPrice && numPrice > 0
                ? `${Math.round((1 - numPrice / numOld) * 100)}% off`
                : null);

            return (
              <Link
                key={`mobile-bestseller-${item.id}`}
                href={`/product/${item.slug || item.id}`}
                prefetch={false}
                className="mobile-best-seller-card group w-full shrink-0 snap-start flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0a7ae6] hover:shadow-md select-none"
              >
                {/* PRODUCT IMAGE CONTAINER */}
                <div className="relative w-full aspect-square rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-center p-2 mb-2 overflow-hidden">
                  {/* TOP LEFT: ONLY DISCOUNT (IF ANY) */}
                  {calculatedDiscount && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="rounded-full bg-[#0a7ae6] px-2.5 py-1 text-[11px] font-bold text-white shadow-xs tracking-wide">
                        {calculatedDiscount}
                      </span>
                    </div>
                  )}

                  {/* TOP RIGHT: ONLY ADD BUTTON */}
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      type="button"
                      aria-label={`Add ${item.name} to cart`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem({
                          id: item.id,
                          slug: item.slug || item.id,
                          name: item.name,
                          price: numPrice,
                          image: item.image,
                          category: "Electronics",
                        });
                        toast.success(`${item.name} added to cart!`);
                      }}
                      className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-[#0a7ae6] text-white shadow-xs hover:bg-[#086ac9] transition-transform active:scale-90 cursor-pointer"
                    >
                      <Plus className="size-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* CENTER PRODUCT IMAGE */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) calc(100vw - 32px), 576px"
                    />
                  </div>
                </div>

                {/* TEXT CONTENT */}
                <div className="flex flex-col items-center text-center px-0.5">
                  {/* PRODUCT TITLE */}
                  <h4 className="mt-1 text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#0a7ae6] line-clamp-1 leading-snug w-full transition-colors">
                    {item.name}
                  </h4>

                  {/* PRICING WITH DISCOUNT */}
                  <div className="mt-1.5 flex items-baseline justify-center gap-1.5 w-full">
                    {calculatedDiscount && (
                      <span className="text-[11px] font-semibold text-[#0a7ae6]">
                        {calculatedDiscount}
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {formatINR(item.price)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* MOBILE PAGINATION DASHES (THEME BLUE, MATCHING UPPER SECTION) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {Array.from({ length: totalPages }).map((_, index) => {
              const isActive = index === activePageIndex;
              return (
                <button
                  key={`bestseller-page-${index}`}
                  type="button"
                  aria-label={`Go to best seller page ${index + 1}`}
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



export default function BestSellersSection({ additionalItems = [] }: { additionalItems?: BestSellerItem[] }) {
  const items = useMemo(() => additionalItems, [additionalItems]);

  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const visualRefs = useRef<Array<HTMLDivElement | null>>([]);
  const glowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const titleRefs = useRef<Array<HTMLHeadingElement | null>>([]);

  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    if (items.length === 0 || reduceMotion) return;

    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!section || !viewport || !track) return;

    const ctx = gsap.context(() => {
      // Helper: calculate X translation to center title[index] inside container
      const getTitleX = (index: number) => {
        const title = titleRefs.current[index];
        if (!title || !track.parentElement) return 0;
        const titleCenter = title.offsetLeft + title.offsetWidth / 2;
        const containerCenter = track.parentElement.offsetWidth / 2;
        return containerCenter - titleCenter;
      };

      // Set initial states (Slide 0 visible, rest hidden)
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.set(card, {
          autoAlpha: i === 0 ? 1 : 0,
          y: i === 0 ? 0 : 35,
          scale: i === 0 ? 1 : 0.96,
        });
      });

      visualRefs.current.forEach((visual, i) => {
        if (!visual) return;
        gsap.set(visual, {
          autoAlpha: i === 0 ? 1 : 0,
          y: i === 0 ? 0 : 100,
          rotation: i === 0 ? 0 : -15,
          scale: i === 0 ? 1 : 0.90,
        });
      });

      titleRefs.current.forEach((title, i) => {
        if (!title) return;
        gsap.set(title, {
          opacity: i === 0 ? 1 : 0.35,
          color: i === 0 ? "#0f172a" : "#cbd5e1",
        });
      });

      glowRefs.current.forEach((glow, i) => {
        if (!glow) return;
        gsap.set(glow, { autoAlpha: i === 0 ? 1 : 0 });
      });

      // Position title rail initially
      gsap.set(track, { x: getTitleX(0) });

      const numSlides = items.length;
      const scrollDistance = (numSlides - 1) * window.innerHeight;

      // Master Timeline scrubbed by ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${scrollDistance}`,
          scrub: 0.8,
          pin: section,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      for (let i = 0; i < numSlides - 1; i++) {
        const tStart = i;

        const cardCur = cardRefs.current[i];
        const visualCur = visualRefs.current[i];
        const glowCur = glowRefs.current[i];
        const titleCur = titleRefs.current[i];

        if (cardCur) {
          tl.to(
            cardCur,
            { autoAlpha: 0, y: -35, scale: 0.96, ease: "power2.in", duration: 0.35 },
            tStart + 0.15
          );
        }
        if (visualCur) {
          tl.to(
            visualCur,
            { autoAlpha: 0, y: -100, rotation: 15, scale: 0.90, ease: "power3.in", duration: 0.4 },
            tStart + 0.15
          );
        }
        if (glowCur) {
          tl.to(glowCur, { autoAlpha: 0, ease: "power2.in", duration: 0.35 }, tStart + 0.15);
        }
        if (titleCur) {
          tl.to(
            titleCur,
            { opacity: 0.35, color: "#cbd5e1", ease: "power1.inOut", duration: 0.5 },
            tStart + 0.25
          );
        }

        tl.to(
          track,
          {
            x: () => getTitleX(i + 1),
            ease: "power2.inOut",
            duration: 0.6,
          },
          tStart + 0.2
        );

        const cardNext = cardRefs.current[i + 1];
        const visualNext = visualRefs.current[i + 1];
        const glowNext = glowRefs.current[i + 1];
        const titleNext = titleRefs.current[i + 1];

        if (cardNext) {
          tl.to(
            cardNext,
            { autoAlpha: 1, y: 0, scale: 1, ease: "power2.out", duration: 0.35 },
            tStart + 0.52
          );
        }
        if (visualNext) {
          tl.to(
            visualNext,
            { autoAlpha: 1, y: 0, rotation: 0, scale: 1, ease: "power3.out", duration: 0.55 },
            tStart + 0.52
          );
        }
        if (glowNext) {
          tl.to(glowNext, { autoAlpha: 1, ease: "power2.out", duration: 0.35 }, tStart + 0.52);
        }
        if (titleNext) {
          tl.to(
            titleNext,
            { opacity: 1, color: "#0f172a", ease: "power1.inOut", duration: 0.5 },
            tStart + 0.25
          );
        }
      }
    }, section);

    return () => ctx.revert();
  }, [items, reduceMotion]);

  const goToSlide = (targetIndex: number) => {
    const section = sectionRef.current;
    if (!section || items.length < 2) return;
    const numSlides = items.length;
    const scrollDistance = (numSlides - 1) * window.innerHeight;
    const targetProgress = targetIndex / (numSlides - 1);
    const targetScroll = section.offsetTop + targetProgress * scrollDistance;

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  const titleRailStyle = {
    WebkitMaskImage:
      "linear-gradient(90deg, transparent 0%, black 1%, black 99%, transparent 100%)",
    maskImage:
      "linear-gradient(90deg, transparent 0%, black 1%, black 99%, transparent 100%)",
  } as const;

  const titleClass =
    "shrink-0 whitespace-nowrap text-[clamp(1.05rem,1.7vw,1.9rem)] xl:text-[clamp(1.2rem,2.1vw,2.35rem)] font-bold leading-tight tracking-[-0.02em] will-change-transform cursor-pointer transition-opacity duration-300 hover:opacity-100 select-none py-1";

  if (items.length === 0) return null;

  return (
    <div className="relative w-full">
      <MobileBestSellers items={items} />
      <div className="hidden lg:block w-full">
        <section
          ref={sectionRef}
          className="relative min-h-screen h-screen bg-white text-slate-900 overflow-hidden"
        >


      <div
        ref={viewportRef}
        className="mx-auto flex h-full max-w-[1600px] flex-col justify-between px-4 pb-4 pt-16 sm:px-6 sm:pb-5 sm:pt-18 lg:px-8 lg:pb-6 lg:pt-20 xl:px-12 xl:pb-8 xl:pt-22"
      >
        {/* TOP HEADER BLOCK: Badge + Giant Title Rail */}
        <div className="relative z-20 shrink-0 flex flex-col items-center mb-2 sm:mb-3 lg:mb-4 xl:mb-5">
          <p className="text-center text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0a7ae6]">
            Best sellers
          </p>

          <div className="relative mt-1 sm:mt-1.5 w-full overflow-hidden py-0.5" style={titleRailStyle}>
            <div
              ref={trackRef}
              className="flex w-max items-center gap-10 sm:gap-12 lg:gap-14 xl:gap-16 py-0.5 will-change-transform"
            >
              {items.map((item, index) => (
                <h2
                  key={item.id}
                  ref={(node) => {
                    titleRefs.current[index] = node;
                  }}
                  onClick={() => goToSlide(index)}
                  className={titleClass}
                >
                  {item.name}
                </h2>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM PRODUCT SHOWCASE GRID */}
        <div className="relative z-10 grid w-full flex-1 min-h-0 items-center gap-6 sm:gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.25fr)] lg:gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] xl:gap-12">
          <div className="relative order-2 h-full min-h-0 lg:order-1 flex items-center">
            {items.map((item, index) => (
              <div
                key={item.id}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                className="absolute inset-0 flex items-center will-change-[transform,opacity]"
              >
                <div className="relative z-10 w-full max-w-[560px] xl:max-w-[620px] rounded-[20px] sm:rounded-[24px] xl:rounded-[28px] border border-slate-200/80 bg-white/95 backdrop-blur-md p-4 sm:p-5 lg:p-5 xl:p-7 shadow-[0_15px_50px_rgba(15,23,42,0.06)]">
                  <div className="border-b border-slate-200/80 pb-2.5 sm:pb-3 xl:pb-3.5">
                    <p className="text-[10px] sm:text-[11px] xl:text-[12px] font-bold uppercase tracking-[0.2em] text-[#0a7ae6]">
                      XElectron
                    </p>
                    <h3 className="mt-0.5 sm:mt-1 text-[18px] sm:text-[20px] lg:text-[22px] xl:text-[26px] font-bold tracking-tight text-slate-900">
                      {item.name}
                    </h3>
                    <div className="mt-1 sm:mt-1.5 flex flex-wrap items-end gap-x-2.5 gap-y-1">
                      <span className="text-[20px] sm:text-[22px] lg:text-[24px] xl:text-[28px] font-semibold text-slate-900">
                        {formatINR(item.price)}
                      </span>
                      {item.oldPrice && (
                        <span className="text-[12px] sm:text-[13px] xl:text-[15px] text-slate-400 line-through">
                          {formatINR(item.oldPrice)}
                        </span>
                      )}
                      {item.discount && (
                        <span className="text-[12px] sm:text-[13px] xl:text-[15px] font-semibold text-[#0a7ae6]">
                          {item.discount}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 sm:mt-2.5 xl:mt-3.5 max-w-[34rem] text-[12px] sm:text-[13px] xl:text-[14px] leading-relaxed text-slate-600 line-clamp-2 xl:line-clamp-3">
                    {item.description}
                  </p>

                  <div className="mt-2 sm:mt-3 xl:mt-4">
                    {item.specs.map((spec) => (
                      <SpecificationRow key={spec.label} label={spec.label} value={spec.value} />
                    ))}
                  </div>

                  <Link
                    href={`/product/${item.slug || item.id}`}
                    prefetch={false}
                    className="mt-3 sm:mt-4 xl:mt-5 inline-flex h-9 sm:h-10 lg:h-11 xl:h-12 w-full items-center justify-center rounded-full bg-[#0a7ae6] px-5 text-[12px] sm:text-[13px] xl:text-[14px] font-medium text-white transition-all hover:bg-[#086ac9] shadow-md shadow-blue-500/15 active:scale-[0.99]"
                  >
                    View Details & Buy
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="relative order-1 flex items-center justify-center lg:order-2 lg:justify-end h-full min-h-0">
            <div className="relative h-full max-h-[420px] sm:max-h-[480px] lg:max-h-[560px] xl:max-h-[660px] w-full max-w-[850px] xl:max-w-[980px] flex items-center justify-center">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  ref={(node) => {
                    visualRefs.current[index] = node;
                  }}
                  className="absolute inset-0 flex items-center justify-center will-change-[transform,opacity]"
                >
                  <div
                    ref={(node) => {
                      glowRefs.current[index] = node;
                    }}
                    className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(10,122,230,0.22)_0%,_rgba(10,122,230,0.09)_35%,_rgba(10,122,230,0)_70%)] blur-3xl pointer-events-none will-change-[opacity]"
                  />
                  <div className="relative w-full h-full p-1 lg:p-2 flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      className="object-contain filter drop-shadow-[0_20px_45px_rgba(15,23,42,0.16)] scale-105 sm:scale-110 lg:scale-115 xl:scale-125"
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      priority={index === 0}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</div>
  );
}

