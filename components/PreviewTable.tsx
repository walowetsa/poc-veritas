"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ParsedData } from "@/lib/parser";
import RecordModal from "@/components/RecordModal";

type PreviewTableProps = {
  data: ParsedData;
  relevantColumns: string[];
};

export default function PreviewTable({ data, relevantColumns }: PreviewTableProps) {
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  const columns: ColumnDef<Record<string, unknown>>[] = useMemo(() => {
    const valid = relevantColumns.filter((col) => data.headers.includes(col));
    const cols = valid.length > 0 ? valid : data.headers.slice(0, 5);
    return cols.map((header) => ({
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
    }));
  }, [relevantColumns, data.headers]);

  const table = useReactTable({
    data: data.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <>
      <div className="space-y-3">
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

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
            Showing {relevantColumns.length} of {data.headers.length} columns
            {" · "}
            {data.rowCount.toLocaleString()} total rows
          </p>
          <Link
            href="/dashboard/data"
            className="font-mono text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--gold)" }}
          >
            View full table →
          </Link>
        </div>
      </div>

      {selected && (
        <RecordModal record={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}