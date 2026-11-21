"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart-store";
import { JerseySilhouette } from "@/components/jersey-silhouette";
import { formatInr, FREE_SHIPPING_INR, hasProductImage } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = items.reduce((sum, i) => sum + i.priceInr * i.quantity, 0);
  const shippingGap = Math.max(0, FREE_SHIPPING_INR - total);

  return (
    <div className="mx-auto max-w-4xl px-3 pb-24 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] sm:px-8 sm:pb-20 sm:pt-24">
      <h1 className="font-display text-[2.35rem] tracking-tight sm:text-4xl">Bag</h1>
      {items.length === 0 ? (
        <div className="mt-10 space-y-4">
          <p className="text-neutral-600">Empty bag. The rack is waiting.</p>
          <Link href="/shop" className="inline-block bg-black px-5 py-3 text-[11px] uppercase tracking-widest text-lime">
            Shop kits
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.customName}-${item.customNumber}`}
              className="flex gap-4 border-b border-neutral-200 pb-6"
            >
              <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-mint/70 p-1">
                {hasProductImage(item.image) ? (
                  <Image src={item.image} alt={item.name} fill className="object-contain" sizes="80px" />
                ) : (
                  <JerseySilhouette
                    primary={item.primary}
                    secondary={item.secondary}
                    name={item.customName}
                    number={item.customNumber}
                    className="h-full w-full"
                    tilt={-6}
                  />
                )}
              </div>
              <div className="flex-1">
                <Link href={`/product/${item.slug}`} className="font-medium hover:underline">
                  {item.name}
                </Link>
                <p className="text-sm text-neutral-500">
                  Size {item.size}
                  {item.customName ? ` · ${item.customName} #${item.customNumber}` : ""}
                  {item.patches ? ` · ${item.patches}` : ""}
                </p>
                <p className="mt-1 text-sm">{formatInr(item.priceInr)}</p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    className="border px-2"
                    onClick={() =>
                      updateQty(item.productId, item.size, item.quantity - 1, item.customName, item.customNumber)
                    }
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    className="border px-2"
                    onClick={() =>
                      updateQty(item.productId, item.size, item.quantity + 1, item.customName, item.customNumber)
                    }
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="ml-4 text-xs uppercase tracking-wider text-neutral-500 underline"
                    onClick={() =>
                      removeItem(item.productId, item.size, item.customName, item.customNumber)
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <p className="border border-lime bg-lime/30 px-3 py-2 text-sm">
            {shippingGap === 0
              ? "Free shipping on this bag."
              : `Add ${formatInr(shippingGap)} more for free shipping`}
          </p>

          <div className="flex items-center justify-between pt-4">
            <p className="text-lg">
              Subtotal <span className="font-semibold">{formatInr(total)}</span>
            </p>
            <Link
              href="/checkout"
              className="bg-black px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-lime"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
