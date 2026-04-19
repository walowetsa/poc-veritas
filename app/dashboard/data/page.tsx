"use client";

import { useEffect, useState, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";
import SectionLabel from "@/components/SectionLabel";
import RecordModal from "@/components/RecordModal";
import { ParsedData } from "@/lib/parser";
import { getActiveDataset } from "@/lib/storage";

export default function DataPage() {
  const [data, setData] = useState<ParsedData | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    const active = getActiveDataset();
    if (!active || active.id === loadedFor.current) return;
    loadedFor.current = active.id;
    setData(active.data);
    setGlobalFilter(""); // reset search when switching datasets
  });

  const columns: ColumnDef<Record<string, unknown>>[] = useMemo(
    () =>
      (data?.headers ?? []).map((header) => ({
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
    [data?.headers]
  );

  const table = useReactTable({
    data: data?.rows ?? [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  if (!data) {
    return (
      <div className="px-10 py-10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full pulse-gold" style={{ background: "var(--gold)" }} />
          <p className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  const filtered = table.getFilteredRowModel().rows.length;
  const total = data.rowCount;

  return (
    <>
    <div className="px-10 py-10 space-y-6 animate-fade-up">
      <div className="flex items-start justify-between gap-4">
        <SectionLabel label="Data" />
      </div>

      {/* Search + meta row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 font-mono text-xs" style={{ color: "var(--text-dim)" }}>
          <span>
            {globalFilter
              ? `${filtered.toLocaleString()} of ${total.toLocaleString()} rows`
              : `${total.toLocaleString()} rows`}
          </span>
          <span style={{ color: "var(--border-md)" }}>·</span>
          <span>{data.headers.length} columns</span>
          <span style={{ color: "var(--border-md)" }}>·</span>
          <span style={{ color: "var(--text-muted)" }}>{data.fileName}</span>
        </div>

        {/* Search */}
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="font-mono text-xs px-3 py-2 rounded-lg outline-none transition-all"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border-md)",
            color: "var(--text)",
            width: "200px",
          }}
        />
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
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={data.headers.length}
                  className="px-4 py-10 text-center font-mono text-xs"
                  style={{ color: "var(--text-dim)" }}
                >
                  No results match your search
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  onClick={() => setSelected(row.original)}
                  style={{
                    borderBottom:
                      i < table.getRowModel().rows.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                    cursor: "pointer",
                    transition: "background 0.1s ease",
                  }}
                  className="hover:bg-white/[0.03] transition-colors"
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
          Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          {" · "}
          {table.getState().pagination.pageSize} per page
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="font-mono text-xs px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-30"
            style={{ border: "1px solid var(--border-md)", color: "var(--text-muted)" }}
          >
            «
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="font-mono text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-30"
            style={{ border: "1px solid var(--border-md)", color: "var(--text-muted)" }}
          >
            ← Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="font-mono text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-30"
            style={{ border: "1px solid var(--border-md)", color: "var(--text-muted)" }}
          >
            Next →
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="font-mono text-xs px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-30"
            style={{ border: "1px solid var(--border-md)", color: "var(--text-muted)" }}
          >
            »
          </button>
        </div>
      </div>
    </div>

      {selected && (
        <RecordModal record={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}