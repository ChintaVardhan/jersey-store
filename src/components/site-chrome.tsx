"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";
import { useEffect, useState } from "react";
import { isStaff, isSuperAdmin } from "@/lib/roles";

export function ImmersiveNav() {
  const pathname = usePathname();
  const { data, status } = useSession();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => setMenuOpen(false), [pathname]);

  const isHome = pathname === "/";
  const showAuth = mounted && status !== "loading";
  const user = data?.user;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8 sm:pt-6">
        <div className="pointer-events-auto grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex min-w-0 items-center justify-start gap-1 sm:gap-4">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black backdrop-blur sm:hidden"
            >
              <span className="sr-only">Menu</span>
              <span className="flex w-4 flex-col gap-1">
                <span className={`h-0.5 w-full bg-black transition ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
                <span className={`h-0.5 w-full bg-black transition ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`h-0.5 w-full bg-black transition ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
              </span>
            </button>
            <nav className="hidden items-center gap-5 text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-800 sm:flex">
              <Link href="/shop" className="transition-colors hover:text-black">
                Shop
              </Link>
              <Link href="/custom" className="transition-colors hover:text-black">
                Custom
              </Link>
              <Link href="/drops" className="transition-colors hover:text-black">
                Drops
              </Link>
            </nav>
          </div>

          <Link
            href="/"
            className="justify-self-center rounded-full bg-lime px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-black shadow-sm sm:px-3 sm:text-[11px] sm:tracking-[0.18em]"
          >
            Jersey Store
          </Link>

          <nav className="flex items-center justify-end gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-800 sm:gap-5 sm:tracking-[0.22em]">
            {showAuth && user ? (
              <Link href="/account" className="hidden transition-colors hover:text-black sm:inline">
                Account
              </Link>
            ) : null}
            {showAuth && user && isSuperAdmin(user.role) ? (
              <Link href="/super-admin" className="hidden transition-colors hover:text-black md:inline">
                Super
              </Link>
            ) : showAuth && user && isStaff(user.role) ? (
              <Link href="/admin" className="hidden transition-colors hover:text-black md:inline">
                Admin
              </Link>
            ) : null}
            {showAuth && !user ? (
              <Link href="/login" className="hidden transition-colors hover:text-black sm:inline">
                Login
              </Link>
            ) : null}
            <Link
              href="/cart"
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-black/10 bg-white/80 px-3 backdrop-blur transition-colors hover:text-black sm:h-auto sm:min-w-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0"
            >
              Bag{mounted && cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
            {!isHome ? (
              <Link href="/" className="hidden transition-colors hover:text-black md:inline">
                Enter
              </Link>
            ) : null}
          </nav>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-x-3 top-[calc(env(safe-area-inset-top)+3.5rem)] rounded-2xl border border-black/8 bg-white/95 p-4 shadow-lg backdrop-blur">
            <nav className="flex flex-col gap-1 text-[12px] font-semibold uppercase tracking-[0.18em]">
              {[
                ["/shop", "Shop"],
                ["/custom", "Custom"],
                ["/drops", "Drops"],
                ["/wishlist", "Wishlist"],
                ["/compare", "Compare"],
                ["/track", "Track"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-xl px-3 py-3 hover:bg-lime/50"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="my-2 h-px bg-neutral-200" />
              {showAuth && user ? (
                <>
                  <Link href="/account" className="rounded-xl px-3 py-3 hover:bg-lime/50" onClick={() => setMenuOpen(false)}>
                    Account
                  </Link>
                  {isSuperAdmin(user.role) ? (
                    <Link
                      href="/super-admin"
                      className="rounded-xl px-3 py-3 hover:bg-lime/50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Super Admin
                    </Link>
                  ) : isStaff(user.role) ? (
                    <Link href="/admin" className="rounded-xl px-3 py-3 hover:bg-lime/50" onClick={() => setMenuOpen(false)}>
                      Admin
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-xl px-3 py-3 text-left hover:bg-lime/50"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/login" className="rounded-xl px-3 py-3 hover:bg-lime/50" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function LimeBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-[max(0.5rem,env(safe-area-inset-bottom))] bg-lime sm:h-3" />
  );
}
