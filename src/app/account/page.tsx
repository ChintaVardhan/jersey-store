import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/utils";
import { AddressManager } from "@/components/address-manager";
import { ChangePasswordForm } from "@/components/change-password-form";

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
    <div className="mx-auto max-w-4xl px-3 pb-24 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] sm:px-8 sm:pb-20 sm:pt-24">
      <h1 className="font-display text-4xl tracking-tight">Hey, {user?.name || "fan"}</h1>
      <p className="mt-1 text-sm text-neutral-600">
        {user?.email}
        {user?.phone ? ` · ${user.phone}` : ""}
      </p>

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
                <span>{formatInr(o.totalInr)}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-neutral-500">No orders yet.</li>
          )}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Addresses</h2>
        <AddressManager
          initial={(user?.addresses || []).map((a) => ({
            id: a.id,
            label: a.label,
            fullName: a.fullName,
            phone: a.phone,
            line1: a.line1,
            line2: a.line2,
            city: a.city,
            state: a.state,
            postalCode: a.postalCode,
            country: a.country,
            isDefault: a.isDefault,
          }))}
        />
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Password</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
