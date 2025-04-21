'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Helper para formatear moneda (CLP sin decimales)
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) return "-";
  return `$ ${Number(value).toLocaleString("es-CL")}`;
};

function Home() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [tableData, setTableData] = useState([]); // Almacenará [{filename: '...', extracted_data: {...}}, ...]
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false); // Empezar oculta hasta tener datos

  // Verificar API URL (solo para depuración local)
  useEffect(() => {
    console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
  }, []);

  // Manejar selección de archivos
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return; // No hacer nada si no se seleccionan archivos

    if (selected.length + files.length > 10) {
      alert("Máximo 10 boletas permitidas en total.");
      // Limpiar selección para evitar confusión
      e.target.value = null;
      return;
    }
    const currentFiles = [...files]; // Copia estado actual
    const currentPreviews = [...previews]; // Copia estado actual

    const addedFiles = [];
    const addedPreviews = [];

    selected.forEach(file => {
        // Evitar duplicados (opcional, basado en nombre y tamaño)
        if (!currentFiles.some(f => f.name === file.name && f.size === file.size)) {
            addedFiles.push(file);
            addedPreviews.push(URL.createObjectURL(file));
        } else {
            console.warn(`Archivo duplicado omitido: ${file.name}`);
        }
    });

    // Limpiar URLs de objeto anteriores *solo si se añadieron nuevos* para evitar parpadeo
    if(addedFiles.length > 0) {
        // previews.forEach(URL.revokeObjectURL); // Podría ser muy agresivo si no se remueven archivos
    }


    setFiles([...currentFiles, ...addedFiles]);
    setPreviews([...currentPreviews, ...addedPreviews]);

    // Limpiar el input para permitir volver a seleccionar el mismo archivo si se quitó
    e.target.value = null;
  };

  // Quitar una boleta específica
  const handleRemoveBoleta = (index) => {
    const updatedFiles = [...files];
    const updatedPreviews = [...previews];

    if (updatedPreviews[index]) {
        URL.revokeObjectURL(updatedPreviews[index]); // Limpiar memoria
    }

    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);

    if (updatedFiles.length === 0) {
      setTableData([]);
      setShowTable(false);
    }
  };

  // Llamar a la API para extraer datos
  const handleExtract = async () => {
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
      const baseURL = import.meta.env.VITE_API_URL || '/api'; // Fallback
      const res = await fetch(`${baseURL}/extract_multi`, { method: "POST", body: formData });

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

  // Exportar los datos a Excel
  const handleExport = async () => {
    if (!tableData.length) { alert("No hay datos para exportar."); return; }
    const dataToSend = { results: tableData };
    const extractedDataString = JSON.stringify(dataToSend);
    const formData = new FormData();
    formData.append("extracted_results", extractedDataString);
    try {
      const baseURL = import.meta.env.VITE_API_URL || '/api';
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

  // Función para renderizar la tabla de resultados
  const renderTable = () => {
    const headers = [ "Archivo", "Fecha y Hora", "Origen", "Destino", "Asunto / Descripción", "Monto", "Estado", "ID Operacion", "Error Extraccion" ];
    return (
      <div className="mt-4 overflow-x-auto rounded-lg shadow bg-white/80 backdrop-blur-sm"> {/* Fondo semi-transparente a la tabla */}
        <table className="min-w-full text-sm md:text-base text-gray-900">
          <thead className="bg-gray-100/80"> {/* Header también semi-transparente */}
            <tr className="border-b-2 border-gray-300">
              {headers.map((header, idx) => (
                <th key={idx} className="py-3 px-3 md:px-4 text-left font-semibold whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tableData.map((item, idx) => {
              const data = item.extracted_data || {};
              const hasError = !!data.error;
              let displayFechaHora = "-";
              if (!hasError && (data.fecha || data.hora)) { displayFechaHora = `${data.fecha || ''} ${data.hora || ''}`.trim() || '-'; }
              let displayOrigen = "-";
               if (!hasError) { const remitente = data.remitente || {}; displayOrigen = remitente.nombre || data.banco_origen_app || remitente.banco || remitente.rut || "-"; }
               let displayDestino = "-";
               if (!hasError) { const destinatario = data.destinatario || {}; displayDestino = destinatario.nombre || destinatario.banco || destinatario.rut || "-"; }

              return (
                <motion.tr
                  key={item.filename + idx}
                  className={`transition-colors duration-150 ${hasError ? 'bg-red-100/80 hover:bg-red-200/80' : 'bg-white/70 hover:bg-gray-50/70'}`} // Fondos semi-transparentes
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05, duration: 0.3 }}
                >
                  <td className="py-2 md:py-3 px-3 md:px-4 whitespace-nowrap">{item.filename || `Fila ${idx + 1}`}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 whitespace-nowrap">{displayFechaHora}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 min-w-[150px]">{displayOrigen}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 min-w-[150px]">{displayDestino}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 min-w-[200px]">{hasError ? '-' : (data.asunto || "-")}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 whitespace-nowrap text-right font-medium">{hasError ? '-' : formatCurrency(data.monto)}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 whitespace-nowrap">{hasError ? '-' : (data.estado || "-")}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4">{hasError ? '-' : (data.codigo_transaccion || "-")}</td>
                  <td className="py-2 md:py-3 px-3 md:px-4 text-red-700 font-medium">{hasError ? data.error : "-"}</td>{/* Texto error más oscuro */}
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
      {/* Fondo animado fijo */}
      <div className="fixed inset-0 bg-animated -z-20"></div>

      {/* Contenedor Principal Centrado y con Padding para Navbar */}
      {/* Clases clave: min-h-screen, flex, flex-col, items-center, justify-center, relative, pt-... */}
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative pt-24 sm:pt-28 md:pt-32 pb-10 px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-10 text-white">
        {/* === AJUSTA ESTE PADDING TOP (pt-...) SEGÚN LA ALTURA DE TU NAVBAR === */}
        {/* Ejemplo: pt-20 = 5rem, pt-24 = 6rem, pt-28 = 7rem, pt-32 = 8rem */}

        {/* Título */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg text-center"
          initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        >
          Extracción de Boletas
        </motion.h1>

        {/* Sección de Carga */}
        <motion.div
          className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-md flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
        >
           <label htmlFor="fileInput" className="text-base sm:text-lg font-medium mb-2 text-gray-900 text-center"> Sube tus boletas (máx. 10) </label>
           <input id="fileInput" type="file" multiple accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4 cursor-pointer" />
           <button onClick={handleExtract} disabled={loading || files.length === 0} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
               {loading ? "Extrayendo..." : "Extraer Datos"}
           </button>
        </motion.div>

        {/* Previews */}
        {previews.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full max-w-5xl"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
          >
            {previews.map((src, idx) => (
              <motion.div key={idx} className="relative aspect-video sm:aspect-square" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} >
                <img src={src} alt={`Boleta ${idx + 1}`} className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg border-2 border-white/30" /> {/* Borde sutil */}
                <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-black bg-opacity-70 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full backdrop-blur-sm"> Boleta {idx + 1} </div>
                <button onClick={() => handleRemoveBoleta(idx)} className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-red-600/80 text-white w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold hover:bg-red-700/90 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 backdrop-blur-sm" aria-label={`Quitar Boleta ${idx + 1}`} >✕</button> {/* Icono X más claro */}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tabla de Resultados */}
        {tableData.length > 0 && showTable && (
          <motion.div
            className="w-full max-w-7xl rounded-xl md:rounded-2xl shadow-2xl overflow-hidden mb-8" // Quitar fondo aquí, se maneja en el div de renderTable
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 bg-white/90 backdrop-blur-md rounded-t-xl md:rounded-t-2xl"> {/* Header separado con fondo */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900"> Datos Extraídos </h2>
              <button onClick={() => setShowTable(false)} className="bg-gradient-to-r from-red-500/80 to-red-400/80 hover:from-red-600 hover:to-red-500 text-white font-bold py-1 px-3 sm:py-1 sm:px-4 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105" > X </button>
            </div>
            {renderTable()}
          </motion.div>
        )}

        {/* Botón Mostrar Tabla */}
        {!showTable && tableData.length > 0 && (
          <button onClick={() => setShowTable(true)} className="px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-full shadow-md transition-all duration-300 hover:scale-105" > Mostrar tabla </button>
        )}

        {/* Botón Exportar */}
        {tableData.length > 0 && showTable && (
          <motion.button onClick={handleExport} className="mt-6 sm:mt-8 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} > Exportar a Excel </motion.button>
        )}
      </div>
    </>
  );
}

export default Home;