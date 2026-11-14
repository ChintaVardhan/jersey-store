import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCatalog } from "@/lib/roles";

const schema = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  trackingNumber: z.string().optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!canManageCatalog(session?.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const order = await prisma.order.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      trackingNumber: parsed.data.trackingNumber || null,
    },
  });
  return NextResponse.json({ order });
}
