import { NextResponse } from "next/server";
import { getProductMedia } from "@/lib/server/r2";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ key: string[] }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { key } = await params;
    const mediaKey = key.join("/");

    // Direct 307 redirect to Cloudflare R2 CDN ($0 egress, completely bypasses Vercel Compute)
    const publicBase = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-71e14405ed4a425db543797ffb54d14a.r2.dev";
    if (publicBase) {
      return NextResponse.redirect(`${publicBase.replace(/\/+$/, "")}/${mediaKey}`, 307);
    }

    const rangeHeader = request.headers.get("range") || undefined;
    const object = await getProductMedia(mediaKey, rangeHeader);
    if (!object.Body) {
      return NextResponse.json({ success: false, error: "Media not found." }, { status: 404 });
    }

    const headers = new Headers({
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "CDN-Cache-Control": "public, max-age=31536000",
      "Vercel-CDN-Cache-Control": "public, max-age=31536000",
      "Content-Type": object.ContentType || "application/octet-stream",
    });

    if (object.ContentRange) {
      headers.set("Content-Range", object.ContentRange);
    }
    if (object.ContentLength !== undefined) {
      headers.set("Content-Length", String(object.ContentLength));
    }

    const status = rangeHeader && object.ContentRange ? 206 : 200;

    // Stream the body directly for high-performance streaming without buffering in RAM
    const stream = object.Body.transformToWebStream();
    return new NextResponse(stream, {
      status,
      headers,
    });
  } catch (error) {
    const status = error && typeof error === "object" && "$metadata" in error && (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404 ? 404 : 500;
    return NextResponse.json({ success: false, error: status === 404 ? "Media not found." : "Unable to load media." }, { status });
  }
}

