"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { CalendarDays, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

type DashboardData = {
  rangeLabel?: string
  rangeKey?: string
  totalSales: number
  periodSales: number
  orderCount: number
  periodOrderCount: number
  productCount: number
  customerCount: number
  itemsOrdered: number
  fulfilledOrders: number
  deliveredOrders: number
  pendingOrders: number
  lowStockCount: number
  outOfStockCount: number
  currentPeriodLabel: string
  previousPeriodLabel: string
  chartData: { date: string; current: number; previous: number }[]
  recentOrders: { id: string; status: string; total: number; customerName: string; itemCount: number }[]
  topProducts: { name: string; quantity: number }[]
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
})

function formatOrderReference(id: string) {
  return `#${id.slice(-8).toUpperCase()}`
}

function formatOrderStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

export function AdminOverview({ data }: { data: DashboardData }) {
  const router = useRouter()

  const [currentData, setCurrentData] = useState<DashboardData>(data)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState("Total sales")

  const [customNum, setCustomNum] = useState("30")
  const [customUnit, setCustomUnit] = useState("Days")

  const rangeLabel = currentData.rangeLabel || "Last 30 days"

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"
  const metrics = [
    { label: "Sessions", value: "—", change: "No data" },
    { label: "Total sales", value: currencyFormatter.format(currentData.periodSales), change: rangeLabel },
    { label: "Orders", value: currentData.periodOrderCount.toLocaleString("en-IN"), change: rangeLabel },
    { label: "Conversion rate", value: "—", change: "No data" },
  ]
  const chartMaximum = Math.max(10, ...currentData.chartData.flatMap((point) => [point.current, point.previous]))
  const today = new Date()
  const calendarMonths = [-1, 0].map((offset) => {
    const month = new Date(today.getFullYear(), today.getMonth() + offset, 1)
    return {
      label: month.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      firstDay: month.getDay(),
      dayCount: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(),
    }
  })

  async function applyRangeKey(rangeKey: string) {
    setIsLoading(true)
    setIsDatePickerOpen(false)

    router.push(`/dashboard?range=${rangeKey}`, { scroll: false })

    try {
      const res = await fetch(`/api/admin/dashboard-overview?range=${rangeKey}`)
      if (res.ok) {
        const updated = await res.json()
        setCurrentData(updated)
      }
    } catch (err) {
      console.error("Failed to fetch dashboard overview data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  function handleOptionClick(option: string) {
    let key = "last30"
    if (option === "Today") key = "today"
    else if (option === "Yesterday") key = "yesterday"
    else if (option === "Last 7 days") key = "last7"
    else if (option === "Last 30 days") key = "last30"
    else if (option === "Quarter to date") key = "quarter"
    else if (option === "Custom range") return

    applyRangeKey(key)
  }

  function handleApplyCustom() {
    const count = parseInt(customNum, 10) || 30
    let totalDays = count
    if (customUnit === "Weeks") totalDays = count * 7
    if (customUnit === "Months") totalDays = count * 30

    applyRangeKey(`days_${totalDays}`)
  }

  return (
    <section className={`relative flex min-w-0 flex-1 flex-col gap-4 bg-[#f5f5f5] p-4 pt-6 transition-opacity ${isLoading ? "opacity-70 pointer-events-none" : "opacity-100"}`}>
      <div className="relative flex items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="mt-1 truncate text-lg font-semibold tracking-tight text-black">
            {greeting}, Admin
          </h1>
          <p className="mt-0.5 truncate text-xs text-black/55">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={isDatePickerOpen}
          onClick={() => setIsDatePickerOpen((open) => !open)}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-black/25 bg-white px-2.5 text-xs font-medium text-black/75 shadow-sm transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
        >
          {isLoading ? <Loader2 className="size-3.5 animate-spin text-black/65" /> : <CalendarDays className="size-3.5 text-black/65" />}
          {rangeLabel}
          <ChevronDown className="size-3.5 text-black/55" />
        </button>

        {isDatePickerOpen ? (
          <div className="absolute right-0 top-10 z-30 flex w-[min(680px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-black/15 bg-white shadow-xl">
            <div className="hidden w-40 shrink-0 border-r border-black/10 bg-[#fafafa] p-2 sm:block">
              {["Today", "Yesterday", "Last 7 days", "Last 30 days", "Quarter to date", "Custom range"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className={`w-full rounded-md px-2 py-2 text-left text-xs transition-colors hover:bg-black/5 ${
                    option === rangeLabel ? "bg-black/10 font-medium text-black" : "text-black/70"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="min-w-0 flex-1 p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-black/70">Last</span>
                <input
                  aria-label="Number of days"
                  value={customNum}
                  onChange={(e) => setCustomNum(e.target.value)}
                  className="h-8 w-20 rounded-md border border-black/20 px-2 outline-none focus:border-black/50"
                />
                <select
                  aria-label="Date unit"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="h-8 rounded-md border border-black/20 bg-white px-2 outline-none focus:border-black/50"
                >
                  <option>Days</option>
                  <option>Weeks</option>
                  <option>Months</option>
                </select>
                <label className="inline-flex items-center gap-1.5 text-black/70">
                  <input type="checkbox" defaultChecked className="accent-black" /> Include today
                </label>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-6 text-xs text-black/75">
                {calendarMonths.map((month) => (
                  <div key={month.label}>
                    <p className="mb-3 text-center font-semibold">{month.label}</p>
                    <div className="grid grid-cols-7 gap-y-2 text-center text-black/60">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day} className="text-[10px]">{day}</span>)}
                      {Array.from({ length: month.firstDay + month.dayCount }, (_, index) => {
                        const day = index - month.firstDay + 1
                        return <span key={index} className="px-1 py-0.5">{day > 0 ? day : ""}</span>
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-end gap-2 border-t border-black/10 pt-3">
                <button type="button" onClick={() => setIsDatePickerOpen(false)} className="rounded-md border border-black/20 px-3 py-1.5 text-xs">Cancel</button>
                <button type="button" onClick={handleApplyCustom} className="rounded-md bg-black px-3 py-1.5 text-xs text-white hover:bg-black/80">Apply</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative rounded-xl border border-black/10 bg-white p-2 shadow-sm sm:p-3 min-w-0">
        <button
          type="button"
          aria-label={isExpanded ? "Collapse overview" : "Expand overview"}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="absolute right-3 top-3 z-10 inline-flex size-7 items-center justify-center rounded-md text-black/50 transition-colors hover:bg-black/5 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
        >
          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        <div className="grid grid-cols-2 gap-2 pr-8 sm:grid-cols-4">
          {metrics.map((metric) => (
            <button
              type="button"
              key={metric.label}
              aria-pressed={selectedMetric === metric.label}
              onClick={() => setSelectedMetric(metric.label)}
              className={`relative min-w-0 min-h-14 rounded-lg px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 ${
                selectedMetric === metric.label
                  ? "bg-[#f0f0f0]"
                  : "bg-white hover:bg-black/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 min-w-0">
                <p className="truncate text-xs font-medium text-black/75">{metric.label}</p>
                {selectedMetric === metric.label ? <span className="shrink-0 text-sm text-black/45">↗</span> : null}
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-black">
                {metric.value} <span className="font-normal text-black/55">{metric.change}</span>
              </p>
            </button>
          ))}
        </div>

        {isExpanded ? <div className="mt-4 h-[220px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData.chartData} margin={{ top: 8, right: 12, left: 10, bottom: 0 }}>
              <CartesianGrid stroke="#e5e5e5" vertical={false} />
              <XAxis
                dataKey="date"
                interval="preserveStartEnd"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#737373", fontSize: 11 }}
                dy={8}
              />
              <YAxis
                domain={[0, chartMaximum]}
                tickCount={3}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#737373", fontSize: 11 }}
                width={60}
                tickFormatter={(value: number) => {
                  if (value === 0) return "0"
                  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
                  if (value >= 100000) {
                    const lakh = value / 100000
                    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`
                  }
                  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`
                  return `₹${value}`
                }}
              />
              <Tooltip
                cursor={{ stroke: "#d4d4d4", strokeDasharray: "3 3" }}
                formatter={(val: unknown) => [
                  currencyFormatter.format(Number(val || 0)),
                  "Sales",
                ]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e5e5e5",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#8bd4f5"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke="#08a7f5"
                strokeWidth={1.8}
                dot={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div> : null}

        {isExpanded ? <div className="flex justify-center gap-5 pt-2 text-[11px] text-black/55">
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#08a7f5]" /> {currentData.currentPeriodLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#8bd4f5]" /> {currentData.previousPeriodLabel}
          </span>
        </div> : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium min-w-0">
          <span aria-hidden>▣</span> {currentData.pendingOrders} {currentData.pendingOrders === 1 ? "order" : "orders"} to fulfil
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium min-w-0">
          <span aria-hidden>▱</span> Payment capture data unavailable
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link prefetch={false} href="/dashboard/orders" className="text-xs text-black/55 underline underline-offset-2 hover:text-black">
              View all
            </Link>
          </div>
          {currentData.recentOrders.length === 0 ? (
            <p className="mt-3 py-3 text-center text-xs text-black/55">No orders have been placed yet.</p>
          ) : (
            <div className="mt-3 divide-y divide-black/10">
              {currentData.recentOrders.map((order) => (
                <Link prefetch={false} key={order.id} href="/dashboard/orders" className="flex items-center justify-between gap-3 py-3 text-xs hover:bg-black/[0.02] min-w-0">
                  <span className="font-medium shrink-0">{formatOrderReference(order.id)}</span>
                  <span className="text-black/55 truncate">{formatOrderStatus(order.status)}</span>
                  <span className="font-medium shrink-0">{currencyFormatter.format(order.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Top products</h2>
          {currentData.topProducts.length === 0 ? (
            <p className="mt-3 py-3 text-xs text-black/55">Top products will appear after an order is placed in this period.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {currentData.topProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between gap-3 text-xs min-w-0">
                  <span className="truncate text-black/70" title={product.name}>{product.name}</span>
                  <span className="shrink-0 font-medium">{product.quantity} sold</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Quick actions</h2>
          <div className="mt-3 grid gap-2">
            <Link prefetch={false} href="/dashboard/products/new" className="rounded-md border border-black/15 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-black hover:text-white">Add product</Link>
            <Link prefetch={false} href="/dashboard/customers" className="rounded-md border border-black/15 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-black hover:text-white">View customers</Link>
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <section className="min-w-0 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Store health</h2>
            <span className="size-2 rounded-full bg-black/25" />
          </div>
          <p className="mt-3 text-2xl font-semibold">—</p>
          <p className="mt-1 text-xs text-black/55">Health monitoring is not configured</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10">
            <div className="h-full w-0 rounded-full bg-emerald-500" />
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Traffic sources</h2>
          <p className="mt-3 py-3 text-xs text-black/55">No traffic data has been collected yet.</p>
        </section>

        <section className="min-w-0 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Inventory alerts</h2>
          <div className="mt-3 space-y-3 text-xs">
            <div className="flex items-center justify-between"><span className="text-black/70">Low stock</span><span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-800">{currentData.lowStockCount} items</span></div>
            <div className="flex items-center justify-between"><span className="text-black/70">Out of stock</span><span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-800">{currentData.outOfStockCount} items</span></div>
            <Link prefetch={false} href="/dashboard/products" className="inline-block pt-1 text-black/55 underline underline-offset-2 hover:text-black">Review inventory</Link>
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Customer snapshot</h2>
          <p className="mt-3 text-2xl font-semibold">{currentData.customerCount.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-black/55">Total customers</p>
          <p className="mt-3 text-xs font-medium text-black/55">No comparison data yet</p>
        </section>
      </div>

    </section>
  )
}
