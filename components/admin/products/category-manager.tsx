"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Columns3,
  FolderTree,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export type ManagedCategory = {
  id: string
  title: string
  slug: string
  parentId: string | null
  productCount: number
  visible: boolean
  image: string | null
  sortOrder?: number
}

export function CategoryManager({ initialCategories = [] }: { initialCategories?: ManagedCategory[] }) {
  const [categories, setCategories] = useState<ManagedCategory[]>(() =>
    [...(initialCategories ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  )
  const [query, setQuery] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null)
  const [positionInputVal, setPositionInputVal] = useState<string>("")
  const selectAllRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories([...initialCategories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))
    }
  }, [initialCategories])

  const isSearching = query.trim().length > 0
  const visibleCategories = isSearching
    ? categories.filter((category) =>
        category.title.toLowerCase().includes(query.trim().toLowerCase())
      )
    : categories

  const allVisibleSelected = visibleCategories.length > 0 && visibleCategories.every((category) => selectedCategoryIds.includes(category.id))
  const someVisibleSelected = visibleCategories.some((category) => selectedCategoryIds.includes(category.id))
  const selectedCategories = categories.filter((category) => selectedCategoryIds.includes(category.id))
  const selectedProductCount = selectedCategories.reduce((total, category) => total + category.productCount, 0)
  const childCategoriesToPromote = categories.filter((category) =>
    category.parentId !== null && selectedCategoryIds.includes(category.parentId) && !selectedCategoryIds.includes(category.id)
  )
  const destinationCategories = categories.filter((category) => !selectedCategoryIds.includes(category.id))
  const needsProductDestination = selectedProductCount > 0
  const canBulkDelete = selectedCategoryIds.length > 0 && (!needsProductDestination || destinationCategories.length > 0)
  const parentTitle = (parentId: string | null) =>
    categories.find((category) => category.id === parentId)?.title ?? "—"

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected && !allVisibleSelected
    }
  }, [allVisibleSelected, someVisibleSelected])

  function toggleCategorySelection(categoryId: string, selected: boolean) {
    setSelectedCategoryIds((current) => selected
      ? current.includes(categoryId) ? current : [...current, categoryId]
      : current.filter((id) => id !== categoryId)
    )
  }

  function toggleVisibleCategorySelection(selected: boolean) {
    const visibleIds = new Set(visibleCategories.map((category) => category.id))
    setSelectedCategoryIds((current) => selected
      ? Array.from(new Set([...current, ...visibleIds]))
      : current.filter((id) => !visibleIds.has(id))
    )
  }

  async function toggleVisibility(category: ManagedCategory, visible: boolean) {
    const previousCategories = categories
    setCategories((current) => current.map((item) => item.id === category.id ? { ...item, visible } : item))

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible }),
      })
      if (!response.ok) throw new Error("Could not update category visibility")
      toast.success(`"${category.title}" is now ${visible ? "visible" : "hidden"}`)
    } catch {
      setCategories(previousCategories)
      toast.error("Could not update category visibility")
    }
  }

  async function saveReorderedCategories(
    reordered: ManagedCategory[],
    previous: ManagedCategory[],
    successMessage?: string
  ) {
    setIsReordering(true)
    try {
      const response = await fetch("/api/categories/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map((cat, idx) => ({ id: cat.id, sortOrder: idx })),
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Could not save the new category order.")
      }
      if (successMessage) {
        toast.success(successMessage)
      }
    } catch (error) {
      setCategories(previous)
      toast.error(error instanceof Error ? error.message : "Failed to update category order.")
    } finally {
      setIsReordering(false)
    }
  }

  function moveCategory(categoryId: string, direction: -1 | 1) {
    if (isSearching || isReordering) return
    const currentIndex = categories.findIndex((c) => c.id === categoryId)
    const targetIndex = currentIndex + direction
    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= categories.length) return

    const previous = categories
    const next = [...categories]
    const [moved] = next.splice(currentIndex, 1)
    next.splice(targetIndex, 0, moved)
    const reordered = next.map((cat, idx) => ({ ...cat, sortOrder: idx }))
    setCategories(reordered)

    void saveReorderedCategories(
      reordered,
      previous,
      `Moved "${moved.title}" to position ${targetIndex + 1}`
    )
  }

  function commitPositionChange(categoryId: string, inputVal: string) {
    setEditingPositionId(null)
    if (isSearching || isReordering) return

    const targetPos = parseInt(inputVal, 10)
    if (isNaN(targetPos) || targetPos < 1) return

    const targetIndex = Math.max(0, Math.min(categories.length - 1, targetPos - 1))
    const currentIndex = categories.findIndex((c) => c.id === categoryId)
    if (currentIndex === -1 || currentIndex === targetIndex) return

    const previous = categories
    const next = [...categories]
    const [moved] = next.splice(currentIndex, 1)
    next.splice(targetIndex, 0, moved)
    const reordered = next.map((cat, idx) => ({ ...cat, sortOrder: idx }))
    setCategories(reordered)

    void saveReorderedCategories(
      reordered,
      previous,
      `Set "${moved.title}" to position ${targetIndex + 1}`
    )
  }

  function handleDragStart(e: React.DragEvent, categoryId: string) {
    if (isSearching || isReordering) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData("text/plain", categoryId)
    e.dataTransfer.effectAllowed = "move"
    setDraggedId(categoryId)
  }

  function handleDragOver(e: React.DragEvent, categoryId: string) {
    if (isSearching || isReordering) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverId !== categoryId) {
      setDragOverId(categoryId)
    }
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (isSearching || isReordering || !draggedId || draggedId === targetId) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }

    const fromIndex = categories.findIndex((c) => c.id === draggedId)
    const toIndex = categories.findIndex((c) => c.id === targetId)
    if (fromIndex === -1 || toIndex === -1) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }

    const previous = categories
    const next = [...categories]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    const reordered = next.map((cat, idx) => ({ ...cat, sortOrder: idx }))
    setCategories(reordered)
    setDraggedId(null)
    setDragOverId(null)

    void saveReorderedCategories(
      reordered,
      previous,
      `Moved "${moved.title}" to position ${toIndex + 1}`
    )
  }

  function handleDragEnd() {
    setDraggedId(null)
    setDragOverId(null)
  }

  async function deleteCategory(category: ManagedCategory) {
    if (!window.confirm(`Delete ${category.title}?`)) return

    try {
      const response = await fetch(`/api/categories/${category.id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Could not delete category")
      setCategories((current) => {
        const updated = current.filter((item) => item.id !== category.id)
        return updated.map((item, idx) => ({ ...item, sortOrder: idx }))
      })
      toast.success(`"${category.title}" deleted`)
    } catch {
      toast.error("This category could not be deleted. Remove or reassign its products first.")
    }
  }

  async function deleteSelectedCategories() {
    if (selectedCategoryIds.length === 0) return
    if (!canBulkDelete) {
      toast.error("Keep one category available to receive the linked products.")
      return
    }

    setIsBulkDeleting(true)
    try {
      const response = await fetch("/api/categories/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedCategoryIds }),
      })
      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.error ?? "Could not delete the selected categories.")
      }

      const deletedIds = new Set(selectedCategoryIds)
      setCategories((current) => {
        const updated = current.filter((category) => !deletedIds.has(category.id))
        return updated.map((item, idx) => ({ ...item, sortOrder: idx }))
      })
      setSelectedCategoryIds([])
      setBulkDeleteOpen(false)
      toast.success(
        `${result?.deleted ?? deletedIds.size} categor${(result?.deleted ?? deletedIds.size) === 1 ? "y" : "ies"} deleted${result?.productsMoved ? ` and ${result.productsMoved} product${result.productsMoved === 1 ? "" : "s"} moved` : ""}`
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the selected categories.")
    } finally {
      setIsBulkDeleting(false)
    }
  }

  return (
    <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <FolderTree className="size-4" />
          Categories
        </h1>
        <Link prefetch={false}
          href="/dashboard/products/categories/new"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-medium text-white transition hover:bg-black/80"
        >
          <Plus className="size-3.5" />
          Add category
        </Link>
      </div>

      <section className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-black/10 px-4 py-3">
          <button type="button" className="inline-flex items-center gap-1 text-xs font-medium text-black/70">
            All
            <ChevronsUpDown className="size-3.5" />
          </button>
          <label className="flex min-w-52 flex-1 items-center gap-2 text-sm text-black/50">
            <Search className="size-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search and filter categories"
              placeholder="Search and filter"
              className="w-full bg-transparent outline-none placeholder:text-black/45"
            />
          </label>

          {isReordering ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600">
              <Loader2 className="size-3.5 animate-spin" />
              Saving order…
            </span>
          ) : isSearching ? (
            <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              Filter active · clear search to reorder
            </span>
          ) : (
            <span className="text-[11px] text-black/40">
              Drag rows or use arrows / numbers to reorder
            </span>
          )}

          <button
            type="button"
            aria-label="Choose category columns"
            className="rounded-md border-l border-black/10 pl-3 text-black/55 transition hover:text-black"
          >
            <Columns3 className="size-4" />
          </button>
        </div>

        {selectedCategoryIds.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-blue-50/70 px-4 py-2.5">
            <div>
              <p className="text-xs font-medium text-[#0c3152]">
                {selectedCategoryIds.length} categor{selectedCategoryIds.length === 1 ? "y" : "ies"} selected
              </p>
              {needsProductDestination ? (
                <p className="mt-0.5 text-[11px] text-[#76571a]">
                  {selectedProductCount} product{selectedProductCount === 1 ? "" : "s"} will be moved to an available category automatically.
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategoryIds([])}
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-[#0c3152] transition hover:bg-blue-100"
              >
                Clear selection
              </button>
              <button
                type="button"
                onClick={() => canBulkDelete && setBulkDeleteOpen(true)}
                disabled={!canBulkDelete}
                title={!canBulkDelete ? "Keep at least one category to receive the selected products" : undefined}
                className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                <Trash2 className="size-3.5" />
                {canBulkDelete ? "Delete selected" : "Keep one category"}
              </button>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse text-left text-xs">
            <thead className="bg-black/[0.025] text-black/65">
              <tr>
                <th className="w-10 border-b border-black/10 px-3 py-2.5 font-medium">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(event) => toggleVisibleCategorySelection(event.target.checked)}
                    aria-label="Select all visible categories"
                  />
                </th>
                <th className="w-28 border-b border-black/10 px-3 py-2.5 font-medium">Position</th>
                <th className="border-b border-black/10 px-3 py-2.5 font-medium">Category</th>
                <th className="border-b border-black/10 px-3 py-2.5 font-medium">Parent</th>
                <th className="w-20 border-b border-black/10 px-3 py-2.5 font-medium">Products</th>
                <th className="w-36 border-b border-black/10 px-3 py-2.5 font-medium">Store visibility</th>
                <th className="w-24 border-b border-black/10 px-3 py-2.5 font-medium" />
              </tr>
            </thead>
            <tbody>
              {visibleCategories.map((category) => {
                const fullIndex = categories.findIndex((c) => c.id === category.id)
                const isFirst = fullIndex === 0
                const isLast = fullIndex === categories.length - 1
                const isBeingDragged = draggedId === category.id
                const isDropTarget = dragOverId === category.id && !isBeingDragged

                return (
                  <tr
                    key={category.id}
                    onDragOver={(e) => handleDragOver(e, category.id)}
                    onDrop={(e) => handleDrop(e, category.id)}
                    className={cn(
                      "transition-colors",
                      isBeingDragged && "bg-blue-50/40 opacity-40",
                      isDropTarget && "border-t-2 border-blue-500 bg-blue-50/70",
                      "hover:bg-black/[0.02]"
                    )}
                  >
                    <td className="border-b border-black/10 px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(category.id)}
                        onChange={(event) => toggleCategorySelection(category.id, event.target.checked)}
                        aria-label={`Select ${category.title}`}
                      />
                    </td>

                    {/* Manual Position Controls */}
                    <td className="border-b border-black/10 px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {/* Drag grip */}
                        <div
                          draggable={!isReordering && !isSearching}
                          onDragStart={(e) => handleDragStart(e, category.id)}
                          onDragEnd={handleDragEnd}
                          title={isSearching ? "Clear search to drag and reorder" : "Drag to reorder position"}
                          className={cn(
                            "cursor-grab rounded p-1 text-black/35 transition hover:bg-black/[0.06] hover:text-black active:cursor-grabbing",
                            (isSearching || isReordering) && "cursor-not-allowed opacity-30 hover:bg-transparent hover:text-black/35"
                          )}
                          aria-label={`Drag to reorder ${category.title}`}
                        >
                          <GripVertical className="size-4" />
                        </div>

                        {/* Numeric position input */}
                        <input
                          type="number"
                          min={1}
                          max={categories.length}
                          value={editingPositionId === category.id ? positionInputVal : fullIndex + 1}
                          onFocus={() => {
                            setEditingPositionId(category.id)
                            setPositionInputVal(String(fullIndex + 1))
                          }}
                          onChange={(e) => setPositionInputVal(e.target.value)}
                          onBlur={() => commitPositionChange(category.id, positionInputVal)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur()
                            } else if (e.key === "Escape") {
                              setEditingPositionId(null)
                            }
                          }}
                          disabled={isReordering || isSearching}
                          title={isSearching ? "Clear search to change position" : "Type a position number (Press Enter)"}
                          aria-label={`Position of ${category.title}`}
                          className="h-7 w-11 rounded border border-black/20 bg-white text-center text-xs font-semibold text-black/80 transition focus:border-black/60 focus:outline-none focus:ring-1 focus:ring-black/20 disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:opacity-60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        {/* Move Up / Move Down arrow buttons */}
                        <div className="flex flex-col -space-y-0.5">
                          <button
                            type="button"
                            onClick={() => moveCategory(category.id, -1)}
                            disabled={isFirst || isReordering || isSearching}
                            title={isFirst ? "Already at top" : isSearching ? "Clear search to reorder" : "Move up"}
                            aria-label={`Move ${category.title} up`}
                            className="rounded p-0.5 text-black/40 transition hover:bg-black/[0.08] hover:text-black disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:bg-transparent"
                          >
                            <ChevronUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveCategory(category.id, 1)}
                            disabled={isLast || isReordering || isSearching}
                            title={isLast ? "Already at bottom" : isSearching ? "Clear search to reorder" : "Move down"}
                            aria-label={`Move ${category.title} down`}
                            className="rounded p-0.5 text-black/40 transition hover:bg-black/[0.08] hover:text-black disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:bg-transparent"
                          >
                            <ChevronDown className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="border-b border-black/10 px-3 py-2.5">
                      <Link
                        prefetch={false}
                        href={`/dashboard/products/categories/${category.id}`}
                        className="flex items-center gap-3 font-medium text-[#0c3152] hover:underline"
                      >
                        <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-black/[0.04] text-xs font-semibold text-black/60">
                          {category.image ? (
                            <Image src={category.image} alt="" fill sizes="40px" className="object-contain p-1" />
                          ) : (
                            category.title.slice(0, 1)
                          )}
                        </span>
                        <span>
                          <span className="block">{category.title}</span>
                          <span className="mt-1 block text-[11px] font-normal text-black/45">/categories/{category.slug}</span>
                        </span>
                      </Link>
                    </td>

                    <td className="border-b border-black/10 px-3 py-2.5 text-black/65">
                      {parentTitle(category.parentId)}
                    </td>

                    <td className="border-b border-black/10 px-3 py-2.5 text-black/65">
                      {category.productCount}
                    </td>

                    <td className="border-b border-black/10 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={category.visible}
                          onCheckedChange={(checked) => void toggleVisibility(category, checked)}
                          aria-label={`Toggle ${category.title} visibility`}
                        />
                        <span className="text-black/60">{category.visible ? "Visible" : "Hidden"}</span>
                      </div>
                    </td>

                    <td className="border-b border-black/10 px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <Link
                          prefetch={false}
                          href={`/dashboard/products/categories/${category.id}`}
                          aria-label={`Edit ${category.title}`}
                          className="rounded-md p-1.5 text-black/50 transition hover:bg-black/[0.06] hover:text-black"
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => void deleteCategory(category)}
                          aria-label={`Delete ${category.title}`}
                          className="rounded-md p-1.5 text-black/50 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {visibleCategories.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-black/55">No categories match your search.</p>
        ) : null}
      </section>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected categories?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedCategoryIds.length} selected categor{selectedCategoryIds.length === 1 ? "y" : "ies"}.{needsProductDestination ? ` ${selectedProductCount} linked product${selectedProductCount === 1 ? " will" : "s will"} be kept and moved automatically.` : ""}{childCategoriesToPromote.length > 0 ? ` ${childCategoriesToPromote.length} child categor${childCategoriesToPromote.length === 1 ? "y will" : "ies will"} become top-level.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void deleteSelectedCategories()}
              disabled={isBulkDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isBulkDeleting ? "Deleting…" : "Delete categories"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
