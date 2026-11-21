import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCatalog } from "@/lib/roles";
import { ORDER_STATUSES } from "@/lib/commerce";

const schema = z.object({
  id: z.string(),
  status: z.enum(ORDER_STATUSES),
  trackingNumber: z.string().optional().nullable(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!canManageCatalog(session?.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { id, status, trackingNumber } = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!existing) throw new Error("Order not found");

      const data: {
        status: typeof status;
        trackingNumber?: string | null;
      } = { status };

      if (trackingNumber !== undefined) {
        data.trackingNumber = trackingNumber?.trim() ? trackingNumber.trim() : null;
      }

      const wasActive = existing.status !== "CANCELLED";
      const cancelling = status === "CANCELLED" && wasActive;

      if (cancelling) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data,
      });
    });

    return NextResponse.json({ order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
