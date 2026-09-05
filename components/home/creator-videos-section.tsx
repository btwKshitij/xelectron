"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  ShoppingBag,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { toast } from "sonner";

type CreatorVideoType = {
  id: string;
  title?: string | null;
  thumbnailUrl: string;
  videoUrl?: string | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    mainImage: string;
    price?: string;
    oldPrice?: string | null;
    discount?: string | null;
    rating?: number;
    reviewsCount?: string;
    description?: string;
  } | null;
};

function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=)|img\.youtube\.com\/vi\/)([\w-]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

function extractYouTubeThumbnail(url: string): string {
  if (!url) return url;
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return url.trim();
}

export default function CreatorVideosSection() {
  const router = useRouter();
  const { addItem } = useCart();
  const [videoList, setVideoList] = useState<CreatorVideoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/creator-videos");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setVideoList(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch creator videos:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVideos();
  }, []);

  if (!isLoading && videoList.length === 0) {
    return null;
  }

  const videos = videoList;

  const toggleFlip = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavigateToProduct = (url: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    router.push(url);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector(".group");
    const cardWidth = card ? card.getBoundingClientRect().width : 320;
    const gap = typeof window !== "undefined" && window.innerWidth >= 640 ? 24 : 14;
    const scrollAmount = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap);
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section className="bg-white pt-2 sm:pt-4 pb-12 md:pb-16 text-slate-900 overflow-hidden">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        {/* HEADER WITH TITLE AND SCROLL CONTROLS */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950">
              Approved by Creators
            </h2>
          </div>

          {/* DESKTOP-ONLY CAROUSEL ARROWS */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous videos"
              className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-[#0a7ae6] hover:text-[#0a7ae6] active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next videos"
              className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-[#0a7ae6] hover:text-[#0a7ae6] active:scale-95 cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* HORIZONTALLY SCROLLABLE CAROUSEL TRACK */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-3.5 sm:gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth px-1 sm:px-0"
        >
          {videos.map((vid) => {
            const ytId = extractYouTubeId(vid.videoUrl || vid.thumbnailUrl);
            const isFlipped = !!flippedCards[vid.id];
            const targetUrl = vid.product ? `/product/${vid.product.slug}` : "/shop";

            return (
              <div
                key={vid.id}
                className="group relative [perspective:1000px] aspect-[9/16] w-[86vw] xs:w-[82vw] max-w-[360px] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] shrink-0 snap-center sm:snap-start select-none cursor-pointer"
                onClick={(e) => toggleFlip(vid.id, e)}
              >
                {/* 3D FLIPPABLE INNER CONTAINER */}
                <div
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: "transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                  className="relative w-full h-full rounded-[22px] sm:rounded-2xl"
                >
                  {/* ───────────────── FRONT SIDE: AUTOPLAY VIDEO ───────────────── */}
                  <div
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(0deg)",
                    }}
                    className={`absolute inset-0 w-full h-full rounded-[22px] sm:rounded-2xl overflow-hidden bg-slate-950 border border-black/10 shadow-xs transition-opacity duration-300 ${
                      isFlipped ? "pointer-events-none opacity-0 z-0" : "pointer-events-auto opacity-100 z-10"
                    }`}
                  >
                    {/* VIDEO AUTOPLAY LAYER */}
                    {ytId ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black overflow-hidden pointer-events-none select-none">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1&disablekb=1&fs=0&playsinline=1&iv_load_policy=3&enablejsapi=1`}
                          title={vid.title || "Creator video"}
                          allow="autoplay; encrypted-media; picture-in-picture"
                          tabIndex={-1}
                          className="pointer-events-none absolute inset-0 w-full h-full object-cover border-0 select-none scale-[1.03]"
                        />
                      </div>
                    ) : vid.videoUrl ? (
                      <video
                        src={vid.videoUrl}
                        poster={extractYouTubeThumbnail(vid.thumbnailUrl)}
                        preload="metadata"
                        autoPlay={isPlaying}
                        muted={isMuted}
                        loop
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
                      />
                    ) : (
                      <Image
                        src={extractYouTubeThumbnail(vid.thumbnailUrl)}
                        alt={vid.title || "Approved by Creators"}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 260px, 320px"
                      />
                    )}

                    {/* TRANSPARENT INTERACTION SHIELD & SUBTLE BOTTOM GRADIENT */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-auto cursor-pointer select-none" />

                    {/* IN-CARD NAVIGATION ARROWS (PHONE ONLY: sm:hidden) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        scroll("left");
                      }}
                      aria-label="Previous creator video"
                      className="sm:hidden absolute left-3 top-1/2 -translate-y-1/2 z-20 flex size-9 items-center justify-center rounded-lg bg-black/60 text-white shadow-md backdrop-blur-xs hover:bg-black/80 transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronLeft className="size-5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        scroll("right");
                      }}
                      aria-label="Next creator video"
                      className="sm:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20 flex size-9 items-center justify-center rounded-lg bg-black/60 text-white shadow-md backdrop-blur-xs hover:bg-black/80 transition-all cursor-pointer active:scale-95"
                    >
                      <ChevronRight className="size-5" />
                    </button>

                    {/* BOTTOM-LEFT VIDEO CONTROLS: PLAY/PAUSE & MUTE */}
                    <div className="absolute bottom-3.5 left-3.5 z-20 flex items-center gap-2 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPlaying((prev) => !prev);
                        }}
                        className="flex size-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-black/80 transition-colors cursor-pointer shadow-sm"
                        aria-label="Play or pause video"
                      >
                        {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted((prev) => !prev);
                        }}
                        className="flex size-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-black/80 transition-colors cursor-pointer shadow-sm"
                        aria-label="Mute or unmute video"
                      >
                        {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                      </button>
                    </div>

                    {/* BOTTOM TITLE */}
                    {vid.title && (
                      <div className="absolute bottom-12 left-4 right-4 z-20 text-white pointer-events-auto">
                        <p className="text-xs sm:text-sm font-semibold leading-snug drop-shadow-md line-clamp-2">
                          {vid.title}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ───────────────── BACK SIDE: EXACT STOREFRONT PRODUCT CARD ───────────────── */}
                  <div
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                    className={`absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-white text-slate-900 border border-slate-200 p-3.5 sm:p-4 flex flex-col cursor-pointer shadow-xs transition-opacity duration-300 ${
                      isFlipped ? "pointer-events-auto opacity-100 z-10" : "pointer-events-none opacity-0 z-0"
                    }`}
                    onClick={(e) => toggleFlip(vid.id, e)}
                  >
                    {/* TOP CORNER FLIP BACK BUTTON */}
                    <button
                      type="button"
                      onClick={(e) => toggleFlip(vid.id, e)}
                      className="absolute right-2.5 top-2.5 z-20 flex size-8 items-center justify-center rounded-full bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Flip back to video"
                    >
                      <RotateCcw className="size-4" />
                    </button>

                    {vid.product ? (
                      /* ── CASE 1: PRODUCT IS ATTACHED (REAL DATA ONLY) ── */
                      <>
                        {/* PRODUCT IMAGE */}
                        <div className="relative h-[56%] w-full rounded-xl bg-[#fbfbfd] overflow-hidden p-3 flex items-center justify-center group/img shrink-0">
                          <Image
                            src={vid.product.mainImage || extractYouTubeThumbnail(vid.thumbnailUrl)}
                            alt={vid.product.name}
                            fill
                            unoptimized
                            className="object-contain p-2 transition-transform duration-300 group-hover/img:scale-105"
                          />
                        </div>

                        {/* PRODUCT DETAILS BODY */}
                        <div className="flex flex-1 flex-col justify-between pt-2.5">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
                              XELECTRON
                            </p>
                            <h3 className="line-clamp-2 text-[13px] sm:text-[14px] font-bold leading-snug text-slate-900">
                              {vid.product.name}
                            </h3>
                            {vid.product.description && (
                              <p className="text-[11px] leading-4 text-slate-500 line-clamp-2">
                                {vid.product.description}
                              </p>
                            )}

                            {/* PRICE SECTION */}
                            {vid.product.price && (
                              <div className="flex items-baseline gap-2 pt-1.5">
                                <span className="text-[16px] sm:text-[18px] font-bold text-slate-900">
                                  {vid.product.price.startsWith("₹")
                                    ? vid.product.price
                                    : `₹${vid.product.price}`}
                                </span>
                                {vid.product.oldPrice ? (
                                  <span className="text-[11px] sm:text-[12px] text-slate-400 line-through">
                                    {vid.product.oldPrice.startsWith("₹")
                                      ? vid.product.oldPrice
                                      : `₹${vid.product.oldPrice}`}
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </div>

                          {/* BUY BUTTON REDIRECTS TO PRODUCT PAGE */}
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const numPrice =
                                  parseFloat((vid.product?.price || "0").replace(/[^\d.]/g, "")) || 0;
                                if (vid.product) {
                                  addItem({
                                    id: vid.product.id,
                                    slug: vid.product.slug,
                                    name: vid.product.name,
                                    price: numPrice,
                                    image: vid.product.mainImage,
                                    category: "Electronics",
                                  });
                                }
                                router.push(`/product/${vid.product?.slug}`);
                              }}
                              className="inline-flex h-9 sm:h-10 w-full cursor-pointer items-center justify-center rounded-xl bg-[#0a7ae6] text-xs sm:text-sm font-bold text-white transition-colors hover:bg-[#0866c2] shadow-xs active:scale-[0.98]"
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* ── CASE 2: NO PRODUCT ATTACHED (CLEAN SHOP REDIRECT CARD) ── */
                      <div className="flex flex-1 flex-col items-center justify-between text-center p-3 pt-6">
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0a7ae6] mb-3 border border-blue-100">
                            <ShoppingBag className="size-7" />
                          </div>
                          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#0a7ae6]">
                            XELECTRON STORE
                          </p>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                            Explore Catalog
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed mt-2 max-w-[220px]">
                            No specific product linked to this video. Explore our full collection of smart projectors and sound systems.
                          </p>
                        </div>

                        <Link
                          href="/shop"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0a7ae6] text-xs sm:text-sm font-bold text-white transition-colors hover:bg-[#0866c2] shadow-xs active:scale-[0.98]"
                        >
                          <span>Visit Shop</span>
                          <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
