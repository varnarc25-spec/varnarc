import type { ReactNode } from 'react';

export function HrPanel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-8 rounded-lg border border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] p-4">
      {children}
    </div>
  );
}

export function HrDataTable({
  columns,
  rows,
  empty,
}: {
  columns: string[];
  rows: ReactNode[][];
  empty: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--varnarc-border)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--varnarc-muted)] text-xs text-[var(--varnarc-subtle)]">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-[var(--varnarc-subtle)]" colSpan={columns.length}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index} className="border-t border-[var(--varnarc-border)]">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
