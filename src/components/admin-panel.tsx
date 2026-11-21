"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { formatInr } from "@/lib/utils";

const STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURN_REQUESTED",
  "RETURNED",
  "CANCELLED",
] as const;

type ProductRow = {
  id: string;
  name: string;
  stock: number;
  priceInr: number;
  featured: boolean;
};

type OrderItem = {
  name: string;
  size: string;
  quantity: number;
  unitPriceInr: number;
  customName?: string | null;
  customNumber?: string | null;
};

type OrderRow = {
  id: string;
  orderNumber: string | null;
  waybill: string | null;
  status: string;
  totalInr: number;
  subtotalInr: number;
  discountInr: number;
  shippingInr: number;
  couponCode: string | null;
  email: string;
  trackingNumber: string | null;
  city?: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
};

type CouponRow = {
  id: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrderInr: number;
  maxDiscountInr: number | null;
  usageLimit: number;
  timesUsed: number;
  active: boolean;
};

type ReviewRow = {
  id: string;
  productName: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type Metrics = {
  revenueInr: number;
  todayRevenueInr: number;
  pendingCount: number;
  lowStockCount: number;
  customerCount: number;
  statusCounts: Record<string, number>;
  topProducts: { name: string; quantity: number }[];
};

function inr2(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function AdminPanel({
  products,
  orders,
  coupons,
  reviews,
  metrics,
}: {
  products: ProductRow[];
  orders: OrderRow[];
  coupons: CouponRow[];
  reviews: ReviewRow[];
  metrics: Metrics;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<"overview" | "orders" | "returns" | "products" | "add" | "coupons" | "reviews">(
    "overview"
  );
  const [invoice, setInvoice] = useState<OrderRow | null>(null);

  const returns = orders.filter((order) =>
    ["RETURN_REQUESTED", "RETURNED", "CANCELLED"].includes(order.status)
  );

  async function updateProduct(id: string, stock: number, priceInr: number) {
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stock, priceInr }),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? "Product saved" : data.error || "Could not save product");
    if (res.ok) router.refresh();
  }

  async function updateOrder(id: string, status: string, trackingNumber?: string) {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, trackingNumber }),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? "Order updated" : data.error || "Could not update order");
    if (res.ok) router.refresh();
  }

  async function returnAction(id: string, action: "REFUND" | "REPLACEMENT") {
    const res = await fetch("/api/admin/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? (action === "REFUND" ? "Refund approved" : "Replacement approved") : data.error || "Failed");
    if (res.ok) router.refresh();
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

  async function createCoupon(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: fd.get("code"),
        type: fd.get("type"),
        value: Number(fd.get("value")),
        minOrderInr: Number(fd.get("minOrderInr")),
        maxDiscountInr: fd.get("maxDiscountInr") ? Number(fd.get("maxDiscountInr")) : null,
        usageLimit: Number(fd.get("usageLimit")),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? `Coupon ${data.coupon?.code} created` : data.error || "Could not create coupon");
    if (res.ok) {
      e.currentTarget.reset();
      router.refresh();
    }
  }

  async function toggleCoupon(id: string, active: boolean) {
    const res = await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? "Coupon updated" : data.error || "Could not update coupon");
    if (res.ok) router.refresh();
  }

  async function deleteReview(id: string) {
    const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? "Review removed" : data.error || "Could not delete review");
    if (res.ok) router.refresh();
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["overview", "Overview"],
            ["orders", "Orders"],
            ["returns", "Returns"],
            ["products", "Products"],
            ["add", "Add product"],
            ["coupons", "Coupons"],
            ["reviews", "Reviews"],
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

      {tab === "overview" ? (
        <section className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Revenue", formatInr(metrics.revenueInr)],
              ["Today", formatInr(metrics.todayRevenueInr)],
              ["Pending", String(metrics.pendingCount)],
              ["Low stock", String(metrics.lowStockCount)],
              ["Customers", String(metrics.customerCount)],
            ].map(([label, value]) => (
              <div key={label} className="panel p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">{label}</p>
                <p className="mt-2 font-display text-2xl">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="panel p-4">
              <h2 className="font-display text-xl">Status</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {STATUSES.map((status) => (
                  <li key={status} className="flex justify-between border-b border-neutral-100 py-1">
                    <span>{status.replaceAll("_", " ")}</span>
                    <span>{metrics.statusCounts[status] || 0}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel p-4">
              <h2 className="font-display text-xl">Top products</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {metrics.topProducts.length ? (
                  metrics.topProducts.map((product) => (
                    <li key={product.name} className="flex justify-between border-b border-neutral-100 py-1">
                      <span>{product.name}</span>
                      <span>{product.quantity}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-neutral-500">No sales yet.</li>
                )}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

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
                  <tr key={p.id} className={`border-b border-neutral-100 ${p.stock < 10 ? "bg-lime/20" : ""}`}>
                    <td className="py-3 pr-4">{p.name}</td>
                    <td>
                      <input type="number" defaultValue={p.priceInr} id={`price-${p.id}`} className="w-24 border px-2 py-1" />
                    </td>
                    <td>
                      <input type="number" defaultValue={p.stock} id={`stock-${p.id}`} className="w-20 border px-2 py-1" />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-xs uppercase tracking-wider underline"
                        onClick={() => {
                          const stock = Number((document.getElementById(`stock-${p.id}`) as HTMLInputElement).value);
                          const priceInr = Number((document.getElementById(`price-${p.id}`) as HTMLInputElement).value);
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
              <li key={`${o.id}-${o.status}-${o.trackingNumber || ""}`} className="panel p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span>
                    {o.orderNumber || `#${o.id.slice(-8)}`} · {o.email}
                    {o.city ? ` · ${o.city}` : ""}
                  </span>
                  <span>{formatInr(o.totalInr)}</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Status: {o.status.replaceAll("_", " ")}
                  {o.waybill ? ` · ${o.waybill}` : ""}
                  {o.trackingNumber ? ` · Track ${o.trackingNumber}` : ""}
                  {o.couponCode ? ` · ${o.couponCode}` : ""}
                </p>
                {o.items.length ? (
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
                    {STATUSES.map((s) => (
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
                      const trackingNumber = (document.getElementById(`track-${o.id}`) as HTMLInputElement).value;
                      updateOrder(o.id, status, trackingNumber);
                    }}
                  >
                    Update
                  </button>
                  <button type="button" className="border border-black px-3 py-1" onClick={() => setInvoice(o)}>
                    Invoice
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "returns" ? (
        <section>
          <h2 className="font-display text-2xl">Returns</h2>
          <ul className="mt-4 space-y-4">
            {returns.length === 0 ? <li className="text-sm text-neutral-500">No returns or cancellations.</li> : null}
            {returns.map((o) => (
              <li key={o.id} className="panel p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span>
                    {o.orderNumber || `#${o.id.slice(-8)}`} · {o.status.replaceAll("_", " ")}
                  </span>
                  <span>{formatInr(o.totalInr)}</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {o.email}
                  {o.waybill ? ` · ${o.waybill}` : ""}
                </p>
                {o.status === "RETURN_REQUESTED" || o.status === "RETURNED" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className="bg-black px-3 py-1 text-lime" onClick={() => returnAction(o.id, "REFUND")}>
                      Approve refund
                    </button>
                    <button
                      type="button"
                      className="border border-black px-3 py-1"
                      onClick={() => returnAction(o.id, "REPLACEMENT")}
                    >
                      Approve replacement
                    </button>
                  </div>
                ) : null}
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
            <textarea name="description" required rows={3} placeholder="Description" className="border px-3 py-2" />
            <button type="submit" className="bg-black py-3 text-[11px] uppercase tracking-widest text-lime">
              Create
            </button>
          </form>
        </section>
      ) : null}

      {tab === "coupons" ? (
        <section>
          <h2 className="font-display text-2xl">Coupons</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {coupons.map((coupon) => (
              <li key={coupon.id} className="panel flex flex-wrap items-center justify-between gap-3 p-3">
                <span>
                  <strong>{coupon.code}</strong> · {coupon.type === "PERCENT" ? `${coupon.value}%` : formatInr(coupon.value)} ·
                  min {formatInr(coupon.minOrderInr)}
                  {coupon.maxDiscountInr ? ` · cap ${formatInr(coupon.maxDiscountInr)}` : ""} · {coupon.timesUsed}/
                  {coupon.usageLimit}
                  {coupon.active ? "" : " · off"}
                </span>
                <button
                  type="button"
                  className="border border-black px-3 py-1 text-[10px] uppercase tracking-[0.14em]"
                  onClick={() => toggleCoupon(coupon.id, !coupon.active)}
                >
                  {coupon.active ? "Disable" : "Enable"}
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={createCoupon} className="mt-6 grid max-w-xl gap-2 sm:grid-cols-2">
            <input name="code" required placeholder="Code" className="border px-3 py-2 uppercase" />
            <select name="type" className="border px-3 py-2">
              <option value="PERCENT">Percent</option>
              <option value="FLAT">Flat</option>
            </select>
            <input name="value" type="number" required placeholder="Value" className="border px-3 py-2" />
            <input name="minOrderInr" type="number" required placeholder="Min order ₹" className="border px-3 py-2" />
            <input name="maxDiscountInr" type="number" placeholder="Max discount ₹" className="border px-3 py-2" />
            <input name="usageLimit" type="number" required defaultValue={100} className="border px-3 py-2" />
            <button type="submit" className="bg-black py-3 text-[11px] uppercase tracking-widest text-lime sm:col-span-2">
              Create coupon
            </button>
          </form>
        </section>
      ) : null}

      {tab === "reviews" ? (
        <section>
          <h2 className="font-display text-2xl">Reviews</h2>
          <ul className="mt-4 space-y-3">
            {reviews.length === 0 ? <li className="text-sm text-neutral-500">No reviews yet.</li> : null}
            {reviews.map((review) => (
              <li key={review.id} className="panel p-4 text-sm">
                <p className="font-medium">
                  {review.authorName} · {review.productName} · {"★".repeat(review.rating)}
                </p>
                <p className="mt-1 text-neutral-600">{review.comment}</p>
                <button type="button" className="mt-2 text-xs uppercase tracking-wider underline" onClick={() => deleteReview(review.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {invoice ? <InvoiceModal order={invoice} onClose={() => setInvoice(null)} /> : null}
    </div>
  );
}

function InvoiceModal({ order, onClose }: { order: OrderRow; onClose: () => void }) {
  const taxable = order.totalInr / 1.12;
  const tax = order.totalInr - taxable;
  const half = tax / 2;

  function printInvoice() {
    const sheet = document.getElementById("invoice-sheet");
    if (!sheet) return;
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) return;
    popup.document.write(
      `<!doctype html><html><head><title>${order.orderNumber || "Invoice"}</title><style>
        body{font-family:Georgia,serif;color:#111;padding:28px}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left;font-size:12px}
        h1{letter-spacing:.18em;font-size:22px;margin:0}
      </style></head><body>${sheet.innerHTML}</body></html>`
    );
    popup.document.close();
    popup.focus();
    popup.print();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="mt-10 w-full max-w-3xl bg-white p-6 text-black shadow-xl">
        <div className="mb-4 flex justify-between gap-3">
          <button type="button" onClick={printInvoice} className="bg-black px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-lime">
            Print
          </button>
          <button type="button" onClick={onClose} className="border border-black px-3 py-2 text-[10px] uppercase tracking-[0.16em]">
            Close
          </button>
        </div>
        <div id="invoice-sheet">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h1 style={{ letterSpacing: "0.18em", fontSize: 22, margin: 0 }}>JERSEY STORE</h1>
              <p style={{ fontSize: 12, color: "#555" }}>Football & cricket kits · GSTIN 27AABCJ1234F1Z5</p>
              <p style={{ fontSize: 12, color: "#555" }}>Matchday warehouse, Mumbai 400001</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.14em" }}>TAX INVOICE</p>
              <p style={{ fontWeight: 700 }}>{order.orderNumber || order.id.slice(-8)}</p>
              <p style={{ fontSize: 12 }}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
          </div>
          <p style={{ marginTop: 16, fontSize: 13 }}>
            Waybill <strong>{order.waybill || "Pending"}</strong>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16, fontSize: 13 }}>
            <p>
              <strong>Sold by</strong>
              <br />
              Jersey Store
              <br />
              Matchday warehouse, Mumbai
            </p>
            <p>
              <strong>Ship to</strong>
              <br />
              {order.customerName}
              <br />
              {order.address || order.city}
              <br />
              {order.phone} · {order.email}
            </p>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Kit / HSN 611020</th>
                <th>Qty</th>
                <th>Net rate</th>
                <th>Tax</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={`${item.name}-${index}`}>
                  <td>{index + 1}</td>
                  <td>
                    {item.name}
                    <br />
                    Size {item.size}
                  </td>
                  <td>{item.quantity}</td>
                  <td>{inr2(item.unitPriceInr / 1.12)}</td>
                  <td>12%</td>
                  <td>{inr2(item.unitPriceInr * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginLeft: "auto", marginTop: 16, maxWidth: 280, fontSize: 13 }}>
            <p style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Taxable value</span>
              <span>{inr2(taxable)}</span>
            </p>
            <p style={{ display: "flex", justifyContent: "space-between" }}>
              <span>CGST 6%</span>
              <span>{inr2(half)}</span>
            </p>
            <p style={{ display: "flex", justifyContent: "space-between" }}>
              <span>SGST 6%</span>
              <span>{inr2(half)}</span>
            </p>
            {order.discountInr ? (
              <p style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Includes coupon {order.couponCode || ""}</span>
                <span>{inr2(order.discountInr)} off</span>
              </p>
            ) : null}
            <p style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Shipping</span>
              <span>{order.shippingInr ? inr2(order.shippingInr) : "Free"}</span>
            </p>
            <p style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid #111", paddingTop: 6 }}>
              <span>Total payable</span>
              <span>{inr2(order.totalInr)}</span>
            </p>
          </div>
          <p style={{ marginTop: 24, fontSize: 11, color: "#666" }}>Computer-generated tax invoice. Signature not required.</p>
        </div>
      </div>
    </div>
  );
}
