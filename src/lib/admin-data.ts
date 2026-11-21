import { prisma } from "@/lib/prisma";

function topProductCounts(items: { productName: string; quantity: number }[]) {
  const totals = new Map<string, number>();
  for (const item of items) {
    totals.set(item.productName, (totals.get(item.productName) || 0) + item.quantity);
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));
}

export async function loadAdminDashboard() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [products, orders, userCount, coupons, reviews, revenue, today, pending, lowStock, customers, statusGroups, topProducts] =
    await Promise.all([
      prisma.product.findMany({ orderBy: { updatedAt: "desc" } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 80,
        include: { items: true, user: true, address: true },
      }),
      prisma.user.count(),
      prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { product: { select: { name: true } } },
      }),
      prisma.order.aggregate({
        _sum: { totalInr: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.order.aggregate({
        _sum: { totalInr: true },
        where: { status: { not: "CANCELLED" }, createdAt: { gte: start } },
      }),
      prisma.order.count({ where: { status: { in: ["PENDING", "PAID", "PROCESSING"] } } }),
      prisma.product.count({ where: { stock: { lt: 10 } } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.orderItem.findMany({
        where: { order: { status: { not: "CANCELLED" } } },
        select: { productName: true, quantity: true },
      }),
    ]);

  return {
    products,
    orders,
    userCount,
    coupons,
    reviews,
    revenueInr: revenue._sum.totalInr || 0,
    metrics: {
      revenueInr: revenue._sum.totalInr || 0,
      todayRevenueInr: today._sum.totalInr || 0,
      pendingCount: pending,
      lowStockCount: lowStock,
      customerCount: customers,
      statusCounts: Object.fromEntries(statusGroups.map((row) => [row.status, row._count._all])),
      topProducts: topProductCounts(topProducts),
    },
  };
}

export function toAdminPanelProps(data: Awaited<ReturnType<typeof loadAdminDashboard>>) {
  return {
    products: data.products.map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      priceInr: p.priceInr,
      featured: p.featured,
    })),
    orders: data.orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      waybill: o.waybill,
      status: o.status,
      totalInr: o.totalInr,
      subtotalInr: o.subtotalInr,
      discountInr: o.discountInr,
      shippingInr: o.shippingInr,
      couponCode: o.couponCode,
      email: o.user.email,
      trackingNumber: o.trackingNumber,
      city: o.address ? `${o.address.city}, ${o.address.state}` : "",
      createdAt: o.createdAt.toISOString(),
      customerName: o.address?.fullName || o.user.name || "Customer",
      phone: o.address?.phone || o.user.phone || "",
      address: o.address
        ? `${o.address.line1}${o.address.line2 ? `, ${o.address.line2}` : ""}, ${o.address.city}, ${o.address.state} ${o.address.postalCode}`
        : "",
      items: o.items.map((i) => ({
        name: i.productName,
        size: i.size,
        quantity: i.quantity,
        unitPriceInr: i.unitPriceInr,
        customName: i.customName,
        customNumber: i.customNumber,
      })),
    })),
    coupons: data.coupons.map((c) => ({
      id: c.id,
      code: c.code,
      type: c.type,
      value: c.value,
      minOrderInr: c.minOrderInr,
      maxDiscountInr: c.maxDiscountInr,
      usageLimit: c.usageLimit,
      timesUsed: c.timesUsed,
      active: c.active,
    })),
    reviews: data.reviews.map((r) => ({
      id: r.id,
      productName: r.product.name,
      authorName: r.authorName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    })),
    metrics: data.metrics,
  };
}
