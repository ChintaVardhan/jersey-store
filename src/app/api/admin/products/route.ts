import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCatalog } from "@/lib/roles";

const patchSchema = z.object({
  id: z.string(),
  stock: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  priceInr: z.number().int().min(0).optional(),
  isDrop: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!canManageCatalog(session?.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { id, ...data } = parsed.data;
  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ product });
}

const createSchema = z.object({
  name: z.string().min(2),
  team: z.string().min(2),
  sport: z.enum(["FOOTBALL", "CRICKET"]),
  edition: z.enum(["FAN_EDITION", "MASTER_COPY", "CUSTOM_BUILD"]),
  priceInr: z.number().int().min(100),
  stock: z.number().int().min(0).default(50),
  description: z.string().min(10),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!canManageCatalog(session?.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const d = parsed.data;
  const slug =
    d.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36);

  const product = await prisma.product.create({
    data: {
      slug,
      name: d.name,
      description: d.description,
      sport: d.sport,
      edition: d.edition,
      team: d.team,
      priceInr: d.priceInr,
      priceUsd: Math.max(1, Math.round(d.priceInr / 50)),
      stock: d.stock,
      featured: true,
      colors: JSON.stringify(["#111111", "#C6FF3D"]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      imageColors: JSON.stringify({ primary: "#111111", secondary: "#C6FF3D", accent: "#FFFFFF" }),
      image: "",
      searchable: `${d.name} ${d.team} ${d.sport} jersey`.toLowerCase(),
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
