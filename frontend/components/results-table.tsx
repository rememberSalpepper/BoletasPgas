// components/results-table.tsx
"use client";

import { formatCurrency } from "@/lib/utils";

interface ResultsTableProps {
  results: any[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  const flatten = (r: any) => {
    const d = r.extracted_data || {};
    if (d.error) {
      return {
        filename: r.filename || "Desconocido",
        error: d.error,
        fecha: null,
        origen: null,
        destino: null,
        asunto: null,
        monto: null,
        estado: null,
        codigo: null,
      };
    }
    const o = d.remitente || {};
    const t = d.destinatario || {};
    return {
      filename: r.filename || "Desconocido",
      error: null,
      fecha: `${d.fecha || ""} ${d.hora || ""}`.trim() || null,
      origen: o.nombre || d.banco_origen_app || o.banco || o.rut || null,
      destino: t.nombre || t.banco || t.rut || null,
      asunto: d.asunto || null,
      monto: d.monto,
      estado: d.estado || null,
      codigo: d.codigo_transaccion || null,
    };
  };

  const items = results.map(flatten);

  return (
    <table className="min-w-full divide-y divide-gray-200 text-gray-900">
      <thead className="bg-white">
        <tr className="uppercase text-xs font-medium text-gray-500 tracking-wide">
          {["Archivo", "Fecha y Hora", "Origen", "Destino", "Asunto", "Monto", "Estado", "Código"].map((h) => (
            <th key={h} className="px-4 py-3 text-left">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {items.map((it, i) => (
          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{it.filename}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm">
              {it.error ? <span className="text-red-500">Error: {it.error}</span> : it.fecha}
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-sm">{it.origen}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm">{it.destino}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm">{it.asunto}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm">{it.monto != null ? formatCurrency(it.monto) : ""}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm">{it.estado}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm">{it.codigo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
