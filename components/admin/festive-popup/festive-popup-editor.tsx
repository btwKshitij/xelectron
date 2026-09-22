"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Upload,
  RotateCcw,
  Check,
  Save,
  Eye,
  ExternalLink,
  Tag,
  Loader2,
  X,
  AlertCircle,
  Copy,
  Smartphone,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { uploadProductImage } from "@/lib/client/upload-product-image";
import { FestivePopupSettingsItem } from "@/lib/server/controllers/festive-popup.controller";

const DEFAULT_BANNER = "/ganesh-chaturthi-popup-clean.png";

type Props = {
  initialSettings: FestivePopupSettingsItem;
};

export default function FestivePopupEditor({ initialSettings }: Props) {
  const [settings, setSettings] = useState<FestivePopupSettingsItem>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewTab, setPreviewTab] = useState<"form" | "success">("form");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewEmail, setPreviewEmail] = useState("");
  const [previewCopied, setPreviewCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const uploaded = await uploadProductImage(file);
      setSettings((prev) => ({ ...prev, imageUrl: uploaded.url }));
      toast.success("Banner image uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetToDefaultImage = () => {
    setSettings((prev) => ({ ...prev, imageUrl: DEFAULT_BANNER }));
    toast.info("Banner image reset to default festive graphic.");
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/admin/festive-popup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: settings.isActive,
          imageUrl: settings.imageUrl,
          badgeTitle: settings.badgeTitle,
          heading: settings.heading,
          offerText: settings.offerText,
          subtext: settings.subtext,
          buttonText: settings.buttonText,
          discountCode: settings.discountCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSettings(data.settings);
      try {
        localStorage.setItem("xelectron:festive-popup-updated", String(Date.now()));
      } catch { /* Storefront also refreshes settings when it regains focus. */ }
      toast.success("Festive popup settings saved and published to storefront!");
    } catch (err: any) {
      toast.error(err?.message || "Error saving festive popup settings");
    } finally {
      setIsSaving(false);
    }
  };

  const isDefaultPreset =
    settings.imageUrl === DEFAULT_BANNER &&
    settings.heading === "BRING HOME MORE JOY" &&
    settings.offerText === "GET 5% OFF";

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
              <Sparkles className="size-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Festive & Promotional Offer Popup
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Upload custom banner graphics, customize offer headlines, set discount codes, and manage automatic storefront popup.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition"
          >
            <ExternalLink className="size-3.5" />
            <span>Storefront</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0a7ae6] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0866c2] transition active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Controls & Settings (7 cols) */}
        <div className="space-y-6 lg:col-span-6">
          {/* Card 1: Active Status */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">Popup Status</span>
                  {settings.isActive ? (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                      Active on Storefront
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, visitors automatically see this promotional offer popup upon landing on the store.
                </p>
              </div>

              <Switch
                checked={settings.isActive}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>

          {/* Card 2: Banner Image Upload */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Banner Graphic / Creative</h3>
                <p className="text-xs text-muted-foreground">
                  Upload a festival artwork, promotion banner, or product photo. Recommended aspect: ~4:3 or ~16:9.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetToDefaultImage}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition"
                title="Restore default Ganesh Chaturthi graphic"
              >
                <RotateCcw className="size-3" />
                <span>Reset to Default</span>
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-slate-950">
              <Image
                src={settings.imageUrl}
                alt="Popup banner preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 text-[11px] text-white/80 font-mono truncate max-w-[85%]">
                {settings.imageUrl}
              </div>
            </div>

            {/* Upload Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-xs font-semibold text-background hover:bg-foreground/90 transition active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="size-3.5" />
                    <span>Upload New Image</span>
                  </>
                )}
              </button>

              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Or enter image URL..."
                  value={settings.imageUrl}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Offer Text & Messaging */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Offer Messaging & Copy</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Badge / Eyebrow Tagline
                </label>
                <input
                  type="text"
                  value={settings.badgeTitle}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, badgeTitle: e.target.value }))
                  }
                  placeholder="e.g. GANESH CHATURTHI SPECIAL"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={settings.heading}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, heading: e.target.value }))
                  }
                  placeholder="e.g. BRING HOME MORE JOY"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Offer Highlight / Discount Callout
                </label>
                <input
                  type="text"
                  value={settings.offerText}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, offerText: e.target.value }))
                  }
                  placeholder="e.g. GET 5% OFF or FLAT ₹1000 OFF"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-semibold text-orange-600 placeholder:text-muted-foreground outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={settings.subtext}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, subtext: e.target.value }))
                  }
                  placeholder="e.g. Sign up and receive your festive offer by email."
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Unlock Button Text
                </label>
                <input
                  type="text"
                  value={settings.buttonText}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, buttonText: e.target.value }))
                  }
                  placeholder="e.g. UNLOCK MY 5% OFF"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Coupon Code */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Discount Coupon Code</h3>
                <p className="text-xs text-muted-foreground">
                  The coupon code revealed to customers upon submitting their email.
                </p>
              </div>
              <Link
                href="/dashboard/discounts"
                className="text-xs font-medium text-orange-600 hover:underline"
              >
                Discounts Manager →
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={settings.discountCode}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      discountCode: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. GANESH5"
                  className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs font-mono font-bold uppercase tracking-wider text-foreground placeholder:text-muted-foreground outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Storefront Preview (6 cols) */}
        <div className="space-y-4 lg:col-span-6">
          <div className="sticky top-6 space-y-3">
            {/* Preview Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 shadow-xs">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground pl-1">
                  Live Preview
                </span>
                <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                  REAL-TIME
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* State toggle: Form vs Success */}
                <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("form")}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                      previewTab === "form"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Form View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("success")}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                      previewTab === "success"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Success View
                  </button>
                </div>

                {/* Device switch: Desktop vs Mobile */}
                <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`rounded-md p-1.5 transition cursor-pointer ${
                      previewDevice === "desktop"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`rounded-md p-1.5 transition cursor-pointer ${
                      previewDevice === "mobile"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Viewport Container */}
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-border bg-stone-950/95 p-4 sm:p-6 shadow-inner">
              <div
                className={`w-full transition-all duration-300 ${
                  previewDevice === "mobile" ? "max-w-[340px]" : "max-w-[580px]"
                }`}
              >
                {/* Simulated Modal Card */}
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-700/70 bg-[#0c1017] shadow-[0_25px_90px_rgba(0,0,0,0.95),0_0_50px_rgba(240,80,26,0.12)]">
                  {/* Close button mock */}
                  <div className="absolute top-2.5 right-2.5 z-30 flex size-7 items-center justify-center rounded-full bg-slate-950/90 text-white border-2 border-white/90 shadow-md">
                    <X className="size-3.5 stroke-[2.5]" />
                  </div>

                  {previewDevice === "desktop" ? (
                    isDefaultPreset ? (
                      /* Desktop Default Preset Artwork */
                      <div className="relative w-full aspect-[770/588]">
                        <Image
                          src={settings.imageUrl}
                          alt="Ganesh Chaturthi Special"
                          fill
                          className="object-cover"
                          sizes="580px"
                        />

                        <div className="absolute top-[66.3%] left-[55.8%] w-[37.2%] z-20">
                          {previewTab === "form" ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="email"
                                placeholder="Enter Your Email Address"
                                value={previewEmail}
                                onChange={(e) => setPreviewEmail(e.target.value)}
                                className="w-full h-8 rounded-full bg-[#141923]/95 border border-[#0a7ae6]/70 px-3 text-[10px] text-white placeholder:text-slate-400 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewTab("success")}
                                className="w-full h-8 rounded-full bg-[#0a7ae6] hover:bg-[#0866c2] text-[10px] font-bold uppercase tracking-wider text-white shadow-md transition cursor-pointer flex items-center justify-center gap-1"
                              >
                                <span>{settings.buttonText || "UNLOCK MY 5% OFF"}</span>
                              </button>
                            </div>
                          ) : (
                            <div className="rounded-xl bg-[#0f141d]/98 border border-[#0a7ae6]/60 p-2 text-center shadow-xl">
                              <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-sky-300 uppercase tracking-widest">
                                <Sparkles className="size-2.5 text-[#0a7ae6]" />
                                <span>Offer Unlocked</span>
                              </div>
                              <div className="mt-1 flex items-center justify-between rounded-lg bg-[#181f2c] border border-slate-700/80 px-2 py-1">
                                <span className="font-mono font-bold text-white text-[11px] tracking-wider">
                                  {settings.discountCode}
                                </span>
                                <span className="rounded bg-[#0a7ae6] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                                  Copy
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Desktop Split Layout (Custom Banner / Custom Copy) */
                      <div className="grid grid-cols-12 min-h-[320px] bg-[#0c1017]">
                        <div className="col-span-5 relative min-h-[320px] border-r border-slate-800">
                          <Image
                            src={settings.imageUrl}
                            alt="Custom Banner"
                            fill
                            className="object-cover"
                            sizes="280px"
                          />
                        </div>

                        <div className="col-span-7 flex flex-col justify-center p-5 space-y-3 bg-[#0c1017]">
                          <div className="space-y-1">
                            {settings.badgeTitle && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[9px] font-bold uppercase font-serif">
                                <Sparkles className="size-2.5 text-amber-400" />
                                <span>{settings.badgeTitle}</span>
                              </div>
                            )}
                            <h4 className="text-base font-extrabold font-serif text-white tracking-tight leading-tight">
                              {settings.heading}
                            </h4>
                            <div className="text-xl font-black text-[#f0501a] tracking-tight">
                              {settings.offerText}
                            </div>
                            {settings.subtext && (
                              <p className="text-[11px] text-slate-300 leading-tight">
                                {settings.subtext}
                              </p>
                            )}
                          </div>

                          {previewTab === "form" ? (
                            <div className="space-y-2 pt-1">
                              <input
                                type="email"
                                placeholder="Enter Your Email Address"
                                value={previewEmail}
                                onChange={(e) => setPreviewEmail(e.target.value)}
                                className="w-full h-8 rounded-full bg-[#141923]/95 border border-[#0a7ae6]/70 px-3 text-[10px] text-white placeholder:text-slate-400 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewTab("success")}
                                className="w-full h-8 rounded-full bg-[#0a7ae6] hover:bg-[#0866c2] text-[10px] font-bold uppercase tracking-wider text-white shadow-md transition cursor-pointer flex items-center justify-center gap-1"
                              >
                                <span>{settings.buttonText || "UNLOCK MY OFFER"}</span>
                              </button>
                            </div>
                          ) : (
                            <div className="rounded-xl bg-[#0f141d] border border-[#0a7ae6]/60 p-3 text-center space-y-1.5 shadow-xl">
                              <p className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">
                                ✨ Offer Unlocked!
                              </p>
                              <div className="flex items-center justify-between rounded-lg bg-[#181f2c] border border-slate-700/80 px-2.5 py-1">
                                <span className="font-mono font-bold text-white text-xs tracking-wider">
                                  {settings.discountCode}
                                </span>
                                <span className="rounded bg-[#0a7ae6] px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                                  Copy
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    /* Mobile Stacked Preview */
                    <div className="flex flex-col bg-[#0c1017] text-white">
                      <div className="relative h-[150px] w-full overflow-hidden bg-gradient-to-b from-[#080c14] to-[#0c1017]">
                        <Image
                          src={settings.imageUrl}
                          alt="Mobile Banner"
                          fill
                          className="object-cover object-left"
                          sizes="340px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-[#0c1017]/40 to-transparent" />
                      </div>

                      <div className="p-4 pt-1 text-center space-y-2.5">
                        <div className="space-y-0.5">
                          {settings.badgeTitle && (
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300 font-serif">
                              {settings.badgeTitle}
                            </p>
                          )}
                          <h4 className="text-base font-extrabold font-serif text-white">
                            {settings.heading}
                          </h4>
                          <div className="text-xl font-black text-[#f0501a]">
                            {settings.offerText}
                          </div>
                          {settings.subtext && (
                            <p className="text-[10px] text-stone-300">
                              {settings.subtext}
                            </p>
                          )}
                        </div>

                        {previewTab === "form" ? (
                          <div className="space-y-2 pt-1">
                            <input
                              type="email"
                              placeholder="Enter Your Email Address"
                              value={previewEmail}
                              onChange={(e) => setPreviewEmail(e.target.value)}
                              className="w-full h-8 rounded-full bg-[#141923]/95 border border-[#0a7ae6]/70 px-3 text-[10px] text-white text-center outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setPreviewTab("success")}
                              className="w-full h-8 rounded-full bg-[#0a7ae6] text-[10px] font-bold uppercase tracking-wider text-white shadow-md flex items-center justify-center gap-1"
                            >
                              <span>{settings.buttonText || "UNLOCK MY OFFER"}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-xl bg-[#0f141d] border border-[#0a7ae6]/60 p-2.5 text-center space-y-1.5">
                            <p className="text-[10px] font-bold text-sky-300 uppercase">
                              ✨ Offer Unlocked!
                            </p>
                            <div className="flex items-center justify-between rounded-lg bg-[#181f2c] border border-slate-700/80 p-1.5">
                              <span className="font-mono font-bold text-white text-xs pl-1">
                                {settings.discountCode}
                              </span>
                              <span className="rounded bg-[#0a7ae6] px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                                Copy
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
