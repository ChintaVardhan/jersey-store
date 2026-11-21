import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCatalog } from "@/lib/roles";

export async function GET() {
  const session = await auth();
  if (!canManageCatalog(session?.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [revenue, today, pending, lowStock, customers, statusGroups, soldItems] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalInr: true },
      _count: { _all: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { totalInr: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: start } },
    }),
    prisma.order.count({
      where: { status: { in: ["PENDING", "PAID", "PROCESSING"] } },
    }),
    prisma.product.count({ where: { stock: { lt: 10 } } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { status: { not: "CANCELLED" } } },
      select: { productName: true, quantity: true },
    }),
  ]);

  const totals = new Map<string, number>();
  for (const item of soldItems) {
    totals.set(item.productName, (totals.get(item.productName) || 0) + item.quantity);
  }
  const topProducts = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  return NextResponse.json({
    revenueInr: revenue._sum.totalInr || 0,
    todayRevenueInr: today._sum.totalInr || 0,
    orderCount: revenue._count._all,
    pendingCount: pending,
    lowStockCount: lowStock,
    customerCount: customers,
    statusCounts: Object.fromEntries(statusGroups.map((row) => [row.status, row._count._all])),
    topProducts,
  });
}
