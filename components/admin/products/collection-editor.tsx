"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronDown,
  ChevronRight,
  Check,
  CirclePlus,
  Grid2X2,
  ImageUp,
  LayoutList,
  Link2,
  Pencil,
  Search,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const availableProducts = [
  ["XELECTRON BAMBOO CREW TEE 1.0", "product9.png"],
  ["XELECTRON BAMBOO TEE 1.0", "product8.png"],
  ["XELECTRON PIN TUCK PANTS", "product7.png"],
  ["XELECTRON RIBBED MUSCLE TANK", "product6.png"],
  ["XELECTRON EASE PANTS", "product5.png"],
  ["XELECTRON ALDEN SUEDE SLIDES", "product4.png"],
  ["XELECTRON BLACK RESERVE DENIM", "product3.png"],
  ["XELECTRON INDIGO RESERVE DENIM", "product2.png"],
  ["XELECTRON STUDIO SNEAKERS", "product1.png"],
] as const

type Product = (typeof availableProducts)[number]

type CollectionSource = {
  id: string
  title: string
  image: string
  products: Product[]
}

const collectionSources: CollectionSource[] = [
  { id: "best-sellers", title: "BEST SELLERS", image: "product1.png", products: [availableProducts[0], availableProducts[1], availableProducts[3], availableProducts[8]] },
  { id: "clothing", title: "CLOTHING", image: "product7.png", products: [availableProducts[0], availableProducts[2], availableProducts[3], availableProducts[4]] },
  { id: "new-drop", title: "NEW DROP", image: "product8.png", products: [availableProducts[1], availableProducts[6], availableProducts[7]] },
  { id: "denim", title: "DENIM", image: "product3.png", products: [availableProducts[6], availableProducts[7]] },
  { id: "footwear", title: "FOOTWEAR", image: "product4.png", products: [availableProducts[5], availableProducts[8]] },
  { id: "everyday-essentials", title: "EVERYDAY ESSENTIALS", image: "product9.png", products: [availableProducts[0], availableProducts[1], availableProducts[4]] },
]

const sortOptions = [
  "Most relevant",
  "Best selling",
  "Product title A-Z",
  "Product title Z-A",
  "Highest price",
  "Lowest price",
  "Newest",
  "Oldest",
  "Manually",
] as const

type SortOption = (typeof sortOptions)[number]

