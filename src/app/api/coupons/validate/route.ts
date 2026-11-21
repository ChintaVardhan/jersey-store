import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { discountForCoupon } from "@/lib/commerce";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("code") || "").trim().toUpperCase();
  const subtotal = Number(searchParams.get("subtotal") || 0);

  if (!code || !Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ valid: false, code, discountInr: 0, message: "Enter a code and subtotal." });
  }

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) {
    return NextResponse.json({
      valid: false,
      code,
      discountInr: 0,
      message: "Invalid code.",
    });
  }

  const result = discountForCoupon(coupon, Math.round(subtotal));
  return NextResponse.json({
    valid: result.ok,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountInr: result.discountInr,
    message: result.message,
  });
}
