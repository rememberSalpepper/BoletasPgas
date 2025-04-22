"use client";

import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, AlertCircle, FileText, ArrowUpDown } from 'lucide-react';
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
      filename: r.filename || "Desconocido",
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
    if (s.includes("exit") || s.includes("complet") || s.includes("realiz")) {
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

  // Versión móvil simplificada
  const renderMobileTable = () => (
    <div className="block md:hidden">
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No hay resultados disponibles</p>
        </div>
      ) : (
        <div className="space-y-4 px-3 py-3">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="p-4 rounded-lg shadow-sm bg-white"
            >
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <span className="font-medium text-gray-900 text-base">{item.filename}</span>
              </div>
              
              {item.error ? (
                <div className="flex items-center text-red-600 mt-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Error: {item.error}</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Fecha</p>
                    <p className="font-medium text-gray-800">{item.fecha}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Monto</p>
                    <p className="font-bold text-gray-900">
                      {item.monto != null ? formatCurrency(item.monto) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Origen</p>
                    <p className="font-medium text-gray-800">{item.origen}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Destino</p>
                    <p className="text-gray-800">{item.destino}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Estado</p>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(item.estado)} text-xs px-2 py-0.5 rounded-full inline-flex items-center`}
                    >
                      {item.estado.toLowerCase().includes("exit") && <CheckCircle className="h-3 w-3 mr-1" />}
                      {item.estado}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Código</p>
                    <p className="font-mono text-gray-800">{item.codigo}</p>
                  </div>
                  {item.asunto && item.asunto !== "-" && (
                    <div className="col-span-2 mt-1">
                      <p className="text-gray-500 text-xs mb-1">Asunto</p>
                      <p className="text-gray-800">{item.asunto}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // Versión desktop
  const columns = [
    { id: "filename", label: "Archivo", priority: 1 },
    { id: "fecha", label: "Fecha", priority: 2 },
    { id: "origen", label: "Origen", priority: 3 },
    { id: "destino", label: "Destino", priority: 4 },
    { id: "monto", label: "Monto", priority: 1 },
    { id: "estado", label: "Estado", priority: 1 },
    { id: "codigo", label: "Código", priority: 2 },
    { id: "asunto", label: "Asunto", priority: 5 },
  ];

  const getColumnClass = (priority: number) => 
    `${
      priority <= 1 ? 'table-cell' : 
      priority <= 2 ? 'hidden md:table-cell' : 
      priority <= 3 ? 'hidden lg:table-cell' : 
      'hidden xl:table-cell'
    }`;

  const renderDesktopTable = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gradient-to-r from-blue-50 to-cyan-50">
            {columns.map((col) => (
              <th
                key={col.id}
                onClick={() => handleSort(col.id)}
                className={`group px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-colors ${getColumnClass(col.priority)}`}
              >
                <div className="flex items-center space-x-1">
                  <span>{col.label}</span>
                  <ArrowUpDown
                    className={`h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${
                      sortField === col.id ? 'opacity-100 text-blue-500' : ''
                    }`}
                  />
                  {sortField === col.id && (
                    <span className="ml-1 text-blue-500">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center space-y-2">
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
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-blue-50 transition-colors ${
                  item.error ? 'bg-red-50 hover:bg-red-100' : ''
                } ${hoveredRow === idx ? 'shadow-md z-10' : ''}`}
                onMouseEnter={() => setHoveredRow(idx)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`px-4 py-3.5 whitespace-nowrap ${getColumnClass(col.priority)}`}
                  >
                    {col.id === 'filename' ? (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <FileText className="h-4 w-4 text-blue-500" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">
                          {item.filename}
                        </span>
                      </div>
                    ) : col.id === 'estado' ? (
                      item.estado && item.estado !== "-" ? (
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(item.estado)} text-xs px-2.5 py-1 rounded-full flex items-center w-fit`}
                        >
                          {item.estado.toLowerCase().includes("exit") && (
                            <CheckCircle className="h-3 w-3 mr-1.5" />
                          )}
                          {item.estado}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )
                    ) : col.id === 'monto' ? (
                      item.monto != null ? (
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(item.monto)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )
                    ) : col.id === 'asunto' ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-gray-700 max-w-[150px] truncate inline-block">
                              {item.asunto}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.asunto}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-sm text-gray-700">
                        {(item as any)[col.id] || '-'}
                      </span>
                    )}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-md bg-white">
      {renderMobileTable()}
      {renderDesktopTable()}
    </div>
  );
}