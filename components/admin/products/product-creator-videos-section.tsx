"use client";

import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Video,
} from "lucide-react";

export type ProductCreatorVideoItem = {
  id?: string;
  title?: string | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

interface ProductCreatorVideosSectionProps {
  videos: ProductCreatorVideoItem[];
  onChange: (videos: ProductCreatorVideoItem[]) => void;
}

export function ProductCreatorVideosSection({
  videos,
  onChange,
}: ProductCreatorVideosSectionProps) {
  function addVideo(videoUrl = "") {
    onChange([
      ...videos,
      {
        videoUrl,
        thumbnailUrl: "/creator-projector.png",
        sortOrder: videos.length,
        isActive: true,
      },
    ]);
  }

  function updateVideoUrl(index: number, videoUrl: string) {
    const updated = [...videos];
    updated[index] = { ...updated[index], videoUrl };
    onChange(updated);
  }

  function removeVideo(index: number) {
    onChange(videos.filter((_, i) => i !== index));
  }

  function moveVideo(fromIdx: number, toIdx: number) {
    if (toIdx < 0 || toIdx >= videos.length) return;
    const updated = [...videos];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    onChange(updated.map((v, i) => ({ ...v, sortOrder: i })));
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-black/10">
        <p className="text-xs text-black/60">
          Add video URLs (YouTube links or direct MP4 streams) to autoplay after banners.
        </p>

        <button
          type="button"
          onClick={() => addVideo()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/80 transition cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>Add Video</span>
        </button>
      </div>

      {/* Video Cards List */}
      {videos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/15 bg-black/[0.02] p-6 text-center">
          <div className="mx-auto mb-2 flex size-9 items-center justify-center rounded-full bg-black/5 text-black/60">
            <Video className="size-4" />
          </div>
          <p className="text-xs font-semibold text-black/80">
            No Videos Added Yet
          </p>
          <p className="text-[11px] text-black/50 mt-0.5 max-w-sm mx-auto">
            Paste video links to showcase hands-on creator / feature videos.
          </p>
          <button
            type="button"
            onClick={() => addVideo()}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-black/80 transition cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add Video</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {videos.map((vid, idx) => (
            <div
              key={vid.id || `creator-vid-${idx}`}
              className="group flex items-center gap-2.5 rounded-lg border border-black/10 bg-white p-2 shadow-2xs hover:border-black/25 transition"
            >
              {/* Video Badge */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/[0.04] text-[11px] font-semibold text-black/70 shrink-0 select-none">
                <Video className="size-3.5 text-black/50" />
                <span>Video {idx + 1}</span>
              </div>

              {/* Video URL Input */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={vid.videoUrl || ""}
                  onChange={(e) => updateVideoUrl(idx, e.target.value)}
                  placeholder="Paste Video URL (e.g. https://www.youtube.com/watch?v=... or .mp4 link)"
                  className="w-full h-8 rounded border border-black/20 bg-white px-2.5 text-xs text-black placeholder:text-black/40 focus:border-black focus:outline-none"
                />
              </div>

              {/* Actions (Reorder, Delete) */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => moveVideo(idx, idx - 1)}
                  disabled={idx === 0}
                  title="Move up"
                  className="p-1.5 rounded hover:bg-black/5 text-black/50 hover:text-black transition disabled:opacity-20 cursor-pointer"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveVideo(idx, idx + 1)}
                  disabled={idx === videos.length - 1}
                  title="Move down"
                  className="p-1.5 rounded hover:bg-black/5 text-black/50 hover:text-black transition disabled:opacity-20 cursor-pointer"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeVideo(idx)}
                  title="Delete video"
                  className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
