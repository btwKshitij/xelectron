import { NextRequest, NextResponse } from "next/server";
import * as ordersController from "@/lib/server/controllers/orders.controller";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/orders/:id
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const order = await ordersController.getOrder(id);
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

// PUT /api/orders/:id  (update status)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const order = await ordersController.updateOrder(id, body);
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

// DELETE /api/orders/:id
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    await ordersController.deleteOrder(id);
    return NextResponse.json({ success: true, message: "Order deleted" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

// POST /api/orders/:id (WAF workaround — dispatches update/delete via _method field)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    if (body?._method === "DELETE") {
      await ordersController.deleteOrder(id);
      return NextResponse.json({ success: true, message: "Order deleted" });
    }

    const { _method, ...updateData } = body || {};
    const order = await ordersController.updateOrder(id, updateData);
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

