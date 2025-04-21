'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Helper para formatear moneda (sin cambios)
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  return `$ ${Number(value).toLocaleString("es-CL")}`;
};

function Home() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + files.length > 10) {
      alert("Máximo 10 boletas permitidas en total.");
      return;
    }
    const newFiles = [...files, ...selected];
    setFiles(newFiles);
    const newPreviews = selected.map((file) => URL.createObjectURL(file));
    previews.forEach(URL.revokeObjectURL);
    setPreviews(newPreviews);
  };

  const handleRemoveBoleta = (index) => {
    const updatedFiles = [...files];
    const updatedPreviews = [...previews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    if (updatedFiles.length === 0) {
      setTableData([]);
      setShowTable(false);
    }
  };

  const handleExtract = async () => {
    // ... (lógica de handleExtract sin cambios) ...
     if (!files.length) {
      alert("Por favor, selecciona al menos un archivo.");
      return;
    }
    setLoading(true);
    setTableData([]);
    setShowTable(false);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const baseURL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${baseURL}/extract_multi`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        let errorDetail = `Error HTTP: ${res.status} ${res.statusText}`;
        try { const errorJson = await res.json(); errorDetail = errorJson.detail || errorDetail; } catch (jsonError) {}
        throw new Error(errorDetail);
      }
      const result = await res.json();
      setTableData(result.results || []);
      if (result.results && result.results.length > 0) { setShowTable(true); }
    } catch (error) {
      console.error("Error al extraer datos:", error);
      alert(`Ocurrió un error al extraer los datos: ${error.message}`);
      setTableData([]);
      setShowTable(false);
    }
    setLoading(false);
  };

  const handleExport = async () => {
    // ... (lógica de handleExport sin cambios) ...
    if (!tableData.length) { alert("No hay datos para exportar."); return; }
    const dataToSend = { results: tableData };
    const extractedDataString = JSON.stringify(dataToSend);
    const formData = new FormData();
    formData.append("extracted_results", extractedDataString);

    try {
      const baseURL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseURL}/export`, { method: "POST", body: formData });
      if (!response.ok) {
        let errorDetail = `Error HTTP ${response.status}: ${response.statusText}`;
        try { const errorJson = await response.json(); errorDetail = errorJson.detail || errorDetail; } catch(e) {}
        throw new Error(errorDetail);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "extraccion_comprobantes.xlsx";
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      alert(`Ocurrió un error al exportar los datos: ${error.message}`);
    }
  };

  // --- Renderizado de la Tabla (sin cambios en lógica, solo en clases contenedor) ---
  const renderTable = () => {
    const headers = [ "Archivo", "Fecha y Hora", "Origen", "Destino", "Asunto / Descripción", "Monto", "Estado", "ID Operacion", "Error Extraccion" ];
    return (
      // El overflow-x-auto es clave para responsive en tablas
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm md:text-base text-gray-900"> {/* Ajuste tamaño fuente base */}
          <thead>
            <tr className="border-b border-gray-300">
              {headers.map((header, idx) => (
                <th key={idx} className="py-2 md:py-3 px-3 md:px-4 text-left font-semibold whitespace-nowrap"> {/* Menos padding en móvil */}
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, idx) => {
              const data = item.extracted_data || {};
              const hasError = !!data.error;
              let displayFechaHora = "-";
              if (!hasError && (data.fecha || data.hora)) { displayFechaHora = `${data.fecha || ''} ${data.hora || ''}`.trim(); }
              let displayOrigen = "-";
               if (!hasError) { const remitente = data.remitente || {}; displayOrigen = remitente.nombre || data.banco_origen_app || remitente.banco || remitente.rut || "-"; }
               let displayDestino = "-";
               if (!hasError) { const destinatario = data.destinatario || {}; displayDestino = destinatario.nombre || destinatario.banco || destinatario.rut || "-"; }

              return (
                <motion.tr key={item.filename + idx} /* ... animaciones ... */
                  className={`border-b border-gray-300 transition-colors ${hasError ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-gray-100'}`}
                >
                  <td className="py-2 md:py-3 px-3 md:px-4 whitespace-nowrap">{item.filename || `Fila ${idx + 1}`}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 whitespace-nowrap">{displayFechaHora}</td>
                  {/* Permitir wrap para Origen/Destino/Asunto en móvil */}
                  <td className="py-2 md:py-3 px-3 md:px-4 min-w-[150px]">{displayOrigen}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 min-w-[150px]">{displayDestino}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 min-w-[200px]">{hasError ? '-' : (data.asunto || "-")}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 whitespace-nowrap">{hasError ? '-' : formatCurrency(data.monto)}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 whitespace-nowrap">{hasError ? '-' : (data.estado || "-")}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4">{hasError ? '-' : (data.codigo_transaccion || "-")}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 text-red-600 font-medium">{hasError ? data.error : "-"}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };


  return (
    <>
      {/* Fondo animado (sin cambios) */}
      <style>{`/* ... estilos ... */`}</style>
      <div className="absolute inset-0 bg-animated -z-20"></div>

      {/* Contenedor Principal con Padding Responsivo */}
      <div className="min-h-screen w-screen overflow-x-hidden flex flex-col items-center justify-start relative pt-20 md:pt-24 pb-10 px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-10 text-white"> {/* Padding ajustado, justify-start */}

        {/* Título Responsivo */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg text-center mt-4 md:mt-0" // Ajuste tamaño fuente y margen
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Extracción de Boletas
        </motion.h1>

        {/* Sección de carga Responsiva */}
        <motion.div
          className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-md flex flex-col items-center" // Padding ajustado
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <label
            htmlFor="fileInput"
            className="text-base sm:text-lg font-medium mb-2 text-gray-900 text-center" // Ajuste tamaño fuente
          >
            Sube tus boletas (máx. 10)
          </label>
          {/* Input file con mejor estilo responsive */}
          <input
            id="fileInput"
            type="file"
            multiple
            accept="image/*" // Aceptar solo imágenes
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4 cursor-pointer"
          />
          <button
            onClick={handleExtract}
            disabled={loading || files.length === 0} // Deshabilitar si no hay archivos
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" // Padding/tamaño ajustado
          >
            {loading ? "Extrayendo..." : "Extraer Datos"}
          </button>
        </motion.div>

        {/* Previews con Grid Responsivo */}
        {previews.length > 0 && (
          <motion.div
            // Ajustar columnas: 2 en móvil, 3 en sm, 4 en md, 5 en lg
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full max-w-5xl" // Ajuste de gap y columnas
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {previews.map((src, idx) => (
              <motion.div
                key={idx}
                className="relative aspect-video sm:aspect-square" // Proporción para consistencia
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <img
                  src={src}
                  alt={`Boleta ${idx + 1}`}
                  // Altura fija menor en móvil, object-cover para llenar
                  className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg"
                />
                {/* Posición y tamaño de texto ajustados */}
                <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black bg-opacity-60 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full">
                  Boleta {idx + 1}
                </div>
                <button
                  onClick={() => handleRemoveBoleta(idx)}
                  // Tamaño y posición ajustados
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-600 text-white w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-xs sm:text-sm hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  aria-label={`Quitar Boleta ${idx + 1}`} // Accesibilidad
                >
                  X
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tabla de Resultados Responsiva */}
        {tableData.length > 0 && showTable && (
          <motion.div
            // Ancho completo en móvil, max-w en pantallas grandes
            className="w-full max-w-7xl bg-white bg-opacity-95 backdrop-blur-md rounded-xl md:rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 overflow-hidden mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4"> {/* Justify-between */}
              {/* Título de tabla responsivo */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Datos Extraídos
              </h2>
              {/* Botón cerrar más pequeño en móvil */}
              <button
                onClick={() => setShowTable(false)}
                className="bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white font-bold py-1 px-3 sm:py-1 sm:px-4 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                X
              </button>
            </div>
            {/* Renderiza la tabla con su propio scroll */}
            {renderTable()}
          </motion.div>
        )}

        {/* Botón Mostrar Tabla Responsivo */}
        {!showTable && tableData.length > 0 && (
          <button
            onClick={() => setShowTable(true)}
            // Padding/tamaño ajustado
            className="px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-full shadow-md transition-all duration-300 hover:scale-105"
          >
            Mostrar tabla
          </button>
        )}

        {/* Botón Exportar Responsivo */}
        {tableData.length > 0 && showTable && (
          <motion.button
            onClick={handleExport}
            // Margen superior, padding/tamaño ajustado
            className="mt-6 sm:mt-8 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Exportar a Excel
          </motion.button>
        )}
      </div>
    </>
  );
}

export default Home;