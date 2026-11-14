import { prisma } from "@/lib/prisma";
import { CustomBuilder } from "@/components/custom-builder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Custom Build" };

type SearchParams = Promise<{ base?: string }>;

export default async function CustomPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const bases = await prisma.product.findMany({
    where: { edition: "CUSTOM_BUILD" },
    orderBy: { name: "asc" },
  });

  const selected = sp.base
    ? bases.find((b) => b.slug === sp.base) || bases[0]
    : bases[0];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-8">
      <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Custom Build</p>
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Make it yours</h1>
      <p className="mt-2 max-w-lg text-sm text-neutral-600">
        Pick a base kit, lock name + number + patches, preview live, drop it in the bag.
      </p>
      {selected ? <CustomBuilder bases={bases} initialId={selected.id} /> : (
        <p className="mt-10 text-neutral-500">No custom bases seeded yet.</p>
      )}
    </div>
  );
}
