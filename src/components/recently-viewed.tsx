"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useRecentStore } from "@/store/recent-store";

export function RecentlyViewed() {
  const items = useRecentStore((s) => s.items);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready || items.length === 0) return null;

  return (
    <section className="px-3 pb-12 sm:px-8 sm:pb-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Recently viewed</h2>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-4 md:grid-cols-4 md:gap-6">
          {items.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
