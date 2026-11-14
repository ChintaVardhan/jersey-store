"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function StaffBar({ label }: { label: string }) {
  const { data } = useSession();
  const role = data?.user?.role;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
      <Link
        href="/"
        className="rounded-full bg-lime px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-black"
      >
        Jersey Store
      </Link>
      <nav className="flex flex-wrap items-center gap-4 text-[11px] font-medium uppercase tracking-[0.16em]">
        <span className="text-neutral-500">{label}</span>
        <Link href="/admin" className="hover:text-black">
          Admin
        </Link>
        {role === "SUPER_ADMIN" ? (
          <Link href="/super-admin" className="hover:text-black">
            Super
          </Link>
        ) : null}
        <Link href="/shop" className="hover:text-black">
          Store
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/staff" })}
          className="hover:text-black"
        >
          Sign out
        </button>
      </nav>
    </header>
  );
}
