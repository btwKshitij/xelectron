import { db } from "@/lib/db";

const orderInclude = {
  user: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      product: { select: { id: true, name: true } },
    },
  },
} as const;

export async function getOrdersForDashboard() {
  return db.order.findMany({
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
}

function parseRangeDates(rangeParam: string = "last30"): {
  fromDate: Date;
  toDate: Date;
  previousFromDate: Date;
  previousToDate: Date;
  label: string;
  isSingleDay: boolean;
} {
  const today = new Date();
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);

  let fromDate: Date;
  let toDate: Date;
  let previousFromDate: Date;
  let previousToDate: Date;
  let label: string;
  let isSingleDay = false;

  const cleanParam = rangeParam.toLowerCase().trim();

  if (cleanParam === "today") {
    fromDate = startOfToday;
    toDate = endOfToday;
    isSingleDay = true;
    label = "Today";

    previousFromDate = new Date(startOfToday);
    previousFromDate.setDate(previousFromDate.getDate() - 1);
    previousToDate = new Date(endOfToday);
    previousToDate.setDate(previousToDate.getDate() - 1);
  } else if (cleanParam === "yesterday") {
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(endOfToday);
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);

    fromDate = startOfYesterday;
    toDate = endOfYesterday;
    isSingleDay = true;
    label = "Yesterday";

    previousFromDate = new Date(startOfYesterday);
    previousFromDate.setDate(previousFromDate.getDate() - 1);
    previousToDate = new Date(endOfYesterday);
    previousToDate.setDate(previousToDate.getDate() - 1);
  } else if (cleanParam === "last7" || cleanParam === "7d") {
    fromDate = new Date(startOfToday);
    fromDate.setDate(fromDate.getDate() - 6);
    toDate = endOfToday;
    label = "Last 7 days";

    const duration = toDate.getTime() - fromDate.getTime();
    previousToDate = new Date(fromDate.getTime() - 1);
    previousFromDate = new Date(previousToDate.getTime() - duration);
  } else if (cleanParam === "quarter") {
    const currentMonth = today.getMonth();
    const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
    fromDate = new Date(today.getFullYear(), quarterStartMonth, 1, 0, 0, 0, 0);
    toDate = endOfToday;
    label = "Quarter to date";

    const duration = toDate.getTime() - fromDate.getTime();
    previousToDate = new Date(fromDate.getTime() - 1);
    previousFromDate = new Date(previousToDate.getTime() - duration);
  } else if (cleanParam.startsWith("days_")) {
    const count = parseInt(cleanParam.replace("days_", ""), 10) || 30;
    fromDate = new Date(startOfToday);
    fromDate.setDate(fromDate.getDate() - (count - 1));
    toDate = endOfToday;
    label = `Last ${count} days`;

    const duration = toDate.getTime() - fromDate.getTime();
    previousToDate = new Date(fromDate.getTime() - 1);
    previousFromDate = new Date(previousToDate.getTime() - duration);
  } else {
    // Default: Last 30 days
    fromDate = new Date(startOfToday);
    fromDate.setDate(fromDate.getDate() - 29);
    toDate = endOfToday;
    label = "Last 30 days";

    const duration = toDate.getTime() - fromDate.getTime();
    previousToDate = new Date(fromDate.getTime() - 1);
    previousFromDate = new Date(previousToDate.getTime() - duration);
  }

  return { fromDate, toDate, previousFromDate, previousToDate, label, isSingleDay };
}

