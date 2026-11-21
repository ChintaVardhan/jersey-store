"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CompareProduct = {
  id: string;
  slug: string;
  name: string;
  edition: string;
  sport: string;
  team: string;
  priceInr: number;
  compareAtInr?: number | null;
  image?: string | null;
  imageColors: string;
  rating?: number;
};

type CompareState = {
  items: CompareProduct[];
  has: (id: string) => boolean;
  toggle: (product: CompareProduct) => void;
  remove: (id: string) => void;
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      has: (id) => get().items.some((item) => item.id === id),
      toggle: (product) =>
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) {
            return { items: state.items.filter((item) => item.id !== product.id) };
          }
          if (state.items.length >= 4) return state;
          return { items: [...state.items, product] };
        }),
      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
    }),
    { name: "jersey-store-compare" }
  )
);
