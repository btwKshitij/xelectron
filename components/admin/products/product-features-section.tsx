"use client"

import { Plus, Trash2, ListPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ProductFeaturesSectionProps {
  features: string[]
  onChange: (features: string[]) => void
}

export function ProductFeaturesSection({ features, onChange }: ProductFeaturesSectionProps) {

  function addFeature() {
    onChange([...features, ""])
  }

  function updateFeature(index: number, value: string) {
    const newFeatures = [...features]
    newFeatures[index] = value
    onChange(newFeatures)
  }

  function removeFeature(index: number) {
    const newFeatures = [...features]
    newFeatures.splice(index, 1)
    onChange(newFeatures)
  }

  return (
    <section className="mt-4 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 px-4 py-4">
        <div>
          <h2 className="text-sm font-semibold text-black/75">Key Features</h2>
          <p className="mt-1 text-xs leading-5 text-black/50">Add short, punchy bullet points to highlight the product's main selling points.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addFeature} className="shrink-0 cursor-pointer border-black/15 bg-white text-black/70 shadow-none hover:bg-black/[0.03]">
          <Plus className="size-3.5 mr-1" /> Add feature
        </Button>
      </div>

      {features.length > 0 ? (
        <div className="border-t border-black/10 px-4 py-4">
          <div className="mt-2 space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  aria-label="Feature text"
                  value={feature}
                  onChange={(event) => updateFeature(index, event.target.value)}
                  placeholder="e.g. 180° Rotating Gimbal Stand"
                  className="border-black/20 bg-white shadow-none focus-visible:border-black/45 focus-visible:ring-black/10 flex-1"
                />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove feature" onClick={() => removeFeature(index)} className="cursor-pointer text-black/40 hover:bg-red-50 hover:text-red-700 shrink-0">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-4 mb-4 flex flex-col items-center rounded-lg border border-dashed border-black/15 bg-black/[0.015] px-4 py-5 text-center">
          <ListPlus className="size-5 text-black/35" />
          <p className="mt-2 text-sm font-medium text-black/65">No features yet</p>
          <p className="mt-1 text-xs text-black/45">Use “Add feature” to add a new key feature.</p>
        </div>
      )}
    </section>
  )
}
