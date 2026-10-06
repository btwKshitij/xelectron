export type BestSellerItem = {
  id: string;
  slug?: string;
  name: string;
  category: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  description: string;
  image: string;
  imageAlt: string;
  specs: {
    label: string;
    value: string;
  }[];
};
