import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCatalog } from "@/lib/roles";

async function guard() {
  const session = await auth();
  if (!canManageCatalog(session?.user?.role)) return false;
  return true;
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

const createSchema = z.object({
  code: z.string().min(3).max(24),
  type: z.enum(["PERCENT", "FLAT"]),
  value: z.number().int().positive(),
  minOrderInr: z.number().int().min(0),
  maxDiscountInr: z.number().int().positive().nullable().optional(),
  usageLimit: z.number().int().positive(),
});

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid coupon" }, { status: 400 });

  const code = parsed.data.code.trim().toUpperCase();
  const exists = await prisma.coupon.findUnique({ where: { code } });
  if (exists) return NextResponse.json({ error: "Code already exists" }, { status: 409 });

  const coupon = await prisma.coupon.create({
    data: {
      code,
      type: parsed.data.type,
      value: parsed.data.value,
      minOrderInr: parsed.data.minOrderInr,
      maxDiscountInr: parsed.data.type === "PERCENT" ? parsed.data.maxDiscountInr ?? null : null,
      usageLimit: parsed.data.usageLimit,
    },
  });
  return NextResponse.json({ coupon }, { status: 201 });
}

const patchSchema = z.object({
  id: z.string(),
  active: z.boolean(),
});

export async function PATCH(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const coupon = await prisma.coupon.update({
    where: { id: parsed.data.id },
    data: { active: parsed.data.active },
  });
  return NextResponse.json({ coupon });
}
