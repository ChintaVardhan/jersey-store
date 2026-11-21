"use client";

import { FormEvent, useState } from "react";

export function ChangePasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: fd.get("currentPassword"),
        newPassword: fd.get("newPassword"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || "Could not update password");
    else {
      setMessage(data.message || "Password updated.");
      e.currentTarget.reset();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid max-w-md gap-2">
      <input
        name="currentPassword"
        type="password"
        required
        minLength={6}
        placeholder="Current password"
        className="border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="newPassword"
        type="password"
        required
        minLength={6}
        placeholder="New password"
        className="border border-neutral-300 px-3 py-2 text-sm"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-neutral-700">{message}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="bg-black py-3 text-[11px] uppercase tracking-[0.18em] text-lime disabled:opacity-60"
      >
        {loading ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
