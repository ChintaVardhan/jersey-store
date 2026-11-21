import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  if (q.length < 4) {
    return NextResponse.json({ error: "Enter an order number or waybill" }, { status: 400 });
  }

  const upper = q.toUpperCase();
  const tail = q.toLowerCase().slice(-8);

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { orderNumber: upper },
        { waybill: upper },
        { trackingNumber: upper },
        { trackingNumber: q },
        { id: { endsWith: tail } },
      ],
    },
    include: {
      items: true,
      address: { select: { city: true, state: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found. Check the order number or waybill." }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      waybill: order.waybill,
      trackingNumber: order.trackingNumber,
      status: order.status,
      etaAt: order.etaAt?.toISOString() || null,
      createdAt: order.createdAt.toISOString(),
      subtotalInr: order.subtotalInr,
      discountInr: order.discountInr,
      shippingInr: order.shippingInr,
      totalInr: order.totalInr,
      couponCode: order.couponCode,
      city: order.address ? `${order.address.city}, ${order.address.state}` : "",
      items: order.items.map((item) => ({
        name: item.productName,
        size: item.size,
        quantity: item.quantity,
      })),
    },
  });
}
