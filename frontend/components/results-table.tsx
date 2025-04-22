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
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface ResultsTableProps {
  results: any[];
}

type ColumnConfig = {
  id: keyof FlattenedItem;
  label: string;
  priority: number;
  sortable?: boolean;
};

type FlattenedItem = {
  filename: string;
  error: string | null;
  fecha: string | null;
  origen: string | null;
  destino: string | null;
  asunto: string | null;
  monto: number | null;
  estado: string | null;
  codigo: string | null;
};

export function ResultsTable({ results }: ResultsTableProps) {
  const [sortField, setSortField] = useState<keyof FlattenedItem | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Configuración responsive de columnas
  const columns: ColumnConfig[] = useMemo(() => [
    { id: 'filename', label: 'Archivo', priority: 1 },
    { id: 'fecha', label: 'Fecha', priority: 2 },
    { id: 'monto', label: 'Monto', priority: 1 },
    { id: 'estado', label: 'Estado', priority: 1 },
    { id: 'origen', label: 'Origen', priority: 3 },
    { id: 'destino', label: 'Destino', priority: 3 },
    { id: 'codigo', label: 'Código', priority: 2 },
    { id: 'asunto', label: 'Asunto', priority: 4 },
  ], []);

  // Aplanar resultados
  const flattenedItems = useMemo(() => results.map(r => {
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
    
    const remitente = d.remitente || {};
    const destinatario = d.destinatario || {};
    
    return {
      filename: r.filename || "Desconocido",
      error: null,
      fecha: `${d.fecha || ''} ${d.hora || ''}`.trim() || null,
      origen: remitente.nombre || d.banco_origen_app || remitente.banco || remitente.rut || "-",
      destino: destinatario.nombre || destinatario.banco || destinatario.rut || "-",
      asunto: d.asunto || "-",
      monto: d.monto || null,
      estado: d.estado || "-",
      codigo: d.codigo_transaccion || "-",
    };
  }), [results]);

  // Ordenamiento optimizado
  const sortedItems = useMemo(() => {
    if (!sortField) return flattenedItems;

    return [...flattenedItems].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === null || aVal === "-") return sortDirection === 'asc' ? 1 : -1;
      if (bVal === null || bVal === "-") return sortDirection === 'asc' ? -1 : 1;

      if (sortField === 'monto') {
        return sortDirection === 'asc' 
          ? (aVal as number) - (bVal as number) 
          : (bVal as number) - (aVal as number);
      }

      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [flattenedItems, sortField, sortDirection]);

  // Manejo de ordenamiento seguro por tipos
  const handleSort = (field: keyof FlattenedItem) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sistema de colores para estados
  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusLower = status.toLowerCase();
    switch (true) {
      case statusLower.includes('exit') || statusLower.includes('complet'):
        return 'bg-green-100 text-green-800 border-green-200';
      case statusLower.includes('pend') || statusLower.includes('proces'):
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case statusLower.includes('error') || statusLower.includes('recha'):
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Versión móvil optimizada
  const MobileView = () => (
    <div className="md:hidden space-y-3 px-2 py-3">
      {sortedItems.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: idx * 0.05 }}
          className={`p-4 rounded-xl shadow-sm ${
            item.error ? 'bg-red-50' : 'bg-white'
          } border border-gray-100`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{item.filename}</p>
              {item.error && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Error en procesamiento</span>
                </p>
              )}
            </div>
          </div>

          {!item.error && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Fecha/Hora</p>
                <p className="font-medium">{item.fecha || '-'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Monto</p>
                <p className="font-semibold">
                  {item.monto ? formatCurrency(item.monto) : '-'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">Origen</p>
                <p className="truncate">{item.origen}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">Destino</p>
                <p className="truncate">{item.destino}</p>
              </div>

              <div className="space-y-1 col-span-2">
                <p className="text-xs text-gray-500">Estado</p>
                <Badge className={`${getStatusColor(item.estado)} px-2 py-1 text-xs`}>
                  {item.estado}
                </Badge>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );

  // Versión desktop optimizada
  const DesktopView = () => {
    const visibleColumns = useMemo(() => 
      columns.sort((a, b) => a.priority - b.priority), [columns]
    );

    return (
      <div className="hidden md:block overflow-x-auto rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs font-medium uppercase">
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  onClick={() => column.sortable !== false && handleSort(column.id)}
                  className={`px-4 py-3.5 text-left ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {column.label}
                    {column.sortable !== false && (
                      <ArrowUpDown className={`w-3.5 h-3.5 ${
                        sortField === column.id ? 'text-blue-600 opacity-100' : 'text-gray-400 opacity-40'
                      }`} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {sortedItems.map((item, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className={`hover:bg-gray-50 ${
                  hoveredRow === idx ? 'bg-gray-50' : 'bg-white'
                } transition-colors`}
                onMouseEnter={() => setHoveredRow(idx)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {visibleColumns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-4 py-3.5 text-sm ${
                      column.id === 'monto' ? 'font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {column.id === 'estado' ? (
                      <Badge className={`${getStatusColor(item.estado)} px-2.5 py-1`}>
                        {item.estado}
                      </Badge>
                    ) : column.id === 'monto' ? (
                      item.monto ? formatCurrency(item.monto) : '-'
                    ) : column.id === 'filename' ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="truncate max-w-[160px]">{item.filename}</span>
                      </div>
                    ) : (
                      (item as any)[column.id] || '-'
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <MobileView />
      <DesktopView />
      
      {sortedItems.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          <p>No se encontraron resultados</p>
        </div>
      )}
    </div>
  );
}