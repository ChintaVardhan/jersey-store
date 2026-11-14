"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { formatInr } from "@/lib/utils";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const total = items.reduce((sum, i) => sum + i.priceInr * i.quantity, 0);
  const shipping = total >= 2499 || total === 0 ? 0 : 99;
  const router = useRouter();
  const [provider, setProvider] = useState<"DEMO" | "RAZORPAY" | "STRIPE">("DEMO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
            customName: i.customName,
            customNumber: i.customNumber,
            patches: i.patches,
          })),
          fullName: fd.get("fullName"),
          phone: fd.get("phone"),
          line1: fd.get("line1"),
          line2: fd.get("line2"),
          city: fd.get("city"),
          state: fd.get("state"),
          postalCode: fd.get("postalCode"),
          country: fd.get("country") || "IN",
          provider,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.mode === "STRIPE" && data.clientSecret) {
        setError("Stripe PaymentIntent created. Add Stripe Elements UI with your publishable key to complete.");
        setLoading(false);
        return;
      }

      if (data.mode === "RAZORPAY" && data.paymentId && data.razorpayKey) {
        // Client Razorpay checkout requires script; demo confirms order id
        clear();
        router.push(`/account/orders?success=${data.orderId}`);
        return;
      }

      clear();
      router.push(`/account/orders?success=${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (status === "loading") {
    return <div className="px-4 pt-28 text-center text-neutral-500">Loading…</div>;
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-20 pt-28 text-center">
        <h1 className="font-display text-3xl">Login to checkout</h1>
        <p className="mt-2 text-neutral-600">
          Create a free account or login — your bag stays ready. Demo: fan@jerseystore.com / jersey123
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login?callbackUrl=/checkout" className="bg-black px-5 py-3 text-[11px] uppercase tracking-widest text-lime">
            Login
          </Link>
          <Link href="/signup" className="border border-black px-5 py-3 text-[11px] uppercase tracking-widest">
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-20 pt-28 text-center">
        <h1 className="font-display text-3xl">Nothing to checkout</h1>
        <Link href="/shop" className="mt-6 inline-block underline">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 pb-20 pt-24 lg:grid-cols-2 sm:px-8">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Checkout</h1>
        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          {[
            ["fullName", "Full name"],
            ["phone", "Phone"],
            ["line1", "Address line 1"],
            ["line2", "Address line 2 (optional)"],
            ["city", "City"],
            ["state", "State"],
            ["postalCode", "PIN / ZIP"],
          ].map(([name, label]) => (
            <input
              key={name}
              name={name}
              required={name !== "line2"}
              placeholder={label}
              className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
            />
          ))}
          <input name="country" defaultValue="IN" className="w-full border border-neutral-300 px-3 py-2" />

          <div className="pt-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Payment</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["DEMO", "RAZORPAY", "STRIPE"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProvider(p)}
                  className={`border px-3 py-2 text-xs ${provider === p ? "border-black bg-lime" : "border-neutral-300"}`}
                >
                  {p === "DEMO" ? "Demo pay" : p}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Demo pay works without keys. Razorpay/Stripe activate when env keys are set.
            </p>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-black py-3 text-[11px] uppercase tracking-[0.22em] text-lime disabled:opacity-60"
          >
            {loading ? "Processing…" : `Pay ${formatInr(total + shipping)}`}
          </button>
        </form>
      </div>

      <aside className="panel h-fit p-6">
        <h2 className="font-display text-xl">Order</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((i) => (
            <li key={`${i.productId}-${i.size}-${i.customName}`} className="flex justify-between gap-4">
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>{formatInr(i.priceInr * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatInr(shipping)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatInr(total + shipping)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
