export type NavDropdownItem = {
  label: string;
  items: string[];
};

export type CategoryItem = {
  title: string;
  src: string;
  alt: string;
};


export const dropdownItems: NavDropdownItem[] = [
  {
    label: "PRODUCT",
    items: ["New Arrivals", "Best Sellers", "All Products"],
  },
  {
    label: "WARRANTY",
    items: ["Check Coverage", "Register Product", "Service Status"],
  },
  {
    label: "SUPPORT & SERVICE",
    items: ["Contact Support", "Repair Center", "Downloads"],
  },
];

export const flatItems = ["Home", "About Us", "Contact", "My Account"];

export type BannerItem = {
  src: string;
  mobileSrc?: string;
  alt: string;
  title: string;
  category?: string;
  caption?: string;
  cta?: string;
  linkUrl?: string;
};

export const banners: BannerItem[] = [
  {
    src: "/hero-banner-projector-c9.png",
    mobileSrc: "/hero-banner-projector-c9-mobile.jpg",
    alt: "XElectron Android C9 Plus projector banner",
    title: "Android C9 Plus",
    category: "Projector",
    caption: "Smart Cinema • Full HD 1080p",
    cta: "Shop now",
    linkUrl: "/shop",
  },
  {
    src: "/hero-banner-techno-projector.png",
    mobileSrc: "/hero-banner-techno-projector-mobile.jpg",
    alt: "XElectron Techno Android Projector banner",
    title: "Techno Android",
    category: "Projector",
    caption: "Portable • Crystal Clear Display",
    cta: "Explore now",
    linkUrl: "/shop",
  },
  {
    src: "/hero-banner-tv.png",
    mobileSrc: "/hero-banner-tv-mobile.jpg",
    alt: "XElectron 55 Inch LED TV banner",
    title: "55 Inch LED TV",
    category: "Smart TV",
    caption: "Big Screen • Bright Detail",
    cta: "View TV",
    linkUrl: "/shop",
  },
];

export const categories: CategoryItem[] = [
  {
    title: "Smart Projectors",
    src: "/category-projector.png",
    alt: "Smart Projectors category",
  },
  {
    title: "Digital Photo Frames",
    src: "/category-frame.png",
    alt: "Digital Photo Frames category",
  },
  {
    title: "LED Televisions & Smart Displays",
    src: "/category-tv.png",
    alt: "LED Televisions & Smart Displays category",
  },
  {
    title: "Portable Monitors",
    src: "/category-monitor.png",
    alt: "Portable Monitors category",
  },
];
