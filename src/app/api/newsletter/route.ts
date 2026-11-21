import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ ok: true, message: "This email is already on the list." });
  }

  await prisma.newsletterSubscriber.create({ data: { email } });
  return NextResponse.json({ ok: true, message: "You are on the list. New drops will reach this inbox." });
}
