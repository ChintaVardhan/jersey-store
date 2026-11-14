export const metadata = { title: "Size guide" };

const rows = [
  ["S", "36–38", "91–96"],
  ["M", "38–40", "96–101"],
  ["L", "40–42", "101–106"],
  ["XL", "42–44", "106–111"],
  ["XXL", "44–46", "111–116"],
];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-28">
      <h1 className="font-display text-4xl tracking-tight">Size guide</h1>
      <p className="mt-2 text-sm text-neutral-600">Chest measurements in inches / cm. Athletic fit.</p>
      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-[10px] uppercase tracking-wider text-neutral-500">
            <th className="py-2">Size</th>
            <th>Chest (in)</th>
            <th>Chest (cm)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-neutral-100">
              <td className="py-3 font-medium">{r[0]}</td>
              <td>{r[1]}</td>
              <td>{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
