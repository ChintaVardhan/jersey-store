"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { WishlistSync } from "@/components/wishlist-sync";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <WishlistSync />
      {children}
    </SessionProvider>
  );
}
