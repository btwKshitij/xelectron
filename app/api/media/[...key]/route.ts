import { NextResponse } from "next/server";
import { getProductMedia } from "@/lib/server/r2";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ key: string[] }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { key } = await params;
    const mediaKey = key.join("/");

    if (!mediaKey.startsWith("products/") || key.some((part) => part === ".." || part === ".")) {
      return NextResponse.json({ error: "Invalid media key." }, { status: 400 });
    }

    const rangeHeader = request.headers.get("range") || undefined;
    const object = await getProductMedia(mediaKey, rangeHeader);
    if (!object.Body) {
      return NextResponse.json({ success: false, error: "Media not found." }, { status: 404 });
    }

    const headers = new Headers({
      "Accept-Ranges": "bytes",
      "Cache-Control": rangeHeader ? "private, no-store" : "public, max-age=31536000, s-maxage=31536000, immutable",
      "CDN-Cache-Control": "public, max-age=31536000",
      "Vercel-CDN-Cache-Control": "public, max-age=31536000",
      "Content-Type": object.ContentType || "application/octet-stream",
    });

    if (rangeHeader) {
      headers.set("CDN-Cache-Control", "no-store");
      headers.set("Vercel-CDN-Cache-Control", "no-store");
    }
    if (object.ETag) headers.set("ETag", object.ETag);

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
    const upstreamStatus = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
    const status = upstreamStatus === 404 ? 404 : upstreamStatus === 416 ? 416 : 502;
    console.error("R2 media read failed", { status, upstreamStatus });
    return NextResponse.json({ success: false, error: status === 404 ? "Media not found." : "Unable to load media." }, { status, headers: { "Cache-Control": "no-store" } });
  }
}

