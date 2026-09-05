export type ProductCategory = {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  productCount: number;
  visible: boolean;
  description?: string;
};

export const defaultProductCategories: ProductCategory[] = [
  {
    id: "smart-tvs",
    title: "Smart TVs",
    slug: "smart-tvs",
    parentId: null,
    productCount: 12,
    visible: true,
    description: "High definition 4K and Smart LED Televisions",
  },
  {
    id: "projectors",
    title: "Projectors",
    slug: "projectors",
    parentId: null,
    productCount: 8,
    visible: true,
    description: "Portable Android & HD Cinema Projectors",
  },
  {
    id: "audio",
    title: "Audio & Headphones",
    slug: "audio",
    parentId: null,
    productCount: 15,
    visible: true,
    description: "Wireless Earbuds, Soundbars & Headphones",
  },
  {
    id: "dashcams",
    title: "Dashcams & Cameras",
    slug: "dashcams",
    parentId: null,
    productCount: 6,
    visible: true,
    description: "Smart 4K Dash Cameras & Action Cams",
  },
];
