"use client"
import { formatCurrency } from "@/lib/utils"

interface ResultsTableProps {
  results: any[]
}

export function ResultsTable({ results }: ResultsTableProps) {
  // Función para extraer datos aplanados de cada resultado
  const flattenResult = (result: any) => {
    const extractedData = result.extracted_data || {}

    // Manejar caso de error
    if (extractedData.error) {
      return {
        filename: result.filename || "Desconocido",
        error: extractedData.error,
        fecha: null,
        origen: null,
        destino: null,
        asunto: null,
        monto: null,
        estado: null,
        codigo: null,
      }
    }

    const remitente = extractedData.remitente || {}
    const destinatario = extractedData.destinatario || {}

    return {
      filename: result.filename || "Desconocido",
      error: null,
      fecha: `${extractedData.fecha || ""} ${extractedData.hora || ""}`.trim() || null,
      origen: remitente.nombre || extractedData.banco_origen_app || remitente.banco || remitente.rut || null,
      destino: destinatario.nombre || destinatario.banco || destinatario.rut || null,
      asunto: extractedData.asunto || null,
      monto: extractedData.monto,
      estado: extractedData.estado || null,
      codigo: extractedData.codigo_transaccion || null,
    }
  }

  const flattenedResults = results.map(flattenResult)

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-gray-900">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha y Hora
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origen</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {flattenedResults.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{item.filename}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                {item.error ? <span className="text-red-500">Error: {item.error}</span> : item.fecha}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{item.origen}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{item.destino}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{item.asunto}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{item.monto ? formatCurrency(item.monto) : null}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{item.estado}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{item.codigo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
