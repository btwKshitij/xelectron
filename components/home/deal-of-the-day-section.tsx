"use client";

import Image from "next/image";
import Link from "next/link";

import { formatINR, parsePriceNumber } from "@/lib/format-price";
import { useEffect, useRef, useState } from "react";
import { Flame } from "lucide-react";

export type StorefrontDealOfTheDay = {
  title: string;
  description: string;
  image: string;
  badge: string | null;
  features: string[];
  unitsLeft: number;
  totalUnits: number;
  endsAt: string | null;
  product: {
    slug: string;
    name: string;
    price: string;
    oldPrice: string | null;
    description?: string | null;
    shippingNotice?: string | null;
  };
};

function getTimeLeftInfo(endsAt: string | null) {
  const now = new Date();
  const deadline = endsAt ? new Date(endsAt) : new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const remaining = Math.max(0, deadline.getTime() - now.getTime());

  const totalHours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1_000);

  const isMoreThan24Hours = remaining > 24 * 60 * 60 * 1000;
  const isUrgent = remaining > 0 && remaining <= 3 * 60 * 60 * 1000;

  let labelText = "Ends In";
  let dateDisplay = "";

  if (isMoreThan24Hours) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const dayDiff = Math.round((targetDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

    labelText = "Offer";

    if (dayDiff <= 1) {
      dateDisplay = "Ends Tomorrow";
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      dateDisplay = `Ends ${deadline.getDate()} ${monthNames[deadline.getMonth()]}`;
    }
  }

  return {
    remaining,
    totalHours,
    minutes,
    seconds,
    isMoreThan24Hours,
    isUrgent,
    labelText,
    dateDisplay,
  };
}

function displayPrice(price: string) {
  return formatINR(price);
}

