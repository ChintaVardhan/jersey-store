"use client";

import { usePathname } from "next/navigation";
import { ImmersiveNav, LimeBar } from "@/components/site-chrome";
import { SiteFooter } from "@/components/site-footer";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaff =
    pathname.startsWith("/staff") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/super-admin");

  if (isStaff) {
    return <main className="min-h-[100dvh]">{children}</main>;
  }

  return (
    <>
      <ImmersiveNav />
      <main className="min-h-[100dvh] pb-8">{children}</main>
      <SiteFooter />
      <LimeBar />
    </>
  );
}
