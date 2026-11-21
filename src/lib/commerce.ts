import type { Coupon, Prisma } from "@prisma/client";
import { FREE_SHIPPING_INR, SHIPPING_FEE_INR } from "@/lib/utils";

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURN_REQUESTED",
  "RETURNED",
  "CANCELLED",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export function shippingForSubtotal(subtotalInr: number) {
  if (subtotalInr <= 0 || subtotalInr >= FREE_SHIPPING_INR) return 0;
  return SHIPPING_FEE_INR;
}

export function discountForCoupon(
  coupon: Pick<Coupon, "type" | "value" | "minOrderInr" | "maxDiscountInr" | "active" | "timesUsed" | "usageLimit">,
  subtotalInr: number
) {
  if (!coupon.active) {
    return { ok: false as const, discountInr: 0, message: "This code is no longer active." };
  }
  if (coupon.timesUsed >= coupon.usageLimit) {
    return { ok: false as const, discountInr: 0, message: "This code has reached its usage limit." };
  }
  if (subtotalInr < coupon.minOrderInr) {
    return {
      ok: false as const,
      discountInr: 0,
      message: `Minimum order of ₹${coupon.minOrderInr.toLocaleString("en-IN")} required.`,
    };
  }

  let discount =
    coupon.type === "PERCENT" ? Math.round((subtotalInr * coupon.value) / 100) : coupon.value;
  if (coupon.type === "PERCENT" && coupon.maxDiscountInr != null) {
    discount = Math.min(discount, coupon.maxDiscountInr);
  }
  discount = Math.max(0, Math.min(discount, subtotalInr));

  return {
    ok: true as const,
    discountInr: discount,
    message: `₹${discount.toLocaleString("en-IN")} off applied.`,
  };
}

function randomChunk(length: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function makeOrderNumber() {
  return `JS-${new Date().getFullYear()}-${randomChunk(5)}`;
}

export function makeWaybill() {
  return `JS-EXP-${randomChunk(8)}`;
}

export function etaFromNow(days = 2) {
  const eta = new Date();
  eta.setDate(eta.getDate() + days);
  return eta;
}

type Tx = Prisma.TransactionClient;

export async function restockItems(tx: Tx, items: { productId: string; quantity: number }[]) {
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
}

export async function recomputeProductRating(tx: Tx, productId: string) {
  const agg = await tx.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const count = agg._count._all;
  await tx.product.update({
    where: { id: productId },
    data: {
      reviewsCount: count,
      rating: count ? Math.round((agg._avg.rating || 0) * 100) / 100 : 0,
    },
  });
}
