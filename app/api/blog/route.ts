import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import * as blogController from "@/lib/server/controllers/blog.controller";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("all") !== "true";
    const posts = await blogController.listBlogPosts(activeOnly);
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const post = await blogController.createBlogPost(body);
    revalidatePath("/dashboard/blog");
    revalidatePath("/");
    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
