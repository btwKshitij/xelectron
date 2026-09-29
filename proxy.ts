import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "./lib/server/auth/constants";

export function proxy(request: NextRequest) {
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
  matcher: ["/dashboard/:path*", "/checkout/velocity-callback"],
};
