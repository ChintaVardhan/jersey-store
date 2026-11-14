import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { editionLabel, formatInr, parseImageColors } from "@/lib/utils";
import { ProductImage } from "@/components/product-image";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const colors = parseImageColors(product.imageColors);
  const related = await prisma.product.findMany({
    where: { sport: product.sport, NOT: { id: product.id } },
    take: 4,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.slug,
    brand: { "@type": "Brand", name: "Jersey Store" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.priceInr,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImage
          image={product.image}
          imageColors={product.imageColors}
          alt={product.name}
          className="aspect-[4/5] w-full"
          priority
        />

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            {product.sport.toLowerCase()} · {editionLabel(product.edition)} · {product.team}
          </p>
          <h1 className="font-display mt-2 text-4xl tracking-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-3 text-xl">{formatInr(product.priceInr)}</p>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">{product.description}</p>

          <div className="mt-8">
            <AddToCart
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                priceInr: product.priceInr,
                sizes: product.sizes,
                primary: colors.primary,
                secondary: colors.secondary,
                image: product.image || undefined,
              }}
            />
          </div>

          {product.edition === "CUSTOM_BUILD" ? (
            <Link
              href={`/custom?base=${product.slug}`}
              className="mt-4 inline-block text-[11px] uppercase tracking-[0.2em] underline"
            >
              Open custom builder →
            </Link>
          ) : null}

          <div className="mt-10 border-t border-neutral-200 pt-6 text-sm text-neutral-600">
            <p>
              <Link href="/size-guide" className="underline">
                Size guide
              </Link>{" "}
              · Stock: {product.stock}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl tracking-tight">Related kits</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
