"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export function ProductReviews({
  productId,
  rating,
  reviewsCount,
  reviews,
}: {
  productId: string;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
}) {
  const { data } = useSession();
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data?.user?.name) {
      setAuthor((current) => current || data.user?.name || "");
    }
  }, [data?.user?.name]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        authorName: fd.get("authorName"),
        rating: Number(fd.get("rating")),
        comment: fd.get("comment"),
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error || "Could not save review");
      setLoading(false);
      return;
    }
    e.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <section className="mt-16 border-t border-neutral-200 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl tracking-tight">Reviews</h2>
        <p className="text-sm text-neutral-600">
          {reviewsCount > 0 ? `${rating.toFixed(1)} · ${reviewsCount} review${reviewsCount === 1 ? "" : "s"}` : "No ratings yet"}
        </p>
      </div>

      <ul className="mt-6 space-y-4">
        {reviews.map((review) => (
          <li key={review.id} className="panel p-4">
            <p className="text-sm font-medium">
              {review.authorName} · {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </p>
            <p className="mt-1 text-sm text-neutral-600">{review.comment}</p>
          </li>
        ))}
        {!reviews.length ? <li className="text-sm text-neutral-500">Be the first to review this kit.</li> : null}
      </ul>

      <form onSubmit={onSubmit} className="mt-6 grid max-w-lg gap-3">
        <input
          name="authorName"
          required
          minLength={2}
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          className="border border-neutral-300 px-3 py-2 text-sm"
        />
        <select name="rating" defaultValue="5" className="border border-neutral-300 px-3 py-2 text-sm">
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n === 1 ? "" : "s"}
            </option>
          ))}
        </select>
        <textarea
          name="comment"
          required
          minLength={4}
          rows={3}
          placeholder="How did the kit feel?"
          className="border border-neutral-300 px-3 py-2 text-sm"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="bg-black py-3 text-[11px] uppercase tracking-[0.18em] text-lime disabled:opacity-60"
        >
          {loading ? "Saving…" : "Post review"}
        </button>
      </form>
    </section>
  );
}
