import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const coupons = await prisma.coupon.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  const available = coupons.filter((c) => c.timesUsed < c.usageLimit);
  return NextResponse.json({
    coupons: available.map((c) => ({
      id: c.id,
      code: c.code,
      type: c.type,
      value: c.value,
      minOrderInr: c.minOrderInr,
      maxDiscountInr: c.maxDiscountInr,
      usageLimit: c.usageLimit,
      timesUsed: c.timesUsed,
    })),
  });
}
