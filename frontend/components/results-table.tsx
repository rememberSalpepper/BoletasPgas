// components/results-table.tsx
"use client";

import { formatCurrency } from "@/lib/utils";

interface ResultsTableProps {
  results: any[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  // Aplana el resultado para simplificar rows
  const flatten = (r: any) => {
    const d = r.extracted_data || {};
    if (d.error) {
      return { filename: r.filename || "Desconocido", error: d.error, fecha: null, origen: null, destino: null, asunto: null, monto: null, estado: null, codigo: null };
    }
    const o = d.remitente || {}, t = d.destinatario || {};
    return {
      filename: r.filename || "Desconocido",
      error: null,
      fecha: `${d.fecha||""} ${d.hora||""}`.trim() || null,
      origen: o.nombre || d.banco_origen_app || o.banco || o.rut || "-",
      destino: t.nombre || t.banco || t.rut || "-",
      asunto: d.asunto || "-",
      monto: d.monto,
      estado: d.estado || "-",
      codigo: d.codigo_transaccion || "-",
    };
  };

  const rows = results.map(flatten);

  return (
    <table className="min-w-full divide-y divide-gray-200 text-gray-900">
      <thead className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <tr className="uppercase text-xs font-medium text-gray-600 tracking-wide">
          {["Archivo","Fecha y Hora","Origen","Destino","Asunto","Monto","Estado","Código"].map((h) => (
            <th key={h} className="px-4 py-3 text-left">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50"}>
            <td className="px-4 py-2 whitespace-nowrap font-medium">{row.filename}</td>
            <td className="px-4 py-2 whitespace-nowrap">{row.error ? <span className="text-red-500">Error</span> : row.fecha}</td>
            <td className="px-4 py-2 whitespace-nowrap">{row.origen}</td>
            <td className="px-4 py-2 whitespace-nowrap">{row.destino}</td>
            <td className="px-4 py-2 whitespace-nowrap max-w-xs truncate">{row.asunto}</td>
            <td className="px-4 py-2 whitespace-nowrap">{row.monto != null ? formatCurrency(row.monto) : "-"}</td>
            <td className="px-4 py-2 whitespace-nowrap">{row.estado}</td>
            <td className="px-4 py-2 whitespace-nowrap font-mono">{row.codigo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
