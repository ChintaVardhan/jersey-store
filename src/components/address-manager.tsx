"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type AddressRow = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const empty = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
  isDefault: false,
};

export function AddressManager({ initial }: { initial: AddressRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function save(e: FormEvent<HTMLFormElement>, id?: string) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      id,
      label: fd.get("label"),
      fullName: fd.get("fullName"),
      phone: fd.get("phone"),
      line1: fd.get("line1"),
      line2: fd.get("line2"),
      city: fd.get("city"),
      state: fd.get("state"),
      postalCode: fd.get("postalCode"),
      country: fd.get("country") || "IN",
      isDefault: fd.get("isDefault") === "on",
    };
    const res = await fetch("/api/addresses", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not save address");
      return;
    }
    setOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not delete");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-3">
      {initial.map((address) => (
        <div key={address.id} className="panel p-4 text-sm">
          <p className="font-medium">
            {address.label}
            {address.isDefault ? " · Default" : ""}
          </p>
          <p className="mt-1 text-neutral-600">
            {address.fullName} · {address.phone}
            <br />
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.postalCode}
          </p>
          <div className="mt-2 flex gap-3 text-[10px] uppercase tracking-[0.14em]">
            <button type="button" className="underline" onClick={() => setEditing(editing === address.id ? null : address.id)}>
              Edit
            </button>
            <button type="button" className="underline" onClick={() => remove(address.id)}>
              Delete
            </button>
          </div>
          {editing === address.id ? (
            <AddressForm address={address} onSubmit={(e) => save(e, address.id)} />
          ) : null}
        </div>
      ))}
      {!initial.length ? <p className="text-sm text-neutral-500">No saved addresses yet.</p> : null}
      {open ? <AddressForm address={empty} onSubmit={(e) => save(e)} /> : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="border border-black px-3 py-2 text-[10px] uppercase tracking-[0.16em]"
      >
        {open ? "Close" : "Add address"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function AddressForm({
  address,
  onSubmit,
}: {
  address: Omit<AddressRow, "id"> & { id?: string };
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-3 grid gap-2 sm:grid-cols-2">
      {(
        [
          ["label", "Label", address.label],
          ["fullName", "Full name", address.fullName],
          ["phone", "Phone", address.phone],
          ["line1", "Address", address.line1],
          ["line2", "Line 2", address.line2 || ""],
          ["city", "City", address.city],
          ["state", "State", address.state],
          ["postalCode", "PIN", address.postalCode],
          ["country", "Country", address.country],
        ] as const
      ).map(([name, label, value]) => (
        <input
          key={name}
          name={name}
          required={name !== "line2"}
          defaultValue={value}
          placeholder={label}
          className="border border-neutral-300 px-3 py-2 text-sm"
        />
      ))}
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="isDefault" defaultChecked={address.isDefault} />
        Default address
      </label>
      <button type="submit" className="bg-black py-2 text-[10px] uppercase tracking-[0.16em] text-lime sm:col-span-2">
        Save address
      </button>
    </form>
  );
}
