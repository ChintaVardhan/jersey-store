import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const RETURNABLE = new Set(["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]);

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (existing.status === "RETURN_REQUESTED") {
    return NextResponse.json({ order: existing });
  }
  if (!RETURNABLE.has(existing.status)) {
    return NextResponse.json(
      { error: "A return can be requested after the order has shipped." },
      { status: 400 }
    );
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: "RETURN_REQUESTED" },
  });
  return NextResponse.json({ order });
}
