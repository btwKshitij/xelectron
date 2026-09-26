"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  PlusIcon,
  Trash2Icon,
  PencilIcon,
  ImageIcon,
  EyeIcon,
  EyeOffIcon,
  UploadIcon,
  Loader2Icon,
  XIcon,
  RefreshCwIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  ExternalLinkIcon,
  SmartphoneIcon,
  MonitorIcon,
  LinkIcon,
  VideoIcon,
  FilmIcon,
  ClockIcon,
  Maximize2Icon,
  HardDriveIcon,
  PlayIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react"
import { toast } from "sonner"
import type { HeroBannerItem } from "@/lib/server/controllers/banners.controller"
import { uploadProductImage } from "@/lib/client/upload-product-image"
import { isYouTubeUrl, getYouTubeThumbnail } from "@/lib/banner-media"

type CategoryOption = { id: string; title: string; slug: string }

type MediaMeta = {
  fileSize?: string
  dimensions?: string
  duration?: string
  type?: "image" | "video"
  format?: string
}

export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false
  const clean = url.split("?")[0].toLowerCase()
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".m4v") ||
    clean.endsWith(".mkv") ||
    clean.endsWith(".avi") ||
    clean.startsWith("data:video") ||
    clean.startsWith("blob:") ||
    clean.includes("video") ||
    clean.includes(".mp4") ||
    clean.includes(".webm") ||
    clean.includes(".mov")
  )
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function BannerManager({ initialBanners }: { initialBanners: HeroBannerItem[] }) {
  const router = useRouter()
  const [banners, setBanners] = useState<HeroBannerItem[]>(initialBanners)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<HeroBannerItem | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false)
  const [uploadProgressDesktop, setUploadProgressDesktop] = useState<number | null>(null)
  const [isUploadingMobile, setIsUploadingMobile] = useState(false)
  const [uploadProgressMobile, setUploadProgressMobile] = useState<number | null>(null)
  const [desktopUploadPreview, setDesktopUploadPreview] = useState<{ url: string; isVideo: boolean } | null>(null)
  const [mobileUploadPreview, setMobileUploadPreview] = useState<{ url: string; isVideo: boolean } | null>(null)
  useEffect(() => () => {
    if (desktopUploadPreview) URL.revokeObjectURL(desktopUploadPreview.url)
  }, [desktopUploadPreview])
  useEffect(() => () => {
    if (mobileUploadPreview) URL.revokeObjectURL(mobileUploadPreview.url)
  }, [mobileUploadPreview])
  const [isDraggingDesktop, setIsDraggingDesktop] = useState(false)
  const [isDraggingMobile, setIsDraggingMobile] = useState(false)
  const [showDesktopUrlInput, setShowDesktopUrlInput] = useState(false)
  const [showMobileUrlInput, setShowMobileUrlInput] = useState(false)
  const [categories, setCategories] = useState<CategoryOption[]>([])

  // Media Inspection Metadata
  const [desktopMeta, setDesktopMeta] = useState<MediaMeta>({})
  const [mobileMeta, setMobileMeta] = useState<MediaMeta>({})

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const selectAllRef = useRef<HTMLInputElement>(null)

  const fetchFreshBanners = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/banners?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setBanners(data)
        }
      }
    } catch (err) {
      console.error("Failed to fetch fresh banners:", err)
      if (initialBanners && initialBanners.length > 0) {
        setBanners(initialBanners)
      }
    }
  }, [initialBanners])

  useEffect(() => {
    fetchFreshBanners()
  }, [fetchFreshBanners])

  async function handleClearServerCache() {
    setIsClearingCache(true)
    try {
      const res = await fetch(`/api/admin/clear-cache?t=${Date.now()}`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to clear server cache")
      await fetchFreshBanners()
      toast.success("Server cache cleared successfully!")
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || "Failed to clear cache")
    } finally {
      setIsClearingCache(false)
    }
  }

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data)
        }
      })
      .catch(() => {})
  }, [])

  // Filtered Banners
  const filteredBanners = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return banners.filter((banner) => {
      const matchesSearch =
        !query ||
        [
          banner.title,
          banner.category || "",
          banner.caption || "",
          banner.cta || "",
          banner.linkUrl || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)

      const matchesCategory =
        selectedCategory === "all" || banner.category === selectedCategory

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && banner.isActive) ||
        (statusFilter === "hidden" && !banner.isActive)

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [banners, searchQuery, selectedCategory, statusFilter])

  // Stats
  const activeCount = useMemo(() => banners.filter((b) => b.isActive).length, [banners])
  const hiddenCount = useMemo(() => banners.filter((b) => !b.isActive).length, [banners])

  // Selection logic
  const selectedVisibleCount = filteredBanners.filter((b) => selectedIds.has(b.id)).length
  const isAllVisibleSelected =
    filteredBanners.length > 0 && selectedVisibleCount === filteredBanners.length

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedVisibleCount > 0 && !isAllVisibleSelected
    }
  }, [isAllVisibleSelected, selectedVisibleCount])

  function toggleBannerSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (isAllVisibleSelected) {
        filteredBanners.forEach((b) => next.delete(b.id))
      } else {
        filteredBanners.forEach((b) => next.add(b.id))
      }
      return next
    })
  }

  async function handleBulkStatus(activeState: boolean) {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    setBanners((prev) =>
      prev.map((b) => (ids.includes(b.id) ? { ...b, isActive: activeState } : b))
    )

    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/banners/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: activeState }),
          })
        )
      )
      toast.success(`${ids.length} banner${ids.length > 1 ? "s" : ""} updated`)
    } catch {
      toast.error("Failed to update some banners")
    }
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    if (!window.confirm(`Are you sure you want to delete ${ids.length} selected banner(s)?`)) {
      return
    }

    setIsBulkDeleting(true)
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/banners/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _method: "DELETE" }),
          })
        )
      )
      setBanners((prev) => prev.filter((b) => !ids.includes(b.id)))
      setSelectedIds(new Set())
      toast.success(`${ids.length} banner(s) deleted`)
      router.refresh()
    } catch {
      toast.error("Failed to delete some banners")
    } finally {
      setIsBulkDeleting(false)
    }
  }

  async function handleRestoreDefaults() {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/banners/seed", { method: "POST" })
      if (!res.ok) throw new Error("Failed to restore default banners")
      const data = await res.json()
      setBanners(data)
      toast.success("Default banners loaded successfully!")
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("Failed to load default banners")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    caption: "",
    src: "",
    mobileSrc: "",
    alt: "",
    cta: "Shop now",
    linkUrl: "/shop",
    sortOrder: 0,
    isActive: true,
  })

  function getCategoryLinkUrl(categoryTitle: string): string {
    const cat = categories.find((c) => c.title === categoryTitle)
    return cat ? `/shop?filter=${cat.slug}` : "/shop"
  }

  const desktopPreviewSrc = desktopUploadPreview?.url || formData.src
  const mobilePreviewSrc = mobileUploadPreview?.url || formData.mobileSrc
  const desktopPreviewIsVideo = desktopUploadPreview?.isVideo ?? isVideoUrl(formData.src)
  const mobilePreviewIsVideo = mobileUploadPreview?.isVideo ?? isVideoUrl(formData.mobileSrc)

  function inspectMediaFile(file: File, isMobile: boolean) {
    const isVideo = file.type.startsWith("video/") || isVideoUrl(file.name)
    const formattedSize = formatBytes(file.size)
    const formatName = file.type
      ? file.type.split("/")[1]?.toUpperCase()
      : isVideo
        ? "VIDEO"
        : "IMAGE"

    const objectUrl = URL.createObjectURL(file)

    if (isVideo) {
      const tempVideo = document.createElement("video")
      tempVideo.preload = "metadata"
      tempVideo.src = objectUrl
      tempVideo.onloadedmetadata = () => {
        const meta: MediaMeta = {
          fileSize: formattedSize,
          dimensions: `${tempVideo.videoWidth} × ${tempVideo.videoHeight} px`,
          duration: `${Math.round(tempVideo.duration || 0)}s`,
          type: "video",
          format: formatName,
        }
        if (isMobile) setMobileMeta(meta)
        else setDesktopMeta(meta)
        URL.revokeObjectURL(objectUrl)
      }
      tempVideo.onerror = () => {
        const meta: MediaMeta = {
          fileSize: formattedSize,
          type: "video",
          format: formatName,
        }
        if (isMobile) setMobileMeta(meta)
        else setDesktopMeta(meta)
        URL.revokeObjectURL(objectUrl)
      }
    } else {
      const tempImg = new window.Image()
      tempImg.src = objectUrl
      tempImg.onload = () => {
        const meta: MediaMeta = {
          fileSize: formattedSize,
          dimensions: `${tempImg.naturalWidth} × ${tempImg.naturalHeight} px`,
          type: "image",
          format: formatName,
        }
        if (isMobile) setMobileMeta(meta)
        else setDesktopMeta(meta)
        URL.revokeObjectURL(objectUrl)
      }
      tempImg.onerror = () => {
        const meta: MediaMeta = {
          fileSize: formattedSize,
          type: "image",
          format: formatName,
        }
        if (isMobile) setMobileMeta(meta)
        else setDesktopMeta(meta)
        URL.revokeObjectURL(objectUrl)
      }
    }
  }

  function openAddModal() {
    setEditingBanner(null)
    setShowDesktopUrlInput(false)
    setShowMobileUrlInput(false)
    setDesktopMeta({})
    setMobileMeta({})
    setFormData({
      title: "",
      category: "",
      caption: "",
      src: "",
      mobileSrc: "",
      alt: "",
      cta: "Shop now",
      linkUrl: "/shop",
      sortOrder: banners.length,
      isActive: true,
    })
    setIsModalOpen(true)
  }

  function openEditModal(banner: HeroBannerItem) {
    setEditingBanner(banner)
    setShowDesktopUrlInput(false)
    setShowMobileUrlInput(false)
    setDesktopMeta({
      type: isVideoUrl(banner.src) ? "video" : "image",
    })
    setMobileMeta({
      type: isVideoUrl(banner.mobileSrc) ? "video" : "image",
    })

    const resolvedLink = banner.category
      ? getCategoryLinkUrl(banner.category)
      : banner.linkUrl || "/shop"
    setFormData({
      title: banner.title,
      category: banner.category || "",
      caption: banner.caption || "",
      src: banner.src,
      mobileSrc: banner.mobileSrc || "",
      alt: banner.alt || banner.title,
      cta: banner.cta || "Shop now",
      linkUrl: resolvedLink,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
    })
    setIsModalOpen(true)
  }

  async function handleToggleActive(banner: HeroBannerItem) {
    const newStatus = !banner.isActive
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, isActive: newStatus } : b))
    )

    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (res.status === 401) {
        toast.error("Your admin session has expired. Please log in again.")
        router.push("/login")
        return
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to update status")
      }
      toast.success(`Banner ${newStatus ? "activated" : "deactivated"}`)
      router.refresh()
    } catch (err: any) {
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: banner.isActive } : b))
      )
      console.error("Toggle banner status failed:", err)
      toast.error(err?.message || "Failed to update banner status")
    }
  }

  async function handleDelete(id: string) {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _method: "DELETE" }),
      })
      if (res.status === 401) {
        toast.error("Your admin session has expired. Please log in again.")
        router.push("/login")
        return
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to delete banner")
      }

      setBanners((prev) => prev.filter((b) => b.id !== id))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      toast.success("Banner deleted successfully")
      setDeleteTargetId(null)
      await fetchFreshBanners()
      router.refresh()
    } catch (err: any) {
      console.error("Delete banner failed:", err)
      toast.error(err?.message || "Failed to delete banner")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleMoveBanner(bannerId: string, direction: "up" | "down") {
    const sorted = [...banners].sort((a, b) => a.sortOrder - b.sortOrder)
    const index = sorted.findIndex((b) => b.id === bannerId)
    if (index === -1) return

    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sorted.length) return

    const currentBanner = sorted[index]
    const targetBanner = sorted[targetIndex]
    const currentOrder = currentBanner.sortOrder
    const targetOrder = targetBanner.sortOrder

    const updated = sorted.map((b) => {
      if (b.id === currentBanner.id) return { ...b, sortOrder: targetOrder }
      if (b.id === targetBanner.id) return { ...b, sortOrder: currentOrder }
      return b
    }).sort((a, b) => a.sortOrder - b.sortOrder)

    setBanners(updated)

    try {
      await Promise.all([
        fetch(`/api/admin/banners/${currentBanner.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: targetOrder }),
        }),
        fetch(`/api/admin/banners/${targetBanner.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: currentOrder }),
        }),
      ])
      toast.success("Banner reordered successfully")
      await fetchFreshBanners()
      router.refresh()
    } catch {
      toast.error("Failed to update banner order")
    }
  }

  async function handleDesktopFileUpload(file: File) {
    if (!file || isUploadingDesktop || isSubmitting) return
    setIsUploadingDesktop(true)
    setDesktopUploadPreview({ url: URL.createObjectURL(file), isVideo: file.type.startsWith("video/") || isVideoUrl(file.name) })
    setUploadProgressDesktop(0)
    inspectMediaFile(file, false)

    try {
      const uploaded = await uploadProductImage(file, {
        onProgress: (percent) => {
          setUploadProgressDesktop(percent)
        },
      })
      setFormData((prev) => ({ ...prev, src: uploaded.url }))
      toast.success("Desktop media uploaded successfully")
    } catch (err: any) {
      console.error("Desktop media upload failed:", err)
      toast.error(err?.message || "Media upload failed")
    } finally {
      setDesktopUploadPreview(null)
      setIsUploadingDesktop(false)
      setUploadProgressDesktop(null)
    }
  }

  async function handleMobileFileUpload(file: File) {
    if (!file || isUploadingMobile || isSubmitting) return
    setIsUploadingMobile(true)
    setMobileUploadPreview({ url: URL.createObjectURL(file), isVideo: file.type.startsWith("video/") || isVideoUrl(file.name) })
    setUploadProgressMobile(0)
    inspectMediaFile(file, true)

    try {
      const uploaded = await uploadProductImage(file, {
        onProgress: (percent) => {
          setUploadProgressMobile(percent)
        },
      })
      setFormData((prev) => ({ ...prev, mobileSrc: uploaded.url }))
      toast.success("Mobile media uploaded successfully")
    } catch (err: any) {
      console.error("Mobile media upload failed:", err)
      toast.error(err?.message || "Mobile media upload failed")
    } finally {
      setMobileUploadPreview(null)
      setIsUploadingMobile(false)
      setUploadProgressMobile(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isUploadingDesktop || isUploadingMobile || isSubmitting) return
    if (!formData.title.trim()) {
      toast.error("Banner title is required")
      return
    }
    if (!formData.src.trim()) {
      toast.error("Desktop Banner media is required")
      return
    }

    setIsSubmitting(true)
    try {
      if (editingBanner) {
        // Update existing banner
        const res = await fetch(`/api/admin/banners/${editingBanner.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (res.status === 401) {
          toast.error("Your admin session has expired. Please log in again.")
          router.push("/login")
          return
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || "Failed to update banner")
        }
        const updated = await res.json()

        setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
        toast.success("Banner updated successfully")
      } else {
        // Create new banner
        const res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (res.status === 401) {
          toast.error("Your admin session has expired. Please log in again.")
          router.push("/login")
          return
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || "Failed to create banner")
        }
        const created = await res.json()

        setBanners((prev) => [...prev, created])
        toast.success("New banner added successfully")
      }
      setIsModalOpen(false)
      await fetchFreshBanners()
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || "Failed to save banner")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-5 bg-[#f6f6f6] p-4 sm:p-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Homepage Hero Banners</h1>
          <p className="mt-1 text-xs text-black/60">
            Manage, preview, reorder, and configure image & video carousel slides for the store banner.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearServerCache}
            disabled={isClearingCache || isSubmitting}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 shadow-2xs transition hover:bg-red-100 disabled:opacity-50"
            title="Purge Next.js page & data cache immediately"
          >
            {isClearingCache ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <RefreshCwIcon className="size-3.5" />
            )}
            <span>Clear Cache</span>
          </button>

          <button
            type="button"
            onClick={handleRestoreDefaults}
            disabled={isSubmitting}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 text-xs font-medium text-black shadow-2xs transition hover:bg-black/5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <RefreshCwIcon className="size-3.5" />
            )}
            <span>Load Defaults</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-black px-3.5 text-xs font-medium text-white shadow-2xs transition hover:bg-black/80"
          >
            <PlusIcon className="size-3.5" />
            Add New Banner
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-xs">
        {/* Table Toolbar / Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                statusFilter === "all"
                  ? "bg-black text-white"
                  : "text-black/60 hover:bg-black/5 hover:text-black"
              }`}
            >
              All ({banners.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                statusFilter === "active"
                  ? "bg-emerald-600 text-white"
                  : "text-black/60 hover:bg-black/5 hover:text-black"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("hidden")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                statusFilter === "hidden"
                  ? "bg-neutral-800 text-white"
                  : "text-black/60 hover:bg-black/5 hover:text-black"
              }`}
            >
              Hidden ({hiddenCount})
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            {/* Search Input */}
            <div className="relative min-w-48 max-w-xs flex-1">
              <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-black/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search banners by title, CTA, category..."
                className="h-8 w-full rounded-lg border border-black/15 bg-white pl-8 pr-3 text-xs outline-none focus:border-black"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                >
                  <XIcon className="size-3" />
                </button>
              ) : null}
            </div>

            {/* Category Dropdown Filter */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontalIcon className="size-3.5 text-black/40" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 rounded-lg border border-black/15 bg-white px-2.5 text-xs font-medium text-black outline-none focus:border-black"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.title}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Selection Actions */}
            {selectedIds.size > 0 ? (
              <div className="flex items-center gap-1.5 rounded-lg bg-black/5 p-1 pl-2.5 text-xs">
                <span className="font-medium text-black/80">{selectedIds.size} selected</span>
                <button
                  type="button"
                  onClick={() => handleBulkStatus(true)}
                  className="rounded px-2 py-0.5 font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Activate
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkStatus(false)}
                  className="rounded px-2 py-0.5 font-medium text-neutral-700 hover:bg-neutral-200"
                >
                  Hide
                </button>
                <button
                  type="button"
                  disabled={isBulkDeleting}
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2Icon className="size-3" />
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="rounded p-0.5 text-black/50 hover:bg-black/10 hover:text-black"
                  title="Clear selection"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Table Content */}
        {filteredBanners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon className="size-10 text-black/25" />
            <h3 className="mt-3 text-sm font-semibold text-black">
              {banners.length === 0
                ? "No hero banners created yet"
                : "No banners match your filters"}
            </h3>
            <p className="mt-1 text-xs text-black/55">
              {banners.length === 0
                ? "Add custom image/video slides or load the default XElectron hero banners."
                : "Try adjusting your search keywords or resetting your category filter."}
            </p>
            <div className="mt-4 flex items-center gap-2">
              {banners.length === 0 ? (
                <>
                  <button
                    type="button"
                    onClick={handleRestoreDefaults}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-black/20 bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-2xs hover:bg-black/5"
                  >
                    <RefreshCwIcon className="size-3.5" />
                    Load Default Banners
                  </button>
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-black/80"
                  >
                    <PlusIcon className="size-3.5" />
                    Add Custom Banner
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setStatusFilter("all")
                  }}
                  className="rounded-lg border border-black/20 bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-black/5"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left text-xs">
              <thead className="border-b border-black/10 bg-black/[0.02] text-black/60">
                <tr>
                  <th className="w-10 px-3 py-3 text-center">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={isAllVisibleSelected}
                      onChange={toggleSelectAll}
                      className="size-3.5 rounded border-black/30 accent-black"
                      aria-label="Select all banners"
                    />
                  </th>
                  <th className="w-16 px-3 py-3 font-semibold">Order</th>
                  <th className="w-36 px-3 py-3 font-semibold">Banner Preview</th>
                  <th className="min-w-48 px-3 py-3 font-semibold">Title & Caption</th>
                  <th className="w-32 px-3 py-3 font-semibold">Category</th>
                  <th className="w-44 px-3 py-3 font-semibold">CTA & Link Target</th>
                  <th className="w-28 px-3 py-3 font-semibold">Status</th>
                  <th className="w-28 px-3 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filteredBanners.map((banner) => {
                  const isSelected = selectedIds.has(banner.id)
                  const isDesktopVideo = isVideoUrl(banner.src)
                  const isDesktopYouTube = isYouTubeUrl(banner.src)

                  return (
                    <tr
                      key={banner.id}
                      className={`transition-colors hover:bg-black/[0.02] ${
                        isSelected ? "bg-black/[0.03]" : ""
                      } ${!banner.isActive ? "opacity-75" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBannerSelect(banner.id)}
                          className="size-3.5 rounded border-black/30 accent-black"
                          aria-label={`Select ${banner.title}`}
                        />
                      </td>

                      {/* Display Order */}
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center justify-center rounded bg-black/5 px-2 py-0.5 text-[11px] font-mono font-semibold text-black/75">
                          #{banner.sortOrder}
                        </span>
                      </td>

                      {/* Preview Image / Video */}
                      <td className="px-3 py-3">
                        <div className="group relative aspect-16/9 w-28 overflow-hidden rounded-lg border border-black/10 bg-slate-900 shadow-2xs">
                          {isDesktopYouTube ? (
                            <div className="relative w-full h-full bg-black">
                              <img
                                src={getYouTubeThumbnail(banner.src) || "/creator-projector.png"}
                                alt={banner.alt || banner.title}
                                className="h-full w-full object-cover opacity-85"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <PlayIcon className="size-4 fill-red-600 text-red-600" />
                              </div>
                              <div className="absolute top-1 left-1 rounded bg-black/80 px-1 py-0.5 text-[8px] font-bold text-red-400">
                                YouTube
                              </div>
                            </div>
                          ) : isDesktopVideo ? (
                            <video
                              src={banner.src}
                              autoPlay
                              loop
                              muted
                              playsInline
                              ref={(el) => {
                                if (el) {
                                  el.defaultMuted = true
                                  el.muted = true
                                }
                              }}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Image
                              src={banner.src}
                              alt={banner.alt || banner.title}
                              fill
                              className="object-cover transition duration-300 group-hover:scale-105"
                              sizes="112px"
                            />
                          )}

                          {isDesktopVideo && !isDesktopYouTube ? (
                            <div className="absolute top-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[8px] font-medium text-white flex items-center gap-0.5">
                              <PlayIcon className="size-2 fill-white" />
                              Video
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Title & Caption */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-black">{banner.title}</span>
                          {banner.caption ? (
                            <span className="mt-0.5 line-clamp-1 text-[11px] text-black/60">
                              {banner.caption}
                            </span>
                          ) : null}
                          {banner.alt && banner.alt !== banner.title ? (
                            <span className="mt-0.5 text-[10px] text-black/40">
                              Alt: {banner.alt}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3">
                        {banner.category ? (
                          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-800 border border-neutral-200">
                            {banner.category}
                          </span>
                        ) : (
                          <span className="text-black/40">—</span>
                        )}
                      </td>

                      {/* CTA & Link */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-black">
                            {banner.cta || "Shop now"}
                          </span>
                          <Link prefetch={false}
                            href={banner.linkUrl || "/shop"}
                            target="_blank"
                            className="inline-flex items-center gap-1 truncate text-[11px] text-sky-600 hover:text-sky-800 hover:underline max-w-[170px]"
                            title={banner.linkUrl || "/shop"}
                          >
                            <span className="truncate">{banner.linkUrl || "/shop"}</span>
                            <ExternalLinkIcon className="size-2.5 shrink-0" />
                          </Link>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(banner)}
                          title={`Click to ${banner.isActive ? "hide" : "activate"}`}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition cursor-pointer ${
                            banner.isActive
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              banner.isActive ? "bg-emerald-600" : "bg-neutral-400"
                            }`}
                          />
                          {banner.isActive ? "Active" : "Hidden"}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-3 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveBanner(banner.id, "up")}
                            title="Move up in order"
                            className="rounded-md p-1.5 text-black/60 hover:bg-black/5 hover:text-black transition"
                          >
                            <ArrowUpIcon className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveBanner(banner.id, "down")}
                            title="Move down in order"
                            className="rounded-md p-1.5 text-black/60 hover:bg-black/5 hover:text-black transition"
                          >
                            <ArrowDownIcon className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleActive(banner)}
                            title={banner.isActive ? "Hide banner" : "Show banner"}
                            className="rounded-md p-1.5 text-black/60 hover:bg-black/5 hover:text-black transition"
                          >
                            {banner.isActive ? (
                              <EyeOffIcon className="size-3.5" />
                            ) : (
                              <EyeIcon className="size-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(banner)}
                            title="Edit banner"
                            className="rounded-md p-1.5 text-black/60 hover:bg-black/5 hover:text-black transition"
                          >
                            <PencilIcon className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(banner.id)}
                            title="Delete banner"
                            className="rounded-md p-1.5 text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2Icon className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer / Count Info */}
        <div className="flex items-center justify-between border-t border-black/10 bg-black/[0.01] px-4 py-2.5 text-xs text-black/60">
          <span>
            Showing <strong className="font-semibold text-black">{filteredBanners.length}</strong>{" "}
            of <strong className="font-semibold text-black">{banners.length}</strong> hero banners
          </span>

          <span className="text-[11px] text-black/40">
            Carousel auto-plays in display order on the store homepage
          </span>
        </div>
      </section>

      {/* Add / Edit Banner Modal */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-hidden" data-lenis-prevent>
          <div className="relative flex flex-col w-full max-w-2xl max-h-[88vh] rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" data-lenis-prevent>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-4 bg-white shrink-0">
              <div>
                <h2 className="text-base font-bold text-black">
                  {editingBanner ? "Edit Hero Banner" : "Add New Hero Banner"}
                </h2>
                <p className="text-xs text-black/55 mt-0.5">
                  Upload images or videos for desktop & mobile with live size inspection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)} disabled={isUploadingDesktop || isUploadingMobile || isSubmitting}
                className="rounded-md p-1.5 text-black/50 hover:bg-black/5 hover:text-black transition-colors"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden" data-lenis-prevent>
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs overscroll-contain" data-lenis-prevent>
                {/* Basic Details Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-black text-xs uppercase tracking-wider text-black/50">
                    1. Basic Details
                  </h3>

                {/* Banner Title */}
                <div>
                  <label className="block font-semibold text-black/80">Banner Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. XElectron Techno Android Projector"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-xs outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Category */}
                  <div>
                    <label className="block font-semibold text-black/80">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const selectedTitle = e.target.value
                        const selectedCat = categories.find((c) => c.title === selectedTitle)
                        setFormData({
                          ...formData,
                          category: selectedTitle,
                          linkUrl: selectedCat ? `/shop?filter=${selectedCat.slug}` : "/shop",
                        })
                      }}
                      className="mt-1 w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-xs outline-none focus:border-black"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.title}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CTA Button Text */}
                  <div>
                    <label className="block font-semibold text-black/80">CTA Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Shop now, Explore now"
                      value={formData.cta}
                      onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-xs outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Caption */}
                <div>
                  <label className="block font-semibold text-black/80">Subtitle / Caption</label>
                  <input
                    type="text"
                    placeholder="e.g. Projection Made Simple • Full HD 1080p"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-xs outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Upload Media Section: Desktop & Mobile Separate Cards (Image + Video Support) */}
              <div className="space-y-3 pt-2 border-t border-black/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-black text-xs uppercase tracking-wider text-black/50">
                    2. Banner Media (Image or Video)
                  </h3>
                  <span className="text-[11px] text-black/50">
                    Images (JPG, PNG, WEBP) or Videos (MP4, WebM)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* --- DESKTOP BANNER UPLOAD SECTION --- */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsDraggingDesktop(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsDraggingDesktop(false)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsDraggingDesktop(false)
                      const file = e.dataTransfer.files?.[0]
                      if (file) handleDesktopFileUpload(file)
                    }}
                    className={`flex flex-col rounded-xl border p-3.5 transition-all ${
                      isDraggingDesktop
                        ? "border-black bg-black/[0.04] ring-2 ring-black/20"
                        : "border-black/15 bg-neutral-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MonitorIcon className="size-4 text-black/70" />
                        <span className="font-semibold text-black">Desktop Media *</span>
                      </div>
                      <span className="rounded bg-black/10 px-1.5 py-0.5 text-[10px] font-semibold text-black/70">
                        16:9 Landscape
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-black/55">
                      High-resolution image or video displayed on desktop/laptop displays (up to 250 MB).
                    </p>

                    {/* Preview / Dropzone */}
                    <div className="mt-3 flex flex-1 flex-col">
                      {desktopPreviewSrc ? (
                        <div className="space-y-2">
                          <div className="relative aspect-16/9 w-full overflow-hidden rounded-lg border border-black/15 bg-slate-900 shadow-2xs group">
                            {isYouTubeUrl(desktopPreviewSrc) ? (
                              <div className="relative w-full h-full bg-black flex items-center justify-center">
                                <img
                                  src={getYouTubeThumbnail(desktopPreviewSrc) || "/creator-projector.png"}
                                  alt="YouTube Desktop Preview"
                                  className="w-full h-full object-cover opacity-85"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="flex size-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                                    <PlayIcon className="size-5 fill-white ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            ) : desktopPreviewIsVideo ? (
                              <video
                                key={desktopPreviewSrc}
                                src={desktopPreviewSrc}
                                autoPlay
                                loop
                                muted
                                playsInline
                                onLoadedMetadata={(e) => {
                                  const target = e.currentTarget
                                  setDesktopMeta((prev) => ({
                                    ...prev,
                                    dimensions: `${target.videoWidth} × ${target.videoHeight} px`,
                                    duration: `${Math.round(target.duration || 0)}s`,
                                    type: "video",
                                    format: prev.format || "MP4 / VIDEO",
                                  }))
                                }}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Image
                                src={desktopPreviewSrc}
                                alt="Desktop Preview"
                                fill
                                onLoadingComplete={(img) => {
                                  setDesktopMeta((prev) => ({
                                    ...prev,
                                    dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
                                    type: "image",
                                    format: prev.format || "IMAGE",
                                  }))
                                }}
                                className="object-cover"
                              />
                            )}

                            {/* Type Indicator Badge */}
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded bg-black/75 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-2xs">
                              {isYouTubeUrl(desktopPreviewSrc) ? (
                                <>
                                  <PlayIcon className="size-3 fill-red-500 text-red-500" />
                                  <span>YouTube Video</span>
                                </>
                              ) : desktopPreviewIsVideo ? (
                                <>
                                  <FilmIcon className="size-3 text-sky-400" />
                                  <span>Video Banner</span>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="size-3 text-emerald-400" />
                                  <span>Image Banner</span>
                                </>
                              )}
                            </div>

                            {/* Live Upload Progress Overlay */}
                            {isUploadingDesktop && (
                              <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center p-4 text-white text-center">
                                <Loader2Icon className="size-7 animate-spin text-white mb-2" />
                                <span className="text-xs font-semibold">
                                  {uploadProgressDesktop !== null && uploadProgressDesktop > 0
                                    ? `Uploading desktop media... ${uploadProgressDesktop}%`
                                    : "Uploading desktop media..."}
                                </span>
                                {uploadProgressDesktop !== null && (
                                  <div className="w-44 bg-white/20 rounded-full h-1.5 overflow-hidden mt-2">
                                    <div
                                      className="bg-white h-1.5 rounded-full transition-all duration-150"
                                      style={{ width: `${uploadProgressDesktop}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Dragging Overlay */}
                            {isDraggingDesktop && !isUploadingDesktop && (
                              <div className="absolute inset-0 bg-black/85 z-30 flex flex-col items-center justify-center p-4 text-white text-center border-2 border-dashed border-white/80">
                                <UploadIcon className="size-8 text-white mb-1 animate-bounce" />
                                <span className="text-xs font-bold">Drop video or image to replace</span>
                              </div>
                            )}

                            {/* Hover Overlay Controls */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                              <label className="cursor-pointer inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-semibold text-black shadow-sm hover:bg-neutral-100">
                                {isUploadingDesktop ? (
                                  <Loader2Icon className="size-3.5 animate-spin" />
                                ) : (
                                  <UploadIcon className="size-3.5" />
                                )}
                                {isUploadingDesktop && uploadProgressDesktop !== null
                                  ? `${uploadProgressDesktop}%`
                                  : "Replace"}
                                <input
                                  type="file"
                                  accept="image/*,video/*,.mp4,.webm,.mov,.ogg,.mkv,.m4v"
                                  className="hidden"
                                  onClick={(e) => {
                                    ;(e.currentTarget as HTMLInputElement).value = ""
                                  }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleDesktopFileUpload(file)
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, src: "" }))
                                  setDesktopMeta({})
                                }}
                                className="inline-flex items-center gap-1 rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
                              >
                                <Trash2Icon className="size-3.5" />
                                Remove
                              </button>
                            </div>
                          </div>

                          {/* Media Metadata Size Specs */}
                          {(desktopMeta.dimensions || desktopMeta.fileSize || desktopMeta.duration) && (
                            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white border border-black/10 px-2.5 py-1.5 text-[11px] text-black/75">
                              {desktopMeta.dimensions && (
                                <div className="flex items-center gap-1" title="Resolution">
                                  <Maximize2Icon className="size-3 text-black/50" />
                                  <span className="font-semibold">{desktopMeta.dimensions}</span>
                                </div>
                              )}
                              {desktopMeta.fileSize && (
                                <div className="flex items-center gap-1" title="File Size">
                                  <HardDriveIcon className="size-3 text-black/50" />
                                  <span>{desktopMeta.fileSize}</span>
                                </div>
                              )}
                              {desktopMeta.duration && (
                                <div className="flex items-center gap-1" title="Video Duration">
                                  <ClockIcon className="size-3 text-black/50" />
                                  <span>{desktopMeta.duration}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px]">
                            <button
                              type="button"
                              onClick={() => setShowDesktopUrlInput((prev) => !prev)}
                              className="inline-flex items-center gap-1 text-black/60 hover:text-black font-medium"
                            >
                              <LinkIcon className="size-3" />
                              {showDesktopUrlInput ? "Hide media URL" : "Edit media URL"}
                            </button>
                            <label className="cursor-pointer font-medium text-black hover:underline inline-flex items-center gap-1">
                              {isUploadingDesktop ? (
                                <>
                                  <Loader2Icon className="size-3 animate-spin" />
                                  <span>{uploadProgressDesktop !== null ? `${uploadProgressDesktop}%` : "Uploading..."}</span>
                                </>
                              ) : (
                                <>Upload new</>
                              )}
                              <input
                                type="file"
                                accept="image/*,video/*,.mp4,.webm,.mov,.ogg,.mkv,.m4v"
                                className="hidden"
                                onClick={(e) => {
                                  ;(e.currentTarget as HTMLInputElement).value = ""
                                }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleDesktopFileUpload(file)
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          onDragEnter={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsDraggingDesktop(true)
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsDraggingDesktop(false)
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsDraggingDesktop(false)
                            const file = e.dataTransfer.files?.[0]
                            if (file) handleDesktopFileUpload(file)
                          }}
                          className={`flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition ${
                            isDraggingDesktop
                              ? "border-black bg-black/10 ring-2 ring-black/20"
                              : "border-black/20 bg-white hover:border-black/40 hover:bg-neutral-50/50"
                          }`}
                        >
                          {isUploadingDesktop ? (
                            <div className="flex flex-col items-center gap-1.5 w-full max-w-[220px]">
                              <Loader2Icon className="size-6 animate-spin text-black" />
                              <span className="text-xs font-semibold text-black">
                                {uploadProgressDesktop !== null && uploadProgressDesktop > 0
                                  ? `Uploading desktop media... ${uploadProgressDesktop}%`
                                  : "Uploading desktop media..."}
                              </span>
                              {uploadProgressDesktop !== null && (
                                <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden mt-1">
                                  <div
                                    className="bg-black h-1.5 rounded-full transition-all duration-150"
                                    style={{ width: `${uploadProgressDesktop}%` }}
                                  />
                                </div>
                              )}
                              <span className="text-[10px] text-black/50 mt-0.5">Supports video up to 250 MB</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-1.5 rounded-full bg-black/5 p-2 text-black/60">
                                <UploadIcon className="size-4" />
                                <VideoIcon className="size-4" />
                              </div>
                              <span className="mt-2 text-xs font-semibold text-black">
                                Click or drag Image or Video
                              </span>
                              <span className="mt-0.5 text-[10px] text-black/50">
                                MP4, WebM, MOV, PNG, JPG (1920×600 or 16:9 • max 250 MB)
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*,video/*,.mp4,.webm,.mov,.ogg,.mkv,.m4v"
                            className="hidden"
                            onClick={(e) => {
                              ;(e.currentTarget as HTMLInputElement).value = ""
                            }}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleDesktopFileUpload(file)
                            }}
                          />
                        </label>
                      )}

                      {/* Optional URL Input */}
                      {(!formData.src || showDesktopUrlInput) && (
                        <div className="mt-2.5">
                          <label className="block text-[10px] font-semibold text-black/65">
                            Desktop Media URL or Path:
                          </label>
                          <input
                            type="text"
                            placeholder="/hero-banner-projector.mp4 or https://..."
                            value={formData.src}
                            onChange={(e) => setFormData({ ...formData, src: e.target.value })}
                            className="mt-1 w-full rounded-md border border-black/20 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-black"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* --- MOBILE BANNER UPLOAD SECTION --- */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsDraggingMobile(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsDraggingMobile(false)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsDraggingMobile(false)
                      const file = e.dataTransfer.files?.[0]
                      if (file) handleMobileFileUpload(file)
                    }}
                    className={`flex flex-col rounded-xl border p-3.5 transition-all ${
                      isDraggingMobile
                        ? "border-black bg-black/[0.04] ring-2 ring-black/20"
                        : "border-black/15 bg-neutral-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <SmartphoneIcon className="size-4 text-black/70" />
                        <span className="font-semibold text-black">Mobile Media</span>
                      </div>
                      <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700">
                        Optional (Mobile Crop)
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-black/55">
                      Optimized smartphone image/video (up to 250 MB). If omitted, desktop media is used.
                    </p>

                    {/* Preview / Dropzone */}
                    <div className="mt-3 flex flex-1 flex-col">
                      {mobilePreviewSrc ? (
                        <div className="space-y-2">
                          <div className="relative aspect-16/9 w-full overflow-hidden rounded-lg border border-black/15 bg-slate-900 shadow-2xs group">
                            {isYouTubeUrl(mobilePreviewSrc) ? (
                              <div className="relative w-full h-full bg-black flex items-center justify-center">
                                <img
                                  src={getYouTubeThumbnail(mobilePreviewSrc) || "/creator-projector.png"}
                                  alt="YouTube Mobile Preview"
                                  className="w-full h-full object-cover opacity-85"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="flex size-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                                    <PlayIcon className="size-5 fill-white ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            ) : mobilePreviewIsVideo ? (
                              <video
                                key={mobilePreviewSrc}
                                src={mobilePreviewSrc}
                                autoPlay
                                loop
                                muted
                                playsInline
                                onLoadedMetadata={(e) => {
                                  const target = e.currentTarget
                                  setMobileMeta((prev) => ({
                                    ...prev,
                                    dimensions: `${target.videoWidth} × ${target.videoHeight} px`,
                                    duration: `${Math.round(target.duration || 0)}s`,
                                    type: "video",
                                    format: prev.format || "MP4 / VIDEO",
                                  }))
                                }}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Image
                                src={mobilePreviewSrc}
                                alt="Mobile Preview"
                                fill
                                onLoadingComplete={(img) => {
                                  setMobileMeta((prev) => ({
                                    ...prev,
                                    dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
                                    type: "image",
                                    format: prev.format || "IMAGE",
                                  }))
                                }}
                                className="object-cover"
                              />
                            )}

                            {/* Type Indicator Badge */}
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded bg-black/75 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-2xs">
                              {isYouTubeUrl(mobilePreviewSrc) ? (
                                <>
                                  <PlayIcon className="size-3 fill-red-500 text-red-500" />
                                  <span>YouTube Video</span>
                                </>
                              ) : mobilePreviewIsVideo ? (
                                <>
                                  <FilmIcon className="size-3 text-sky-400" />
                                  <span>Mobile Video</span>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="size-3 text-emerald-400" />
                                  <span>Mobile Image</span>
                                </>
                              )}
                            </div>

                            {/* Live Upload Progress Overlay */}
                            {isUploadingMobile && (
                              <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center p-4 text-white text-center">
                                <Loader2Icon className="size-7 animate-spin text-white mb-2" />
                                <span className="text-xs font-semibold">
                                  {uploadProgressMobile !== null && uploadProgressMobile > 0
                                    ? `Uploading mobile media... ${uploadProgressMobile}%`
                                    : "Uploading mobile media..."}
                                </span>
                                {uploadProgressMobile !== null && (
                                  <div className="w-44 bg-white/20 rounded-full h-1.5 overflow-hidden mt-2">
                                    <div
                                      className="bg-white h-1.5 rounded-full transition-all duration-150"
                                      style={{ width: `${uploadProgressMobile}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Dragging Overlay */}
                            {isDraggingMobile && !isUploadingMobile && (
                              <div className="absolute inset-0 bg-black/85 z-30 flex flex-col items-center justify-center p-4 text-white text-center border-2 border-dashed border-white/80">
                                <UploadIcon className="size-8 text-white mb-1 animate-bounce" />
                                <span className="text-xs font-bold">Drop video or image to replace</span>
                              </div>
                            )}

                            {/* Hover Overlay Controls */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                              <label className="cursor-pointer inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-semibold text-black shadow-sm hover:bg-neutral-100">
                                {isUploadingMobile ? (
                                  <Loader2Icon className="size-3.5 animate-spin" />
                                ) : (
                                  <UploadIcon className="size-3.5" />
                                )}
                                {isUploadingMobile && uploadProgressMobile !== null
                                  ? `${uploadProgressMobile}%`
                                  : "Replace"}
                                <input
                                  type="file"
                                  accept="image/*,video/*,.mp4,.webm,.mov,.ogg,.mkv,.m4v"
                                  className="hidden"
                                  onClick={(e) => {
                                    ;(e.currentTarget as HTMLInputElement).value = ""
                                  }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleMobileFileUpload(file)
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, mobileSrc: "" }))
                                  setMobileMeta({})
                                }}
                                className="inline-flex items-center gap-1 rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
                              >
                                <Trash2Icon className="size-3.5" />
                                Remove
                              </button>
                            </div>
                          </div>

                          {/* Media Metadata Size Specs */}
                          {(mobileMeta.dimensions || mobileMeta.fileSize || mobileMeta.duration) && (
                            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white border border-black/10 px-2.5 py-1.5 text-[11px] text-black/75">
                              {mobileMeta.dimensions && (
                                <div className="flex items-center gap-1" title="Resolution">
                                  <Maximize2Icon className="size-3 text-black/50" />
                                  <span className="font-semibold">{mobileMeta.dimensions}</span>
                                </div>
                              )}
                              {mobileMeta.fileSize && (
                                <div className="flex items-center gap-1" title="File Size">
                                  <HardDriveIcon className="size-3 text-black/50" />
                                  <span>{mobileMeta.fileSize}</span>
                                </div>
                              )}
                              {mobileMeta.duration && (
                                <div className="flex items-center gap-1" title="Video Duration">
                                  <ClockIcon className="size-3 text-black/50" />
                                  <span>{mobileMeta.duration}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px]">
                            <button
                              type="button"
                              onClick={() => setShowMobileUrlInput((prev) => !prev)}
                              className="inline-flex items-center gap-1 text-black/60 hover:text-black font-medium"
                            >
                              <LinkIcon className="size-3" />
                              {showMobileUrlInput ? "Hide media URL" : "Edit media URL"}
                            </button>
                            <label className="cursor-pointer font-medium text-black hover:underline inline-flex items-center gap-1">
                              {isUploadingMobile ? (
                                <>
                                  <Loader2Icon className="size-3 animate-spin" />
                                  <span>{uploadProgressMobile !== null ? `${uploadProgressMobile}%` : "Uploading..."}</span>
                                </>
                              ) : (
                                <>Upload new</>
                              )}
                              <input
                                type="file"
                                accept="image/*,video/*,.mp4,.webm,.mov,.ogg,.mkv,.m4v"
                                className="hidden"
                                onClick={(e) => {
                                  ;(e.currentTarget as HTMLInputElement).value = ""
                                }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleMobileFileUpload(file)
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          onDragEnter={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsDraggingMobile(true)
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsDraggingMobile(false)
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsDraggingMobile(false)
                            const file = e.dataTransfer.files?.[0]
                            if (file) handleMobileFileUpload(file)
                          }}
                          className={`flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition ${
                            isDraggingMobile
                              ? "border-black bg-black/10 ring-2 ring-black/20"
                              : "border-black/20 bg-white hover:border-black/40 hover:bg-neutral-50/50"
                          }`}
                        >
                          {isUploadingMobile ? (
                            <div className="flex flex-col items-center gap-1.5 w-full max-w-[220px]">
                              <Loader2Icon className="size-6 animate-spin text-black" />
                              <span className="text-xs font-semibold text-black">
                                {uploadProgressMobile !== null && uploadProgressMobile > 0
                                  ? `Uploading mobile media... ${uploadProgressMobile}%`
                                  : "Uploading mobile media..."}
                              </span>
                              {uploadProgressMobile !== null && (
                                <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden mt-1">
                                  <div
                                    className="bg-black h-1.5 rounded-full transition-all duration-150"
                                    style={{ width: `${uploadProgressMobile}%` }}
                                  />
                                </div>
                              )}
                              <span className="text-[10px] text-black/50 mt-0.5">Supports video up to 250 MB</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-1.5 rounded-full bg-black/5 p-2 text-black/60">
                                <UploadIcon className="size-4" />
                                <VideoIcon className="size-4" />
                              </div>
                              <span className="mt-2 text-xs font-semibold text-black">
                                Click or drag Mobile Image or Video
                              </span>
                              <span className="mt-0.5 text-[10px] text-black/50">
                                Recommended: 800×600, 1080×1350, or 1080×1920 (max 250 MB)
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*,video/*,.mp4,.webm,.mov,.ogg,.mkv,.m4v"
                            className="hidden"
                            onClick={(e) => {
                              ;(e.currentTarget as HTMLInputElement).value = ""
                            }}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleMobileFileUpload(file)
                            }}
                          />
                        </label>
                      )}

                      {/* Optional URL Input */}
                      {(!formData.mobileSrc || showMobileUrlInput) && (
                        <div className="mt-2.5">
                          <label className="block text-[10px] font-semibold text-black/65">
                            Mobile Media URL or Path:
                          </label>
                          <input
                            type="text"
                            placeholder="/hero-banner-mobile.mp4 or https://..."
                            value={formData.mobileSrc}
                            onChange={(e) => setFormData({ ...formData, mobileSrc: e.target.value })}
                            className="mt-1 w-full rounded-md border border-black/20 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-black"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation & Display Settings */}
              <div className="space-y-3 pt-2 border-t border-black/10">
                <h3 className="font-semibold text-black text-xs uppercase tracking-wider text-black/50">
                  3. Link & Visibility Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Link URL */}
                  <div>
                    <label className="block font-semibold text-black/80">Link Target URL</label>
                    <input
                      type="text"
                      placeholder="/shop or /product/techno-projector"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-xs outline-none focus:border-black"
                    />
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block font-semibold text-black/80">Display Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })
                      }
                      className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-xs outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Is Active Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="size-4 accent-black rounded"
                  />
                  <label
                    htmlFor="isActiveToggle"
                    className="font-semibold text-black/80 cursor-pointer select-none"
                  >
                    Display this banner on homepage carousel
                  </label>
                </div>
                </div>
              </div>

              {/* Sticky Modal Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-black/10 px-6 py-3.5 bg-neutral-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)} disabled={isUploadingDesktop || isUploadingMobile || isSubmitting}
                  className="rounded-lg border border-black/20 bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingDesktop || isUploadingMobile}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-black/80 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
                  {isUploadingDesktop || isUploadingMobile ? "Waiting for upload…" : editingBanner ? "Save Changes" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteTargetId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-black">Delete Banner?</h3>
            <p className="mt-1 text-xs text-black/60">
              Are you sure you want to delete this hero banner? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="rounded-md border border-black/20 px-3 py-1.5 font-medium text-black hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDelete(deleteTargetId)}
                className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2Icon className="size-3 animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
