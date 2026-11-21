"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/store/wishlist-store";

export function WishlistSync() {
  const { status } = useSession();
  const synced = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || synced.current) return;
    synced.current = true;
    const localIds = useWishlistStore.getState().ids;

    (async () => {
      try {
        await Promise.all(
          localIds.map((productId) =>
            fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            })
          )
        );
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;
        const data = await res.json();
        const serverIds: string[] = (data.items || []).map((item: { productId: string }) => item.productId);
        const merged = [...new Set([...localIds, ...serverIds])];
        useWishlistStore.setState({ ids: merged });
      } catch {
        synced.current = false;
      }
    })();
  }, [status]);

  return null;
}