export async function getDashboardOverview(rangeParam: string = "last30") {
  const [orders, inventory, customerCount] = await Promise.all([
    getOrdersForDashboard(),
    db.product.findMany({ select: { quantity: true } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const activeOrders = orders.filter((order: any) => order.status !== "CANCELLED");
  const { fromDate, toDate, previousFromDate, previousToDate, label: rangeLabelText, isSingleDay } = parseRangeDates(rangeParam);

  const periodOrders = activeOrders.filter(
    (order: any) => order.createdAt >= fromDate && order.createdAt <= toDate
  );
  const totalSales = activeOrders.reduce((sum: number, order: any) => sum + order.total, 0);
  const itemsOrdered = activeOrders.reduce(
    (sum: number, order: any) => sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0),
    0
  );
  const fulfilledOrders = orders.filter((order: any) => order.status === "SHIPPED" || order.status === "DELIVERED").length;
  const deliveredOrders = orders.filter((order: any) => order.status === "DELIVERED").length;
  const pendingOrders = orders.filter(
    (order: any) => order.status === "PENDING" || order.status === "CONFIRMED" || order.status === "PROCESSING"
  ).length;

  const productSales = new Map<string, { name: string; quantity: number }>();
  for (const order of periodOrders) {
    for (const item of order.items) {
      const current = productSales.get(item.productId) ?? { name: item.product.name, quantity: 0 };
      current.quantity += item.quantity;
      productSales.set(item.productId, current);
    }
  }

  let chartData: { date: string; current: number; previous: number }[] = [];

  if (isSingleDay) {
    chartData = [0, 4, 8, 12, 16, 20].map((hour) => {
      const slotStart = new Date(fromDate);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(fromDate);
      slotEnd.setHours(hour + 4, 0, 0, 0);

      const prevSlotStart = new Date(previousFromDate);
      prevSlotStart.setHours(hour, 0, 0, 0);
      const prevSlotEnd = new Date(previousFromDate);
      prevSlotEnd.setHours(hour + 4, 0, 0, 0);

      const currentVal = activeOrders
        .filter((o: any) => o.createdAt >= slotStart && o.createdAt < slotEnd)
        .reduce((sum: number, o: any) => sum + o.total, 0);
      const prevVal = activeOrders
        .filter((o: any) => o.createdAt >= prevSlotStart && o.createdAt < prevSlotEnd)
        .reduce((sum: number, o: any) => sum + o.total, 0);

      return {
        date: `${hour.toString().padStart(2, "0")}:00`,
        current: currentVal,
        previous: prevVal,
      };
    });
  } else {
    // Keep a point for every calendar day. The previous three-day sampling
    // labelled the final 27–29 Aug bucket as "27 Aug", which looked as if the
    // dashboard was behind. Daily data preserves today's date and sales.
    const step = 1;
    const points: Date[] = [];
    const curr = new Date(fromDate);
    while (curr <= toDate) {
      points.push(new Date(curr));
      curr.setDate(curr.getDate() + step);
    }

    const prevOffset = fromDate.getTime() - previousFromDate.getTime();

    chartData = points.map((pt: Date) => {
      const dayEnd = new Date(pt);
      dayEnd.setDate(dayEnd.getDate() + step);

      const prevPtStart = new Date(pt.getTime() - prevOffset);
      const prevPtEnd = new Date(dayEnd.getTime() - prevOffset);

      return {
        date: pt.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        current: activeOrders
          .filter((o: any) => o.createdAt >= pt && o.createdAt < dayEnd)
          .reduce((sum: number, o: any) => sum + o.total, 0),
        previous: activeOrders
          .filter((o: any) => o.createdAt >= prevPtStart && o.createdAt < prevPtEnd)
          .reduce((sum: number, o: any) => sum + o.total, 0),
      };
    });
  }

  const formatDateRange = (from: Date, to: Date) => {
    const format = (date: Date) =>
      date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    if (from.toDateString() === to.toDateString()) {
      return format(from);
    }
    return `${format(from)}–${format(to)}`;
  };

  return {
    rangeLabel: rangeLabelText,
    rangeKey: rangeParam,
    totalSales,
    periodSales: periodOrders.reduce((sum: number, order: any) => sum + order.total, 0),
    orderCount: orders.length,
    periodOrderCount: periodOrders.length,
    productCount: inventory.length,
    customerCount,
    itemsOrdered,
    fulfilledOrders,
    deliveredOrders,
    pendingOrders,
    recentOrders: orders.slice(0, 5).map((order: any) => ({
      id: order.id,
      status: order.status,
      total: order.total,
      customerName: order.user?.name || order.customerName || "Customer",
      itemCount: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    })),
    topProducts: [...productSales.values()]
      .sort((first: any, second: any) => second.quantity - first.quantity)
      .slice(0, 5),
    chartData,
    currentPeriodLabel: formatDateRange(fromDate, toDate),
    previousPeriodLabel: formatDateRange(previousFromDate, previousToDate),
    lowStockCount: inventory.filter((product: any) => product.quantity > 0 && product.quantity <= 5).length,
    outOfStockCount: inventory.filter((product: any) => product.quantity === 0).length,
  };
}

export async function getCustomersForDashboard() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      orders: { select: { total: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return customers.map((customer: any) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    createdAt: customer.createdAt.toISOString(),
    orderCount: customer.orders.length,
    amountSpent: customer.orders
      .filter((order: any) => order.status !== "CANCELLED")
      .reduce((sum: number, order: any) => sum + order.total, 0),
  }));
}

export async function getCustomerForDashboard(id: string) {
  const customer = await db.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, mainImage: true, slug: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) return null;

  const amountSpent = customer.orders
    .filter((order: any) => order.status !== "CANCELLED")
    .reduce((sum: number, order: any) => sum + order.total, 0);

  return {
    ...customer,
    amountSpent,
  };
}

export async function getAnalyticsData(range: string = "all") {
  const now = new Date();
  let startDate: Date | null = null;

  if (range === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === "last7") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 7);
  } else if (range === "last30") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30);
  }

  const whereClause = startDate ? { createdAt: { gte: startDate } } : {};

  const [orders, customers, orderItems] = await Promise.all([
    db.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, price: true, mainImage: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findMany({
      where: { role: "CUSTOMER" },
      select: { id: true, _count: { select: { orders: true } } },
    }),
    db.orderItem.findMany({
      where: startDate ? { order: { createdAt: { gte: startDate } } } : {},
      include: {
        product: { select: { id: true, name: true, price: true } },
        order: { select: { status: true } },
      },
    }),
  ]);

  const activeOrders = orders.filter((o: any) => o.status !== "CANCELLED");
  const grossSales = activeOrders.reduce((sum: number, o: any) => sum + o.total, 0);
  const totalOrders = activeOrders.length;
  const ordersFulfilled = activeOrders.filter((o: any) => ["SHIPPED", "DELIVERED"].includes(o.status)).length;

  const totalCustomers = customers.length;
  const returningCustomers = customers.filter((c: any) => c._count.orders > 1).length;
  const returningCustomerRate = totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0;

  const averageOrderValue = totalOrders > 0 ? Math.round(grossSales / totalOrders) : 0;

  // Aggregate sales by product
  const productSalesMap = new Map<string, { id: string; name: string; totalSales: number; quantity: number }>();

  orderItems.forEach((item: any) => {
    if (item.order.status === "CANCELLED" || !item.product) return;
    const existing = productSalesMap.get(item.productId) || {
      id: item.productId,
      name: item.product.name,
      totalSales: 0,
      quantity: 0,
    };
    existing.totalSales += item.unitPrice * item.quantity;
    existing.quantity += item.quantity;
    productSalesMap.set(item.productId, existing);
  });

  const salesByProduct = Array.from(productSalesMap.values()).sort((a: any, b: any) => b.totalSales - a.totalSales);

  return {
    range,
    grossSales,
    totalOrders,
    ordersFulfilled,
    returningCustomerRate,
    averageOrderValue,
    salesByProduct,
    allOrdersCount: orders.length,
  };
}
