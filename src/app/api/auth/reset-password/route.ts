import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(12),
  newPassword: z.string().min(6).max(72),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Email, code, and a new password are required" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const otp = parsed.data.otp.trim();
  const identifier = `reset:${email}`;
  const token = await prisma.verificationToken.findFirst({
    where: { identifier, token: `${email}:${otp}` },
  });

  if (!token) {
    return NextResponse.json({ error: "Invalid reset code." }, { status: 400 });
  }
  if (token.expires.getTime() < Date.now()) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    return NextResponse.json({ error: "Reset code has expired. Request a new one." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid reset code." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  return NextResponse.json({ ok: true, message: "Password reset. You can sign in." });
}
