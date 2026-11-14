"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GuestCartItem = {
  productId: string;
  slug: string;
  name: string;
  size: string;
  quantity: number;
  priceInr: number;
  primary: string;
  secondary: string;
  image?: string;
  customName?: string;
  customNumber?: string;
  patches?: string;
};

type CartState = {
  items: GuestCartItem[];
  addItem: (item: GuestCartItem) => void;
  removeItem: (productId: string, size: string, customName?: string, customNumber?: string) => void;
  updateQty: (
    productId: string,
    size: string,
    quantity: number,
    customName?: string,
    customNumber?: string
  ) => void;
  clear: () => void;
  totalInr: () => number;
  count: () => number;
};

function matchKey(
  a: GuestCartItem,
  productId: string,
  size: string,
  customName?: string,
  customNumber?: string
) {
  return (
    a.productId === productId &&
    a.size === size &&
    (a.customName || "") === (customName || "") &&
    (a.customNumber || "") === (customNumber || "")
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) =>
            matchKey(i, item.productId, item.size, item.customName, item.customNumber)
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                matchKey(i, item.productId, item.size, item.customName, item.customNumber)
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId, size, customName, customNumber) =>
        set((state) => ({
          items: state.items.filter((i) => !matchKey(i, productId, size, customName, customNumber)),
        })),
      updateQty: (productId, size, quantity, customName, customNumber) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              matchKey(i, productId, size, customName, customNumber) ? { ...i, quantity } : i
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalInr: () => get().items.reduce((sum, i) => sum + i.priceInr * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "jersey-store-cart" }
  )
);
