import type { Metadata } from "next"
import { Suspense } from "react"

import { CreateOrderClient } from "./create-order-client"

export const metadata: Metadata = {
  title: "Create order | Xelectron Admin",
  description: "Create draft orders, add products, and configure payment details.",
}

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading order form...</div>}>
      <CreateOrderClient />
    </Suspense>
  )
}
