import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCatalog } from "@/lib/roles";
import { recomputeProductRating } from "@/lib/commerce";

async function guard() {
  const session = await auth();
  return canManageCatalog(session?.user?.role);
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { product: { select: { name: true } } },
  });
  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.product.name,
      authorName: r.authorName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

export async function DELETE(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id } });
    await recomputeProductRating(tx, review.productId);
  });
  return NextResponse.json({ ok: true });
}
