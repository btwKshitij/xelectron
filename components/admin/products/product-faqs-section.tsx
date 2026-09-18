"use client"

import { Plus, Trash2, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export interface FaqItem {
  id?: string
  question: string
  answer: string
}

interface ProductFaqsSectionProps {
  faqs: FaqItem[]
  onChange: (faqs: FaqItem[]) => void
}

export function ProductFaqsSection({ faqs, onChange }: ProductFaqsSectionProps) {
  function addFaq(question = "", answer = "") {
    onChange([...faqs, { question, answer }])
  }

  function updateFaq(index: number, field: "question" | "answer", val: string) {
    const nextFaqs = [...faqs]
    nextFaqs[index] = { ...nextFaqs[index], [field]: val }
    onChange(nextFaqs)
  }

  function removeFaq(index: number) {
    const nextFaqs = [...faqs]
    nextFaqs.splice(index, 1)
    onChange(nextFaqs)
  }


  return (
    <section className="mt-4 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 border-b border-black/10 bg-slate-50/70">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="size-4 text-[#0a7ae6]" />
            Frequently Asked Questions (FAQ&apos;s)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Add custom questions & answers to display in the FAQ tab on the product page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addFaq()}
            className="cursor-pointer border-black/15 bg-white text-xs text-black/75 shadow-none hover:bg-black/[0.04]"
          >
            <Plus className="size-3.5 mr-1" /> Add FAQ
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {faqs.length > 0 ? (
          faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5 space-y-2.5 relative group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="size-5 rounded-full bg-blue-100 text-[#0a7ae6] text-[11px] font-bold flex items-center justify-center shrink-0">
                    Q{index + 1}
                  </span>
                  <Input
                    aria-label="FAQ Question"
                    value={faq.question}
                    onChange={(e) => updateFaq(index, "question", e.target.value)}
                    placeholder="Enter question (e.g. What is covered under warranty?)"
                    className="border-black/20 bg-white text-xs font-semibold shadow-none focus-visible:border-black/45 focus-visible:ring-black/10 flex-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove FAQ"
                  onClick={() => removeFaq(index)}
                  className="cursor-pointer text-black/40 hover:bg-red-50 hover:text-red-700 shrink-0 size-8"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="pl-7">
                <Textarea
                  rows={2}
                  aria-label="FAQ Answer"
                  value={faq.answer}
                  onChange={(e) => updateFaq(index, "answer", e.target.value)}
                  placeholder="Enter detailed answer..."
                  className="border-black/20 bg-white text-xs shadow-none focus-visible:border-black/45 focus-visible:ring-black/10"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            No FAQs added yet. Click &ldquo;Add FAQ&rdquo; to add product questions.
          </div>
        )}
      </div>
    </section>
  )
}
