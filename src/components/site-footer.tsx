import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";

const links = [
  { href: "/track", label: "Track" },
  { href: "/compare", label: "Compare" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/size-guide", label: "Size guide" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/staff", label: "Staff" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white/40 px-4 pb-[max(5rem,calc(env(safe-area-inset-bottom)+3.5rem))] pt-10 backdrop-blur-sm sm:px-8 sm:pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="w-full max-w-md">
          <p
            className="inline-block rounded-full bg-lime px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-black"
            suppressHydrationWarning
          >
            Jersey Store
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-600">
            Football & cricket kits. Fan Edition · Master Copy · Custom Build. Matchday ready.
          </p>
          <NewsletterForm />
        </div>
        <nav className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.16em] text-neutral-700 sm:flex sm:flex-wrap sm:gap-x-5 sm:gap-y-2 sm:tracking-[0.18em]">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="min-h-10 inline-flex items-center hover:text-black sm:min-h-0"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