const productSortMetrics: Record<string, { sales: number; price: number; created: number }> = {
  "XELECTRON BAMBOO CREW TEE 1.0": { sales: 43, price: 1499, created: 2 },
  "XELECTRON BAMBOO TEE 1.0": { sales: 84, price: 1299, created: 7 },
  "XELECTRON PIN TUCK PANTS": { sales: 37, price: 2599, created: 3 },
  "XELECTRON RIBBED MUSCLE TANK": { sales: 66, price: 999, created: 8 },
  "XELECTRON EASE PANTS": { sales: 29, price: 2899, created: 4 },
  "XELECTRON ALDEN SUEDE SLIDES": { sales: 51, price: 2199, created: 5 },
  "XELECTRON BLACK RESERVE DENIM": { sales: 72, price: 3499, created: 1 },
  "XELECTRON INDIGO RESERVE DENIM": { sales: 58, price: 3299, created: 6 },
  "XELECTRON STUDIO SNEAKERS": { sales: 91, price: 3999, created: 9 },
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm ${className}`}>{children}</section>
}

function ProductSkeletons() {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-black/[0.07]">
          <div className="aspect-square animate-pulse bg-black/[0.025]" />
          <div className="space-y-2 p-2.5"><div className="h-2.5 w-full animate-pulse rounded bg-black/[0.025]" /><div className="h-2.5 w-2/3 animate-pulse rounded bg-black/[0.025]" /></div>
        </div>
      ))}
    </div>
  )
}

function ProductPicker({
  open,
  onOpenChange,
  picked,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  picked: Product[]
  onDone: (products: Product[]) => void
}) {
  const [search, setSearch] = React.useState("")
  const [draft, setDraft] = React.useState<Product[]>(picked)

  const visibleProducts = availableProducts.filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
  const toggleProduct = (product: Product) => {
    setDraft((current) => current.some(([name]) => name === product[0]) ? current.filter(([name]) => name !== product[0]) : [...current, product])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:!w-[620px] sm:!max-w-[620px]" showCloseButton={false} overlayClassName="bg-black/45 supports-backdrop-filter:backdrop-blur-[1px]">
        <DialogHeader className="flex-row items-center justify-between border-b border-black/10 px-5 py-4">
          <div><DialogTitle className="text-base font-semibold">Select products to include</DialogTitle><DialogDescription className="sr-only">Choose the products that belong to this collection.</DialogDescription></div>
          <button type="button" onClick={() => { setDraft(picked); onOpenChange(false) }} aria-label="Close product picker" className="rounded-md p-1 text-black/45 transition hover:bg-black/5 hover:text-black"><X className="size-5" /></button>
        </DialogHeader>
        <div className="space-y-3 border-b border-black/10 px-4 py-3">
          <div className="flex gap-2">
            <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-black/35 px-3 ring-2 ring-transparent focus-within:border-black focus-within:ring-black/10"><Search className="size-4 text-black/55" /><input value={search} onChange={(event) => setSearch(event.target.value)} autoFocus placeholder="Search products" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/45" /></label>
            <button type="button" className="hidden h-9 items-center gap-1 rounded-lg border border-black/25 px-3 text-sm text-black/65 sm:inline-flex">Search by All <ChevronDown className="size-3.5" /></button>
          </div>
          <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-black/15 px-2 text-xs font-medium text-black/65 hover:bg-black/[0.03]"><SlidersHorizontal className="size-3" /> Add filter</button>
        </div>
        <div className="max-h-[440px] overflow-y-auto">
          {visibleProducts.map((product) => {
            const checked = draft.some(([name]) => name === product[0])
            return <label key={product[0]} className="flex cursor-pointer items-center gap-3 border-b border-black/[0.08] px-4 py-2.5 transition hover:bg-black/[0.02]"><input type="checkbox" checked={checked} onChange={() => toggleProduct(product)} className="size-4 rounded border-black/35 accent-black" /><Image src={`/images/products/${product[1]}`} alt="" width={42} height={42} className="size-10 rounded-md border border-black/10 object-cover" /><span className="text-sm font-medium text-black/80">{product[0]}</span></label>
          })}
          {visibleProducts.length === 0 && <p className="px-4 py-10 text-center text-sm text-black/55">No products match your search.</p>}
        </div>
        <DialogFooter className="flex-row items-center justify-between border-t border-black/10 px-4 py-3 sm:justify-between"><span className="text-xs text-black/55">{draft.length} selected</span><div className="flex gap-2"><button type="button" onClick={() => { setDraft(picked); onOpenChange(false) }} className="h-8 rounded-lg border border-black/15 px-3 text-sm font-medium hover:bg-black/[0.03]">Cancel</button><button type="button" onClick={() => { onDone(draft); onOpenChange(false) }} className="h-8 rounded-lg bg-black px-3 text-sm font-medium text-white hover:bg-black/80">Done</button></div></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CollectionPicker({
  open,
  onOpenChange,
  selectedIds,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  onDone: (collections: CollectionSource[]) => void
}) {
  const [search, setSearch] = React.useState("")
  const [draftIds, setDraftIds] = React.useState<string[]>(selectedIds)
  const visibleCollections = collectionSources.filter((collection) => collection.title.toLowerCase().includes(search.toLowerCase()))

  const toggleCollection = (id: string) => {
    setDraftIds((current) => current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:!w-[620px] sm:!max-w-[620px]" showCloseButton={false} overlayClassName="bg-black/45 supports-backdrop-filter:backdrop-blur-[1px]">
        <DialogHeader className="flex-row items-center justify-between border-b border-black/10 px-5 py-4">
          <div><DialogTitle className="text-base font-semibold">Add collections</DialogTitle><DialogDescription className="sr-only">Choose collections whose products should be added to this collection.</DialogDescription></div>
          <button type="button" onClick={() => { setDraftIds(selectedIds); onOpenChange(false) }} aria-label="Close collection picker" className="rounded-md p-1 text-black/45 transition hover:bg-black/5 hover:text-black"><X className="size-5" /></button>
        </DialogHeader>
        <div className="border-b border-black/10 px-4 py-3"><label className="flex h-9 items-center gap-2 rounded-lg border border-black/35 px-3 ring-2 ring-transparent focus-within:border-black focus-within:ring-black/10"><Search className="size-4 text-black/55" /><input value={search} onChange={(event) => setSearch(event.target.value)} autoFocus placeholder="Search collections" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/45" /></label></div>
        <div className="max-h-[420px] overflow-y-auto"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-black/[0.025] px-4 py-2 text-xs font-medium text-black/65"><span>Collection</span><span>Products</span></div>{visibleCollections.map((collection) => { const checked = draftIds.includes(collection.id); return <label key={collection.id} className="flex cursor-pointer items-center gap-3 border-b border-black/[0.08] px-4 py-2.5 transition hover:bg-black/[0.02]"><input type="checkbox" checked={checked} onChange={() => toggleCollection(collection.id)} className="size-4 rounded border-black/35 accent-black" /><Image src={`/images/products/${collection.image}`} alt="" width={42} height={42} className="size-10 rounded-md border border-black/10 object-cover" /><span className="min-w-0 flex-1 truncate text-sm font-medium text-black/80">{collection.title}</span><span className="text-sm text-black/65">{collection.products.length}</span></label> })}{visibleCollections.length === 0 && <p className="px-4 py-10 text-center text-sm text-black/55">No collections match your search.</p>}</div>
        <DialogFooter className="flex-row items-center justify-between border-t border-black/10 px-4 py-3 sm:justify-between"><span className="text-xs text-black/55">{draftIds.length} collections selected</span><div className="flex gap-2"><button type="button" onClick={() => { setDraftIds(selectedIds); onOpenChange(false) }} className="h-8 rounded-lg border border-black/15 px-3 text-sm font-medium hover:bg-black/[0.03]">Cancel</button><button type="button" disabled={draftIds.length === 0} onClick={() => { onDone(collectionSources.filter((collection) => draftIds.includes(collection.id))); onOpenChange(false) }} className="h-8 rounded-lg bg-black px-3 text-sm font-medium text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/15">Add</button></div></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CollectionEditor() {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [products, setProducts] = React.useState<Product[]>([])
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [collectionPickerOpen, setCollectionPickerOpen] = React.useState(false)
  const [sourceMenuOpen, setSourceMenuOpen] = React.useState(false)
  const [sourceMode, setSourceMode] = React.useState<"products" | "collections">("products")
  const [selectedCollectionIds, setSelectedCollectionIds] = React.useState<string[]>([])
  const [saved, setSaved] = React.useState(false)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [view, setView] = React.useState<"grid" | "list">("grid")
  const [sort, setSort] = React.useState<SortOption>("Most relevant")

  const canSave = title.trim().length > 0
  const sortedProducts = React.useMemo(() => {
    const ordered = [...products]
    const byName = (direction: 1 | -1) => ordered.sort(([left], [right]) => direction * left.localeCompare(right))
    const byMetric = (metric: "sales" | "price" | "created", direction: 1 | -1) => ordered.sort(([left], [right]) => direction * (productSortMetrics[left][metric] - productSortMetrics[right][metric]))

    switch (sort) {
      case "Best selling": return byMetric("sales", -1)
      case "Product title A-Z": return byName(1)
      case "Product title Z-A": return byName(-1)
      case "Highest price": return byMetric("price", -1)
      case "Lowest price": return byMetric("price", 1)
      case "Newest": return byMetric("created", -1)
      case "Oldest": return byMetric("created", 1)
      default: return ordered
    }
  }, [products, sort])
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? [])
    if (file) setImagePreview(URL.createObjectURL(file))
  }
  const selectedCollections = collectionSources.filter((collection) => selectedCollectionIds.includes(collection.id))
  const addCollectionProducts = (collections: CollectionSource[]) => {
    setSelectedCollectionIds(collections.map((collection) => collection.id))
    setProducts((current) => {
      const productsByName = new Map(current.map((product) => [product[0], product]))
      collections.flatMap((collection) => collection.products).forEach((product) => productsByName.set(product[0], product))
      return Array.from(productsByName.values())
    })
    setSaved(false)
  }

  return (
    <main className="min-h-full bg-[#f5f5f5] p-4 text-black sm:p-5">
      <div className="mx-auto max-w-[968px]">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-1.5 text-lg font-semibold"><Tag className="size-4" /><ChevronRight className="size-4 text-black/45" /> Add collection</h1>
          <div className="flex items-center gap-2"><Link href="/dashboard/products/collections" className="inline-flex h-8 items-center rounded-lg bg-black/[0.06] px-3 text-xs font-medium hover:bg-black/10">Discard</Link><button type="button" disabled={!canSave} onClick={() => setSaved(true)} className="inline-flex h-8 items-center rounded-lg bg-black px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/15">{saved ? "Saved" : "Save"}</button></div>
        </header>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_318px]">
          <div className="space-y-4">
            <SectionCard>
              <div className="flex min-h-48 gap-5 p-4">
                <label className="group relative flex aspect-square w-36 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-black/35 bg-black/[0.015] text-black/55 transition hover:border-black/60 hover:bg-black/[0.03]">
                  {imagePreview ? <Image src={imagePreview} alt="Collection cover preview" fill unoptimized className="object-cover" /> : <ImageUp className="size-5" />}
                  <input type="file" accept="image/*" onChange={handleUpload} className="sr-only" />
                </label>
                <div className="min-w-0 flex-1 pt-1"><label className="sr-only" htmlFor="collection-title">Collection title</label><input id="collection-title" value={title} onChange={(event) => { setTitle(event.target.value); setSaved(false) }} placeholder="Add title" className="w-full bg-transparent text-xl font-semibold text-black outline-none placeholder:text-black/55" /><label className="sr-only" htmlFor="collection-description">Collection description</label><textarea id="collection-description" value={description} onChange={(event) => { setDescription(event.target.value); setSaved(false) }} placeholder="Add description" rows={3} className="mt-3 w-full resize-none bg-transparent text-sm leading-6 text-black/75 outline-none placeholder:text-black/50" /></div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 px-4 py-3"><h2 className="text-sm font-semibold">Collection items <span className="ml-1 rounded-md bg-black/[0.07] px-2 py-0.5 text-xs text-black/60">{products.length}</span></h2>{products.length > 0 ? <Popover><PopoverTrigger asChild><button type="button" aria-label="Choose collection sort order" className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-black/60 transition hover:bg-black/[0.04] hover:text-black"><span>Default sort:</span><strong className="font-semibold text-black/75">{sort}</strong><ChevronDown className="ml-0.5 size-3.5" /></button></PopoverTrigger><PopoverContent align="end" sideOffset={6} className="w-[168px] gap-1 rounded-xl p-1.5 shadow-lg"><div role="menu" aria-label="Collection sort options">{sortOptions.map((option) => <button key={option} type="button" role="menuitemradio" aria-checked={sort === option} onClick={() => setSort(option)} className={`flex h-8 w-full items-center rounded-lg px-2 text-left text-sm transition ${sort === option ? "bg-black/[0.05] font-medium text-black" : "text-black/75 hover:bg-black/[0.04]"}`}><Check className={`mr-2 size-3.5 ${sort === option ? "opacity-100" : "opacity-0"}`} />{option}</button>)}</div></PopoverContent></Popover> : <p className="text-xs text-black/55">Add products to populate your collection</p>}</div>
              <div className="border-b border-black/10 px-4 py-3"><div className="flex items-center gap-2"><button type="button" aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")} className={`rounded-md p-1.5 transition ${view === "grid" ? "bg-black/[0.06] text-black/65" : "text-black/35 hover:bg-black/[0.04]"}`}><Grid2X2 className="size-4" /></button><button type="button" aria-label="List view" aria-pressed={view === "list"} onClick={() => setView("list")} className={`rounded-md p-1.5 transition ${view === "list" ? "bg-black/[0.06] text-black/65 shadow-sm" : "text-black/35 hover:bg-black/[0.04]"}`}><LayoutList className="size-4" /></button></div></div>
              {products.length === 0 ? <ProductSkeletons /> : view === "grid" ? <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">{sortedProducts.map(([name, image]) => <article key={name} className="group overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="relative aspect-square bg-[#fafafa]"><Image src={`/images/products/${image}`} alt={name} fill sizes="(max-width: 640px) 50vw, 150px" className="object-cover" /></div><p className="min-h-12 border-t border-black/[0.06] px-2 py-2 text-[11px] font-medium leading-4 text-black/75">{name}</p></article>)}</div> : <div className="divide-y divide-black/10">{sortedProducts.map(([name, image]) => <article key={name} className="group flex min-h-16 items-center gap-3 px-4 py-2.5 transition hover:bg-black/[0.02]"><Image src={`/images/products/${image}`} alt="" width={40} height={40} className="size-10 rounded-lg border border-black/10 object-cover" /><p className="min-w-0 flex-1 truncate text-sm font-medium text-black/85">{name}</p><button type="button" onClick={() => { setProducts((current) => current.filter(([productName]) => productName !== name)); setSaved(false) }} aria-label={`Remove ${name} from collection`} className="rounded-md p-1.5 text-black/25 transition hover:bg-black/[0.05] hover:text-black/65"><X className="size-4" /></button></article>)}</div>}
            </SectionCard>

            <SectionCard><div className="flex items-center justify-between px-4 pt-4"><h2 className="text-sm font-semibold text-black/75">Search engine listing</h2><button type="button" aria-label="Edit search engine listing" className="rounded p-1 text-black/50 hover:bg-black/[0.04]"><Pencil className="size-4" /></button></div><div className="px-4 pb-5 pt-4"><p className="text-sm font-medium text-black/75">{title || "Xelectron"}</p><p className="mt-1 text-sm text-black/55">https://xelectron.com › collections › {title ? title.toLowerCase().replaceAll(" ", "-") : ""}</p></div></SectionCard>
          </div>

          <aside className="space-y-3 xl:pt-0">
            <SectionCard><div className="border-b border-black/10"><Popover open={sourceMenuOpen} onOpenChange={setSourceMenuOpen}><PopoverTrigger asChild><button type="button" aria-label="Choose collection item source" className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-black/[0.02]"><Tag className="size-4" />{sourceMode === "products" ? "Products" : "Collection"}<ChevronDown className="ml-auto size-3.5" /></button></PopoverTrigger><PopoverContent align="start" sideOffset={4} className="w-44 gap-1 rounded-xl p-1.5 shadow-lg"><button type="button" onClick={() => { setSourceMode("products"); setSourceMenuOpen(false) }} className={`flex h-8 w-full items-center rounded-lg px-2 text-left text-sm transition ${sourceMode === "products" ? "bg-black/[0.05] font-medium" : "hover:bg-black/[0.04]"}`}><Tag className="mr-2 size-3.5" />Products</button><button type="button" onClick={() => { setSourceMode("collections"); setSourceMenuOpen(false) }} className={`flex h-8 w-full items-center rounded-lg px-2 text-left text-sm transition ${sourceMode === "collections" ? "bg-black/[0.05] font-medium" : "hover:bg-black/[0.04]"}`}><Link2 className="mr-2 size-3.5" />Collection</button></PopoverContent></Popover></div><div className="p-2"><div className="flex flex-wrap gap-2 rounded-lg border border-black/10 p-2">{sourceMode === "products" ? <button type="button" onClick={() => setPickerOpen(true)} className="inline-flex h-8 items-center gap-1 rounded-lg bg-black/[0.05] px-2.5 text-xs font-medium text-black/70 hover:bg-black/10"><CirclePlus className="size-3.5" />Add products</button> : <>{selectedCollections.map((collection) => <span key={collection.id} className="inline-flex h-7 items-center rounded-md bg-black/[0.06] px-2 text-xs font-medium text-black/70">{collection.title}</span>)}<button type="button" onClick={() => setCollectionPickerOpen(true)} className="inline-flex h-8 items-center gap-1 rounded-lg bg-black/[0.05] px-2.5 text-xs font-medium text-black/70 hover:bg-black/10"><CirclePlus className="size-3.5" />Add collection</button></>}</div></div></SectionCard>
          </aside>
        </div>
      </div>
      <ProductPicker key={`products:${products.map(([name]) => name).join("|")}`} open={pickerOpen} onOpenChange={setPickerOpen} picked={products} onDone={(selected) => { setProducts(selected); setSaved(false) }} />
      <CollectionPicker key={`collections:${selectedCollectionIds.join("|")}`} open={collectionPickerOpen} onOpenChange={setCollectionPickerOpen} selectedIds={selectedCollectionIds} onDone={addCollectionProducts} />
    </main>
  )
}
