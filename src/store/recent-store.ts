"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CompareProduct } from "@/store/compare-store";

type RecentState = {
  items: CompareProduct[];
  add: (product: CompareProduct) => void;
};

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      add: (product) =>
        set((state) => ({
          items: [product, ...state.items.filter((item) => item.id !== product.id)].slice(0, 8),
        })),
    }),
    { name: "jersey-store-recent" }
  )
);
