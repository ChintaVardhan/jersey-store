import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { Prisma } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

type SearchParams = Promise<{
  sport?: string;
  edition?: string;
  q?: string;
  sort?: string;
}>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const where: Prisma.ProductWhereInput = {};

  if (sp.sport === "FOOTBALL" || sp.sport === "CRICKET") where.sport = sp.sport;
  if (sp.edition === "FAN_EDITION" || sp.edition === "MASTER_COPY" || sp.edition === "CUSTOM_BUILD") {
    where.edition = sp.edition;
  }
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q } },
      { team: { contains: sp.q } },
      { searchable: { contains: sp.q } },
      { description: { contains: sp.q } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sp.sort === "price-asc"
      ? { priceInr: "asc" }
      : sp.sort === "price-desc"
        ? { priceInr: "desc" }
        : { featured: "desc" };

  const products = await prisma.product.findMany({ where, orderBy });

  const filters = [
    { label: "All", href: "/shop" },
    { label: "Football", href: "/shop?sport=FOOTBALL" },
    { label: "Cricket", href: "/shop?sport=CRICKET" },
    { label: "Fan Edition", href: "/shop?edition=FAN_EDITION" },
    { label: "Master Copy", href: "/shop?edition=MASTER_COPY" },
    { label: "Custom Build", href: "/shop?edition=CUSTOM_BUILD" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] sm:px-8 sm:pb-20 sm:pt-24">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Catalog</p>
          <h1 className="font-display text-[2.35rem] tracking-tight sm:text-5xl">Shop kits</h1>
        </div>
        <form className="flex w-full max-w-sm gap-2" action="/shop">
          <input
            name="q"
            defaultValue={sp.q || ""}
            placeholder="Search Argentina, Dhoni, retro..."
            className="min-h-11 w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
          <button
            type="submit"
            className="min-h-11 shrink-0 bg-black px-4 text-[11px] uppercase tracking-wider text-lime"
          >
            Go
          </button>
        </form>
      </div>

      <div className="chip-scroll mt-6 sm:mt-8 sm:flex-wrap">
        {filters.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="rounded-full border border-black/10 bg-white/70 px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] hover:border-black hover:bg-lime"
          >
            {f.label}
          </Link>
        ))}
        <Link
          href="/shop?sort=price-asc"
          className="rounded-full border border-neutral-300 px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] hover:border-black"
        >
          Price ↑
        </Link>
        <Link
          href="/shop?sort=price-desc"
          className="rounded-full border border-neutral-300 px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] hover:border-black"
        >
          Price ↓
        </Link>
      </div>

      <p className="mt-5 text-sm text-neutral-500 sm:mt-6">{products.length} kits</p>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
