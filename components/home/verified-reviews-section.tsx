"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export type BuyerReview = {
  id: string | number;
  name: string;
  product: string;
  productImage?: string;
  avatar: string;
  text: string;
  rating?: number;
  size: "sm" | "md" | "lg";
  mobilePos: { top: string; left: string };
  desktopPos: { top: string; left: string };
  cardSide: "left" | "right";
};

const defaultReviews: BuyerReview[] = [
  {
    id: "default-0",
    name: "MUSKAN A., MUMBAI",
    product: "Arc Buds",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    text: "It is actually a good product just got it and it looks amazing connectivity is good and head moving sound is good.",
    rating: 5,
    size: "md",
    mobilePos: { top: "18%", left: "25%" },
    desktopPos: { top: "25%", left: "28%" },
    cardSide: "right",
  },
  {
    id: "default-1",
    name: "NIKHIL G., PUNE",
    product: "Blaze B1100",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    text: "Audio output is clean and powerful. Surround effect works nicely once speakers are placed properly. Took a bit of adjustment, but after that the experience is great.",
    rating: 5,
    size: "sm",
    mobilePos: { top: "20%", left: "75%" },
    desktopPos: { top: "48%", left: "55%" },
    cardSide: "right",
  },
  {
    id: "default-2",
    name: "ASIYA N., BANGALORE",
    product: "Lumex Pro",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    text: "The XElectron Lumex Pro offers great value with built-in streaming apps, autofocus, and a large projection size, making it ideal for casual movie nights in dark rooms. While the brightness and color accuracy aren't top-tier and the sound is basic, it delivers solid performance for its price.",
    rating: 5,
    size: "lg",
    mobilePos: { top: "50%", left: "82%" },
    desktopPos: { top: "62%", left: "82%" },
    cardSide: "left",
  },
  {
    id: "default-3",
    name: "DAVID R., DELHI",
    product: "iProjector 3",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    text: "Reliable and consistent. XElectron keeps getting better with every generation.",
    rating: 5,
    size: "sm",
    mobilePos: { top: "50%", left: "18%" },
    desktopPos: { top: "25%", left: "76%" },
    cardSide: "left",
  },
  {
    id: "default-4",
    name: "TARA S., HYDERABAD",
    product: "Techno Smart",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    text: "XElectron always delivers. Sound quality and picture sharpness is just next level.",
    rating: 5,
    size: "sm",
    mobilePos: { top: "80%", left: "18%" },
    desktopPos: { top: "50%", left: "16%" },
    cardSide: "right",
  },
  {
    id: "default-5",
    name: "RAMKUMAR T., CHENNAI",
    product: "Blaze B2000",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    text: "Been using it daily for movies and music. No complaints at all, truly premium.",
    rating: 5,
    size: "lg",
    mobilePos: { top: "48%", left: "50%" },
    desktopPos: { top: "50%", left: "38%" },
    cardSide: "right",
  },
];

function AnimatedReviewText({ text }: { text: string }) {
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let count = 0;
    const timer = window.setInterval(() => {
      count = Math.min(count + 1, text.length);
      setVisibleCharacters(count);
      if (count === text.length) window.clearInterval(timer);
    }, 20);

    return () => window.clearInterval(timer);
  }, [text]);

  return (
    <>
      <span className="sr-only motion-reduce:not-sr-only">&ldquo;{text}&rdquo;</span>
      <span aria-hidden="true" className="motion-reduce:hidden">
        &ldquo;{text.slice(0, visibleCharacters)}
        {visibleCharacters < text.length ? (
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#0a7ae6] align-middle" />
        ) : "\u201d"}
      </span>
    </>
  );
}