export default function DealOfTheDaySection({ deal }: { deal: StorefrontDealOfTheDay }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isWhite, setIsWhite] = useState(false);
  const [timerInfo, setTimerInfo] = useState(() => getTimeLeftInfo(deal.endsAt));
  const claimedPercent = Math.max(0, Math.min(100, Math.round(((deal.totalUnits - deal.unitsLeft) / deal.totalUnits) * 100)));

  const numPrice = parsePriceNumber(deal.product.price);
  const numOld = parsePriceNumber(deal.product.oldPrice);
  const discountPercent = numOld > 0 && numPrice > 0 && numPrice < numOld ? Math.round(((numOld - numPrice) / numOld) * 100) : 0;

  // COUNTDOWN TIMER
  useEffect(() => {
    const updateTimer = () => setTimerInfo(getTimeLeftInfo(deal.endsAt));
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [deal.endsAt]);

  // SCROLL TRIGGER: FIRST BLACK, THEN TRANSITIONS TO WHITE ON IN-VIEW
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsWhite(entry.isIntersecting);
      },
      {
        threshold: 0.3,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formatTime = (num: number) => String(num).padStart(2, "0");

  const isUrgent = timerInfo.isUrgent;

  const renderTimerBox = (isMobile = false) => (
    <div
      className={`flex items-center justify-between rounded-2xl sm:rounded-[22px] border px-5 py-3.5 sm:px-6 sm:py-4 shadow-xs transition-all duration-700 shrink-0 ${
        isUrgent
          ? "border-rose-200 bg-rose-50/90 text-rose-950 ring-2 ring-rose-500/20"
          : isWhite
          ? "border-blue-100/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-blue-50/70 text-slate-900"
          : "border-slate-800 bg-[#0f172a]/90 text-white"
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-3.5">
        <div
          className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-colors duration-700 ${
            isUrgent
              ? "bg-rose-100 border border-rose-300 text-rose-600"
              : "bg-[#0a7ae6]/10 border border-[#0a7ae6]/20 text-[#0a7ae6]"
          }`}
        >
          <Flame className={`h-5 w-5 sm:h-5.5 sm:w-5.5 ${isUrgent ? "fill-rose-600 text-rose-600 animate-bounce" : "fill-[#0a7ae6] text-[#0a7ae6] animate-pulse"}`} />
        </div>
        <div>
          <p
            className={`text-base sm:text-lg font-bold leading-none transition-colors duration-700 ${
              isUrgent ? "text-rose-900" : isWhite ? "text-slate-900" : "text-white"
            }`}
          >
            {deal.unitsLeft}
          </p>
          <p className="mt-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Units Left
          </p>
        </div>
      </div>

      <div
        className={`h-8 w-px transition-colors duration-700 ${
          isUrgent ? "bg-rose-200" : isWhite ? "bg-slate-200" : "bg-slate-800"
        }`}
      />

      {/* DYNAMIC TIMER / DATE DISPLAY */}
      <div className="text-right" suppressHydrationWarning>
        {timerInfo.isMoreThan24Hours ? (
          <div suppressHydrationWarning>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {timerInfo.labelText}
            </p>
            <div className="mt-0.5 text-base sm:text-2xl font-bold tracking-tight text-[#0a7ae6]" suppressHydrationWarning>
              {timerInfo.dateDisplay}
            </div>
          </div>
        ) : (
          <div className="font-mono text-xl sm:text-3xl font-extrabold tracking-tight text-slate-950" suppressHydrationWarning>
            <span suppressHydrationWarning>{formatTime(timerInfo.totalHours)}</span>:
            <span suppressHydrationWarning>{formatTime(timerInfo.minutes)}</span>:
            <span suppressHydrationWarning className={isUrgent ? "text-rose-600" : "text-[#0a7ae6]"}>
              {formatTime(timerInfo.seconds)}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className={`px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 transition-colors duration-700 ease-in-out ${
        isWhite ? "bg-[#fafbfc] text-slate-900" : "bg-[#080c14] text-white"
      }`}
    >
      <div className="mx-auto max-w-[1440px]">
        {/* SECTION HEADER */}
        <div className="mb-4 sm:mb-6">
          <h2
            className={`text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight transition-colors duration-700 ${
              isWhite ? "text-slate-950" : "text-white"
            }`}
          >
            Deal of the day
          </h2>
        </div>

        {/* MOBILE TIMER CARD (Displays right below title on phone view) */}
        <div className="block lg:hidden mb-4">
          {renderTimerBox(true)}
        </div>

        {/* 2-COLUMN GRID (DESKTOP: IMAGE LEFT, DETAILS RIGHT) */}
        <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* LEFT COLUMN: LIFESTYLE IMAGE BANNER */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="group relative h-[300px] xs:h-[340px] sm:h-[460px] md:h-[500px] lg:h-[560px] xl:h-[580px] w-full flex items-center justify-center">
              <Image
                src={deal.image}
                alt={deal.title}
                fill
                className="rounded-2xl sm:rounded-[28px] object-contain transition-transform duration-700 group-hover:scale-[1.02] drop-shadow-md"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
            </div>
          </div>

          {/* RIGHT COLUMN: TIMER + DETAILS CARDS */}
          <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-6 justify-between h-auto lg:h-[560px] xl:h-[580px]">
            {/* DESKTOP TIMER BOX (Hidden on mobile, shown on lg+) */}
            <div className="hidden lg:block">
              {renderTimerBox(false)}
            </div>

            {/* PRODUCT CARD BODY */}
            <div
              className={`flex-1 flex flex-col justify-between rounded-2xl sm:rounded-[28px] border p-6 sm:p-7 lg:p-8 shadow-xs transition-all duration-700 ${
                isWhite
                  ? "border-slate-200/80 bg-white text-slate-900"
                  : "border-slate-800 bg-[#0e1626] text-white shadow-2xl"
              }`}
            >
              <div>
                {/* PRODUCT TITLE & SUBTITLE */}
                <h3
                  className={`text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight leading-tight transition-colors duration-700 ${
                    isWhite ? "text-slate-950" : "text-white"
                  }`}
                >
                  {deal.title}
                </h3>
                <p
                  className={`mt-1.5 text-xs sm:text-sm line-clamp-2 leading-relaxed transition-colors duration-700 ${
                    isWhite ? "text-slate-600" : "text-slate-300"
                  }`}
                >
                  {deal.description}
                </p>

                {/* SPECIFICATION PILLS */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {deal.features.map((spec) => (
                    <span
                      key={spec}
                      className={`rounded-full border px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider transition-all duration-700 ${
                        isWhite
                          ? "border-[#0a7ae6]/30 bg-blue-50/70 text-[#0a7ae6] hover:bg-blue-100"
                          : "border-[#0a7ae6]/40 bg-[#0a7ae6]/15 text-[#38bdf8] hover:bg-[#0a7ae6]/25"
                      }`}
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* PRODUCT OVERVIEW & HIGHLIGHTS */}
                {(deal.product.description || deal.product.shippingNotice) && (
                  <div
                    className={`mt-3.5 rounded-xl border p-3 transition-colors duration-700 ${
                      isWhite
                        ? "border-slate-100 bg-slate-50/80 text-slate-700"
                        : "border-slate-800 bg-[#0a101d] text-slate-300"
                    }`}
                  >
                    <p className="text-xs font-semibold text-slate-900 mb-1">
                      About this item
                    </p>
                    <p className="text-xs leading-relaxed line-clamp-3 text-slate-600">
                      {deal.product.description || deal.product.shippingNotice}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                {/* PRICING */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                    <span
                      className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight transition-colors duration-700 ${
                        isWhite ? "text-slate-950" : "text-white"
                      }`}
                    >
                      {displayPrice(deal.product.price)}
                    </span>
                    {deal.product.oldPrice ? (
                      <span className="text-sm sm:text-base font-normal text-slate-400 line-through">
                        {displayPrice(deal.product.oldPrice)}
                      </span>
                    ) : null}
                    {discountPercent > 0 ? (
                      <span className="rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-xs sm:text-sm font-bold text-emerald-600 tracking-wide">
                        {discountPercent}% OFF
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-[#0a7ae6]">
                    Limited-time offer
                  </p>
                </div>

                {/* STOCK CLAIM PROGRESS BAR */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                    <span className="text-[#0a7ae6]">Selling Fast</span>
                    <span className="text-slate-400">{claimedPercent}% Claimed</span>
                  </div>
                  <div
                    className={`mt-1.5 sm:mt-2 h-2 sm:h-2.5 w-full overflow-hidden rounded-full transition-colors duration-700 ${
                      isWhite ? "bg-slate-100" : "bg-slate-800"
                    }`}
                  >
                    <div
                      style={{ width: `${claimedPercent}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-[#0a7ae6] to-[#025bb5] shadow-sm transition-all duration-500"
                    />
                  </div>
                </div>

                {/* BRAND BLUE CTA BUTTON */}
                <Link prefetch={false}
                  href={`/product/${deal.product.slug}`}
                  className="group relative mt-5 inline-flex h-12 sm:h-14 w-full items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0a7ae6] to-[#025bb5] text-sm sm:text-lg font-semibold tracking-wide text-white shadow-md shadow-blue-500/25 transition-all duration-300 hover:from-[#0869c7] hover:to-[#014993] hover:shadow-blue-500/40 active:scale-[0.99]"
                >
                  <span>
                    GRAB IT NOW — {displayPrice(deal.product.price)}
                    {discountPercent > 0 ? ` (${discountPercent}% OFF)` : ""}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
