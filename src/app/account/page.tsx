import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: { take: 5, orderBy: { createdAt: "desc" }, include: { items: true } },
      addresses: true,
      savedCustoms: { include: { product: true }, take: 5 },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-24 sm:px-8">
      <h1 className="font-display text-4xl tracking-tight">Hey, {user?.name || "fan"}</h1>
      <p className="mt-1 text-sm text-neutral-600">{user?.email}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Link href="/account/orders" className="panel bg-sky/70 p-5 hover:bg-lime/40">
          Orders
        </Link>
        <Link href="/wishlist" className="panel bg-blush/80 p-5 hover:bg-lime/40">
          Wishlist
        </Link>
        <Link href="/custom" className="panel bg-mint/80 p-5 hover:bg-lime/40">
          Custom builds
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Recent orders</h2>
        <ul className="mt-4 space-y-3">
          {user?.orders.length ? (
            user.orders.map((o) => (
              <li key={o.id} className="flex justify-between border-b border-neutral-100 py-3 text-sm">
                <span>
                  #{o.id.slice(-6)} · {o.status} · {o.items.length} items
                </span>
                <span>₹{o.totalInr}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-neutral-500">No orders yet.</li>
          )}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Addresses</h2>
        <ul className="mt-4 space-y-2 text-sm text-neutral-600">
          {user?.addresses.length ? (
            user.addresses.map((a) => (
              <li key={a.id}>
                {a.fullName} — {a.line1}, {a.city}
              </li>
            ))
          ) : (
            <li>Addresses appear after checkout.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
