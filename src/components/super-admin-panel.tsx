"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  orderCount: number;
};

export function SuperAdminPanel({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function setRole(id: string, role: string) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }
    setMsg(`Updated ${data.user.email} → ${data.user.role}`);
    router.refresh();
  }

  async function createUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        role: fd.get("role"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Create failed");
      return;
    }
    setMsg(`Created ${data.user.email}`);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-10">
      {msg ? <p className="border border-lime bg-lime/20 px-3 py-2 text-sm">{msg}</p> : null}

      <section>
        <h2 className="font-display text-2xl">Users & roles</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-[10px] uppercase tracking-wider text-neutral-500">
                <th className="py-2">User</th>
                <th>Orders</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-neutral-100">
                  <td className="py-3 pr-4">
                    <div className="font-medium">{u.name || "—"}</div>
                    <div className="text-neutral-500">{u.email}</div>
                  </td>
                  <td>{u.orderCount}</td>
                  <td>
                    <select
                      defaultValue={u.role}
                      id={`role-${u.id}`}
                      className="border px-2 py-1"
                    >
                      {["USER", "ADMIN", "SUPER_ADMIN"].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="text-xs uppercase tracking-wider underline"
                      onClick={() => {
                        const role = (document.getElementById(`role-${u.id}`) as HTMLSelectElement).value;
                        setRole(u.id, role);
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

      <section>
        <h2 className="font-display text-2xl">Create staff / user</h2>
        <form onSubmit={createUser} className="mt-4 grid max-w-xl gap-3">
          <input name="name" required placeholder="Full name" className="border px-3 py-2" />
          <input name="email" type="email" required placeholder="Email" className="border px-3 py-2" />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Temp password"
            className="border px-3 py-2"
          />
          <select name="role" className="border px-3 py-2" defaultValue="ADMIN">
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
          <button type="submit" className="bg-black py-3 text-[11px] uppercase tracking-widest text-lime">
            Create account
          </button>
        </form>
      </section>
    </div>
  );
}
