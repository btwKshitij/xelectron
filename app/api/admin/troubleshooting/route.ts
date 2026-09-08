import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";
import { db } from "@/lib/db";
import { troubleshootingSchema } from "@/lib/shared/troubleshooting";

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const parsed = troubleshootingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }
    await db.troubleshootingPage.upsert({
      where: { id: "default" },
      create: { id: "default", content: parsed.data },
      update: { content: parsed.data },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid page data" }, { status: 400 });
    console.error("Failed to save troubleshooting page", error);
    return NextResponse.json({ error: "Could not save your changes. Please try again." }, { status: 500 });
  }
}
