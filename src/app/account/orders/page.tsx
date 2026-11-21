import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatInr } from "@/lib/utils";
import { OrderActions } from "@/components/order-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

type SearchParams = Promise<{ success?: string }>;

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/orders");
  const sp = await searchParams;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, address: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-3 pb-24 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] sm:px-8 sm:pb-20 sm:pt-24">
      <h1 className="font-display text-4xl tracking-tight">Orders</h1>
      {sp.success ? (
        <p className="mt-4 border border-lime bg-lime/30 px-4 py-3 text-sm">Order confirmed · {sp.success}</p>
      ) : null}
      <ul className="mt-8 space-y-6">
        {orders.map((o) => (
          <li key={o.id} className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">
                {o.orderNumber || `#${o.id.slice(-8)}`} · {o.status.replaceAll("_", " ")}
              </p>
              <p>{formatInr(o.totalInr)}</p>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {o.createdAt.toLocaleString()} · {o.paymentProvider}
              {o.waybill ? ` · ${o.waybill}` : ""}
              {o.etaAt ? ` · ETA ${o.etaAt.toLocaleDateString("en-IN")}` : ""}
              {o.discountInr ? ` · Saved ${formatInr(o.discountInr)}` : ""}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-neutral-700">
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.productName} · {i.size} × {i.quantity}
                  {i.customName ? ` · ${i.customName} #${i.customNumber}` : ""}
                </li>
              ))}
            </ul>
            <OrderActions id={o.id} status={o.status} />
            <Link
              href={`/track?q=${encodeURIComponent(o.orderNumber || o.waybill || o.id.slice(-8))}`}
              className="mt-3 inline-block text-[10px] uppercase tracking-[0.16em] underline"
            >
              Track
            </Link>
          </li>
        ))}
        {!orders.length ? <li className="text-neutral-500">No orders yet.</li> : null}
      </ul>
    </div>
  );
}
