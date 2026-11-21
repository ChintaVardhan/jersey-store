"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { formatInr } from "@/lib/utils";

const STEPS = [
  { key: "PAID", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

type Tracked = {
  orderNumber: string | null;
  waybill: string | null;
  status: string;
  etaAt: string | null;
  createdAt: string;
  totalInr: number;
  city: string;
  items: { name: string; size: string; quantity: number }[];
};

function stepIndex(status: string) {
  if (status === "PENDING") return -1;
  return STEPS.findIndex((step) => step.key === status);
}

function TrackForm() {
  const params = useSearchParams();
  const initial = params.get("q") || "";
  const [query, setQuery] = useState(initial);
  const [order, setOrder] = useState<Tracked | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initial) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/orders/track?q=${encodeURIComponent(initial)}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setOrder(null);
          setError(data.error || "Order not found");
        } else {
          setOrder(data.order);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Order not found");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  async function lookup(q: string) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/orders/track?q=${encodeURIComponent(q)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setOrder(null);
      setError(data.error || "Order not found");
    } else {
      setOrder(data.order);
    }
    setLoading(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) await lookup(query.trim());
  }

  const index = order ? stepIndex(order.status) : -1;
  const terminal = order && ["CANCELLED", "RETURN_REQUESTED", "RETURNED"].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-3 pb-24 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] sm:px-8 sm:pb-20 sm:pt-24">
      <h1 className="font-display text-[2.35rem] tracking-tight sm:text-4xl">Track order</h1>
      <p className="mt-2 text-sm text-neutral-600">Order number, waybill, or the last 8 characters of the order id.</p>
      <form onSubmit={onSubmit} className="mt-6 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="JS-2026-XXXXX"
          className="min-h-11 w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-11 shrink-0 bg-black px-4 text-[11px] uppercase tracking-[0.16em] text-lime"
        >
          {loading ? "…" : "Track"}
        </button>
      </form>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {order ? (
        <div className="panel mt-8 p-5">
          <p className="font-medium">{order.orderNumber || "Order"}</p>
          <p className="mt-1 text-xs text-neutral-500">
            {order.waybill ? `Waybill ${order.waybill}` : "Waybill pending"}
            {order.city ? ` · ${order.city}` : ""}
            {order.etaAt ? ` · ETA ${new Date(order.etaAt).toLocaleDateString("en-IN")}` : ""}
          </p>
          {terminal ? (
            <p className="mt-4 border border-black bg-lime/40 px-3 py-2 text-sm">{order.status.replaceAll("_", " ")}</p>
          ) : (
            <ol className="mt-6 grid gap-2 sm:grid-cols-5">
              {STEPS.map((step, i) => {
                const done = index >= i;
                return (
                  <li
                    key={step.key}
                    className={`border px-2 py-3 text-center text-[10px] uppercase tracking-[0.12em] ${
                      done ? "border-black bg-lime" : "border-neutral-200 text-neutral-400"
                    }`}
                  >
                    {step.label}
                  </li>
                );
              })}
            </ol>
          )}
          <ul className="mt-4 space-y-1 text-sm text-neutral-700">
            {order.items.map((item, i) => (
              <li key={`${item.name}-${i}`}>
                {item.name} · {item.size} × {item.quantity}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">{formatInr(order.totalInr)}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="px-4 pt-28 text-sm text-neutral-500">Loading tracker…</div>}>
      <TrackForm />
    </Suspense>
  );
}
