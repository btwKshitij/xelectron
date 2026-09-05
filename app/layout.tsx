import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import CartProvider from "@/components/providers/cart-provider";
import SmoothScrollProvider from "@/components/providers/smooth-scroll-provider";

export const metadata: Metadata = {
  title: "Xelectron",
  description: "Xelectron admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans")}
      >
      <body className="min-h-dvh flex flex-col">
        <CartProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </CartProvider>
      </body>
    </html>
  );
}

