"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  PlusIcon,
  Trash2Icon,
  PencilIcon,
  EyeIcon,
  EyeOffIcon,
  UploadIcon,
  Loader2Icon,
  XIcon,
  VideoIcon,
  ExternalLinkIcon,
  SearchIcon,
  CheckIcon,
} from "lucide-react"
import { toast } from "sonner"
import type { CreatorVideoItem } from "@/lib/server/controllers/creator-videos.controller"
import { uploadProductImage } from "@/lib/client/upload-product-image"

export function extractYouTubeThumbnail(url: string): string {
  if (!url) return url;
  const trimmed = url.trim();
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return trimmed;
}

type ProductOption = {
  id: string
  name: string
  slug: string
  mainImage: string
  price?: string
  category?: string
}

function ProductSelectPicker({
  products,
  selectedId,
  onSelect,
}: {
  products: ProductOption[]
  selectedId: string
  onSelect: (productId: string) => void
}) {
  const [isSelecting, setIsSelecting] = useState(false)
  const [search, setSearch] = useState("")

  const selectedProduct = products.find((p) => p.id === selectedId)

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  )

  if (!isSelecting && selectedProduct) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-black/15 bg-slate-50 p-2.5 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-black/10">
            <Image
              src={selectedProduct.mainImage}
              alt={selectedProduct.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-black truncate text-xs">{selectedProduct.name}</p>
            <div className="flex items-center gap-2 text-[10px] text-black/50 mt-0.5">
              {selectedProduct.price && <span>₹{selectedProduct.price}</span>}
              {selectedProduct.category && <span>• {selectedProduct.category}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button
            type="button"
            onClick={() => setIsSelecting(true)}
            className="px-2.5 py-1 text-[11px] font-semibold text-black bg-white border border-black/15 rounded-lg hover:bg-black hover:text-white transition cursor-pointer"
          >
            Change
          </button>
          <button
            type="button"
            onClick={() => onSelect("")}
            className="p-1 text-black/40 hover:text-rose-600 transition cursor-pointer"
            title="Remove product link"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (!isSelecting && !selectedProduct) {
    return (
      <button
        type="button"
        onClick={() => setIsSelecting(true)}
        className="w-full flex items-center justify-between rounded-xl border border-dashed border-black/25 bg-slate-50/50 p-3 text-xs text-black/60 hover:text-black hover:border-black hover:bg-slate-100/50 transition cursor-pointer"
      >
        <div className="flex items-center gap-2 font-semibold">
          <PlusIcon className="w-4 h-4 text-black/40" />
          <span>Link a Product to this Video</span>
        </div>
        <span className="text-[10px] text-black/40 bg-white px-2 py-0.5 rounded-md border border-black/10">Optional</span>
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-black/15 bg-white p-3 space-y-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-2">
        <span className="font-semibold text-black text-xs">Select Product to Link</span>
        <button
          type="button"
          onClick={() => setIsSelecting(false)}
          className="text-black/40 hover:text-black text-[11px] font-medium cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-black/40" />
        <input
          type="text"
          autoFocus
          placeholder="Search products by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-black/15 bg-slate-50 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-black focus:bg-white transition"
        />
      </div>

      {/* Scrollable Product List */}
      <div
        onWheel={(e) => e.stopPropagation()}
        onScroll={(e) => e.stopPropagation()}
        className="overflow-y-auto max-h-48 space-y-1 pr-1 divide-y divide-black/5 touch-pan-y overscroll-contain"
      >
        <button
          type="button"
          onClick={() => {
            onSelect("")
            setIsSelecting(false)
          }}
          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
            !selectedId ? "bg-black/5 font-semibold text-black" : "text-black/60 hover:bg-slate-50"
          }`}
        >
          <span>No product linked</span>
          {!selectedId && <CheckIcon className="w-4 h-4 text-black shrink-0" />}
        </button>

        {filteredProducts.map((p) => {
          const isSelected = p.id === selectedId
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onSelect(p.id)
                setIsSelecting(false)
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-lg text-xs transition text-left cursor-pointer ${
                isSelected ? "bg-black text-white" : "hover:bg-slate-100 text-black"
              }`}
            >
              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-black/10">
                <Image src={p.mainImage} alt={p.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate leading-tight">{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {p.price && (
                    <span className={isSelected ? "text-white/80 text-[10px]" : "text-black/60 text-[10px]"}>
                      ₹{p.price}
                    </span>
                  )}
                  {p.category && (
                    <span className={isSelected ? "text-white/60 text-[10px]" : "text-black/40 text-[10px]"}>
                      • {p.category}
                    </span>
                  )}
                </div>
              </div>
              {isSelected && <CheckIcon className="w-4 h-4 text-white shrink-0" />}
            </button>
          )
        })}

        {filteredProducts.length === 0 && (
          <div className="py-4 text-center text-xs text-black/40">No matching products found</div>
        )}
      </div>
    </div>
  )
}

