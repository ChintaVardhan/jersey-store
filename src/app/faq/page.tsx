export const metadata = { title: "FAQ" };

const faqs = [
  {
    q: "What is Fan Edition vs Master Copy?",
    a: "Fan Edition is everyday matchday wear. Master Copy is our premium-feel finish with sharper detailing.",
  },
  {
    q: "Can I customize any jersey?",
    a: "Custom Build kits support name, number, and patches in the builder. Others can be requested via contact.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes. See Shipping for timelines. Duties may apply outside India.",
  },
  {
    q: "Are these official licensed kits?",
    a: "These are fan / replica-style kits for supporters — labeled Fan Edition, Master Copy, or Custom Build.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-28">
      <h1 className="font-display text-4xl tracking-tight">FAQ</h1>
      <div className="mt-8 space-y-6">
        {faqs.map((f) => (
          <div key={f.q}>
            <h2 className="font-medium">{f.q}</h2>
            <p className="mt-1 text-sm text-neutral-600">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
