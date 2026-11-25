import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers & Job Opportunities | XElectron",
  description: "Explore career opportunities at XElectron and find out how to apply to join our team.",
  alternates: { canonical: "/careers" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
