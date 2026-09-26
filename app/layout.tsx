import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import CartProvider from "@/components/providers/cart-provider";
import SmoothScrollProvider from "@/components/providers/smooth-scroll-provider";
import FestiveOfferPopup from "@/components/common/festive-offer-popup";

export const metadata: Metadata = {
  title: "Xelectron",
  description: "Xelectron admin dashboard",
  icons: {
    icon: [
      {
        url: "/favicon.ico?v=2",
        type: "image/x-icon",
        sizes: "any",
      },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/favicon.ico?v=2",
  },
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
          <FestiveOfferPopup />
        </CartProvider>
      </body>
    </html>
  );
}
