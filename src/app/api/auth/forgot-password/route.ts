import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
});

function hasSmtp() {
  return Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.isActive === false) {
    return NextResponse.json({ ok: true, message: "If this email is registered, a reset code has been sent." });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const identifier = `reset:${email}`;
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: `${email}:${otp}`,
      expires,
    },
  });

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Jersey Store <onboarding@resend.dev>",
        to: email,
        subject: "Jersey Store password reset",
        text: `Your Jersey Store reset code is ${otp}. It expires in 15 minutes.`,
      });
    } catch (err) {
      console.error("Reset email failed", err);
    }
  }

  const body: { ok: true; message: string; demoOtp?: string } = {
    ok: true,
    message: hasSmtp()
      ? "A 6-digit reset code was sent."
      : "Demo mode: use the code below. It expires in 15 minutes.",
  };
  if (!hasSmtp()) body.demoOtp = otp;
  return NextResponse.json(body);
}
