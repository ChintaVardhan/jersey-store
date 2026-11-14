"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";
import { useEffect, useState } from "react";
import { isStaff, isSuperAdmin } from "@/lib/roles";

export function ImmersiveNav() {
  const pathname = usePathname();
  const { data } = useSession();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isHome = pathname === "/";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-4 pt-4 sm:px-8 sm:pt-6">
      <nav className="pointer-events-auto flex gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-800 sm:gap-6">
        <Link href="/shop" className="transition-colors hover:text-black">
          Shop
        </Link>
        <Link href="/custom" className="transition-colors hover:text-black">
          Custom
        </Link>
        <Link href="/drops" className="hidden transition-colors hover:text-black sm:inline">
          Drops
        </Link>
      </nav>

      <Link
        href="/"
        className="pointer-events-auto absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-lime px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-black shadow-sm sm:top-6"
      >
        Jersey Store
      </Link>

      <nav className="pointer-events-auto flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-800 sm:gap-6">
        {data?.user ? (
          <>
            <Link href="/account" className="transition-colors hover:text-black">
              Account
            </Link>
            {isSuperAdmin(data.user.role) ? (
              <Link href="/super-admin" className="transition-colors hover:text-black">
                Super
              </Link>
            ) : isStaff(data.user.role) ? (
              <Link href="/admin" className="transition-colors hover:text-black">
                Admin
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="transition-colors hover:text-black"
            >
              Out
            </button>
          </>
        ) : (
          <Link href="/login" className="transition-colors hover:text-black">
            Login
          </Link>
        )}
        <Link href="/cart" className="relative transition-colors hover:text-black">
          Bag{mounted && cartCount > 0 ? ` (${cartCount})` : ""}
        </Link>
        {!isHome ? (
          <Link href="/" className="hidden transition-colors hover:text-black md:inline">
            Enter
          </Link>
        ) : null}
      </nav>
    </header>
  );
}

export function LimeBar() {
  return <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-3 bg-lime sm:h-4" />;
}
