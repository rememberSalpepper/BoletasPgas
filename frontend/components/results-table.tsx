// components/results-table.tsx
"use client";

import { formatCurrency } from "@/lib/utils";

interface ResultsTableProps {
  results: any[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  const flattenResult = (res: any) => {
    const d = res.extracted_data || {};
    if (d.error) {
      return { filename: res.filename||"Desconocido", error: d.error, fecha: null, origen: null, destino: null, asunto: null, monto: null, estado: null, codigo: null };
    }
    const r = d.remitente||{}, t = d.destinatario||{};
    return {
      filename: res.filename||"Desconocido",
      error: null,
      fecha: `${d.fecha||""} ${d.hora||""}`.trim()||null,
      origen: r.nombre||d.banco_origen_app||r.banco||r.rut||null,
      destino: t.nombre||t.banco||t.rut||null,
      asunto: d.asunto||null,
      monto: d.monto,
      estado: d.estado||null,
      codigo: d.codigo_transaccion||null,
    };
  };

  const items = results.map(flattenResult);

  return (
    <table className="min-w-full divide-y divide-gray-200 text-gray-900">
      <thead className="bg-white">
        <tr className="uppercase text-xs font-medium text-gray-500 tracking-wide">
          <th className="px-4 py-3 text-left">Archivo</th>
          <th className="px-4 py-3 text-left">Fecha y Hora</th>
          <th className="px-4 py-3 text-left">Origen</th>
          <th className="px-4 py-3 text-left">Destino</th>
          <th className="px-4 py-3 text-left">Asunto</th>
          <th className="px-4 py-3 text-left">Monto</th>
          <th className="px-4 py-3 text-left">Estado</th>
          <th className="px-4 py-3 text-left">Código</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {items.map((it, i) => (
          <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
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
