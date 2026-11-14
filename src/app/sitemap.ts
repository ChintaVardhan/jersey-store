import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const products = await prisma.product.findMany({ select: { slug: true, updatedAt: true } });

  const staticRoutes = [
    "",
    "/shop",
    "/custom",
    "/drops",
    "/shipping",
    "/returns",
    "/size-guide",
    "/contact",
    "/faq",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
