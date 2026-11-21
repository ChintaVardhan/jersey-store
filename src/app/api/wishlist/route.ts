import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  productId: z.string().min(1),
});

async function requireUser() {
  const session = await auth();
  return session?.user?.id || null;
}

export async function GET() {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, productId: true },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId: product.id } },
    update: {},
    create: { userId, productId: product.id },
    select: { id: true, productId: true },
  });
  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const fromQuery = new URL(req.url).searchParams.get("productId");
  let productId = fromQuery;
  if (!productId) {
    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    productId = parsed.success ? parsed.data.productId : null;
  }
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  return NextResponse.json({ ok: true });
}
