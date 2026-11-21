import { prisma } from "@/lib/prisma";
import { parseImageColors } from "@/lib/utils";
import { HeroEnter } from "@/components/hero-enter";
import { ProductCard } from "@/components/product-card";
import { DropCountdown } from "@/components/drop-countdown";
import { RecentlyViewed } from "@/components/recently-viewed";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { featured: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  const drop = await prisma.product.findFirst({
    where: { isDrop: true, dropEndsAt: { not: null } },
    orderBy: { dropEndsAt: "asc" },
  });

  const rack = featured.slice(0, 7).map((p, i) => {
    const c = parseImageColors(p.imageColors);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      primary: c.primary,
      secondary: c.secondary,
      accent: c.accent,
      image: p.image,
      tilt: -18 + i * 5,
    };
  });

  return (
    <>
      <HeroEnter jerseys={rack} />

      <section className="border-t border-black/5 px-3 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-end sm:gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Limited run</p>
            <h2 className="font-display mt-2 text-[1.85rem] leading-tight tracking-tight sm:text-5xl">
              {drop?.name || "Retro Football Shirt 90s Drop"}
            </h2>
            <p className="mt-2 max-w-md text-sm text-neutral-600">
              Scroll-stopping kits. When it&apos;s gone, it&apos;s gone.
            </p>
          </div>
          {drop?.dropEndsAt ? <DropCountdown endsAt={drop.dropEndsAt} /> : null}
        </div>
      </section>

      <section className="px-3 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex items-end justify-between sm:mb-8">
            <h2 className="font-display text-2xl tracking-tight sm:text-3xl">Bestsellers</h2>
            <Link
              href="/shop"
              className="inline-flex min-h-10 items-center text-[11px] uppercase tracking-[0.2em] text-neutral-500"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4 md:gap-6">
            {featured.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <RecentlyViewed />

      <section className="px-3 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            { href: "/shop?sport=FOOTBALL", title: "Football kits", sub: "Club + national energy", tint: "bg-sky/80" },
            { href: "/shop?sport=CRICKET", title: "Cricket kits", sub: "ODI · T20 · Custom", tint: "bg-mint/90" },
            { href: "/custom", title: "Custom build", sub: "Name. Number. Patches.", tint: "bg-blush/90" },
          ].map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className={`border border-black/5 px-5 py-8 transition-colors hover:border-black hover:bg-lime/40 sm:px-6 sm:py-10 ${b.tint}`}
            >
              <h3 className="font-display text-xl tracking-tight sm:text-2xl">{b.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{b.sub}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