export function CreatorVideoManager({
  initialVideos,
}: {
  initialVideos: CreatorVideoItem[]
}) {
  const router = useRouter()
  const [videos, setVideos] = useState<CreatorVideoItem[]>(initialVideos || [])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<CreatorVideoItem | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Sync / fetch videos
  useEffect(() => {
    setVideos(initialVideos || [])
  }, [initialVideos])

  // Fetch product options for dropdown
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setProducts(
            json.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              mainImage: p.mainImage || "/category-smartphone.png",
              price: p.price,
              category: typeof p.category === "string" ? p.category : p.category?.title,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    thumbnailUrl: "",
    videoUrl: "",
    productId: "",
    sortOrder: 0,
    isActive: true,
  })

  function openAddModal() {
    setEditingVideo(null)
    setFormData({
      title: "",
      thumbnailUrl: "",
      videoUrl: "",
      productId: "",
      sortOrder: videos.length,
      isActive: true,
    })
    setIsModalOpen(true)
  }

  function openEditModal(item: CreatorVideoItem) {
    setEditingVideo(item)
    setFormData({
      title: item.title || "",
      thumbnailUrl: item.thumbnailUrl,
      videoUrl: item.videoUrl || "",
      productId: item.productId || "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    })
    setIsModalOpen(true)
  }

  async function handleToggleActive(item: CreatorVideoItem) {
    const newStatus = !item.isActive
    setVideos((prev) =>
      prev.map((v) => (v.id === item.id ? { ...v, isActive: newStatus } : v))
    )

    try {
      const res = await fetch(`/api/admin/creator-videos/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      toast.success(newStatus ? "Video enabled" : "Video disabled")
      router.refresh()
    } catch {
      toast.error("Failed to update video status")
      setVideos((prev) =>
        prev.map((v) => (v.id === item.id ? { ...v, isActive: item.isActive } : v))
      )
    }
  }

  async function handleDelete(id: string) {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/creator-videos/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete video")
      setVideos((prev) => prev.filter((v) => v.id !== id))
      toast.success("Creator video deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete creator video")
    } finally {
      setIsSubmitting(false)
      setDeleteTargetId(null)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const uploadedResult = await uploadProductImage(file)
      setFormData((prev) => ({ ...prev, thumbnailUrl: uploadedResult.url }))
      toast.success("Thumbnail uploaded")
    } catch {
      toast.error("Failed to upload thumbnail")
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.thumbnailUrl) {
      toast.error("Thumbnail image is required")
      return
    }

    const payload = {
      ...formData,
      thumbnailUrl: extractYouTubeThumbnail(formData.thumbnailUrl),
    }

    setIsSubmitting(true)
    try {
      if (editingVideo) {
        // Update
        const res = await fetch(`/api/admin/creator-videos/${editingVideo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || "Failed to update creator video")
        }
        const updated = await res.json()
        setVideos((prev) => prev.map((v) => (v.id === editingVideo.id ? updated : v)))
        toast.success("Creator video updated!")
      } else {
        // Create
        const res = await fetch("/api/admin/creator-videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || "Failed to create creator video")
        }
        const created = await res.json()
        setVideos((prev) => [...prev, created])
        toast.success("Creator video added successfully!")
      }
      setIsModalOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeCount = videos.filter((v) => v.isActive).length
  const totalCount = videos.length

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <VideoIcon className="w-4 h-4 text-white" />
            </div>
            Creator Videos
          </h1>
          <p className="text-xs text-black/50 mt-1.5 ml-[42px]">
            Videos shown on the homepage. Attach a product so clicking opens its page.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-black/80 shadow-xs cursor-pointer shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          Add Video
        </button>
      </div>

      {/* Stats Bar */}
      {totalCount > 0 && (
        <div className="flex items-center gap-6 px-4 py-3 rounded-xl bg-black/[0.03] border border-black/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-black/30" />
            <span className="text-[11px] font-medium text-black/60">
              {totalCount} video{totalCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium text-black/60">
              {activeCount} active
            </span>
          </div>
          {totalCount - activeCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[11px] font-medium text-black/60">
                {totalCount - activeCount} hidden
              </span>
            </div>
          )}
        </div>
      )}

      {/* Grid / Empty State */}
      {videos.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-black/10 rounded-2xl bg-black/[0.015]">
          <div className="w-14 h-14 rounded-2xl bg-black/[0.06] flex items-center justify-center mx-auto mb-4">
            <VideoIcon className="w-6 h-6 text-black/25" />
          </div>
          <h3 className="text-sm font-semibold text-black/70">No creator videos yet</h3>
          <p className="text-xs text-black/40 mt-1 max-w-xs mx-auto">
            Add YouTube or MP4 links to feature creator reviews and demos on your homepage.
          </p>
          <button
            onClick={openAddModal}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-black/80 transition cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            Add First Video
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((vid, idx) => (
            <div
              key={vid.id}
              className={`group relative flex items-center gap-4 bg-white border rounded-xl p-3 transition-all duration-200 hover:shadow-md ${
                !vid.isActive ? "opacity-60 border-dashed border-black/15" : "border-black/[0.08] hover:border-black/15"
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-28 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                <Image
                  src={extractYouTubeThumbnail(vid.thumbnailUrl)}
                  alt={vid.title || "Creator Video"}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <VideoIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                {/* Sort order badge */}
                <div className="absolute top-1.5 left-1.5">
                  <span className="bg-black/60 backdrop-blur text-white text-[9px] font-bold w-5 h-5 rounded-md flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-black truncate">
                    {vid.title || "Untitled Video"}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      vid.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${vid.isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {vid.isActive ? "Active" : "Hidden"}
                  </span>
                </div>

                {/* Video URL preview */}
                {vid.videoUrl && (
                  <p className="text-[11px] text-black/40 truncate max-w-md mb-2">
                    {vid.videoUrl}
                  </p>
                )}

                {/* Linked Product */}
                {vid.product ? (
                  <div className="inline-flex items-center gap-2 bg-black/[0.04] rounded-lg px-2.5 py-1.5">
                    <div className="relative w-6 h-6 rounded overflow-hidden bg-white shrink-0 border border-black/10">
                      <Image
                        src={vid.product.mainImage}
                        alt={vid.product.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-black/70 truncate max-w-[200px]">
                      {vid.product.name}
                    </span>
                    <Link
                      href={`/product/${vid.product.slug}`}
                      target="_blank"
                      className="text-black/40 hover:text-black transition shrink-0"
                    >
                      <ExternalLinkIcon className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <span className="text-[10px] text-black/30 italic">No product linked</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggleActive(vid)}
                  className={`p-2 rounded-lg transition cursor-pointer ${
                    vid.isActive
                      ? "text-black/40 hover:text-amber-600 hover:bg-amber-50"
                      : "text-black/40 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                  title={vid.isActive ? "Hide from homepage" : "Show on homepage"}
                >
                  {vid.isActive ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEditModal(vid)}
                  className="p-2 rounded-lg text-black/40 hover:text-black hover:bg-black/5 transition cursor-pointer"
                  title="Edit video"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTargetId(vid.id)}
                  className="p-2 rounded-lg text-black/40 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Delete video"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
                  <VideoIcon className="w-3.5 h-3.5 text-white" />
                </div>
                {editingVideo ? "Edit Video" : "Add Video"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-black/40 hover:text-black p-1.5 rounded-lg hover:bg-black/5 transition cursor-pointer"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-semibold text-black/70 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Earbuds Unboxing & Review"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-black/15 bg-black/[0.02] px-3 py-2.5 text-xs outline-none focus:border-black/40 focus:bg-white transition"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block font-semibold text-black/70 mb-1.5">
                  Video URL
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... or .mp4 link"
                  value={formData.videoUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoThumb = !formData.thumbnailUrl ? extractYouTubeThumbnail(val) : formData.thumbnailUrl;
                    setFormData({
                      ...formData,
                      videoUrl: val,
                      thumbnailUrl: autoThumb,
                    });
                  }}
                  className="w-full rounded-lg border border-black/15 bg-black/[0.02] px-3 py-2.5 text-xs outline-none focus:border-black/40 focus:bg-white transition"
                />
                <p className="mt-1.5 text-[10px] text-black/40">
                  YouTube links auto-generate the thumbnail.
                </p>
              </div>

              {/* Thumbnail Image URL / Upload */}
              <div>
                <label className="block font-semibold text-black/70 mb-1.5">
                  Thumbnail <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Image URL or upload →"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    className="flex-1 rounded-lg border border-black/15 bg-black/[0.02] px-3 py-2.5 text-xs outline-none focus:border-black/40 focus:bg-white transition"
                  />
                  <label className="inline-flex items-center gap-1.5 rounded-lg border border-black/15 bg-black/[0.03] px-3 py-2.5 font-semibold text-black/70 hover:bg-black/[0.06] transition cursor-pointer">
                    {isUploading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.thumbnailUrl && (
                  <div className="mt-2.5 relative h-32 w-20 rounded-lg overflow-hidden border border-black/10 bg-slate-900">
                    <Image
                      src={extractYouTubeThumbnail(formData.thumbnailUrl)}
                      alt="Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Product Select */}
              <div>
                <label className="block font-semibold text-black/70 mb-1.5">
                  Link Product
                </label>
                <ProductSelectPicker
                  products={products}
                  selectedId={formData.productId}
                  onSelect={(id) => setFormData({ ...formData, productId: id })}
                />
                <p className="mt-1.5 text-[10px] text-black/40">
                  Clicking the video on homepage will open this product page.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-black/15 px-4 py-2.5 text-xs font-semibold text-black/70 hover:bg-black/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-black/80 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2Icon className="w-4 h-4 animate-spin" />}
                  {editingVideo ? "Save Changes" : "Create Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-1">
              <Trash2Icon className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-base font-bold text-black">Delete this video?</h3>
            <p className="text-xs text-black/50">
              This video will be permanently removed from your homepage. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="rounded-lg border border-black/15 px-4 py-2.5 text-xs font-semibold text-black/70 hover:bg-black/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTargetId)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting && <Loader2Icon className="w-4 h-4 animate-spin" />}
                Delete Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
