"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    };
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not sign up");
      setLoading(false);
      return;
    }
    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-20 pt-28">
      <h1 className="font-display text-4xl tracking-tight">Sign up</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-3">
        <input name="name" required placeholder="Name" className="w-full border border-neutral-300 px-3 py-2" />
        <input name="email" type="email" required placeholder="Email" className="w-full border border-neutral-300 px-3 py-2" />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6)"
          className="w-full border border-neutral-300 px-3 py-2"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={loading} className="w-full bg-black py-3 text-[11px] uppercase tracking-[0.2em] text-lime">
          {loading ? "…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm">
        Have an account?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>
    </div>
  );
}
