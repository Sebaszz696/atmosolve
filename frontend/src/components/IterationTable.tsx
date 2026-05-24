interface Props {
  tabla: Record<string, number | string>[];
}

export default function IterationTable({ tabla }: Props) {
  if (!tabla.length) return null;
  const cols = Object.keys(tabla[0]);

  const fmt = (v: number | string) => {
    if (typeof v !== "number") return v;
    if (Number.isInteger(v)) return String(v);
    if (Math.abs(v) < 1e-4 && v !== 0) return v.toExponential(4);
    return v.toFixed(6);
  };

  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="min-w-full text-xs">
        <thead className="bg-sky-50">
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 text-left font-semibold text-sky-800 whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {cols.map((c) => (
                <td key={c} className="px-3 py-1.5 font-mono whitespace-nowrap text-gray-700">
                  {fmt(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
