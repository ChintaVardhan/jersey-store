export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-28">
      <h1 className="font-display text-4xl tracking-tight">Contact</h1>
      <p className="mt-4 text-sm text-neutral-700">
        Email: hello@jerseystore.com
        <br />
        IG / TikTok: @jerseystore
        <br />
        {/* TODO: replace with real support channels */}
      </p>
      <form className="mt-8 space-y-3">
        <input placeholder="Name" className="w-full border border-neutral-300 px-3 py-2" />
        <input placeholder="Email" type="email" className="w-full border border-neutral-300 px-3 py-2" />
        <textarea placeholder="Message" rows={5} className="w-full border border-neutral-300 px-3 py-2" />
        <button type="button" className="bg-black px-5 py-3 text-[11px] uppercase tracking-widest text-lime">
          Send (demo)
        </button>
      </form>
    </div>
  );
}
