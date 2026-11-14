import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];
  if (!ids.length) return NextResponse.json({ products: [] });

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
  });
  return NextResponse.json({ products });
}
