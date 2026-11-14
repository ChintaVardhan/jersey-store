"use client";

import { FormEvent, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";

type Portal = "ADMIN" | "SUPER_ADMIN";

export default function StaffLoginPage() {
  const [portal, setPortal] = useState<Portal>("ADMIN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      const me = await fetch("/api/auth/me").then((r) => r.json());
      const role = me?.user?.role as string | undefined;

      if (portal === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
        await signOut({ redirect: false });
        setError("This account is not Super Admin");
        setLoading(false);
        return;
      }
      if (portal === "ADMIN" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
        await signOut({ redirect: false });
        setError("This account is not staff");
        setLoading(false);
        return;
      }

      window.location.assign(portal === "SUPER_ADMIN" ? "/super-admin" : "/admin");
    } catch {
      setError("Could not sign in. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-4">
      <div className="panel w-full max-w-md p-8 shadow-[0_20px_60px_rgba(198,255,61,0.18)]">
        <div className="text-center">
          <span className="inline-block rounded-full bg-lime px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-black">
            Jersey Store
          </span>
          <h1 className="font-display mt-4 text-3xl tracking-tight">Staff portal</h1>
          <p className="mt-2 text-sm text-neutral-600">Admin & Super Admin access</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-full border border-neutral-200 p-1">
          {(["ADMIN", "SUPER_ADMIN"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPortal(p)}
              className={`rounded-full py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                portal === p ? "bg-black text-lime" : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {p === "ADMIN" ? "Admin" : "Super Admin"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Username / Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder={portal === "SUPER_ADMIN" ? "super@jerseystore.com" : "admin@jerseystore.com"}
              className="mt-1 w-full border border-neutral-300 px-3 py-2.5 outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className="mt-1 w-full border border-neutral-300 px-3 py-2.5 outline-none focus:border-black"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-lime disabled:opacity-60"
          >
            {loading ? "Signing in…" : `Log in as ${portal === "ADMIN" ? "Admin" : "Super Admin"}`}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-500">
          Demo: admin@jerseystore.com / jersey123
          <br />
          Super: super@jerseystore.com / jersey123
        </p>
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="underline">
            Customer login
          </Link>
          {" · "}
          <Link href="/" className="underline">
            Storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
