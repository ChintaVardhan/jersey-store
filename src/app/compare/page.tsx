"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { editionLabel, formatInr } from "@/lib/utils";
import { useCompareStore } from "@/store/compare-store";

export default function ComparePage() {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] sm:px-8 sm:pb-20 sm:pt-24">
      <h1 className="font-display text-4xl tracking-tight">Compare</h1>
      <p className="mt-2 text-sm text-neutral-600">Up to 4 kits, saved in this browser.</p>
      {!ready ? <p className="mt-8 text-sm text-neutral-500">Loading…</p> : null}
      {ready && items.length === 0 ? (
        <p className="mt-8 text-neutral-600">
          Nothing selected.{" "}
          <Link href="/shop" className="underline">
            Browse the shop
          </Link>
        </p>
      ) : null}
      {ready && items.length > 0 ? (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-[10px] uppercase tracking-wider text-neutral-500">
                <th className="py-2 pr-4">Kit</th>
                {items.map((item) => (
                  <th key={item.id} className="px-3 py-2 font-medium text-black">
                    {item.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-100">
                <td className="py-3 pr-4 text-neutral-500">Look</td>
                {items.map((item) => (
                  <td key={item.id} className="px-3 py-3">
                    <ProductImage image={item.image} imageColors={item.imageColors} alt={item.name} className="h-28 w-24" />
                  </td>
                ))}
              </tr>
              {(
                [
                  ["Team", (item: (typeof items)[number]) => item.team],
                  ["Sport", (item: (typeof items)[number]) => item.sport.toLowerCase()],
                  ["Edition", (item: (typeof items)[number]) => editionLabel(item.edition)],
                  ["Price", (item: (typeof items)[number]) => formatInr(item.priceInr)],
                  ["Rating", (item: (typeof items)[number]) => (item.rating ? item.rating.toFixed(1) : "—")],
                ] as const
              ).map(([label, read]) => (
                <tr key={label} className="border-b border-neutral-100">
                  <td className="py-3 pr-4 text-neutral-500">{label}</td>
                  {items.map((item) => (
                    <td key={item.id} className="px-3 py-3">
                      {read(item)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="py-3" />
                {items.map((item) => (
                  <td key={item.id} className="px-3 py-3">
                    <Link href={`/product/${item.slug}`} className="mr-3 text-xs uppercase tracking-wider underline">
                      View
                    </Link>
                    <button type="button" className="text-xs uppercase tracking-wider underline" onClick={() => remove(item.id)}>
                      Remove
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
