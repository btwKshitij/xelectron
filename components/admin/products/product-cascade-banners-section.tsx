"use client";

import { useState, useRef } from "react";
import {
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
  Layers,
  Image as ImageIcon,
  Loader2,
  Smartphone,
  Monitor,
  Video,
  Film,
  Play,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { uploadProductImage } from "@/lib/client/upload-product-image";
import { BannerItem } from "./product-banners-section";
import {
  isYouTubeUrl,
  getYouTubeThumbnail,
  isVideoUrl,
  getBannerMediaType,
} from "@/lib/banner-media";

interface ProductCascadeBannersSectionProps {
  banners: BannerItem[];
  onChange: (banners: BannerItem[]) => void;
  position?: string;
  onPositionChange?: (position: string) => void;
  showcaseCount?: number;
}

export function ProductCascadeBannersSection({
  banners,
  onChange,
  position = "after",
  onPositionChange,
  showcaseCount = 0,
}: ProductCascadeBannersSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadIndex, setUploadIndex] = useState<number | null>(null);
  const [uploadType, setUploadType] = useState<"desktop" | "mobile">("desktop");
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleRow(index: number) {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  }

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
      alert(err.message || "Failed to upload cascade media file(s).");
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
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-xs space-y-4">
      {/* Hidden file input supporting images and videos */}
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
            <Layers className="size-4 text-emerald-600" />
            Slider / Carousel Banners ({banners.length})
          </h3>
          <p className="text-xs text-black/50">
            Upload sliding banners or MP4/YouTube videos to display an interactive swipeable carousel on the product page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Simple Position Dropdown */}
          {onPositionChange && (
            <div className="flex items-center gap-1.5 text-xs text-black/70">
              <span className="font-medium">Position:</span>
              <select
                value={
                  position === "before" || position === "0"
                    ? "1"
                    : position === "after"
                    ? String(showcaseCount + 1)
                    : position
                }
                onChange={(e) => onPositionChange(e.target.value)}
                className="h-7.5 rounded-lg border border-black/20 bg-white px-2.5 font-semibold text-xs text-black outline-none cursor-pointer focus:border-black"
              >
                {Array.from({ length: showcaseCount + 1 }).map((_, idx) => (
                  <option key={`pos-num-${idx + 1}`} value={String(idx + 1)}>
                    {idx + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => triggerUpload(null, "desktop")}
            disabled={isUploading}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isUploading && uploadIndex === null ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            Upload Slider Banners (Image / Video)
          </button>
        </div>
      </div>

      {banners.length === 0 ? (
        <div
          onClick={() => triggerUpload(null, "desktop")}
          className="rounded-xl border-2 border-dashed border-emerald-500/25 bg-emerald-50/[0.15] p-6 text-center hover:bg-emerald-50/[0.3] transition cursor-pointer space-y-2"
        >
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-600">
            {isUploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Upload className="size-5" />
            )}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-black/80">
              Click to upload slider banners (Carousel)
            </p>
            <p className="text-[11px] text-black/50">
              Select images or videos, or paste YouTube links to create an interactive sliding carousel.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {banners.map((banner, index) => {
            const isDesktopYt = isYouTubeUrl(banner.imageUrl);
            const isDesktopVid = isVideoUrl(banner.imageUrl);
            const isMobileYt = isYouTubeUrl(banner.mobileImageUrl);
            const isMobileVid = isVideoUrl(banner.mobileImageUrl);
            const isExpanded = Boolean(expandedRows[index]);

            return (
              <div
                key={`cascade-banner-row-${index}`}
                className="rounded-xl border border-black/10 bg-slate-50/50 p-2.5 hover:bg-slate-50 transition shadow-2xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Slide Number, Desktop Thumbnail & Phone Thumbnail */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex size-6 items-center justify-center rounded-md bg-emerald-600 text-xs font-bold text-white shadow-xs">
                      {index + 1}
                    </span>

                    {/* Desktop Thumbnail */}
                    <div
                      onClick={() => triggerUpload(index, "desktop")}
                      className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-black/15 bg-slate-900 flex items-center justify-center cursor-pointer group shadow-2xs"
                      title="Desktop Media (Click to change file)"
                    >
                      {isDesktopYt ? (
                        <div className="relative w-full h-full bg-black">
                          <img
                            src={getYouTubeThumbnail(banner.imageUrl) || "/creator-projector.png"}
                            alt="YouTube"
                            className="h-full w-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="size-4 fill-red-600 text-red-600" />
                          </div>
                          <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-1 text-[8px] font-bold text-red-400">
                            YT
                          </span>
                        </div>
                      ) : isDesktopVid ? (
                        <div className="relative w-full h-full bg-black flex flex-col items-center justify-center text-sky-400">
                          <Film className="size-4 mb-0.5" />
                          <span className="text-[8px] font-bold">MP4</span>
                        </div>
                      ) : banner.imageUrl ? (
                        <img src={banner.imageUrl} alt="Desktop" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-white/50">
                          <Monitor className="size-3.5 mb-0.5" />
                          <span className="text-[9px] font-semibold">Desktop</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition">
                        <Monitor className="size-3 text-white mb-0.5" />
                        <span className="text-[9px] text-white font-medium">Change</span>
                      </div>
                    </div>

                    {/* Phone / Mobile Thumbnail */}
                    <div
                      onClick={() => triggerUpload(index, "mobile")}
                      className={`relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border flex items-center justify-center cursor-pointer group shadow-2xs transition ${
                        banner.mobileImageUrl
                          ? "border-emerald-500/40 bg-slate-900"
                          : "border-dashed border-black/25 bg-slate-50 hover:border-black/50"
                      }`}
                      title={banner.mobileImageUrl ? "Phone Media (Click to change file)" : "Click to upload phone media"}
                    >
                      {isMobileYt ? (
                        <div className="relative w-full h-full bg-black">
                          <img
                            src={getYouTubeThumbnail(banner.mobileImageUrl) || "/creator-projector.png"}
                            alt="YouTube"
                            className="h-full w-full object-cover opacity-80"
                          />
                          <Play className="size-3.5 fill-red-600 text-red-600 absolute inset-0 m-auto" />
                        </div>
                      ) : isMobileVid ? (
                        <div className="flex flex-col items-center justify-center text-sky-400">
                          <Film className="size-3" />
                          <span className="text-[7px] font-bold">MP4</span>
                        </div>
                      ) : banner.mobileImageUrl ? (
                        <img src={banner.mobileImageUrl} alt="Phone" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-black/40 group-hover:text-black/70">
                          <Smartphone className="size-3.5" />
                          <span className="text-[8px] font-bold mt-0.5">+ Phone</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition">
                        <Smartphone className="size-3 text-white mb-0.5" />
                        <span className="text-[8px] text-white font-medium">{banner.mobileImageUrl ? "Change" : "Upload"}</span>
                      </div>
                      {banner.mobileImageUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateBanner(index, "mobileImageUrl", null);
                          }}
                          className="absolute -top-1 -right-1 size-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs hover:bg-red-700 z-10"
                          title="Remove phone media"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title / Caption Input */}
                  <div className="flex-1 min-w-0 w-full">
                    <input
                      type="text"
                      value={banner.title || ""}
                      onChange={(e) => updateBanner(index, "title", e.target.value)}
                      placeholder="Optional slide title / caption..."
                      className="h-8 w-full rounded-md border border-black/15 bg-white px-2.5 text-xs text-black outline-none focus:border-black"
                    />
                  </div>

                  {/* Actions: Toggle URL input, Reorder & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleRow(index)}
                      className={`h-7 px-2 rounded flex items-center gap-1 text-[11px] font-medium transition cursor-pointer ${
                        isExpanded || isDesktopYt || isDesktopVid || isMobileYt || isMobileVid
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-black/5 text-black/70 hover:bg-black/10"
                      }`}
                      title="Toggle YouTube / Video URL input"
                    >
                      <LinkIcon className="size-3" />
                      <span>URL / Video</span>
                      {isExpanded ? (
                        <ChevronUp className="size-3" />
                      ) : (
                        <ChevronDown className="size-3" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => moveBanner(index, index - 1)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-black/5 text-black/50 hover:text-black disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBanner(index, index + 1)}
                      disabled={index === banners.length - 1}
                      className="p-1 rounded hover:bg-black/5 text-black/50 hover:text-black disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBanner(index)}
                      className="p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-700 cursor-pointer ml-0.5"
                      title="Delete Slide"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expandable URL Input Tray */}
                {isExpanded && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-black/5">
                    <div>
                      <label className="block text-[10px] font-semibold text-black/70 mb-0.5">
                        Desktop Media URL (YouTube, MP4 video, or Image link):
                      </label>
                      <input
                        type="text"
                        value={banner.imageUrl || ""}
                        onChange={(e) => updateBanner(index, "imageUrl", e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or .mp4 link"
                        className="h-7 w-full rounded border border-black/15 bg-white px-2 text-xs text-black outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-black/70 mb-0.5">
                        Phone Media URL (Optional):
                      </label>
                      <input
                        type="text"
                        value={banner.mobileImageUrl || ""}
                        onChange={(e) => updateBanner(index, "mobileImageUrl", e.target.value)}
                        placeholder="Optional phone video/YouTube or image URL"
                        className="h-7 w-full rounded border border-black/15 bg-white px-2 text-xs text-black outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => triggerUpload(null, "desktop")}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-emerald-500/30 py-2.5 text-xs font-semibold text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50/20 transition cursor-pointer"
          >
            <Upload className="size-3.5" />
            + Add Another Slide (Image / Video)
          </button>
        </div>
      )}
    </div>
  );
}