export default function VerifiedReviewsSection({
  initialReviews,
}: {
  initialReviews?: BuyerReview[];
}) {
  const reviews = initialReviews ?? defaultReviews;
  // Saved presets only have six slots. Reflow crowded layouts instead of
  // stacking new customers on top of existing avatars.
  const useAutomaticLayout = reviews.length > 6 || reviews.some((review, index) =>
    reviews.slice(0, index).some((other) =>
      Math.abs(parseFloat(review.desktopPos.top) - parseFloat(other.desktopPos.top)) < 20 &&
      Math.abs(parseFloat(review.desktopPos.left) - parseFloat(other.desktopPos.left)) < 15
    )
  );
  const columns = Math.min(4, reviews.length);
  const rows = Math.ceil(reviews.length / Math.max(1, columns));
  const canvasHeight = useAutomaticLayout ? Math.max(360, rows * 180) : 360;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [popupBottom, setPopupBottom] = useState(0);

  // Follow the typing animation and product image as the popup grows. Avatar
  // positions use the original canvas height so expansion cannot push them down.
  useEffect(() => {
    const popup = popupRef.current;
    const canvas = canvasRef.current;
    if (activeIndex === null || !popup || !canvas) return;

    const observer = new ResizeObserver(() => {
      setPopupBottom(Math.ceil(
        popup.getBoundingClientRect().bottom - canvas.getBoundingClientRect().top + 48
      ));
    });
    observer.observe(popup);
    return () => observer.disconnect();
  }, [activeIndex, canvasHeight]);

  // Close card when clicking outside the section
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        setActiveIndex(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + reviews.length) % reviews.length));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % reviews.length));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMouseOffset({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    });
  };

  const handleCanvasClick = () => {
    setActiveIndex(null);
  };

  if (reviews.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#f6faf7] md:bg-white px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24 overflow-hidden"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* HEADER TITLE & NAVIGATION BUTTONS */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-wide uppercase text-slate-900 md:normal-case md:text-3xl lg:text-[42px] md:font-normal">
            Real reviews from verified buyers
          </h2>

          {/* DESKTOP NAV ARROWS */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handlePrev}
              aria-label="Previous review"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#0a7ae6] text-white shadow-md shadow-blue-500/25 transition-all hover:bg-[#0869c7] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[2.5]" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next review"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#0a7ae6] text-white shadow-md shadow-blue-500/25 transition-all hover:bg-[#0869c7] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ── PHONE / MOBILE VIEW: VERTICAL LIST OF CLEAN REVIEW CARDS (< md) ── */}
        <div className="block md:hidden space-y-3.5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-[20px] bg-white border border-slate-200/80 p-5 shadow-xs"
            >
              {/* TOP ROW: NAME & PRODUCT BADGE */}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold tracking-wide uppercase text-slate-900">
                  {rev.name}
                </h3>
                <span className="rounded-md bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {rev.product}
                </span>
              </div>

              {/* STARS */}
              <div className="my-2.5 flex items-center gap-1 text-amber-500">
                {[...Array(rev.rating ?? 5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* REVIEW QUOTE */}
              <p className="text-xs sm:text-sm italic leading-relaxed text-slate-700">
                &quot;{rev.text}&quot;
              </p>
            </div>
          ))}
        </div>

        {/* ── DESKTOP VIEW: SCATTERED AVATAR PARALLAX CANVAS (md+) ── */}
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMouseOffset({ x: 0, y: 0 })}
          className="hidden md:block relative w-full rounded-3xl bg-transparent p-2 cursor-pointer"
          style={{ height: activeIndex === null ? canvasHeight : Math.max(canvasHeight, popupBottom) }}
        >
          {reviews.map((rev, idx) => {
            const isActive = idx === activeIndex;
            const row = Math.floor(idx / columns);
            const itemsInRow = Math.min(columns, reviews.length - row * columns);
            const pos = useAutomaticLayout
              ? {
                  top: `${((row + 0.5) / rows) * 100}%`,
                  left: `${((idx % columns + 0.5) / itemsInRow) * 100}%`,
                }
              : rev.desktopPos;
            const cardSide = parseFloat(pos.left) >= 50 ? "left" : "right";

            let circleSize = "w-12 h-12";
            let depth = 10;
            if (rev.size === "md") {
              circleSize = "w-18 h-18";
              depth = 16;
            }
            if (rev.size === "lg") {
              circleSize = "w-22 h-22";
              depth = 24;
            }

            const moveX = mouseOffset.x * depth;
            const moveY = mouseOffset.y * depth;

            return (
              <div
                key={rev.id}
                className={`absolute transition-all duration-300 ease-out ${
                  isActive ? "z-40" : "z-10"
                }`}
                style={{
                  top: `${parseFloat(pos.top) / 100 * canvasHeight}px`,
                  left: pos.left,
                  transform: `translate(-50%, -50%) translate3d(${moveX}px, ${moveY}px, 0)`,
                }}
              >
                {/* BLUE RADIAL GLOW ONLY WHEN ACTIVE */}
                {isActive && (
                  <div className="pointer-events-none absolute -inset-5 rounded-full bg-blue-500/30 blur-xl animate-pulse motion-reduce:animate-none" />
                )}

                {/* AVATAR CIRCLE BUTTON */}
                <button
                  type="button"
                  aria-label={`Read review by ${rev.name}`}
                  aria-expanded={isActive}
                  aria-controls={isActive ? `buyer-review-${rev.id}` : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(isActive ? null : idx);
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`relative overflow-hidden rounded-full border-2 bg-slate-100 shadow-lg transition-all duration-300 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a7ae6] cursor-pointer ${circleSize} ${
                    isActive
                      ? "border-[#0a7ae6] ring-4 ring-blue-500/30 scale-110 shadow-blue-500/20 shadow-xl"
                      : "border-white opacity-85 hover:opacity-100 hover:scale-110"
                  }`}
                >
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="h-full w-full object-cover pointer-events-none"
                  />
                </button>

                {/* DESKTOP FLOATING REVIEW CARD POPOVER */}
                {isActive && (
                  <div
                    ref={popupRef}
                    id={`buyer-review-${rev.id}`}
                    role="region"
                    aria-label={`Review by ${rev.name}`}
                    onClick={(event) => event.stopPropagation()}
                    className={`absolute top-0 z-50 w-64 lg:w-80 cursor-auto animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none ${
                      cardSide === "left"
                        ? "right-full mr-4"
                        : "left-full ml-4"
                    }`}
                  >
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_15px_40px_rgba(15,23,42,0.12)]">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-900 wrap-break-word">
                        {rev.name}
                      </p>
                      <div className="mb-2 mt-1.5 flex items-center gap-0.5" aria-label={`${rev.rating ?? 5} out of 5 stars`}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} aria-hidden="true" className={`size-3.5 ${i < (rev.rating ?? 5) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`} />
                        ))}
                      </div>
                      <blockquote className="min-h-10 whitespace-pre-line text-sm font-medium italic leading-relaxed text-slate-700 wrap-break-word">
                        <AnimatedReviewText key={`${rev.id}:${rev.text}`} text={rev.text} />
                      </blockquote>
                    </div>
                    {rev.productImage && (
                      <div
                        role="region"
                        aria-label={`Reviewed product: ${rev.product}`}
                        className={`mt-3 w-28 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-[0_15px_40px_rgba(15,23,42,0.12)] animate-in fade-in zoom-in-95 duration-300 motion-reduce:animate-none ${cardSide === "left" ? "ml-auto" : "mr-auto"}`}
                      >
                        <img src={rev.productImage} alt={rev.product} className="h-20 w-full object-contain" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
