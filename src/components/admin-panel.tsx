"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ProductRow = {
  id: string;
  name: string;
  stock: number;
  priceInr: number;
  featured: boolean;
};

type OrderRow = {
  id: string;
  status: string;
  totalLabel: string;
  email: string;
  trackingNumber: string | null;
  city?: string;
  items?: { name: string; size: string; quantity: number; customName?: string | null; customNumber?: string | null }[];
};

export function AdminPanel({
  products,
  orders,
}: {
  products: ProductRow[];
  orders: OrderRow[];
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<"orders" | "products" | "add">("orders");

  async function updateProduct(id: string, stock: number, priceInr: number) {
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stock, priceInr }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || "Could not save product");
      return;
    }
    setMsg("Product saved");
    router.refresh();
  }

  async function updateOrder(id: string, status: string, trackingNumber?: string) {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, trackingNumber }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || "Could not update order");
      return;
    }
    setMsg("Order updated");
    router.refresh();
  }

  async function createProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        team: fd.get("team"),
        sport: fd.get("sport"),
        edition: fd.get("edition"),
        priceInr: Number(fd.get("priceInr")),
        stock: Number(fd.get("stock")),
        description: fd.get("description"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Create failed");
      return;
    }
    setMsg(`Created ${data.product.name}`);
    e.currentTarget.reset();
    setTab("products");
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["orders", "Orders"],
            ["products", "Products"],
            ["add", "Add product"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.16em] ${
              tab === k ? "bg-black text-lime" : "border border-neutral-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {msg ? <p className="border border-lime bg-lime/20 px-3 py-2 text-sm">{msg}</p> : null}

      {tab === "products" ? (
        <section>
          <h2 className="font-display text-2xl">Products / stock</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                  <tr className="border-b text-[10px] uppercase tracking-wider text-neutral-500">
                  <th className="py-2">Name</th>
                  <th>Price (₹)</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-100">
                    <td className="py-3 pr-4">{p.name}</td>
                    <td>
                      <input
                        type="number"
                        defaultValue={p.priceInr}
                        id={`price-${p.id}`}
                        className="w-24 border px-2 py-1"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        defaultValue={p.stock}
                        id={`stock-${p.id}`}
                        className="w-20 border px-2 py-1"
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-xs uppercase tracking-wider underline"
                        onClick={() => {
                          const stock = Number(
                            (document.getElementById(`stock-${p.id}`) as HTMLInputElement).value
                          );
                          const priceInr = Number(
                            (document.getElementById(`price-${p.id}`) as HTMLInputElement).value
                          );
                          updateProduct(p.id, stock, priceInr);
                        }}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "orders" ? (
        <section>
          <h2 className="font-display text-2xl">Orders</h2>
          <ul className="mt-4 space-y-4">
            {orders.length === 0 ? (
              <li className="text-sm text-neutral-500">No orders yet — place a demo buy as a customer.</li>
            ) : null}
            {orders.map((o) => (
              <li key={o.id} className="panel p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span>
                    #{o.id.slice(-8)} · {o.email}
                    {o.city ? ` · ${o.city}` : ""}
                  </span>
                  <span>{o.totalLabel}</span>
                </div>
                {o.items?.length ? (
                  <ul className="mt-2 space-y-1 text-neutral-600">
                    {o.items.map((item, idx) => (
                      <li key={`${o.id}-${idx}`}>
                        {item.name} · {item.size} × {item.quantity}
                        {item.customName ? ` · ${item.customName} #${item.customNumber}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <select defaultValue={o.status} id={`status-${o.id}`} className="border px-2 py-1">
                    {["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Tracking #"
                    defaultValue={o.trackingNumber || ""}
                    id={`track-${o.id}`}
                    className="border px-2 py-1"
                  />
                  <button
                    type="button"
                    className="bg-black px-3 py-1 text-lime"
                    onClick={() => {
                      const status = (document.getElementById(`status-${o.id}`) as HTMLSelectElement).value;
                      const trackingNumber = (document.getElementById(`track-${o.id}`) as HTMLInputElement)
                        .value;
                      updateOrder(o.id, status, trackingNumber);
                    }}
                  >
                    Update
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "add" ? (
        <section>
          <h2 className="font-display text-2xl">Add product</h2>
          <form onSubmit={createProduct} className="mt-4 grid max-w-xl gap-3">
            <input name="name" required placeholder="Product name" className="border px-3 py-2" />
            <input name="team" required placeholder="Team" className="border px-3 py-2" />
            <select name="sport" className="border px-3 py-2">
              <option value="FOOTBALL">Football</option>
              <option value="CRICKET">Cricket</option>
            </select>
            <select name="edition" className="border px-3 py-2">
              <option value="FAN_EDITION">Fan Edition</option>
              <option value="MASTER_COPY">Master Copy</option>
              <option value="CUSTOM_BUILD">Custom Build</option>
            </select>
            <input name="priceInr" type="number" required defaultValue={1499} className="border px-3 py-2" />
            <input name="stock" type="number" required defaultValue={50} className="border px-3 py-2" />
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Description"
              className="border px-3 py-2"
            />
            <button type="submit" className="bg-black py-3 text-[11px] uppercase tracking-widest text-lime">
              Create
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
