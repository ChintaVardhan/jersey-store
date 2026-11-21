import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recomputeProductRating } from "@/lib/commerce";

const createSchema = z.object({
  productId: z.string().min(1),
  authorName: z.string().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(4).max(1000),
});

export async function GET(req: Request) {
  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const session = await auth();
  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        productId: product.id,
        userId: session?.user?.id || null,
        authorName: parsed.data.authorName.trim(),
        rating: parsed.data.rating,
        comment: parsed.data.comment.trim(),
      },
    });
    await recomputeProductRating(tx, product.id);
    return created;
  });

  return NextResponse.json({ review }, { status: 201 });
}
