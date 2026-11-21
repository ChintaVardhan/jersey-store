import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { AdminPanel } from "@/components/admin-panel";
import { StaffBar } from "@/components/staff-bar";
import { formatInr } from "@/lib/utils";
import { canManageCatalog } from "@/lib/roles";
import { loadAdminDashboard, toAdminPanelProps } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/staff");
  if (!canManageCatalog(session.user.role)) redirect("/staff");

  const data = await loadAdminDashboard();
  const panel = toAdminPanelProps(data);

  return (
    <div className="pb-16">
      <StaffBar label="Staff · Admin" />
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Staff · Admin</p>
            <h1 className="font-display text-4xl tracking-tight">Dashboard</h1>
            <p className="mt-2 text-sm text-neutral-600">
              {data.products.length} products · {data.orders.length} recent orders · {data.userCount} users ·{" "}
              {formatInr(data.revenueInr)} revenue
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

        <AdminPanel {...panel} />
      </div>
    </div>
  );
}
