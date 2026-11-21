import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PATCH_FEE_INR } from "@/lib/utils";
import { discountForCoupon, etaFromNow, makeOrderNumber, makeWaybill, shippingForSubtotal } from "@/lib/commerce";

const itemSchema = z.object({
  productId: z.string(),
  size: z.string(),
  quantity: z.number().int().min(1).max(10),
  customName: z.string().optional(),
  customNumber: z.string().optional(),
  patches: z.string().optional(),
});

const schema = z.object({
  items: z.array(itemSchema).min(1),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().default("IN"),
  provider: z.enum(["DEMO", "RAZORPAY", "STRIPE"]).default("DEMO"),
  couponCode: z.string().max(24).optional(),
});

function patchSurcharge(patches?: string) {
  return patches && patches.trim() && patches !== "None" ? PATCH_FEE_INR : 0;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const productIds = [...new Set(data.items.map((i) => i.productId))];
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      const map = new Map(products.map((p) => [p.id, p]));

      const qtyByProduct = new Map<string, number>();
      for (const item of data.items) {
        qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) || 0) + item.quantity);
      }

      for (const [productId, qty] of qtyByProduct) {
        const product = map.get(productId);
        if (!product) throw new Error("Product missing");
        if (product.stock < qty) {
          throw new Error(`Not enough stock for ${product.name}`);
        }
      }

      let subtotal = 0;
      const orderItems = [];

      for (const item of data.items) {
        const product = map.get(item.productId)!;
        const unit = product.priceInr + patchSurcharge(item.patches);
        subtotal += unit * item.quantity;
        orderItems.push({
          productId: product.id,
          productName: product.name,
          size: item.size,
          quantity: item.quantity,
          unitPriceInr: unit,
          customName: item.customName || null,
          customNumber: item.customNumber || null,
          patches: item.patches || null,
        });
      }

      let discount = 0;
      let couponCode: string | null = null;
      let couponId: string | null = null;
      let couponLimit = 0;
      if (data.couponCode?.trim()) {
        const code = data.couponCode.trim().toUpperCase();
        const coupon = await tx.coupon.findUnique({ where: { code } });
        if (!coupon) throw new Error("Invalid coupon code");
        const applied = discountForCoupon(coupon, subtotal);
        if (!applied.ok) throw new Error(applied.message);
        discount = applied.discountInr;
        couponCode = coupon.code;
        couponId = coupon.id;
        couponLimit = coupon.usageLimit;
      }

      const shipping = shippingForSubtotal(subtotal);
      const total = Math.max(0, subtotal - discount) + shipping;

      let paymentId = `demo_${Date.now()}`;
      let provider: "DEMO" | "RAZORPAY" | "STRIPE" = "DEMO";
      let status: "PAID" | "PENDING" = "PAID";

      const stripeKey = process.env.STRIPE_SECRET_KEY;
      const rzpId = process.env.RAZORPAY_KEY_ID;
      const rzpSecret = process.env.RAZORPAY_KEY_SECRET;

      if (data.provider === "STRIPE" && stripeKey) {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(stripeKey);
        const intent = await stripe.paymentIntents.create({
          amount: Math.max(50, Math.round(total / 80) * 100),
          currency: "usd",
          metadata: { userId: session.user.id },
          automatic_payment_methods: { enabled: true },
        });
        return {
          early: true as const,
          mode: "STRIPE" as const,
          clientSecret: intent.client_secret,
          totalInr: total,
        };
      }

      if (data.provider === "RAZORPAY" && rzpId && rzpSecret) {
        const Razorpay = (await import("razorpay")).default;
        const rzp = new Razorpay({
          key_id: rzpId,
          key_secret: rzpSecret,
        });
        const rzOrder = await rzp.orders.create({
          amount: total * 100,
          currency: "INR",
          receipt: `js_${Date.now()}`,
        });
        paymentId = rzOrder.id;
        provider = "RAZORPAY";
        status = "PENDING";
      }
      // Missing Razorpay/Stripe keys → Demo pay (PAID) so cart isn't cleared into unpaid orders

      await tx.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });

      const address = await tx.address.create({
        data: {
          userId: session.user.id,
          fullName: data.fullName,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          isDefault: true,
        },
      });

      for (const [productId, qty] of qtyByProduct) {
        const updated = await tx.product.updateMany({
          where: { id: productId, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });
        if (updated.count !== 1) {
          const product = map.get(productId);
          throw new Error(`Not enough stock for ${product?.name || "item"}`);
        }
      }

      if (couponId) {
        const redeemed = await tx.coupon.updateMany({
          where: { id: couponId, active: true, timesUsed: { lt: couponLimit } },
          data: { timesUsed: { increment: 1 } },
        });
        if (redeemed.count !== 1) throw new Error("This code has reached its usage limit.");
      }

      await tx.user.update({
        where: { id: session.user.id },
        data: { phone: data.phone },
      });

      let orderNumber = makeOrderNumber();
      let waybill = makeWaybill();
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const clash = await tx.order.findFirst({
          where: { OR: [{ orderNumber }, { waybill }] },
          select: { id: true },
        });
        if (!clash) break;
        orderNumber = makeOrderNumber();
        waybill = makeWaybill();
      }

      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          addressId: address.id,
          status,
          orderNumber,
          waybill,
          paymentProvider: provider,
          paymentId,
          subtotalInr: subtotal,
          discountInr: discount,
          couponCode,
          shippingInr: shipping,
          totalInr: total,
          etaAt: etaFromNow(2),
          items: { create: orderItems },
        },
        include: { items: true },
      });

      return {
        early: false as const,
        mode: provider,
        orderId: order.id,
        orderNumber: order.orderNumber,
        waybill: order.waybill,
        discountInr: discount,
        paymentId,
        totalInr: total,
        razorpayKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || null,
      };
    });

    if (result.early) {
      return NextResponse.json({
        mode: result.mode,
        clientSecret: result.clientSecret,
        totalInr: result.totalInr,
      });
    }

    return NextResponse.json({
      mode: result.mode,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      waybill: result.waybill,
      discountInr: result.discountInr,
      paymentId: result.paymentId,
      totalInr: result.totalInr,
      razorpayKey: result.razorpayKey,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
