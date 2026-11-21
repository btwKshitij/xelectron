import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1600, 1920, 2048, 3840],
    qualities: [60, 75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  devIndicators: {
    position: "bottom-right",
  },
  experimental: {
    proxyClientMaxBodySize: "250mb",
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
  async redirects() {
    // Verified against the current catalog during the SEO crawl. Keep these
    // exact aliases when products are renamed; never redirect unknown products.
    const productAliases: Record<string, string> = {
      "iprojector-1-plus-digital-focus-auto-keystone-smart-projector": "xelectron-iprojector-1-plus-digital-focus-auto-keystone-smart-projector",
      "arzopa-156-inch-ips-fhd-hdr-1080p-resolution-100-srgb-300-nits-portable-monitor": "arzopa-a1-pro-156-inch-ips-fhd-hdr-1080p-resolution-100-srgb-300-nits-portable-monitor",
      "arzopa-173-portable-monitor": "arzopa-a1m-173-inch-portable-monitor",
      "arzopa-161-fhd-1080p-portable-monitor": "arzopa-z1c-161-fhd-1080p-portable-monitor",
      "arzopa-161-inch-144hz-portable-monitor": "arzopa-z1fc-161-inch-144hz-portable-monitor",
      "arzopa-portable-monitor-kickstand-140-ultra-slim-portable-laptop": "arzopa-a1s-portable-monitor-kickstand-140-ultra-slim-portable-laptop",
      "remote-of-digital-photo-frame": "xelectron-digital-photo-frame-replacement-remote-control",
      "netflix-official-license-xelectron-luminex-projector-4k-ultra-hd-1080p-native-android-13-smart-mini-projector": "xelectron-luminex-projector-4k-ultra-hd-1080p-native-android-13-whale-os-smart-projector",
      "xelectron-iprojector-2-plus-auto-focus-auto-keystone-projector-native-1080p-full-hd-4k-hdr-android-12": "xelectron-iprojector-2-plus-auto-focus-auto-keystone-smart-projector",
      "xelectron-techno-plus-android-14-smart-home-projector-for-room-1080p-native-4k-support-inbuilt-speaker-rotatable-electric-focus-auto-4p-keystone-with-built-in-apps-wifi-bt-screen-mirroring": "xelectron-techno-plus-android-14-smart-projector",
      "xelectron-iprojector-3-plus-official-google-tv-dust-proof-brightest-2500-ansi-native-1080p-smart-projector-4k-ultra-hd-for-home-auto-focus-keystone-hdmi-arc-wifi-6-bt-screen-mirroring": "xelectron-iprojector-3-plus-official-google-tv-dust-proof-brightest-25000-lumens",
    };
    return [
      ...Object.entries(productAliases).map(([oldSlug, currentSlug]) => ({
        source: `/product/${oldSlug}`,
        destination: `/product/${currentSlug}`,
        statusCode: 301,
      })),
      {
        source: "/about",
        destination: "/about-us",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/((?!media/products/).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "Surrogate-Control", value: "no-store" },
        ],
      },
      {
        source: "/dashboard/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "Surrogate-Control", value: "no-store" },
        ],
      },
      {
        source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "Surrogate-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;

// Trigger restart for config fix
