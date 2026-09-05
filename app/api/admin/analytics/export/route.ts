import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsData } from "@/lib/server/controllers/dashboard.controller";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "all";

    const analytics = await getAnalyticsData(range);

    const rows: string[][] = [
      ["XELECTRON SALES & ANALYTICS REPORT"],
      [`Generated At`, new Date().toLocaleString("en-IN")],
      [`Time Range`, range.toUpperCase()],
      [],
      ["KEY PERFORMANCE METRICS"],
      ["Metric", "Value"],
      ["Gross Sales (INR)", String(analytics.grossSales)],
      ["Total Orders", String(analytics.totalOrders)],
      ["Orders Fulfilled", String(analytics.ordersFulfilled)],
      ["Average Order Value (INR)", String(analytics.averageOrderValue)],
      ["Returning Customer Rate", `${analytics.returningCustomerRate}%`],
      [],
      ["SALES BY PRODUCT"],
      ["Product ID", "Product Name", "Units Sold", "Total Revenue (INR)"],
    ];

    if (analytics.salesByProduct && analytics.salesByProduct.length > 0) {
      analytics.salesByProduct.forEach((p: any) => {
        rows.push([
          `"${p.id || ""}"`,
          `"${(p.name || "").replace(/"/g, '""')}"`,
          String(p.quantity || 0),
          String(p.totalSales || 0),
        ]);
      });
    } else {
      rows.push(["-", "No product sales in this period", "0", "0"]);
    }

    const csvContent = rows.map((r) => r.join(",")).join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="xelectron-analytics-report-${range}-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
