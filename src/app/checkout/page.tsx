"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { formatInr, FREE_SHIPPING_INR, SHIPPING_FEE_INR } from "@/lib/utils";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const total = items.reduce((sum, i) => sum + i.priceInr * i.quantity, 0);
  const shipping = total === 0 || total >= FREE_SHIPPING_INR ? 0 : SHIPPING_FEE_INR;
  const shippingGap = Math.max(0, FREE_SHIPPING_INR - total);
  const [provider, setProvider] = useState<"DEMO" | "RAZORPAY" | "STRIPE">("DEMO");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponNote, setCouponNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const payable = Math.max(0, total - discount) + shipping;

  async function applyCoupon() {
    setCouponNote("");
    const code = couponCode.trim();
    if (!code) {
      setDiscount(0);
      return;
    }
    const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${total}`);
    const data = await res.json().catch(() => ({}));
    if (!data.valid) {
      setDiscount(0);
      setCouponNote(data.message || "Invalid code");
      return;
    }
    setCouponCode(data.code || code.toUpperCase());
    setDiscount(data.discountInr || 0);
    setCouponNote(data.message || "Applied");
  }

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
          couponCode: discount > 0 ? couponCode : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.mode === "STRIPE" && data.clientSecret) {
        setError("Stripe PaymentIntent created. Add Stripe Elements UI with your publishable key to complete.");
        setLoading(false);
        return;
      }

      clear();
      const ref = data.orderNumber || data.orderId;
      window.location.assign(`/account/orders?success=${encodeURIComponent(ref)}`);
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
          <Link
            href="/signup?callbackUrl=/checkout"
            className="border border-black px-5 py-3 text-[11px] uppercase tracking-widest"
          >
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
    <div className="mx-auto grid max-w-5xl gap-8 px-3 pb-24 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] lg:grid-cols-2 sm:gap-10 sm:px-8 sm:pb-20 sm:pt-24">
      <div>
        <h1 className="font-display text-[2.35rem] tracking-tight sm:text-4xl">Checkout</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-3 sm:mt-8">
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
              className="min-h-11 w-full border border-neutral-300 px-3 py-2.5 outline-none focus:border-black"
            />
          ))}
          <input
            name="country"
            defaultValue="IN"
            className="min-h-11 w-full border border-neutral-300 px-3 py-2.5"
          />

          <div className="flex gap-2 pt-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Coupon code"
              className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
            />
            <button type="button" onClick={applyCoupon} className="border border-black px-3 text-[10px] uppercase tracking-[0.14em]">
              Apply
            </button>
          </div>
          {couponNote ? <p className="text-xs text-neutral-600">{couponNote}</p> : null}

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
            {loading ? "Processing…" : `Pay ${formatInr(payable)}`}
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
          <p className="pb-2 text-neutral-600">
            {shippingGap === 0 ? "Free shipping on this bag." : `Add ${formatInr(shippingGap)} more for free shipping`}
          </p>
          {discount > 0 ? (
            <div className="flex justify-between">
              <span>Discount {couponCode}</span>
              <span>−{formatInr(discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatInr(shipping)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatInr(payable)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
