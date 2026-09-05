"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { banners as defaultBanners } from "@/components/home/content";
import { ChevronRight } from "lucide-react";
import { isYouTubeUrl, getYouTubeEmbedUrl } from "@/lib/banner-media";

type BannerType = {
  src: string;
  mobileSrc?: string | null;
  alt: string;
  title: string;
  category?: string | null;
  caption?: string | null;
  cta?: string | null;
  linkUrl?: string | null;
};

const SLIDE_DURATION = 6500;

function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".m4v") ||
    clean.endsWith(".mkv") ||
    clean.startsWith("data:video") ||
    clean.startsWith("blob:") ||
    clean.includes("video") ||
    clean.includes(".mp4") ||
    clean.includes(".webm") ||
    clean.includes(".mov")
  );
}

function HeroVideo({
  src,
  isActive,
}: {
  src: string;
  isActive: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Mobile browsers strictly require muted and defaultMuted to be true in DOM
    video.defaultMuted = true;
    video.muted = true;

    if (isActive) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    } else {
      video.pause();
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      className={`h-full w-full object-cover object-center transform-gpu ${
        isActive ? "animate-hero-zoom" : "scale-100"
      }`}
    />
  );
}


export default function HeroShowcase({ initialBanners }: { initialBanners?: BannerType[] }) {
  const [bannerList, setBannerList] = useState<BannerType[]>(
    initialBanners && initialBanners.length > 0 ? initialBanners : defaultBanners
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mouse follow cursor with buttery-smooth RAF trailing interpolation
  const viewportRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const [renderPos, setRenderPos] = useState<{ x: number; y: number } | null>(null);
  const [isInRightHalf, setIsInRightHalf] = useState(false);
  const rafId = useRef<number | null>(null);

  // Swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 45;

  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) {
      setBannerList(initialBanners);
    }
  }, [initialBanners]);

  useEffect(() => {
    async function syncBanners() {
      try {
        const res = await fetch("/api/banners", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBannerList(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch active banners:", err);
      }
    }
    syncBanners();
  }, []);

  const activeBanners = bannerList.length > 0 ? bannerList : defaultBanners;
  const totalBanners = activeBanners.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalBanners);
  }, [totalBanners]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalBanners) % totalBanners);
  }, [totalBanners]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Smooth RAF loop for fluid, non-jittery arrow glide
  useEffect(() => {
    const animate = () => {
      if (isInRightHalf) {
        currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.1;
        currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.1;
        setRenderPos({
          x: Math.round(currentPos.current.x * 100) / 100,
          y: Math.round(currentPos.current.y * 100) / 100,
        });
      }
      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isInRightHalf]);

  // Autoplay timer: keeps changing even on hover, resets on slide change
  useEffect(() => {
    if (totalBanners <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalBanners);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [currentIndex, totalBanners]);


  // Mouse move handler for right-half follow arrow
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= rect.width * 0.45) {
      if (!isInRightHalf) {
        currentPos.current = { x, y };
        setRenderPos({ x, y });
        setIsInRightHalf(true);
      }
      targetPos.current = { x, y };
    } else {
      setIsInRightHalf(false);
    }
  };

  const handleMouseLeave = () => {
    setIsInRightHalf(false);
  };


  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  return (
    <section className="group relative w-full bg-white overflow-hidden select-none">
      {/* BANNER VIEWPORT */}
      <div
        ref={viewportRef}
        className="relative w-full aspect-[9/16] sm:aspect-[1672/941] overflow-hidden bg-white touch-pan-y"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* SLIDE LAYERS */}
        {activeBanners.map((banner, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={`banner-slide-${index}`}
              className={`absolute inset-0 transition-opacity duration-300 ease-out ${
                isActive
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Link
                href={banner.linkUrl || "/shop"}
                className="block relative h-full w-full overflow-hidden"
              >
                {/* DESKTOP BANNER MEDIA */}
                <div className="hidden sm:block relative h-full w-full overflow-hidden">
                  {isYouTubeUrl(banner.src) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(banner.src, isActive, true, true)}
                      title={banner.title}
                      className="h-full w-full border-0 pointer-events-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : isVideoUrl(banner.src) ? (
                    <HeroVideo src={banner.src} isActive={isActive} />
                  ) : (
                    <div
                      key={`img-desktop-${index}`}
                      className={`relative h-full w-full transform-gpu ${
                        isActive ? "animate-hero-zoom" : "scale-100"
                      }`}
                    >
                      <Image
                        src={banner.src}
                        alt={banner.alt || banner.title}
                        fill
                        priority
                        className="object-cover object-center pointer-events-none"
                        sizes="100vw"
                      />
                    </div>
                  )}
                </div>

                {/* MOBILE BANNER MEDIA */}
                <div className="sm:hidden relative h-full w-full overflow-hidden">
                  {isYouTubeUrl(banner.mobileSrc || banner.src) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(banner.mobileSrc || banner.src, isActive, true, true)}
                      title={banner.title}
                      className="h-full w-full border-0 pointer-events-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : isVideoUrl(banner.mobileSrc || banner.src) ? (
                    <HeroVideo src={banner.mobileSrc || banner.src} isActive={isActive} />
                  ) : (
                    <div
                      key={`img-mobile-${index}`}
                      className={`relative h-full w-full transform-gpu ${
                        isActive ? "animate-hero-zoom" : "scale-100"
                      }`}
                    >
                      <Image
                        src={banner.mobileSrc || banner.src}
                        alt={banner.alt || banner.title}
                        fill
                        priority
                        className="object-cover object-center pointer-events-none"
                        sizes="100vw"
                      />
                    </div>
                  )}
                </div>
              </Link>
            </div>
          );
        })}

        {/* RIGHT HALF INTERACTIVE CLICK ZONE (ADVANCES TO NEXT SLIDE) */}
        <div
          className="absolute right-0 top-0 w-1/2 h-full z-20 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next slide"
        />

        {/* MOUSE-FOLLOWING BLUE CIRCULAR ARROW (FLOWS SMOOTHLY IN RIGHT HALF OF BANNER) */}
        {renderPos && (
          <div
            className={`pointer-events-none hidden sm:flex absolute z-30 items-center justify-center -translate-x-1/2 -translate-y-1/2 ${
              isInRightHalf ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
            style={{
              left: `${renderPos.x}px`,
              top: `${renderPos.y}px`,
              transition: "opacity 300ms ease-out, scale 300ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="w-12 h-12 rounded-full bg-[#0a7ae6] text-white flex items-center justify-center shadow-[0_4px_22px_rgba(10,122,230,0.65)] scale-105">
              <ChevronRight className="w-6 h-6 stroke-[3] text-white ml-0.5" />
            </div>
          </div>
        )}

        {/* VERTICAL INDICATOR PILLS / DASHES (RIGHT CENTER, INCREASED SIZE, WHITE & BLUE THEME) */}
        {totalBanners > 1 && (
          <div className="absolute right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 pointer-events-auto">
            {activeBanners.map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={`indicator-${index}`}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToSlide(index);
                  }}
                  className={`transition-all duration-300 cursor-pointer rounded-full ${
                    isActive
                      ? "w-1 sm:w-1.5 h-6 sm:h-7 bg-[#0a7ae6] shadow-[0_0_10px_rgba(10,122,230,0.85)]"
                      : "w-1 sm:w-1.5 h-3 sm:h-3.5 bg-white/90 hover:bg-white hover:h-4.5 shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
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



