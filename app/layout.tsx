import { Suspense } from "react";
import PageTracking from "@/components/analytics/page-tracking";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import CartProvider from "@/components/providers/cart-provider";
import SmoothScrollProvider from "@/components/providers/smooth-scroll-provider";
import FestiveOfferPopup from "@/components/common/festive-offer-popup";
import ChunkErrorHandler from "@/components/common/chunk-error-handler";

export const metadata: Metadata = {
  title: "XElectron",
  description: "Discover premium XElectron products, smart tech, and official support for home entertainment, lifestyle, and everyday innovation.",
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
      <head>
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NB43H649');`,
          }}
        />
      </head>
      <body className="min-h-dvh flex flex-col">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NB43H649"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <ChunkErrorHandler />
        <Suspense fallback={null}><PageTracking /></Suspense>
        <CartProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
          <FestiveOfferPopup />
        </CartProvider>
      </body>
    </html>
  );
}
