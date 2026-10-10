export function DataTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-body-sm">
        <thead>
          <tr className="text-caption uppercase text-slate-500">
            {columns.map((column) => (
              <th key={column} className="border-b border-line px-2 py-2 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-line">
              {row.map((cell, index) => (
                <td key={`${row[0]}-${index}`} className={`px-2 py-3 ${index === 0 ? "font-medium" : "font-mono tabular text-[12px]"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
