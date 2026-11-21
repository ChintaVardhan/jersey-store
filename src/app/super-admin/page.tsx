import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SuperAdminPanel } from "@/components/super-admin-panel";
import { StaffBar } from "@/components/staff-bar";
import { AdminPanel } from "@/components/admin-panel";
import { loadAdminDashboard, toAdminPanelProps } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Super Admin" };

export default async function SuperAdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/staff");
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin");

  const [users, dashboard] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    }),
    loadAdminDashboard(),
  ]);

  return (
    <div className="pb-16">
      <StaffBar label="Staff · Super Admin" />
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Staff · Super Admin</p>
          <h1 className="font-display text-4xl tracking-tight">Control center</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Manage roles, staff accounts, catalog, and fulfillment.
          </p>
        </div>
        <Link href="/admin" className="border border-black px-3 py-2 text-[11px] uppercase tracking-[0.16em] hover:bg-lime">
          Admin dashboard
        </Link>
      </div>

      <SuperAdminPanel
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          orderCount: u._count.orders,
        }))}
      />

      <div className="mt-16 border-t border-neutral-200 pt-10">
        <h2 className="font-display text-3xl tracking-tight">Catalog & orders</h2>
        <AdminPanel {...toAdminPanelProps(dashboard)} />
      </div>
      </div>
    </div>
  );
}
