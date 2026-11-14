"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // Wire Resend + VerificationToken when RESEND_API_KEY is set
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-20 pt-28">
      <h1 className="font-display text-4xl tracking-tight">Forgot password</h1>
      <p className="mt-2 text-sm text-neutral-600">
        We&apos;ll email a reset link when Resend is configured. Demo accounts use jersey123.
      </p>
      {sent ? (
        <p className="mt-8 text-sm">If that email exists, a reset link would be sent.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full border border-neutral-300 px-3 py-2"
          />
          <button type="submit" className="w-full bg-black py-3 text-[11px] uppercase tracking-[0.2em] text-lime">
            Send reset
          </button>
        </form>
      )}
      <Link href="/login" className="mt-6 inline-block text-sm underline">
        Back to login
      </Link>
    </div>
  );
}
