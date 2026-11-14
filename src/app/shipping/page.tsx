export const metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-28 prose-sm">
      <h1 className="font-display text-4xl tracking-tight">Shipping</h1>
      <ul className="mt-6 space-y-3 text-sm text-neutral-700">
        <li>India: 3–7 business days. Free over ₹2,499.</li>
        <li>International: 7–14 business days (duties may apply).</li>
        <li>Custom builds may add 2–3 days for print.</li>
        <li>Tracking emailed when your order ships.</li>
      </ul>
    </div>
  );
}
