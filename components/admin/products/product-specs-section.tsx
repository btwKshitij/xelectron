"use client"

import { useMemo } from "react"
import { Layers, Cpu, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export interface SpecItem {
  id?: string
  label: string
  value: string
  section?: "design" | "connectivity"
}

interface ProductSpecsSectionProps {
  specs: SpecItem[]
  onChange: (specs: SpecItem[]) => void
}

export function isConnectivitySpec(rawLabel: string): boolean {
  const l = rawLabel.trim().toLowerCase()
  return (
    l.includes("smart") ||
    l.includes("battery") ||
    l.includes("charging") ||
    l.includes("connectivity") ||
    l.includes("bluetooth") ||
    l.includes("wi-fi") ||
    l.includes("wifi") ||
    l.includes("app support") ||
    l.includes("app") ||
    l.includes("wireless") ||
    l.includes("network") ||
    l.includes("ports")
  )
}

export function ProductSpecsSection({ specs, onChange }: ProductSpecsSectionProps) {
  // Partition specs into Design and Connectivity sections
  const { designSpecs, connectivitySpecs } = useMemo(() => {
    const design: SpecItem[] = []
    const connectivity: SpecItem[] = []

    specs.forEach((item) => {
      const isConn =
        (item.section ?? (isConnectivitySpec(item.label) ? "connectivity" : "design")) === "connectivity"
      if (isConn) {
        connectivity.push({ ...item, section: "connectivity" })
      } else {
        design.push({ ...item, section: "design" })
      }
    })

    return { designSpecs: design, connectivitySpecs: connectivity }
  }, [specs])

  function updateDesignSpecs(newDesign: SpecItem[]) {
    onChange([...newDesign, ...connectivitySpecs])
  }

  function updateConnectivitySpecs(newConn: SpecItem[]) {
    onChange([...designSpecs, ...newConn])
  }

  // --- Design Section Actions ---
  function addDesignField(label = "", value = "") {
    updateDesignSpecs([...designSpecs, { label, value, section: "design" }])
  }

  function updateDesignField(index: number, field: "label" | "value", val: string) {
    const next = [...designSpecs]
    next[index] = { ...next[index], [field]: val, section: "design" }
    updateDesignSpecs(next)
  }

  function removeDesignField(index: number) {
    const next = [...designSpecs]
    next.splice(index, 1)
    updateDesignSpecs(next)
  }


  // --- Connectivity Section Actions ---
  function addConnectivityField(label = "", value = "") {
    updateConnectivitySpecs([...connectivitySpecs, { label, value, section: "connectivity" }])
  }

  function updateConnectivityField(index: number, field: "label" | "value", val: string) {
    const next = [...connectivitySpecs]
    next[index] = { ...next[index], [field]: val, section: "connectivity" }
    updateConnectivitySpecs(next)
  }

  function removeConnectivityField(index: number) {
    const next = [...connectivitySpecs]
    next.splice(index, 1)
    updateConnectivitySpecs(next)
  }


  return (
    <div className="mt-4 space-y-4">
      {/* SECTION 1: Design, Display & Performance */}
      <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 border-b border-black/10 bg-slate-50/70">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="size-4 text-[#0a7ae6]" />
              Design, Display & Performance
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Details for design, display, sensors, durability, and performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addDesignField()}
              className="cursor-pointer border-black/15 bg-white text-xs text-black/75 shadow-none hover:bg-black/[0.04]"
            >
              <Plus className="size-3.5 mr-1" /> Add Field
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {designSpecs.length > 0 ? (
            designSpecs.map((item, index) => {
              return (
                <div key={index} className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 p-2 rounded-lg hover:bg-slate-50/50 transition">
                  <div className="w-full sm:w-1/3 shrink-0">
                    <Input
                      aria-label="Specification label"
                      value={item.label}
                      onChange={(e) => updateDesignField(index, "label", e.target.value)}
                      placeholder="e.g. Display Type"
                      className="border-black/20 bg-white text-xs font-semibold shadow-none focus-visible:border-black/45 focus-visible:ring-black/10"
                    />
                  </div>
                  <div className="flex-1 w-full flex items-start gap-2">
                    <Textarea
                        rows={3}
                        aria-label="Specification value"
                        value={item.value}
                        onChange={(e) => updateDesignField(index, "value", e.target.value)}
                        placeholder="Enter value (multi-line supported)..."
                        className="border-black/20 bg-white text-xs shadow-none focus-visible:border-black/45 focus-visible:ring-black/10 flex-1"
                      />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove specification"
                      onClick={() => removeDesignField(index)}
                      className="cursor-pointer text-black/40 hover:bg-red-50 hover:text-red-700 shrink-0 size-9 mt-0.5"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No specifications in this section yet. Click &ldquo;Add Field&rdquo; to enter a label and product details.
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: Connectivity, Battery & Smart Features */}
      <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 border-b border-black/10 bg-slate-50/70">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="size-4 text-[#0a7ae6]" />
              Connectivity, Battery & Smart Features
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Details for smart features, battery life, charging, and app support.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addConnectivityField()}
              className="cursor-pointer border-black/15 bg-white text-xs text-black/75 shadow-none hover:bg-black/[0.04]"
            >
              <Plus className="size-3.5 mr-1" /> Add Field
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {connectivitySpecs.length > 0 ? (
            connectivitySpecs.map((item, index) => {
              return (
                <div key={index} className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 p-2 rounded-lg hover:bg-slate-50/50 transition">
                  <div className="w-full sm:w-1/3 shrink-0">
                    <Input
                      aria-label="Specification label"
                      value={item.label}
                      onChange={(e) => updateConnectivityField(index, "label", e.target.value)}
                      placeholder="e.g. Smart Features"
                      className="border-black/20 bg-white text-xs font-semibold shadow-none focus-visible:border-black/45 focus-visible:ring-black/10"
                    />
                  </div>
                  <div className="flex-1 w-full flex items-start gap-2">
                    <Textarea
                        rows={4}
                        aria-label="Specification value"
                        value={item.value}
                        onChange={(e) => updateConnectivityField(index, "value", e.target.value)}
                        placeholder="Enter features (multi-line supported)..."
                        className="border-black/20 bg-white text-xs shadow-none focus-visible:border-black/45 focus-visible:ring-black/10 flex-1"
                      />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove specification"
                      onClick={() => removeConnectivityField(index)}
                      className="cursor-pointer text-black/40 hover:bg-red-50 hover:text-red-700 shrink-0 size-9 mt-0.5"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No specifications in this section yet. Click &ldquo;Add Field&rdquo; to enter a label and product details.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
