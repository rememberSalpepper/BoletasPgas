// components/results-table.tsx
"use client"

import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, AlertCircle, FileText, ArrowUpDown, ExternalLink } from 'lucide-react'
import { useState } from "react"
import { motion } from "framer-motion"

interface ResultsTableProps {
  results: any[]
}

export function ResultsTable({ results }: ResultsTableProps) {
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  // Aplana el resultado para simplificar rows
  const flattenResult = (r: any) => {
    const d = r.extracted_data || {}
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
      }
    }
    const o = d.remitente || {},
      t = d.destinatario || {}
    return {
      filename: r.filename || "Desconocido",
      error: null,
      fecha: `${d.fecha || ""} ${d.hora || ""}`.trim() || null,
      origen: o.nombre || d.banco_origen_app || o.banco || o.rut || "-",
      destino: t.nombre || t.banco || t.rut || "-",
      asunto: d.asunto || "-",
      monto: d.monto,
      estado: d.estado || "-",
      codigo: d.codigo_transaccion || "-",
    }
  }

  let items = results.map(flattenResult)

  // Ordenar los elementos si hay un campo de ordenación seleccionado
  if (sortField) {
    items = [...items].sort((a, b) => {
      if (a[sortField] === null) return sortDirection === "asc" ? 1 : -1
      if (b[sortField] === null) return sortDirection === "asc" ? -1 : 1

      if (sortField === "monto") {
        return sortDirection === "asc"
          ? (a[sortField] || 0) - (b[sortField] || 0)
          : (b[sortField] || 0) - (a[sortField] || 0)
      }

      const aVal = String(a[sortField] || "").toLowerCase()
      const bVal = String(b[sortField] || "").toLowerCase()

      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Función para obtener el color del estado
  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-200 text-gray-700"

    const statusLower = status.toLowerCase()
    if (statusLower.includes("exit") || statusLower.includes("complet")) {
      return "bg-green-100 text-green-800 border-green-300"
    }
    if (statusLower.includes("pend") || statusLower.includes("proces")) {
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    }
    if (statusLower.includes("error") || statusLower.includes("recha") || statusLower.includes("fall")) {
      return "bg-red-100 text-red-800 border-red-300"
    }

    return "bg-blue-100 text-blue-800 border-blue-300"
  }

  // Columnas de la tabla
  const columns = [
    { id: "filename", label: "Archivo", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "fecha", label: "Fecha y Hora", icon: null },
    { id: "origen", label: "Origen", icon: null },
    { id: "destino", label: "Destino", icon: null },
    { id: "asunto", label: "Asunto", icon: null },
    { id: "monto", label: "Monto", icon: null },
    { id: "estado", label: "Estado", icon: null },
    { id: "codigo", label: "Código", icon: null },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-md bg-white">
      {/* Encabezado de la tabla con gradiente */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-cyan-50">
              {columns.map((col) => (
                <th
                  key={col.id}
                  onClick={() => handleSort(col.id)}
                  className="group px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    {col.icon && <span className="text-gray-400">{col.icon}</span>}
                    <span>{col.label}</span>
                    <ArrowUpDown
                      className={`h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${sortField === col.id ? "opacity-100 text-blue-500" : ""}`}
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
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
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
                  className={`
                    relative
                    ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} 
                    hover:bg-blue-50 transition-colors
                    ${item.error ? "bg-red-50 hover:bg-red-100" : ""}
                    ${hoveredRow === idx ? "shadow-md z-10" : ""}
                  `}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <FileText className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 text-sm">
                          {item.filename.length > 20 ? `${item.filename.substring(0, 18)}...` : item.filename}
                        </span>
                        {item.filename.length > 20 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <ExternalLink className="h-3 w-3 text-gray-400 ml-1 inline cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.filename}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {item.error ? (
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-red-600 text-sm">Error: {item.error}</span>
                      </div>
                    ) : (
                      <span className="text-gray-700 text-sm">{item.fecha || "-"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-sm text-gray-700 font-medium">{item.origen || "-"}</span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{item.destino || "-"}</span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm text-gray-700 max-w-[150px] truncate inline-block">
                            {item.asunto || "-"}
                          </span>
                        </TooltipTrigger>
                        {item.asunto && (
                          <TooltipContent>
                            <p>{item.asunto}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {item.monto != null ? (
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(item.monto)}</span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {item.estado ? (
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(item.estado)} text-xs px-2.5 py-1 rounded-full flex items-center w-fit`}
                      >
                        {item.estado.toLowerCase().includes("exit") && <CheckCircle className="h-3 w-3 mr-1.5" />}
                        {item.estado}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-600">{item.codigo || "-"}</span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}