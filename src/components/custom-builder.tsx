"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { JerseySilhouette } from "@/components/jersey-silhouette";
import { AddToCart } from "@/components/add-to-cart";
import { formatInr, parseImageColors, parseJsonArray } from "@/lib/utils";

type Base = {
  id: string;
  slug: string;
  name: string;
  priceInr: number;
  sizes: string;
  imageColors: string;
  image?: string | null;
  team: string;
};

const PATCH_OPTIONS = ["None", "Champions League", "World Cup", "IPL Star", "Captain Armband"];

export function CustomBuilder({ bases, initialId }: { bases: Base[]; initialId: string }) {
  const [baseId, setBaseId] = useState(initialId);
  const [name, setName] = useState("YOUR NAME");
  const [number, setNumber] = useState("10");
  const [patch, setPatch] = useState("None");

  const base = bases.find((b) => b.id === baseId) || bases[0];
  const colors = useMemo(() => parseImageColors(base.imageColors), [base]);

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-2">
      <div className="panel relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-mint/50">
        {base.image ? (
          <>
            <Image src={base.image} alt={base.name} fill className="object-contain p-4" sizes="50vw" />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-5xl">
                {number.slice(0, 2)}
              </span>
              <span className="mt-1 text-xs font-bold tracking-[0.25em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] sm:text-sm">
                {name.slice(0, 12)}
              </span>
            </div>
          </>
        ) : (
          <JerseySilhouette
            primary={colors.primary}
            secondary={colors.secondary}
            accent={colors.accent}
            name={name}
            number={number}
            tilt={-8}
            className="h-[82%] w-[72%]"
          />
        )}
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Base kit</label>
          <select
            value={baseId}
            onChange={(e) => setBaseId(e.target.value)}
            className="mt-2 w-full border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-black"
          >
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} — {formatInr(b.priceInr)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Name</label>
          <input
            value={name}
            maxLength={12}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            className="mt-2 w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Number</label>
          <input
            value={number}
            maxLength={2}
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 2))}
            className="mt-2 w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Patches</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PATCH_OPTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPatch(p)}
                className={`border px-3 py-1.5 text-xs ${
                  patch === p ? "border-black bg-lime" : "border-neutral-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-neutral-600">
          Sizes: {parseJsonArray(base.sizes).join(" · ")} · Team: {base.team}
        </p>

        <AddToCart
          product={{
            id: base.id,
            slug: base.slug,
            name: `${base.name} — ${name} #${number}`,
            priceInr: base.priceInr + (patch !== "None" ? 199 : 0),
            sizes: base.sizes,
            primary: colors.primary,
            secondary: colors.secondary,
            image: base.image || undefined,
          }}
          customName={name}
          customNumber={number}
          patches={patch === "None" ? "" : patch}
        />
      </div>
    </div>
  );
}
