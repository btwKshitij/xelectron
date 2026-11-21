import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";
import { preferredRedirect, PUBLIC_PATHS } from "../lib/canonical";
import { readFileSync, existsSync } from "node:fs";

test("production host/protocol variants converge without redirect loops", () => {
  for (const host of ["xelectron.com", "www.xelectron.com"]) {
    for (const protocol of ["http", "https"]) {
      const url = new URL(`${protocol}://${host}/contact?utm_source=example`);
      assert.equal(preferredRedirect(url, host)?.href, "https://www.xelectron.com/contact");
    }
  }
  assert.equal(preferredRedirect(new URL("https://www.xelectron.com/contact"), "www.xelectron.com"), null);
  assert.equal(preferredRedirect(new URL("http://localhost:3000/contact"), "localhost:3000"), null);
});

test("redirects never leak the reverse proxy's internal port", () => {
  for (const host of ["xelectron.com", "xelectron.com:3000"]) {
    const result = preferredRedirect(new URL("http://xelectron.com:3000/contact"), host);
    assert.equal(result?.href, "https://www.xelectron.com/contact");
  }
  // A correctly forwarded canonical request must not loop just because its
  // internal request URL contains the upstream HTTP origin and port.
  assert.equal(preferredRedirect(new URL("http://www.xelectron.com:3000/contact"), "www.xelectron.com"), null);
  const request = new NextRequest("http://xelectron.com:3000/?utm_source=test", {
    headers: { host: "xelectron.com", "x-forwarded-proto": "https" },
  });
  assert.equal(proxy(request).headers.get("location"), "https://www.xelectron.com/");
  const query = preferredRedirect(new URL("http://www.xelectron.com:3000/contact?extra=1"), "www.xelectron.com");
  assert.equal(query?.href, "https://www.xelectron.com/contact");
});

test("TLS-terminating proxies do not cause canonical HTTPS self-redirects", () => {
  for (const host of ["www.xelectron.com", "www.xelectron.com:3000"]) {
    for (const forwarded of [undefined, "http", "https", "http, https"]) {
      const headers: Record<string, string> = { host };
      if (forwarded) headers["x-forwarded-proto"] = forwarded;
      const response = proxy(new NextRequest("http://www.xelectron.com:3000/", { headers }));
      assert.equal(response.headers.get("location"), null);
      assert.equal(response.headers.get("x-middleware-next"), "1");
    }
  }
});

test("shop filters and Next.js transport survive duplicate query cleanup", () => {
  const url = new URL("https://www.xelectron.com/shop?filter=projector&utm_source=ad&_rsc=123");
  assert.equal(preferredRedirect(url, url.host)?.search, "?filter=projector&_rsc=123");
  const all = new URL("https://www.xelectron.com/shop?filter=all");
  assert.equal(preferredRedirect(all, all.host)?.href, "https://www.xelectron.com/shop");
});

test("auth and checkout tokens are preserved", () => {
  for (const path of ["/reset-password?token=secret", "/checkout/velocity-callback?orderId=123&status=success"]) {
    const url = new URL(`https://xelectron.com${path}`);
    assert.equal(preferredRedirect(url, url.host)?.href, `https://www.xelectron.com${path}`);
  }
});

test("proxy preserves webhook POST rewrite and dashboard authentication", () => {
  const webhook = proxy(new NextRequest("https://xelectron.com/checkout/velocity-callback", { method: "POST" }));
  assert.equal(webhook.headers.get("x-middleware-rewrite"), "https://xelectron.com/api/payment/velocity/webhook");
  const dashboard = proxy(new NextRequest("https://www.xelectron.com/dashboard"));
  assert.equal(dashboard.headers.get("location"), "https://www.xelectron.com/login");
  const duplicate = proxy(new NextRequest("https://xelectron.com/?utm_source=test"));
  assert.equal(duplicate.status, 308);
  assert.equal(duplicate.headers.get("location"), "https://www.xelectron.com/");
});

test("every static sitemap page declares its own canonical", () => {
  for (const path of PUBLIC_PATHS) {
    const folder = path === "/" ? "app" : `app${path}`;
    const source = ["page.tsx", "layout.tsx"].filter(file => existsSync(`${folder}/${file}`))
      .map(file => readFileSync(`${folder}/${file}`, "utf8")).join("\n");
    assert.ok(source.includes(`canonical: "${path}"`) || source.includes(`canonical: "https://www.xelectron.com${path}"`), path);
  }
});
