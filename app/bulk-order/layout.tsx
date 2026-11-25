import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Orders & Business Enquiries | XElectron",
  description: "Contact XElectron for bulk projector and electronics orders, corporate requirements and institutional purchases.",
  alternates: { canonical: "/bulk-order" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
