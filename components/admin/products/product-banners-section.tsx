"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Smartphone,
  Monitor,
  Video,
  Film,
  Play,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { uploadProductImage } from "@/lib/client/upload-product-image";
import {
  isYouTubeUrl,
  getYouTubeThumbnail,
  isVideoUrl,
  getBannerMediaType,
} from "@/lib/banner-media";

export type BannerItem = {
  id?: string;
  imageUrl: string;
  mobileImageUrl?: string | null;
  title?: string | null;
  sortOrder?: number;
};

interface ProductBannersSectionProps {
  banners: BannerItem[];
  onChange: (banners: BannerItem[]) => void;
}

export function ProductBannersSection({
  banners,
  onChange,
}: ProductBannersSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadIndex, setUploadIndex] = useState<number | null>(null);
  const [uploadType, setUploadType] = useState<"desktop" | "mobile">("desktop");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addBanner(imageUrl = "", title = "", mobileImageUrl = "") {
    onChange([
      ...banners,
      {
        imageUrl,
        title,
        mobileImageUrl,
        sortOrder: banners.length,
      },
    ]);
  }

  function updateBanner(
    index: number,
    field: keyof BannerItem,
    value: any
  ) {
    const updated = [...banners];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  function removeBanner(index: number) {
    onChange(banners.filter((_, i) => i !== index));
  }

  function moveBanner(fromIdx: number, toIdx: number) {
    if (toIdx < 0 || toIdx >= banners.length) return;
    const updated = [...banners];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    onChange(updated.map((b, i) => ({ ...b, sortOrder: i })));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      if (uploadIndex !== null && uploadIndex < banners.length) {
        // Replacing single banner desktop/mobile
        const file = files[0];
        const res = await uploadProductImage(file);
        if (uploadType === "mobile") {
          updateBanner(uploadIndex, "mobileImageUrl", res.url);
        } else {
          updateBanner(uploadIndex, "imageUrl", res.url);
        }
      } else {
        // Adding new banner(s) in cascade
        const uploadPromises = files.map(async (file, idx) => {
          const res = await uploadProductImage(file);
          return {
            imageUrl: res.url,
            title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "),
            sortOrder: banners.length + idx,
          } as BannerItem;
        });

        const newBanners = await Promise.all(uploadPromises);
        onChange([...banners, ...newBanners]);
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload media file(s).");
    } finally {
      setIsUploading(false);
      setUploadIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function triggerUpload(index: number | null, type: "desktop" | "mobile" = "desktop") {
    setUploadIndex(index);
    setUploadType(type);
    fileInputRef.current?.click();
  }

  return (
    <div className="space-y-4">
      {/* Hidden file input supporting both images and videos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple={uploadIndex === null}
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-black/80 flex items-center gap-1.5">
            <ImageIcon className="size-4 text-[#0a7ae6]" />
            Product Showcase & Marketing Banners ({banners.length})
          </h3>
          <p className="text-xs text-black/50">
            Full-width promotional graphics, MP4 videos, or YouTube showcases displayed on the product page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => triggerUpload(null, "desktop")}
            disabled={isUploading}
            className="flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-black/80 transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isUploading && uploadIndex === null ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            Upload Banner (Image / Video)
          </button>
          <button
            type="button"
            onClick={() => addBanner()}
            className="flex items-center gap-1 rounded-lg border border-black/20 bg-white px-2.5 py-1.5 text-xs font-medium text-black/70 hover:bg-black/5 transition cursor-pointer"
          >
            <Plus className="size-3.5" />
            Add Slide
          </button>
        </div>
      </div>

      {banners.length === 0 ? (
        <div
          onClick={() => triggerUpload(null, "desktop")}
          className="rounded-xl border-2 border-dashed border-black/15 bg-black/[0.01] p-8 text-center hover:bg-black/[0.03] transition cursor-pointer space-y-2"
        >
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#0a7ae6]/10 text-[#0a7ae6]">
            {isUploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <Upload className="size-6" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-black/80">
              Click to upload product showcase banners
            </p>
            <p className="text-xs text-black/50 max-w-sm mx-auto">
              Upload landscape banners (1920x800 or 16:9), MP4 videos, or paste YouTube links to showcase features, specs, and demos.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => {
            const desktopMediaType = getBannerMediaType(banner.imageUrl);
            const mobileMediaType = getBannerMediaType(banner.mobileImageUrl);

            return (
              <div
                key={`banner-row-${index}`}
                className="rounded-xl border border-black/15 bg-white p-4 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5.5 items-center justify-center rounded-md bg-black text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-black/80">
                      Showcase Banner #{index + 1} {banner.title ? `— ${banner.title}` : ""}
                    </span>
                    {desktopMediaType === "youtube" && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                        YouTube
                      </span>
                    )}
                    {desktopMediaType === "video" && (
                      <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
                        MP4 Video
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBanner(index, index - 1)}
                      disabled={index === 0}
                      title="Move Up"
                      className="p-1 rounded hover:bg-black/5 text-black/50 hover:text-black disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBanner(index, index + 1)}
                      disabled={index === banners.length - 1}
                      title="Move Down"
                      className="p-1 rounded hover:bg-black/5 text-black/50 hover:text-black disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBanner(index)}
                      title="Delete Banner"
                      className="p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-700 cursor-pointer ml-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Caption */}
                <div>
                  <label className="block text-[11px] font-semibold text-black/70 mb-1">
                    Banner Caption / Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={banner.title || ""}
                    onChange={(e) => updateBanner(index, "title", e.target.value)}
                    placeholder="e.g. Cinema-Grade Contrast. Any Screen Size."
                    className="h-8 w-full rounded-md border border-black/20 bg-white px-2.5 text-xs text-black/90 outline-none focus:border-black/50"
                  />
                </div>

                {/* Dual Desktop + Mobile Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Desktop Version */}
                  <div className="rounded-lg border border-black/10 bg-slate-50/50 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-black/80">
                        <Monitor className="size-3.5 text-[#0a7ae6]" />
                        Desktop Banner (16:9 / 21:9)
                      </span>
                      <div className="flex items-center gap-1.5">
                        {banner.imageUrl ? (
                          <button
                            type="button"
                            onClick={() => updateBanner(index, "imageUrl", "")}
                            className="text-[10px] text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => triggerUpload(index, "desktop")}
                          disabled={isUploading}
                          className="inline-flex items-center gap-1 rounded bg-black px-2.5 py-1 text-[11px] font-medium text-white hover:bg-black/80 cursor-pointer"
                        >
                          <Upload className="size-3" />
                          {banner.imageUrl ? "Change File" : "Upload File"}
                        </button>
                      </div>
                    </div>

                    {/* Preview Screen */}
                    <div
                      onClick={() => !banner.imageUrl && triggerUpload(index, "desktop")}
                      className="relative aspect-21/9 w-full overflow-hidden rounded-md border border-black/10 bg-black flex items-center justify-center cursor-pointer group"
                    >
                      {desktopMediaType === "youtube" ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          <img
                            src={getYouTubeThumbnail(banner.imageUrl) || "/creator-projector.png"}
                            alt={banner.title || `Desktop Banner ${index + 1}`}
                            className="w-full h-full object-cover opacity-85"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex size-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                              <Play className="size-5 fill-white ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-red-400 flex items-center gap-1 backdrop-blur-xs">
                            <Video className="size-3 text-red-500" /> YouTube
                          </div>
                        </div>
                      ) : desktopMediaType === "video" ? (
                        <div className="relative w-full h-full bg-black">
                          <video
                            src={banner.imageUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-sky-400 flex items-center gap-1 backdrop-blur-xs">
                            <Film className="size-3 text-sky-400" /> Video MP4
                          </div>
                        </div>
                      ) : banner.imageUrl ? (
                        <div className="relative w-full h-full">
                          <img
                            src={banner.imageUrl}
                            alt={banner.title || `Desktop Banner ${index + 1}`}
                            className="w-full h-full object-cover block"
                          />
                          <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1 backdrop-blur-xs">
                            <ImageIcon className="size-3 text-emerald-400" /> Image
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-3 text-white/50 group-hover:text-white/80 transition">
                          <div className="flex items-center justify-center gap-1.5 mb-1 opacity-60">
                            <ImageIcon className="size-5" />
                            <Video className="size-5 text-[#0a7ae6]" />
                          </div>
                          <span className="text-[11px] font-medium block">Click to upload image or video</span>
                          <span className="text-[10px] opacity-60 block">or paste link below</span>
                        </div>
                      )}
                    </div>

                    {/* URL Input (Paste YouTube or MP4 Link or Image URL) */}
                    <div className="space-y-1 pt-0.5">
                      <label className="flex items-center gap-1 text-[11px] font-medium text-black/65">
                        <LinkIcon className="size-3 text-black/50" />
                        <span>Or Paste Video / YouTube / Image URL:</span>
                      </label>
                      <input
                        type="text"
                        value={banner.imageUrl || ""}
                        onChange={(e) => updateBanner(index, "imageUrl", e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or .mp4 link"
                        className="h-8 w-full rounded-md border border-black/15 bg-white px-2.5 text-xs text-black placeholder:text-black/35 outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  {/* Mobile Version */}
                  <div className="rounded-lg border border-black/10 bg-slate-50/50 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-black/80">
                        <Smartphone className="size-3.5 text-emerald-600" />
                        Mobile Banner (Portrait / 1080x1350)
                      </span>
                      <div className="flex items-center gap-1.5">
                        {banner.mobileImageUrl ? (
                          <button
                            type="button"
                            onClick={() => updateBanner(index, "mobileImageUrl", null)}
                            className="text-[10px] text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => triggerUpload(index, "mobile")}
                          disabled={isUploading}
                          className="inline-flex items-center gap-1 rounded bg-black px-2.5 py-1 text-[11px] font-medium text-white hover:bg-black/80 cursor-pointer"
                        >
                          <Upload className="size-3" />
                          {banner.mobileImageUrl ? "Change File" : "Upload Mobile"}
                        </button>
                      </div>
                    </div>

                    {/* Mobile Preview Screen */}
                    <div
                      onClick={() => !banner.mobileImageUrl && triggerUpload(index, "mobile")}
                      className="relative aspect-21/9 md:aspect-21/9 w-full overflow-hidden rounded-md border border-black/10 bg-black flex items-center justify-center cursor-pointer group"
                    >
                      {mobileMediaType === "youtube" ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          <img
                            src={getYouTubeThumbnail(banner.mobileImageUrl) || "/creator-projector.png"}
                            alt={banner.title || `Mobile Banner ${index + 1}`}
                            className="w-full h-full object-cover opacity-85"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex size-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                              <Play className="size-5 fill-white ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-red-400 flex items-center gap-1 backdrop-blur-xs">
                            <Video className="size-3 text-red-500" /> YouTube
                          </div>
                        </div>
                      ) : mobileMediaType === "video" ? (
                        <div className="relative w-full h-full bg-black">
                          <video
                            src={banner.mobileImageUrl || ""}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-sky-400 flex items-center gap-1 backdrop-blur-xs">
                            <Film className="size-3 text-sky-400" /> Video MP4
                          </div>
                        </div>
                      ) : banner.mobileImageUrl ? (
                        <div className="relative w-full h-full">
                          <img
                            src={banner.mobileImageUrl}
                            alt={banner.title || `Mobile Banner ${index + 1}`}
                            className="w-full h-full object-contain block"
                          />
                          <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1 backdrop-blur-xs">
                            <ImageIcon className="size-3 text-emerald-400" /> Image
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-3 text-white/50 group-hover:text-white/80 transition">
                          <div className="flex items-center justify-center gap-1.5 mb-1 opacity-60">
                            <Smartphone className="size-5" />
                            <Video className="size-5 text-emerald-500" />
                          </div>
                          <span className="text-[11px] font-medium block">Click to upload optional mobile media</span>
                          <span className="text-[10px] opacity-60 block">or paste link below</span>
                        </div>
                      )}
                    </div>

                    {/* Mobile URL Input */}
                    <div className="space-y-1 pt-0.5">
                      <label className="flex items-center gap-1 text-[11px] font-medium text-black/65">
                        <LinkIcon className="size-3 text-black/50" />
                        <span>Or Paste Mobile Video / YouTube / Image URL:</span>
                      </label>
                      <input
                        type="text"
                        value={banner.mobileImageUrl || ""}
                        onChange={(e) => updateBanner(index, "mobileImageUrl", e.target.value)}
                        placeholder="Optional mobile media URL (YouTube, MP4, or Image)"
                        className="h-8 w-full rounded-md border border-black/15 bg-white px-2.5 text-xs text-black placeholder:text-black/35 outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => triggerUpload(null, "desktop")}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-black/25 py-3 text-xs font-semibold text-black/70 hover:border-black/50 hover:bg-black/[0.02] transition cursor-pointer"
          >
            <Plus className="size-4" />
            Add Another Showcase Banner
          </button>
        </div>
      )}
    </div>
  );
}
