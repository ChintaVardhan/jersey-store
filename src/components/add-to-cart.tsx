"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { parseJsonArray } from "@/lib/utils";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    priceInr: number;
    sizes: string;
    primary: string;
    secondary: string;
    image?: string;
  };
  customName?: string;
  customNumber?: string;
  patches?: string;
};

export function AddToCart({ product, customName, customNumber, patches }: Props) {
  const sizes = parseJsonArray(product.sizes);
  const [size, setSize] = useState(sizes[2] || sizes[0] || "M");
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  function buildItem() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size,
      quantity: 1,
      priceInr: product.priceInr,
      primary: product.primary,
      secondary: product.secondary,
      image: product.image,
      customName,
      customNumber,
      patches,
    };
  }

  function add() {
    addItem(buildItem());
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  function buyNow() {
    addItem(buildItem());
    router.push("/checkout");
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">Size</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`min-w-10 border px-3 py-2 text-sm ${
                size === s ? "border-black bg-black text-lime" : "border-neutral-300 hover:border-black"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={add}
          className="w-full border border-black py-3 text-[11px] font-semibold uppercase tracking-[0.22em] transition hover:bg-neutral-50"
        >
          {added ? "Added ✓" : "Add to bag"}
        </button>
        <button
          type="button"
          onClick={buyNow}
          className="w-full bg-black py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-lime transition hover:bg-neutral-900"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
