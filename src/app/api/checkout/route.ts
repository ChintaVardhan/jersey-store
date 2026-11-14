import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
});

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
      const productIds = data.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      const map = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const orderItems = [];

      for (const item of data.items) {
        const product = map.get(item.productId);
        if (!product) throw new Error("Product missing");
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}`);
        }
        subtotal += product.priceInr * item.quantity;
        orderItems.push({
          productId: product.id,
          productName: product.name,
          size: item.size,
          quantity: item.quantity,
          unitPriceInr: product.priceInr,
          customName: item.customName || null,
          customNumber: item.customNumber || null,
          patches: item.patches || null,
        });
      }

      const shipping = subtotal >= 2499 ? 0 : 99;
      const total = subtotal + shipping;

      let paymentId = `demo_${Date.now()}`;
      let provider = data.provider;
      let status: "PAID" | "PENDING" = provider === "DEMO" ? "PAID" : "PENDING";

      if (data.provider === "STRIPE" && process.env.STRIPE_SECRET_KEY) {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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

      if (data.provider === "RAZORPAY" && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const Razorpay = (await import("razorpay")).default;
        const rzp = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
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

      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          addressId: address.id,
          status,
          paymentProvider: provider,
          paymentId,
          subtotalInr: subtotal,
          shippingInr: shipping,
          totalInr: total,
          items: { create: orderItems },
        },
        include: { items: true },
      });

      return {
        early: false as const,
        mode: provider,
        orderId: order.id,
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
      paymentId: result.paymentId,
      totalInr: result.totalInr,
      razorpayKey: result.razorpayKey,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
