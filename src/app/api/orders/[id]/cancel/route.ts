import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { restockItems } from "@/lib/commerce";

const CANCELLABLE = new Set(["PAID", "PROCESSING"]);

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!existing || existing.userId !== session.user.id) {
        throw new Error("Order not found");
      }
      if (!CANCELLABLE.has(existing.status)) {
        throw new Error("This order can only be cancelled while it is paid or processing.");
      }
      await restockItems(tx, existing.items);
      return tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
    });
    return NextResponse.json({ order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cancel failed";
    const status = message === "Order not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
