import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "./lib/server/auth/constants";
import { preferredRedirect } from "./lib/canonical";

export function proxy(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") {
    const host = request.headers.get("host") || request.nextUrl.host;
    const destination = preferredRedirect(new URL(request.url), host);
    if (destination) return NextResponse.redirect(destination, 308);
  }
  // If Velocity sends server-to-server POST webhooks to /checkout/velocity-callback,
  // rewrite directly to the webhook API handler.
  if (
    request.nextUrl.pathname === "/checkout/velocity-callback" &&
    request.method === "POST"
  ) {
    return NextResponse.rewrite(new URL("/api/payment/velocity/webhook", request.url));
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (
    request.nextUrl.pathname.startsWith("/dashboard") &&
    !sessionCookie
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/|.*\\.(?:png|jpg|jpeg|webp|svg|ico|css|js|woff2?)$).*)"],
};
