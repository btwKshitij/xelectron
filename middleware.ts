import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // If Velocity sends server-to-server POST webhooks to /checkout/velocity-callback,
  // rewrite directly to the webhook API handler.
  if (
    request.nextUrl.pathname === "/checkout/velocity-callback" &&
    request.method === "POST"
  ) {
    return NextResponse.rewrite(new URL("/api/payment/velocity/webhook", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/velocity-callback"],
};
