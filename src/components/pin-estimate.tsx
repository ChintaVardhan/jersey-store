"use client";

import { FormEvent, useState } from "react";

export function PinEstimate() {
  const [note, setNote] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pin = String(new FormData(e.currentTarget).get("pin") || "").trim();
    if (!/^\d{6}$/.test(pin)) {
      setNote("Enter a 6-digit PIN.");
      return;
    }
    const eta = new Date();
    eta.setDate(eta.getDate() + 2);
    const when = eta.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
    setNote(`Delivery by ${when} to ${pin}. Cash on delivery available. 30-day returns.`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 border-t border-neutral-200 pt-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Delivery estimate</p>
      <div className="mt-2 flex gap-2">
        <input
          name="pin"
          inputMode="numeric"
          maxLength={6}
          placeholder="6-digit PIN"
          className="w-36 border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
        />
        <button type="submit" className="border border-black px-3 py-2 text-[10px] uppercase tracking-[0.16em]">
          Check
        </button>
      </div>
      {note ? <p className="mt-2 text-sm text-neutral-600">{note}</p> : null}
    </form>
  );
}
