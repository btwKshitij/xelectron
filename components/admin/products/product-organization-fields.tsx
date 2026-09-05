"use client"

import { CirclePlus, X } from "lucide-react"
import { useState } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { defaultProductCategories } from "@/lib/product-categories"

function AddPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-lg bg-black/[0.07] px-2 text-sm text-black/65">
      {children}
    </span>
  )
}

export function ProductOrganizationFields() {
  const [category, setCategory] = useState("")

  return (
    <div className="space-y-4 px-4 pb-4">
      <label className="grid gap-1.5 text-sm text-black/75">
        <span>Collections</span>
        <div className="flex h-9 items-center rounded-lg border border-black/25 px-1.5">
          <AddPill>
            <CirclePlus className="size-3" />
            Add collections
          </AddPill>
        </div>
      </label>

      <label className="grid gap-1.5 text-sm text-black/75">
        <span>Category</span>
        <Select value={category} onValueChange={(nextValue) => { if (nextValue) setCategory(nextValue) }}>
          <SelectTrigger
            aria-label="Product category"
            className="w-full rounded-lg border-black/25 !bg-white text-black shadow-none hover:!bg-white"
          >
            <SelectValue placeholder="Add to a category" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black">
            {defaultProductCategories.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {category ? (
          <span className="flex items-center justify-between gap-2 rounded-lg bg-black/[0.06] px-2.5 py-1.5 text-sm text-black/70">
            {defaultProductCategories.find((option) => option.id === category)?.title}
            <button
              type="button"
              onClick={() => setCategory("")}
              aria-label={`Remove ${category} category`}
              className="rounded p-0.5 text-black/50 transition hover:bg-black/10 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ) : null}
      </label>

      <label className="grid gap-1.5 text-sm text-black/75">
        <span>Tags</span>
        <div className="flex h-9 items-center rounded-lg border border-black/25 px-1.5">
          <AddPill>
            <CirclePlus className="size-3" />
            Add tags
          </AddPill>
        </div>
      </label>
    </div>
  )
}


