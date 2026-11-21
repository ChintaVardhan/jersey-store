"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const email = String(new FormData(e.currentTarget).get("email") || "");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(data.message || data.error || (res.ok ? "Saved." : "Could not subscribe"));
    if (res.ok) e.currentTarget.reset();
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex max-w-sm flex-col gap-2 sm:flex-row">
      <input
        name="email"
        type="email"
        required
        placeholder="Email for drops"
        className="min-h-11 w-full border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
      />
      <button
        type="submit"
        disabled={loading}
        className="min-h-11 bg-black px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-lime disabled:opacity-60 sm:shrink-0"
      >
        {loading ? "…" : "Join"}
      </button>
      {message ? <p className="text-xs text-neutral-600 sm:basis-full">{message}</p> : null}
    </form>
  );
}
