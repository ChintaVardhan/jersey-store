import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/utils";

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
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-24 sm:px-8">
      <h1 className="font-display text-4xl tracking-tight">Orders</h1>
      {sp.success ? (
        <p className="mt-4 border border-lime bg-lime/30 px-4 py-3 text-sm">
          Order confirmed · #{sp.success.slice(-8)}
        </p>
      ) : null}
      <ul className="mt-8 space-y-6">
        {orders.map((o) => (
          <li key={o.id} className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">
                #{o.id.slice(-8)} · {o.status}
              </p>
              <p>{formatInr(o.totalInr)}</p>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {o.createdAt.toLocaleString()} · {o.paymentProvider}
              {o.trackingNumber ? ` · Track ${o.trackingNumber}` : ""}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-neutral-700">
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.productName} · {i.size} × {i.quantity}
                  {i.customName ? ` · ${i.customName} #${i.customNumber}` : ""}
                </li>
              ))}
            </ul>
          </li>
        ))}
        {!orders.length ? <li className="text-neutral-500">No orders yet.</li> : null}
      </ul>
    </div>
  );
}
