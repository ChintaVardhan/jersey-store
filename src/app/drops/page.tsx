import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { DropCountdown } from "@/components/drop-countdown";

export const dynamic = "force-dynamic";
export const metadata = { title: "Drops" };

export default async function DropsPage() {
  const drops = await prisma.product.findMany({
    where: { isDrop: true },
    orderBy: { createdAt: "desc" },
  });
  const timed = drops.find((d) => d.dropEndsAt);

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] sm:px-8 sm:pb-20 sm:pt-24">
      <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Limited</p>
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Drops</h1>
      <p className="mt-2 max-w-md text-sm text-neutral-600">
        When the lime bar hits — move fast. Matchday kits in limited runs.
      </p>
      {timed?.dropEndsAt ? (
        <div className="mt-8">
          <DropCountdown endsAt={timed.dropEndsAt} />
        </div>
      ) : null}
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {drops.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
