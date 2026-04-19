"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ParsedData } from "@/lib/parser";
import RecordModal from "@/components/RecordModal";

type DataTableProps = { data: ParsedData };

export default function DataTable({ data }: DataTableProps) {
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  const columns: ColumnDef<Record<string, unknown>>[] = useMemo(
    () =>
      data.headers.map((header) => ({
        accessorKey: header,
        header,
        cell: (info) => {
          const val = info.getValue();
          return val === null || val === undefined ? (
            <span style={{ color: "var(--text-dim)" }}>—</span>
          ) : (
            <span>{String(val)}</span>
          );
        },
      })),
    [data.headers]
  );

  const table = useReactTable({
    data: data.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <>
      <div className="space-y-3 animate-fade-up">
        {/* Meta */}
        <div className="flex items-center gap-3 font-mono text-xs" style={{ color: "var(--text-dim)" }}>
          <span>{data.rowCount.toLocaleString()} rows</span>
          <span style={{ color: "var(--border-md)" }}>·</span>
          <span>{data.headers.length} columns</span>
          <span style={{ color: "var(--border-md)" }}>·</span>
          <span style={{ color: "var(--text-muted)" }}>{data.fileName}</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
          <table className="min-w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-subtle)" }}>
                {table.getHeaderGroups().flatMap((hg) =>
                  hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-mono text-xs whitespace-nowrap"
                      style={{ color: "var(--text-dim)", letterSpacing: "0.06em" }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  onClick={() => setSelected(row.original)}
                  style={{
                    borderBottom: i < table.getRowModel().rows.length - 1
                      ? "1px solid var(--border)" : "none",
                    cursor: "pointer",
                    transition: "background 0.1s ease",
                  }}
                  className="hover:bg-white/[0.03]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2.5 font-mono text-xs whitespace-nowrap"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <div className="flex gap-2">
            {[
              { label: "← Prev", fn: () => table.previousPage(), disabled: !table.getCanPreviousPage() },
              { label: "Next →", fn: () => table.nextPage(), disabled: !table.getCanNextPage() },
            ].map(({ label, fn, disabled }) => (
              <button
                key={label}
                onClick={fn}
                disabled={disabled}
                className="font-mono text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{
                  border: "1px solid var(--border-md)",
                  color: disabled ? "var(--text-dim)" : "var(--text-muted)",
                  background: "transparent",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <RecordModal record={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}