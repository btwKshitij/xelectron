export type AdminRoute = {
  label: string
  href: string
  children?: AdminRoute[]
}

export const adminRoutes: AdminRoute[] = [
  { label: "Home", href: "/dashboard" },
  { label: "Banners", href: "/dashboard/banners" },
  { label: "Festive Popup", href: "/dashboard/festive-popup" },
  { label: "Announcements", href: "/dashboard/announcements" },
  { label: "Brand Showcase", href: "/dashboard/brand-showcase" },
  { label: "Brand Platforms", href: "/dashboard/brand-marquee" },
  { label: "Creator Videos", href: "/dashboard/creator-videos" },
  {
    label: "Orders",
    href: "/dashboard/orders",
    children: [
      { label: "Drafts", href: "/dashboard/orders/drafts" },
      {
        label: "Abandoned checkouts",
        href: "/dashboard/orders/abandoned-checkouts",
      },
    ],
  },
  {
    label: "Products",
    href: "/dashboard/products",
    children: [
      { label: "Categories", href: "/dashboard/products/categories" },
      { label: "Navbar products", href: "/dashboard/products/navbar" },
      { label: "Best sellers", href: "/dashboard/products?tab=best-sellers" },
    ],
  },
  { label: "Customers", href: "/dashboard/customers" },
  { label: "Deal of the day", href: "/dashboard/deal-of-the-day" },
  {
    label: "Reviews",
    href: "/dashboard/reviews",
    children: [
      { label: "Homepage reviews", href: "/dashboard/reviews?tab=homepage" },
      { label: "Product reviews", href: "/dashboard/reviews?tab=products" },
    ],
  },
  { label: "Support requests", href: "/dashboard/support-requests" },
  { label: "Troubleshooting", href: "/dashboard/troubleshooting" },
  { label: "Blog", href: "/dashboard/blog" },
  { label: "Discounts", href: "/dashboard/discounts" },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
  },
]
