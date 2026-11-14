import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminPanel } from "@/components/admin-panel";
import { StaffBar } from "@/components/staff-bar";
import { formatInr } from "@/lib/utils";
import { canManageCatalog } from "@/lib/roles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/staff");
  if (!canManageCatalog(session.user.role)) redirect("/staff");

  const [products, orders, users, revenue] = await Promise.all([
    prisma.product.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { items: true, user: true, address: true },
    }),
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: { totalInr: true },
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
    }),
  ]);

  return (
    <div className="pb-16">
      <StaffBar label="Staff · Admin" />
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Staff · Admin</p>
          <h1 className="font-display text-4xl tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-neutral-600">
            {products.length} products · {orders.length} orders · {users} users ·{" "}
            {formatInr(revenue._sum.totalInr || 0)} paid volume
          </p>
        </div>
        {session.user.role === "SUPER_ADMIN" ? (
          <Link
            href="/super-admin"
            className="border border-black px-3 py-2 text-[11px] uppercase tracking-[0.16em] hover:bg-lime"
          >
            Super Admin
          </Link>
        ) : null}
      </div>

      <AdminPanel
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
          priceInr: p.priceInr,
          featured: p.featured,
        }))}
        orders={orders.map((o) => ({
          id: o.id,
          status: o.status,
          totalLabel: formatInr(o.totalInr),
          email: o.user.email,
          trackingNumber: o.trackingNumber,
          city: o.address ? `${o.address.city}, ${o.address.state}` : "",
          items: o.items.map((i) => ({
            name: i.productName,
            size: i.size,
            quantity: i.quantity,
            customName: i.customName,
            customNumber: i.customNumber,
          })),
        }))}
      />
      </div>
    </div>
  );
}
