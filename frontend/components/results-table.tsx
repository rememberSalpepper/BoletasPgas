// components/results-table.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface ResultsTableProps {
  results: any[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Aplana cada resultado
  const flattenResult = (r: any) => {
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
      filename: r.filename,
      error: null,
      fecha: `${d.fecha || ""} ${d.hora || ""}`.trim() || "-",
      origen: o.nombre || d.banco_origen_app || o.banco || o.rut || "-",
      destino: t.nombre || t.banco || t.rut || "-",
      asunto: d.asunto || "-",
      monto: d.monto,
      estado: d.estado || "-",
      codigo: d.codigo_transaccion || "-",
    };
  };

  let items = results.map(flattenResult);

  // Ordenamiento
  if (sortField) {
    items = [...items].sort((a, b) => {
      const aV = a[sortField];
      const bV = b[sortField];
      if (aV == null) return sortDirection === "asc" ? 1 : -1;
      if (bV == null) return sortDirection === "asc" ? -1 : 1;
      if (sortField === "monto") {
        return sortDirection === "asc"
          ? (aV as number) - (bV as number)
          : (bV as number) - (aV as number);
      }
      return sortDirection === "asc"
        ? String(aV).localeCompare(String(bV))
        : String(bV).localeCompare(String(aV));
    });
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(dir => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Colores por estado
  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-200 text-gray-700";
    const s = status.toLowerCase();
    if (s.includes("exit") || s.includes("complet")) {
      return "bg-green-100 text-green-800 border-green-300";
    }
    if (s.includes("pend") || s.includes("proces")) {
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
    if (s.includes("error") || s.includes("recha") || s.includes("fall")) {
      return "bg-red-100 text-red-800 border-red-300";
    }
    return "bg-blue-100 text-blue-800 border-blue-300";
  };

  // Columnas con prioridad móvil
  const columns = [
    { id: "monto", label: "Monto",     icon: null,               priority: 1 },
    { id: "estado", label: "Estado",   icon: null,               priority: 2 },
    { id: "filename", label: "Archivo", icon: <FileText className="h-3.5 w-3.5"/>, priority: 3 },
    { id: "codigo", label: "Código",   icon: null,               priority: 3 },
    { id: "fecha", label: "Fecha",     icon: null,               priority: 4 },
    { id: "origen", label: "Origen",   icon: null,               priority: 5 },
    { id: "destino", label: "Destino", icon: null,               priority: 6 },
    { id: "asunto", label: "Asunto",   icon: null,               priority: 7 },
  ];

  const shouldShowColumn = (p: number) =>
    `hidden ${
      p <= 1
        ? "table-cell"
        : p <= 2
        ? "xs:table-cell"
        : p <= 3
        ? "sm:table-cell"
        : p <= 4
        ? "md:table-cell"
        : p <= 5
        ? "lg:table-cell"
        : "xl:table-cell"
    }`;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-md bg-white">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-cyan-50">
                {columns.map(col => (
                  <th
                    key={col.id}
                    onClick={() => handleSort(col.id)}
                    className={`group px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-colors ${shouldShowColumn(col.priority)}`}
                  >
                    <div className="flex items-center space-x-1">
                      {col.icon && <span className="text-gray-400">{col.icon}</span>}
                      <span>{col.label}</span>
                      <ArrowUpDown
                        className={`h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${
                          sortField === col.id ? "opacity-100 text-blue-500" : ""
                        }`}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <AlertCircle className="h-8 w-8 text-gray-300" />
                      <p>No hay resultados disponibles</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`relative ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors ${
                      item.error ? "bg-red-50 hover:bg-red-100" : ""
                    } ${hoveredRow === idx ? "shadow-md z-10" : ""}`}
                    onMouseEnter={() => setHoveredRow(idx)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {columns.map(col => {
                      const v = (item as any)[col.id];
                      return (
                        <td
                          key={col.id}
                          className={`px-3 py-3 whitespace-nowrap ${shouldShowColumn(col.priority)}`}
                        >
                          {col.id === "estado" ? (
                            v ? (
                              <Badge
                                variant="outline"
                                className={`${getStatusColor(v)} text-xs px-2 py-0.5 rounded-full flex items-center w-fit`}
                              >
                                {v.toLowerCase().includes("exit") && (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                )}
                                <span className="text-xs">{v}</span>
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-500">-</span>
                            )
                          ) : col.id === "monto" ? (
                            v != null ? (
                              <span className="text-xs sm:text-sm font-bold text-gray-900">
                                {formatCurrency(v)}
                              </span>
                            ) : (
                              <span className="text-xs sm:text-sm text-gray-500">-</span>
                            )
                          ) : col.id === "asunto" ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs sm:text-sm text-gray-700 max-w-[100px] sm:max-w-[150px] truncate inline-block">
                                    {v}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{v}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : col.id === "filename" ? (
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                <FileText className="h-3.5 w-3.5 text-blue-500" />
                              </div>
                              <span className="font-medium text-gray-900 text-xs sm:text-sm">
                                {v.length > 13 ? `${v.substring(0, 13)}...` : v}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs sm:text-sm text-gray-700">
                              {v}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
