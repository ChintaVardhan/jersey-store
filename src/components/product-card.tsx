"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { editionLabel, formatInr } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCompareStore, type CompareProduct } from "@/store/compare-store";

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
    rating?: number;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession();
  const toggle = useWishlistStore((s) => s.toggle);
  const wishedLive = useWishlistStore((s) => s.has(product.id));
  const comparedLive = useCompareStore((s) => s.has(product.id));
  const toggleCompare = useCompareStore((s) => s.toggle);
  const compareCount = useCompareStore((s) => s.items.length);
  const [ready, setReady] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => setReady(true), []);
  const wished = ready && wishedLive;
  const compared = ready && comparedLive;

  async function onWish() {
    const adding = !wished;
    toggle(product.id);
    if (!session?.user) return;
    await fetch("/api/wishlist", {
      method: adding ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    }).catch(() => undefined);
  }

  function onCompare() {
    if (!compared && compareCount >= 4) {
      setNote("Compare up to 4 kits.");
      return;
    }
    setNote("");
    const snapshot: CompareProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      edition: product.edition,
      sport: product.sport,
      team: product.team,
      priceInr: product.priceInr,
      compareAtInr: product.compareAtInr,
      image: product.image,
      imageColors: product.imageColors,
      rating: product.rating,
    };
    toggleCompare(snapshot);
  }

  return (
    <article className="group relative panel p-1.5 sm:p-2">
      <button
        type="button"
        aria-label="Wishlist"
        onClick={onWish}
        className="absolute right-1.5 top-1.5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur sm:right-2 sm:top-2 sm:h-auto sm:w-auto sm:p-2"
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
        <div className="mt-2 space-y-1 px-0.5 sm:mt-3">
          <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-500 sm:text-[10px] sm:tracking-[0.2em]">
            {product.sport.toLowerCase()} · {editionLabel(product.edition)}
          </p>
          <h3 className="font-display text-[15px] leading-tight tracking-tight sm:text-lg">{product.name}</h3>
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
      <button
        type="button"
        onClick={onCompare}
        className={`mt-2 min-h-9 w-full border px-2 py-2 text-[10px] uppercase tracking-[0.14em] sm:min-h-0 sm:py-1 ${
          compared ? "border-black bg-lime" : "border-neutral-300"
        }`}
      >
        {compared ? "Compared" : "Compare"}
      </button>
      {note ? <p className="mt-1 text-[10px] text-neutral-500">{note}</p> : null}
    </article>
  );
}
