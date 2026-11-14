"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/account";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-20 pt-28">
      <h1 className="font-display text-4xl tracking-tight">Login</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Demo: fan@jerseystore.com / jersey123
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black py-3 text-[11px] uppercase tracking-[0.2em] text-lime"
        >
          {loading ? "…" : "Enter"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="mt-3 w-full border border-neutral-300 py-3 text-[11px] uppercase tracking-[0.2em]"
      >
        Continue with Google
      </button>
      <p className="mt-6 text-sm text-neutral-600">
        New here?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>{" "}
        ·{" "}
        <Link href="/forgot-password" className="underline">
          Forgot password
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
