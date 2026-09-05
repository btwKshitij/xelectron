"use client"

import Image from "next/image"
import Link from "next/link"
import { Search, Tag } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Switch } from "@/components/ui/switch"

const MENU_LIMIT = 2
type ProductMenuField = "showInNavbar" | "showInWarrantyMenu"

export type NavbarProduct = {
  id: string
  name: string
  mainImage: string
  showInNavbar: boolean
  showInWarrantyMenu: boolean
}

export function NavbarProductsManager({ initialProducts }: { initialProducts: NavbarProduct[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [query, setQuery] = useState("")
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)
  const navbarCount = products.filter((product) => product.showInNavbar).length
  const warrantyCount = products.filter((product) => product.showInWarrantyMenu).length
  const shownProducts = useMemo(() => {
    const searchTerm = query.trim().toLowerCase()
    return [...products]
      .filter((product) => !searchTerm || product.name.toLowerCase().includes(searchTerm))
      .sort((left, right) => Number(right.showInNavbar || right.showInWarrantyMenu) - Number(left.showInNavbar || left.showInWarrantyMenu) || left.name.localeCompare(right.name))
  }, [products, query])

  async function setMenuPlacement(product: NavbarProduct, field: ProductMenuField, enabled: boolean) {
    const isNavbarMenu = field === "showInNavbar"
    const currentCount = isNavbarMenu ? navbarCount : warrantyCount
    const menuLabel = isNavbarMenu ? "Product dropdown" : "Warranty dropdown"

    if (enabled && currentCount >= MENU_LIMIT) {
      toast.error(`Only ${MENU_LIMIT} products can appear in the ${menuLabel}.`)
      return
    }

    const requestKey = `${product.id}:${field}`
    setUpdatingKey(requestKey)
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: enabled }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || `Could not update ${menuLabel}.`)

      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, [field]: enabled } : item))
      toast.success(enabled ? `${product.name} added to the ${menuLabel}` : `${product.name} removed from the ${menuLabel}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not update ${menuLabel}.`)
    } finally {
      setUpdatingKey(null)
    }
  }

  function menuControl(product: NavbarProduct, field: ProductMenuField) {
    const isNavbarMenu = field === "showInNavbar"
    const selected = product[field]
    const count = isNavbarMenu ? navbarCount : warrantyCount
    const label = isNavbarMenu ? "Product menu" : "Warranty menu"

    return (
      <div className="flex items-center justify-between gap-3">
        <span className={selected ? "font-medium text-emerald-700" : "text-slate-500"}>{selected ? "Added" : "Not added"}</span>
        <Switch
          checked={selected}
          onCheckedChange={(checked) => void setMenuPlacement(product, field, checked)}
          disabled={updatingKey === `${product.id}:${field}` || (!selected && count >= MENU_LIMIT)}
          aria-label={`Show ${product.name} in ${label}`}
        />
      </div>
    )
  }

  return (
    <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-5">
      <div className="mx-auto max-w-[1320px]">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold"><Tag className="size-4" /> Menu products</h1>
            <p className="mt-1 text-xs text-black/55">Choose two products for the Product dropdown and two different products for Warranty.</p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide text-blue-700">Product menu</p>
              <p className="mt-0.5 text-sm font-semibold text-blue-950">{navbarCount} / {MENU_LIMIT}</p>
            </div>
            <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide text-violet-700">Warranty menu</p>
              <p className="mt-0.5 text-sm font-semibold text-violet-950">{warrantyCount} / {MENU_LIMIT}</p>
            </div>
          </div>
        </header>

        <section className="mt-4 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
            <p className="text-sm font-medium">Manage menu products</p>
            <label className="flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-black/15 bg-white px-3 text-sm text-black/55 focus-within:border-black/50">
              <Search className="size-4" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-black/40" />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3 font-semibold">Product</th>
                  <th className="w-56 border-b border-slate-200 px-4 py-3 font-semibold">Product dropdown</th>
                  <th className="w-56 border-b border-slate-200 px-4 py-3 font-semibold">Warranty dropdown</th>
                </tr>
              </thead>
              <tbody>
                {shownProducts.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="border-b border-slate-100 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-400">
                          {product.mainImage ? <Image src={product.mainImage} alt="" fill sizes="48px" className="object-contain p-1" /> : product.name.slice(0, 1)}
                        </div>
                        <Link prefetch={false} href={`/dashboard/products/${product.id}`} className="max-w-[430px] truncate text-sm font-semibold text-slate-900 transition-colors hover:text-[#005BD3] hover:underline">{product.name}</Link>
                      </div>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3">{menuControl(product, "showInNavbar")}</td>
                    <td className="border-b border-slate-100 px-4 py-3">{menuControl(product, "showInWarrantyMenu")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {shownProducts.length === 0 ? <p className="px-4 py-12 text-center text-sm text-black/55">No products match your search.</p> : null}
        </section>
      </div>
    </main>
  )
}
