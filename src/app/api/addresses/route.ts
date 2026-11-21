import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const addressSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1).max(40).optional(),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  line1: z.string().min(3),
  line2: z.string().optional().nullable(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().min(2).default("IN"),
  isDefault: z.boolean().optional(),
});

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function GET() {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ addresses });
}

export async function POST(req: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const parsed = addressSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid address" }, { status: 400 });

  const data = parsed.data;
  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    return tx.address.create({
      data: {
        userId,
        label: data.label || "Home",
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: Boolean(data.isDefault),
      },
    });
  });

  return NextResponse.json({ address }, { status: 201 });
}

export async function PATCH(req: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const parsed = addressSchema.extend({ id: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid address" }, { status: 400 });

  const existing = await prisma.address.findUnique({ where: { id: parsed.data.id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  const data = parsed.data;
  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    return tx.address.update({
      where: { id: data.id },
      data: {
        label: data.label || existing.label,
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: data.isDefault ?? existing.isDefault,
      },
    });
  });

  return NextResponse.json({ address });
}

export async function DELETE(req: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.order.updateMany({ where: { addressId: id }, data: { addressId: null } }),
    prisma.address.delete({ where: { id } }),
  ]);
  return NextResponse.json({ ok: true });
}
