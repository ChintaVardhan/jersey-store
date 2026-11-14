"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { editionLabel, formatInr } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist-store";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    edition: string;
    sport: string;
    priceInr: number;
    compareAtInr?: number | null;
    imageColors: string;
    image?: string | null;
    team: string;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const toggle = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.has(product.id));

  return (
    <article className="group relative panel p-2">
      <button
        type="button"
        aria-label="Wishlist"
        onClick={() => toggle(product.id)}
        className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur"
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-black text-black" : "text-neutral-500"}`} />
      </button>
      <Link href={`/product/${product.slug}`} className="block">
        <ProductImage
          image={product.image}
          imageColors={product.imageColors}
          alt={product.name}
          className="aspect-[4/5] w-full"
        />
        <div className="mt-3 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            {product.sport.toLowerCase()} · {editionLabel(product.edition)}
          </p>
          <h3 className="font-display text-lg leading-tight tracking-tight">{product.name}</h3>
          <p className="text-sm text-neutral-700">
            {formatInr(product.priceInr)}
            {product.compareAtInr ? (
              <span className="ml-2 text-neutral-400 line-through">
                {formatInr(product.compareAtInr)}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
    </article>
  );
}
