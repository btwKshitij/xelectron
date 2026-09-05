export type BrandMarqueeItemType = {
  id?: string;
  name: string;
  logoUrl?: string | null;
  color: string;
  linkUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export const defaultBrandMarqueeItems: BrandMarqueeItemType[] = [
  { name: "Amazon", logoUrl: "/brands/amazon.svg", color: "#FF9900", linkUrl: "https://www.amazon.in", sortOrder: 0, isActive: true },
  { name: "Flipkart", logoUrl: "/brands/flipkart.svg", color: "#2874F0", linkUrl: "https://www.flipkart.com", sortOrder: 1, isActive: true },
  { name: "Myntra", logoUrl: "/brands/myntra.svg", color: "#FF3F6C", linkUrl: "https://www.myntra.com", sortOrder: 2, isActive: true },
  { name: "Croma", logoUrl: "/brands/croma.svg", color: "#0F7C4F", linkUrl: "https://www.croma.com", sortOrder: 3, isActive: true },
  { name: "Reliance Digital", logoUrl: "/brands/reliance-digital.svg", color: "#0033A0", linkUrl: "https://www.reliancedigital.in", sortOrder: 4, isActive: true },
  { name: "JioMart", logoUrl: "/brands/jiomart.svg", color: "#0A3D8F", linkUrl: "https://www.jiomart.com", sortOrder: 5, isActive: true },
  { name: "Meesho", logoUrl: "/brands/meesho.svg", color: "#570A57", linkUrl: "https://www.meesho.com", sortOrder: 6, isActive: true },
  { name: "Snapdeal", logoUrl: "/brands/snapdeal.svg", color: "#E40046", linkUrl: "https://www.snapdeal.com", sortOrder: 7, isActive: true },
  { name: "Tata CLiQ", logoUrl: "/brands/tata-cliq.svg", color: "#5C2D91", linkUrl: "https://www.tatacliq.com", sortOrder: 8, isActive: true },
  { name: "Nykaa", logoUrl: "/brands/nykaa.svg", color: "#FC2779", linkUrl: "https://www.nykaa.com", sortOrder: 9, isActive: true },
];
