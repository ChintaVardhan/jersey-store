"use client";

import { useEffect, useState } from "react";

export function DropCountdown({ endsAt }: { endsAt: string | Date }) {
  const end = new Date(endsAt).getTime();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, end - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex gap-3 font-display text-2xl tracking-tight sm:text-3xl">
      {[
        ["D", d],
        ["H", h],
        ["M", m],
        ["S", s],
      ].map(([label, val]) => (
        <div key={label as string} className="min-w-[3.2rem] text-center">
          <div className="rounded-md bg-black px-2 py-1 text-lime tabular-nums">
            {String(val).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">{label}</div>
        </div>
      ))}
    </div>
  );
}
