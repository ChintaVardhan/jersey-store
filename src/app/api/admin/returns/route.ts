import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCatalog } from "@/lib/roles";
import { restockItems } from "@/lib/commerce";

const schema = z.object({
  id: z.string(),
  action: z.enum(["REFUND", "REPLACEMENT"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!canManageCatalog(session?.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  try {
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: parsed.data.id },
        include: { items: true },
      });
      if (!existing) throw new Error("Order not found");

      if (parsed.data.action === "REPLACEMENT") {
        return tx.order.update({
          where: { id: existing.id },
          data: { status: "PROCESSING" },
        });
      }

      if (existing.status !== "CANCELLED") {
        await restockItems(tx, existing.items);
      }
      return tx.order.update({
        where: { id: existing.id },
        data: { status: "CANCELLED" },
      });
    });
    return NextResponse.json({ order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
