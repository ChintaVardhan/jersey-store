"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not send a code");
      setLoading(false);
      return;
    }
    setSent(true);
    setMessage(data.message || "Check your email for a code.");
    setDemoOtp(data.demoOtp || "");
    if (data.demoOtp) setOtp(data.demoOtp);
    setLoading(false);
  }

  async function resetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        otp,
        newPassword: fd.get("newPassword"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not reset password");
      setLoading(false);
      return;
    }
    setDone(true);
    setMessage(data.message || "Password updated.");
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md px-3 pb-24 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] sm:px-4 sm:pb-20 sm:pt-28">
      <h1 className="font-display text-4xl tracking-tight">Forgot password</h1>
      <p className="mt-2 text-sm text-neutral-600">
        We&apos;ll send a 6-digit code. Without email configured, the demo code shows here.
      </p>
      {done ? (
        <p className="mt-8 text-sm">{message}</p>
      ) : !sent ? (
        <form onSubmit={requestCode} className="mt-8 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border border-neutral-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black py-3 text-[11px] uppercase tracking-[0.2em] text-lime disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="mt-8 space-y-3">
          <p className="text-sm">{message}</p>
          {demoOtp ? (
            <p className="border border-lime bg-lime/30 px-3 py-2 text-sm">Demo code: {demoOtp}</p>
          ) : null}
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            placeholder="6-digit code"
            className="w-full border border-neutral-300 px-3 py-2"
          />
          <input
            name="newPassword"
            type="password"
            required
            minLength={6}
            placeholder="New password"
            className="w-full border border-neutral-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black py-3 text-[11px] uppercase tracking-[0.2em] text-lime disabled:opacity-60"
          >
            {loading ? "Saving…" : "Reset password"}
          </button>
        </form>
      )}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <Link href="/login" className="mt-6 inline-block text-sm underline">
        Back to login
      </Link>
    </div>
  );
}
