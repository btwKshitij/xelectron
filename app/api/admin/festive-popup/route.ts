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
    return NextResponse.json({ success: true, settings });
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
      revalidatePath("/");
      revalidatePath("/dashboard/festive-popup");
    } catch (revalErr) {
      console.warn("Could not revalidate paths:", revalErr);
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Failed to update festive popup settings:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
