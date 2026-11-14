import Link from "next/link";

const links = [
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/size-guide", label: "Size guide" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/staff", label: "Staff" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white/40 px-4 pb-16 pt-10 backdrop-blur-sm sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="rounded-full bg-lime px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-black inline-block">
            Jersey Store
          </p>
          <p className="mt-3 max-w-sm text-sm text-neutral-600">
            Football & cricket kits. Fan Edition · Master Copy · Custom Build. Matchday ready.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-neutral-700">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-black">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
