export type ProductColor = {
  name: string;
  bg: string;
  border?: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductFaq = {
  question: string;
  answer: string;
};

export type ProductBanner = {
  id?: string;
  imageUrl: string;
  mobileImageUrl?: string | null;
  title?: string | null;
  sortOrder?: number;
};

export type ProductDetailItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  rating: number;
  reviewsCount: string;
  description: string;
  colors: ProductColor[];
  features: string[];
  specs: ProductSpec[];
  faqs?: ProductFaq[];
  banners?: ProductBanner[];
  creatorVideos?: {
    id?: string;
    title?: string | null;
    thumbnailUrl: string;
    videoUrl?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  }[];
  shippingNotice: string;
  quantity?: number;
  mainImage: string;
  images?: string[];
  sku?: string | null;
  variants?: any[];
};

// Product details and recommendations now come exclusively from the database.
// These types remain shared by the product UI.
export type SimilarProductCard = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  image: string;
  hoverImage?: string;
  alt: string;
  swatches: string[];
};
