"use client";

import { useEffect } from "react";
import { useRecentStore } from "@/store/recent-store";
import type { CompareProduct } from "@/store/compare-store";

export function RecordRecent({ product }: { product: CompareProduct }) {
  const add = useRecentStore((s) => s.add);
  const id = product.id;
  useEffect(() => {
    add(product);
  }, [add, id, product]);
  return null;
}
