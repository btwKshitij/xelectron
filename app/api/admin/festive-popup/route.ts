import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/server/dal/auth";
import {
  getFestivePopupSettings,
  updateFestivePopupSettings,
} from "@/lib/server/controllers/festive-popup.controller";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getFestivePopupSettings();
    return NextResponse.json(
      { success: true, settings },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to fetch festive popup settings:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const settings = await updateFestivePopupSettings(body);

    try {
      revalidatePath("/", "layout");
      revalidatePath("/", "page");
      revalidatePath("/dashboard/festive-popup", "page");
      revalidatePath("/dashboard/festive-popup", "layout");
      revalidatePath("/api/admin/festive-popup");
      revalidatePath("/api/festive-offer");
    } catch (revalErr) {
      console.warn("Could not revalidate paths:", revalErr);
    }

    return NextResponse.json(
      { success: true, settings },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to update festive popup settings:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return PUT(request);
}

