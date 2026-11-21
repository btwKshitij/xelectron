export const SITE_URL = "https://www.xelectron.com";

export const PUBLIC_PATHS = ["/", "/shop", "/about-us", "/contact", "/blog", "/bulk-order", "/careers", "/find-a-store", "/service-centers", "/pickup-drop-service", "/repair-replacement", "/downloads", "/firmware-updates", "/troubleshooting", "/warranty-registration", "/warranty-terms", "/privacy-policy", "/privacy-choices", "/terms-of-use", "/terms-policy"];

export function canonicalUrl(path: string) {
  return `${SITE_URL}${path === "/" ? "/" : path.replace(/\/+$/, "")}`;
}

// Only normalize public document queries. Checkout/auth/API parameters carry
// application state and must survive. _rsc is Next.js's transport parameter.
export function normalizePublicQuery(url: URL) {
  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (!PUBLIC_PATHS.includes(path) && !/^\/(product|blog)\/[^/]+$/.test(path)) return;
  for (const key of Array.from(url.searchParams.keys())) {
    if (key === "_rsc" || (path === "/shop" && key === "filter")) continue;
    url.searchParams.delete(key);
  }
  if (path === "/shop" && url.searchParams.has("filter")) {
    const filter = url.searchParams.get("filter");
    if (!filter || filter === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", filter);
  }
}

export function preferredRedirect(url: URL, host: string, protocol: string): URL | null {
  const target = new URL(url);
  const hostname = host.toLowerCase().replace(/:\d+$/, "");
  const productionHost = ["xelectron.com", "www.xelectron.com"].includes(hostname);
  if (productionHost) {
    target.protocol = "https:";
    target.host = "www.xelectron.com";
    // Setting URL.host without a port retains the incoming port (e.g. 3000).
    // The public HTTPS endpoint must never inherit the Node server's port.
    target.port = "";
  }
  normalizePublicQuery(target);
  const hostChanged = productionHost && (host.toLowerCase() !== "www.xelectron.com" || protocol !== "https");
  return hostChanged || target.search !== url.search ? target : null;
}
