"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export type BuyerReview = {
  id: number;
  name: string;
  product: string;
  avatar: string;
  text: string;
  size: "sm" | "md" | "lg";
  mobilePos: { top: string; left: string };
  desktopPos: { top: string; left: string };
  cardSide: "left" | "right";
};

const reviews: BuyerReview[] = [
  {
    id: 0,
    name: "MUSKAN A., MUMBAI",
    product: "Arc Buds",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    text: "It is actually a good product just got it and it looks amazing connectivity is good and head moving sound is good.",
    size: "md",
    mobilePos: { top: "18%", left: "25%" },
    desktopPos: { top: "25%", left: "28%" },
    cardSide: "right",
  },
  {
    id: 1,
    name: "NIKHIL G., PUNE",
    product: "Blaze B1100",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    text: "Audio output is clean and powerful. Surround effect works nicely once speakers are placed properly. Took a bit of adjustment, but after that the experience is great.",
    size: "sm",
    mobilePos: { top: "20%", left: "75%" },
    desktopPos: { top: "48%", left: "55%" },
    cardSide: "right",
  },
  {
    id: 2,
    name: "ASIYA N., BANGALORE",
    product: "Lumex Pro",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    text: "The XElectron Lumex Pro offers great value with built-in streaming apps, autofocus, and a large projection size, making it ideal for casual movie nights in dark rooms. While the brightness and color accuracy aren't top-tier and the sound is basic, it delivers solid performance for its price.",
    size: "lg",
    mobilePos: { top: "50%", left: "82%" },
    desktopPos: { top: "62%", left: "82%" },
    cardSide: "left",
  },
  {
    id: 3,
    name: "DAVID R., DELHI",
    product: "iProjector 3",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    text: "Reliable and consistent. XElectron keeps getting better with every generation.",
    size: "sm",
    mobilePos: { top: "50%", left: "18%" },
    desktopPos: { top: "25%", left: "76%" },
    cardSide: "left",
  },
  {
    id: 4,
    name: "TARA S., HYDERABAD",
    product: "Techno Smart",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    text: "XElectron always delivers. Sound quality and picture sharpness is just next level.",
    size: "sm",
    mobilePos: { top: "80%", left: "18%" },
    desktopPos: { top: "50%", left: "16%" },
    cardSide: "right",
  },
  {
    id: 5,
    name: "RAMKUMAR T., CHENNAI",
    product: "Blaze B2000",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    text: "Been using it daily for movies and music. No complaints at all, truly premium.",
    size: "lg",
    mobilePos: { top: "48%", left: "50%" },
    desktopPos: { top: "50%", left: "38%" },
    cardSide: "right",
  },
];

export default function VerifiedReviewsSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Close card when clicking outside the section
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        setActiveIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeReview = activeIndex !== null ? reviews[activeIndex] : null;

  // Typewriter effect on active review change (desktop)
  useEffect(() => {
    if (activeIndex === null || !activeReview) {
      setTypedText("");
      setIsTyping(false);
      return;
    }

    setTypedText("");
    setIsTyping(true);
    let i = 0;
    const fullText = activeReview.text;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [activeIndex, activeReview]);

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
          {reviews.slice(0, 3).map((rev) => (
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

              {/* 5 STARS */}
              <div className="my-2.5 flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
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
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMouseOffset({ x: 0, y: 0 })}
          className="hidden md:block relative min-h-[360px] w-full rounded-3xl bg-transparent p-2 overflow-hidden cursor-pointer"
        >
          {reviews.map((rev) => {
            const isActive = rev.id === activeIndex;
            const pos = rev.desktopPos;

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
                  top: pos.top,
                  left: pos.left,
                  transform: `translate(-50%, -50%) translate3d(${moveX}px, ${moveY}px, 0)`,
                }}
              >
                {/* BLUE RADIAL GLOW ONLY WHEN ACTIVE */}
                {isActive && (
                  <div className="absolute -inset-5 rounded-full bg-blue-500/30 blur-xl animate-pulse" />
                )}

                {/* AVATAR CIRCLE BUTTON */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(isActive ? null : rev.id);
                  }}
                  onMouseEnter={() => setActiveIndex(rev.id)}
                  className={`relative overflow-hidden rounded-full border-2 bg-slate-100 shadow-lg transition-all duration-300 cursor-pointer ${circleSize} ${
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
                    className={`absolute z-50 w-72 lg:w-80 pointer-events-none animate-in fade-in zoom-in-95 duration-200 ${
                      rev.cardSide === "left"
                        ? "right-full mr-3 top-1/2 -translate-y-1/2"
                        : "left-full ml-3 top-1/2 -translate-y-1/2"
                    }`}
                  >
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_15px_40px_rgba(15,23,42,0.12)]">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                          {rev.name}
                        </p>
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          {rev.product}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="min-h-[40px] text-xs sm:text-sm font-medium text-slate-700 leading-relaxed italic">
                        &quot;{typedText}&quot;
                        {isTyping && (
                          <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#0a7ae6] animate-pulse" />
                        )}
                      </p>
                    </div>
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
