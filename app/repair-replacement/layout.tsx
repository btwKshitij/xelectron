import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Repair & Replacement Support | XElectron",
  description: "Get help with XElectron product repairs and replacements. Learn how to request support for your device.",
  alternates: { canonical: "/repair-replacement" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
