"use client";

import { useEffect, useState } from "react";
import { useWishlistStore } from "@/store/wishlist-store";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";

type Product = {
  id: string;
  slug: string;
  name: string;
  edition: string;
  sport: string;
  priceInr: number;
  compareAtInr?: number | null;
  imageColors: string;
  team: string;
};

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!ids.length) {
      setProducts([]);
      return;
    }
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]));
  }, [ids]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-8">
      <h1 className="font-display text-4xl tracking-tight">Wishlist</h1>
      {!ids.length ? (
        <p className="mt-6 text-neutral-600">
          Nothing saved.{" "}
          <Link href="/shop" className="underline">
            Browse kits
          </Link>
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
