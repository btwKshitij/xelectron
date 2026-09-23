"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { X, Loader2, Check, Copy, Sparkles, Tag, Gift } from "lucide-react";
import { toast } from "sonner";

export type FestiveOfferSettings = {
  isActive: boolean;
  imageUrl: string;
  badgeTitle: string;
  heading: string;
  offerText: string;
  subtext: string;
  buttonText: string;
  discountCode: string;
};

const DEFAULT_SETTINGS: FestiveOfferSettings = {
  isActive: false,
  imageUrl: "/ganesh-chaturthi-popup-clean.png",
  badgeTitle: "GANESH CHATURTHI SPECIAL",
  heading: "BRING HOME MORE JOY",
  offerText: "GET 5% OFF",
  subtext: "Sign up and receive your festive offer by email.",
  buttonText: "UNLOCK MY 5% OFF",
  discountCode: "GANESH5",
};

export default function FestiveOfferPopup() {
  const pathname = usePathname();
  const router = useRouter();

  const [settings, setSettings] = useState<FestiveOfferSettings>(DEFAULT_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [isTabDismissed, setIsTabDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [discountCode, setDiscountCode] = useState(DEFAULT_SETTINGS.discountCode);
  const [loadedPath, setLoadedPath] = useState<string | null>(null);
  const isMounted = loadedPath === pathname;

  // Check stored dismissal and unlocked code on mount
  useEffect(() => {
    try {
      if (sessionStorage.getItem("xelectron_festive_closed") === "true") {
        setHasDismissed(true);
      }
      if (sessionStorage.getItem("xelectron_festive_tab_dismissed") === "true") {
        setIsTabDismissed(true);
      }
      const saved = localStorage.getItem("xelectron_festive_submitted");
      if (saved) {
        setIsSuccess(true);
      }
    } catch {}
  }, []);

  // Exclude dashboard, admin, auth, and checkout pages
  const isExcluded =
    !pathname ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/checkout");

  useEffect(() => {
    if (isExcluded) return;
    let controller: AbortController | undefined;
    const refreshSettings = async () => {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;
      try {
        const response = await fetch("/api/festive-offer", { cache: "no-store", signal });
        if (!response.ok) throw new Error("Failed to load popup settings");
        const data = await response.json();
        if (!data.success || typeof data.settings?.isActive !== "boolean") throw new Error("Invalid popup settings");
        if (signal.aborted) return;
        setSettings(data.settings);
        setDiscountCode(data.settings.discountCode);
        if (!data.settings.isActive) setIsOpen(false);
        setLoadedPath(pathname);
      } catch {
        if (signal.aborted) return;
        setSettings((previous) => ({ ...previous, isActive: false }));
        setIsOpen(false);
        setLoadedPath(pathname);
      }
    };
    const handleSettingsChange = (event: StorageEvent) => {
      if (event.key === "xelectron:festive-popup-updated") void refreshSettings();
    };
    void refreshSettings();
    window.addEventListener("focus", refreshSettings);
    window.addEventListener("storage", handleSettingsChange);
    return () => {
      controller?.abort();
      window.removeEventListener("focus", refreshSettings);
      window.removeEventListener("storage", handleSettingsChange);
    };
  }, [pathname, isExcluded]);

  useEffect(() => {
    if (!isMounted || isExcluded) return;
    if (settings.isActive === false) return;
    if (sessionStorage.getItem("xelectron_festive_closed") === "true") return;

    // Show popup automatically when opening the website
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [isMounted, isExcluded, settings.isActive]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setHasDismissed(true);
    try {
      sessionStorage.setItem("xelectron_festive_closed", "true");
    } catch {}
  }, []);

  const handleDismissTab = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTabDismissed(true);
    try {
      sessionStorage.setItem("xelectron_festive_tab_dismissed", "true");
    } catch {}
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(discountCode);
      setCopied(true);
      toast.success("Coupon code copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/festive-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.discountCode) {
        setDiscountCode(data.discountCode);
      }

      setIsSuccess(true);
      localStorage.setItem("xelectron_festive_submitted", cleanEmail);
      toast.success("Festive discount unlocked!");
    } catch {
      // Graceful fallback
      setIsSuccess(true);
      toast.success("Festive discount unlocked!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted || isExcluded || settings.isActive === false) {
    return null;
  }

  const isDefaultPreset =
    settings.imageUrl === "/ganesh-chaturthi-popup-clean.png" &&
    settings.heading === "BRING HOME MORE JOY" &&
    settings.offerText === "GET 5% OFF";

  return (
    <>
      {/* FLOATING SIDE TAB TRIGGER (ATTACHED TO LEFT EDGE) */}
      {!isOpen && hasDismissed && !isTabDismissed && (
        <aside
          aria-label="Festive Offer"
          className="fixed left-0 bottom-4 sm:bottom-6 z-40 animate-in fade-in slide-in-from-left-4 duration-300"
        >
          <div className="relative group">
            {/* CORNER CLOSE (X) BUTTON */}
            <button
              type="button"
              onClick={handleDismissTab}
              aria-label="Dismiss offer tab"
              title="Dismiss"
              className="absolute -top-2.5 -right-2.5 z-10 flex size-5.5 items-center justify-center rounded-full bg-slate-950 text-white hover:bg-slate-800 transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-md border border-white/20"
            >
              <X className="size-3 stroke-[2.5]" />
            </button>

            {/* BRAND BLUE SIDE TAB */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open festive offer"
              title="Click to view offer"
              className="flex w-9 sm:w-10 h-32 sm:h-36 items-center justify-center rounded-r-md bg-[#0a7ae6] hover:bg-[#0866c2] border-2 border-slate-950 border-l-0 shadow-[2px_4px_16px_rgba(10,122,230,0.35)] hover:translate-x-1 transition-all duration-200 cursor-pointer"
            >
              <span className="-rotate-90 whitespace-nowrap text-xs sm:text-[13px] font-black tracking-widest text-white uppercase select-none font-sans">
                {settings.offerText || "GET 5% OFF"}
              </span>
            </button>
          </div>
        </aside>
      )}

      {/* FULL-SCREEN FESTIVE OFFER MODAL */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={settings.badgeTitle || "Festive Offer"}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
      <div className="relative w-full max-w-[760px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_25px_90px_rgba(0,0,0,0.95),0_0_50px_rgba(240,80,26,0.12)] border border-slate-700/70 bg-[#0c1017] animate-in zoom-in-95 duration-300">
        {/* FLOATING CLOSE BUTTON */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-30 flex size-8 sm:size-9 items-center justify-center rounded-full bg-slate-950/90 text-white border-2 border-white/90 shadow-[0_4px_14px_rgba(0,0,0,0.6)] hover:bg-slate-800 hover:scale-105 active:scale-95 transition cursor-pointer"
          aria-label="Close offer popup"
        >
          <X className="size-4 sm:size-5 stroke-[2.5]" />
        </button>

        {/* ── DESKTOP & TABLET VIEW ── */}
        <div className="hidden sm:block">
          {isDefaultPreset ? (
            /* EXACT PIXEL-PERFECT ARTWORK FOR DEFAULT PRESET */
            <div className="relative w-full aspect-[770/588]">
              <Image
                src={settings.imageUrl}
                alt={`${settings.badgeTitle} - ${settings.heading} - ${settings.offerText}`}
                fill
                priority
                className="object-cover"
                sizes="760px"
              />

              {/* INTERACTIVE FORM & SUCCESS OVERLAY */}
              <div className="absolute top-[66.3%] left-[55.8%] w-[37.2%] z-20">
                {!isSuccess ? (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="Enter Your Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-10 lg:h-11 rounded-full bg-[#141923]/95 border border-[#0a7ae6]/70 px-5 text-xs lg:text-[13px] text-white placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-1 focus:ring-[#0a7ae6]/40 shadow-inner transition text-left"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 lg:h-12 rounded-full bg-[#0a7ae6] hover:bg-[#0866c2] active:scale-[0.98] text-xs lg:text-sm font-bold uppercase tracking-wider text-white shadow-[0_4px_18px_rgba(10,122,230,0.45)] transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin text-white" />
                          <span>Unlocking...</span>
                        </>
                      ) : (
                        <span>{settings.buttonText || "UNLOCK MY 5% OFF"}</span>
                      )}
                    </button>
                  </form>
                ) : (
                  /* SUCCESS VOUCHER CARD */
                  <div className="rounded-2xl bg-[#0f141d]/98 border border-[#0a7ae6]/60 p-3.5 text-center shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] lg:text-xs font-bold text-sky-300 uppercase tracking-widest">
                      <Sparkles className="size-3.5 text-[#0a7ae6]" />
                      <span>Festive Offer Unlocked</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-[#181f2c] border border-slate-700/80 px-3 py-1.5">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-white text-sm lg:text-base tracking-widest">
                        <Tag className="size-3.5 text-[#0a7ae6]" />
                        <span>{discountCode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#0a7ae6] px-2.5 py-1 text-[11px] font-bold uppercase text-white hover:bg-[#0866c2] transition active:scale-95 cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="size-3 text-white" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3 text-white" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        router.push("/shop");
                      }}
                      className="mt-2.5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold uppercase tracking-wide text-white transition active:scale-95 cursor-pointer shadow-md"
                    >
                      Shop Now with {settings.offerText || "Offer"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* DYNAMIC SPLIT LAYOUT FOR CUSTOM UPLOADED IMAGE OR CUSTOM HEADINGS */
            <div className="grid grid-cols-12 min-h-[420px] bg-[#0c1017]">
              {/* Left Column: Image Banner */}
              <div className="col-span-5 relative min-h-[420px] bg-gradient-to-br from-slate-900 to-black overflow-hidden border-r border-slate-800/80">
                <Image
                  src={settings.imageUrl}
                  alt={settings.heading || "Special Offer"}
                  fill
                  priority
                  className="object-cover"
                  sizes="380px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017]/80 via-transparent to-transparent" />
              </div>

              {/* Right Column: Offer & Interactive Form */}
              <div className="col-span-7 flex flex-col justify-center p-8 lg:p-10 space-y-5 bg-[#0c1017]">
                <div className="space-y-2">
                  {settings.badgeTitle && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-[0.2em] font-serif">
                      <Sparkles className="size-3 text-amber-400" />
                      <span>{settings.badgeTitle}</span>
                    </div>
                  )}
                  <h3 className="text-2xl lg:text-3xl font-extrabold font-serif text-white tracking-tight leading-tight">
                    {settings.heading}
                  </h3>
                  <div className="text-3xl lg:text-4xl font-black text-[#f0501a] tracking-tight">
                    {settings.offerText}
                  </div>
                  {settings.subtext && (
                    <p className="text-xs lg:text-sm text-slate-300 pt-0.5 leading-relaxed">
                      {settings.subtext}
                    </p>
                  )}
                </div>

                {!isSuccess ? (
                  <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                    <input
                      type="email"
                      required
                      placeholder="Enter Your Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 rounded-full bg-[#141923]/95 border border-[#0a7ae6]/70 px-5 text-xs lg:text-sm text-white placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-1 focus:ring-[#0a7ae6]/40 shadow-inner transition"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-full bg-[#0a7ae6] hover:bg-[#0866c2] active:scale-[0.98] text-xs lg:text-sm font-bold uppercase tracking-wider text-white shadow-[0_4px_18px_rgba(10,122,230,0.45)] transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin text-white" />
                          <span>Unlocking...</span>
                        </>
                      ) : (
                        <span>{settings.buttonText || "UNLOCK MY OFFER"}</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="rounded-2xl bg-[#0f141d] border border-[#0a7ae6]/60 p-4 text-center space-y-3 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-sky-300 uppercase tracking-widest">
                      <Sparkles className="size-4 text-[#0a7ae6]" />
                      <span>Offer Unlocked!</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-xl bg-[#181f2c] border border-slate-700/80 px-4 py-2">
                      <div className="flex items-center gap-2 font-mono font-bold text-white text-base tracking-widest">
                        <Tag className="size-4 text-[#0a7ae6]" />
                        <span>{discountCode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#0a7ae6] px-3 py-1.5 text-xs font-bold uppercase text-white hover:bg-[#0866c2] transition active:scale-95 cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="size-3.5 text-white" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5 text-white" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        router.push("/shop");
                      }}
                      className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition active:scale-95 cursor-pointer shadow-md"
                    >
                      Shop Now with {settings.offerText || "Offer"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── MOBILE RESPONSIVE VIEW ── */}
        <div className="sm:hidden flex flex-col bg-[#0c1017] text-white">
          {/* Header Visual */}
          <div className="relative h-[210px] w-full overflow-hidden bg-gradient-to-b from-[#080c14] to-[#0c1017]">
            <Image
              src={settings.imageUrl}
              alt={settings.heading || "Special Offer"}
              fill
              priority
              className="object-cover object-left"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-[#0c1017]/40 to-transparent" />
          </div>

          {/* Offer Details & Form Content */}
          <div className="p-5 pt-2 text-center space-y-3.5">
            <div className="space-y-1">
              {settings.badgeTitle && (
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300 font-serif">
                  {settings.badgeTitle}
                </p>
              )}
              <h3 className="text-2xl font-extrabold font-serif tracking-tight text-white">
                {settings.heading}
              </h3>
              <div className="text-3xl font-black text-[#f0501a] tracking-tight">
                {settings.offerText}
              </div>
              {settings.subtext && (
                <p className="text-xs text-stone-300 pt-0.5">
                  {settings.subtext}
                </p>
              )}
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                <input
                  type="email"
                  required
                  placeholder="Enter Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 rounded-full bg-[#141923]/95 border border-[#0a7ae6]/70 px-5 text-xs text-white placeholder:text-slate-400 focus:border-[#0a7ae6] focus:outline-none focus:ring-1 focus:ring-[#0a7ae6]/40 text-center"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-full bg-[#0a7ae6] hover:bg-[#0866c2] active:scale-[0.98] text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(10,122,230,0.4)] transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin text-white" />
                      <span>Unlocking...</span>
                    </>
                  ) : (
                    <span>{settings.buttonText || "UNLOCK MY OFFER"}</span>
                  )}
                </button>
              </form>
            ) : (
              <div className="rounded-2xl bg-[#0f141d] border border-[#0a7ae6]/60 p-4 text-center space-y-2.5">
                <p className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                  ✨ Offer Unlocked!
                </p>
                <div className="flex items-center justify-between rounded-xl bg-[#181f2c] border border-slate-700/80 p-2">
                  <span className="font-mono font-bold text-white text-base tracking-widest pl-2">
                    {discountCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="rounded-lg bg-[#0a7ae6] px-3 py-1 text-xs font-bold uppercase text-white hover:bg-[#0866c2] transition"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    router.push("/shop");
                  }}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold uppercase tracking-wide text-white transition shadow-md"
                >
                  Shop Now with {settings.offerText || "Offer"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )}
</>
);
}
