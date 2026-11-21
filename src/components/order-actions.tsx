"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OrderActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const canCancel = status === "PAID" || status === "PROCESSING";
  const canReturn = status === "SHIPPED" || status === "OUT_FOR_DELIVERY" || status === "DELIVERED";

  async function run(path: "cancel" | "return") {
    setLoading(true);
    setMessage("");
    const res = await fetch(`/api/orders/${id}/${path}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setMessage(res.ok ? (path === "cancel" ? "Order cancelled" : "Return requested") : data.error || "Could not update");
    setLoading(false);
    if (res.ok) router.refresh();
  }

  if (!canCancel && !canReturn) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      {canCancel ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => run("cancel")}
          className="border border-black px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] disabled:opacity-60"
        >
          Cancel order
        </button>
      ) : null}
      {canReturn ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => run("return")}
          className="border border-black px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] disabled:opacity-60"
        >
          Request return
        </button>
      ) : null}
      {message ? <span className="text-xs text-neutral-600">{message}</span> : null}
    </div>
  );
}
