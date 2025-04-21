'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Helper para formatear moneda (CLP sin decimales)
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) return "-";
  // Formato chileno con separador de miles, sin decimales
  return `$ ${Number(value).toLocaleString("es-CL")}`;
};

function Home() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [tableData, setTableData] = useState([]); // Almacenará [{filename: '...', extracted_data: {...}}, ...]
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false); // Empezar oculta hasta tener datos
  const [fileNames, setFileNames] = useState("No files selected."); // State para nombres

  // Verificar API URL (solo para depuración local)
  useEffect(() => {
    console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
  }, []);

  // Actualizar nombres de archivo cuando cambie `files`
  useEffect(() => {
    if (files.length === 0) {
      setFileNames("No files selected.");
    } else if (files.length === 1) {
      setFileNames(files[0].name);
    } else {
      setFileNames(`${files.length} files selected.`);
    }
  }, [files]); // Dependencia: files


  // Manejar selección de archivos (con actualización de fileNames)
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;

    if (selected.length + files.length > 10) {
      alert("Máximo 10 boletas permitidas en total.");
      e.target.value = null;
      return;
    }

    const currentFiles = [...files];
    const currentPreviews = [...previews]; // Mantenemos los previews actuales
    const addedFiles = [];
    const addedPreviewsMap = {}; // Usar mapa para evitar duplicados de preview

    selected.forEach(file => {
      const fileKey = `${file.name}-${file.size}`; // Clave única por archivo
      if (!currentFiles.some(f => `${f.name}-${f.size}` === fileKey)) {
        addedFiles.push(file);
        addedPreviewsMap[fileKey] = URL.createObjectURL(file);
      } else {
        console.warn(`Archivo duplicado omitido: ${file.name}`);
      }
    });

    // Crear el nuevo array de previews en orden
    const finalFiles = [...currentFiles, ...addedFiles];
    const finalPreviews = finalFiles.map(file => {
        const fileKey = `${file.name}-${file.size}`;
        // Buscar en previews actuales o nuevos
        const existingPreview = currentPreviews.find((p, i) => `${currentFiles[i]?.name}-${currentFiles[i]?.size}` === fileKey);
        return existingPreview || addedPreviewsMap[fileKey];
    });

    // Limpiar los previews que ya no están en la lista final (si los hubiera)
    currentPreviews.forEach((previewUrl, i) => {
        const fileKey = `${currentFiles[i]?.name}-${currentFiles[i]?.size}`;
        if (!finalFiles.some(f => `${f.name}-${f.size}` === fileKey)) {
            URL.revokeObjectURL(previewUrl);
        }
    });


    setFiles(finalFiles);
    setPreviews(finalPreviews);

    // Limpiar el input para permitir reselección
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
      const baseURL = import.meta.env.VITE_API_URL || '/api'; // Usar /api como fallback
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
      <div className="mt-4 overflow-x-auto rounded-lg shadow bg-white/80 backdrop-blur-sm">
        <table className="min-w-full text-sm md:text-base text-gray-900">
          <thead className="bg-gray-100/80">
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
                  key={item.filename + idx} // Key más robusta
                  className={`transition-colors duration-150 ${hasError ? 'bg-red-50/80 hover:bg-red-100/80' : 'bg-white/70 hover:bg-gray-50/70'}`}
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
                  <td className="py-2 md:py-3 px-3 md:px-4 text-red-700 font-medium">{hasError ? data.error : "-"}</td>
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
      <style>{`
        .bg-animated { background: linear-gradient(270deg, #20DBC8, #0CA0D9, #005FD9); background-size: 600% 600%; animation: gradientAnimation 12s ease infinite; }
        @keyframes gradientAnimation { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      `}</style>
      <div className="fixed inset-0 bg-animated -z-20"></div>

      {/* Contenedor Principal Centrado y con Padding para Navbar */}
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative pt-24 sm:pt-28 md:pt-32 pb-10 px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-8 text-white">
        {/* === AJUSTA ESTE PADDING TOP (pt-...) SEGÚN LA ALTURA DE TU NAVBAR === */}
        {/* Ejemplo: pt-20 (5rem), pt-24 (6rem), pt-28 (7rem), pt-32 (8rem) */}

        {/* Título */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold drop-shadow-lg text-center"
          initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        >
          Extracción de Boletas
        </motion.h1>

        {/* Sección de Carga con Input Estilizado */}
        <motion.div
          className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-lg flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
        >
           <label className="text-base sm:text-lg font-medium mb-4 text-gray-900 text-center">
             Sube tus boletas (máx. 10)
           </label>

           {/* Input File Oculto + Botón Personalizado */}
           <label htmlFor="fileInput" className="w-full mb-4 cursor-pointer group"> {/* Añadido group para hover */}
             <div className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 bg-white group-hover:border-blue-400 transition-colors"> {/* Hover effect */}
                 <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold px-4 py-1 rounded-md">
                     Choose Files
                 </span>
                 <span className="text-sm text-gray-500 ml-3 truncate">
                     {fileNames}
                 </span>
             </div>
           </label>
           <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*" // Aceptar solo imágenes
                onChange={handleFileChange} // Usar la función original ahora que fileNames se actualiza con useEffect
                className="hidden"
            />

           <button
             onClick={handleExtract}
             disabled={loading || files.length === 0}
             className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading ? "Extrayendo..." : "Extraer Datos"}
           </button>
        </motion.div>

        {/* Previews */}
        {previews.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full max-w-6xl" // Ajustado max-w
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
          >
            {previews.map((src, idx) => (
              <motion.div
                key={idx} // Usar solo idx si los archivos no tienen id único estable
                className="relative aspect-w-4 aspect-h-3 group" // Proporción 4:3, añadido group para hover botón X
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
               >
                <img src={src} alt={`Boleta ${idx + 1}`} className="w-full h-full object-cover rounded-lg md:rounded-xl shadow-lg border-2 border-white/30" />
                <div className="absolute bottom-1.5 left-1.5 bg-black bg-opacity-70 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm"> Boleta {idx + 1} </div>
                {/* Botón X visible solo en hover del contenedor (group-hover) */}
                <button
                    onClick={() => handleRemoveBoleta(idx)}
                    className="absolute top-1.5 right-1.5 bg-red-600/70 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold hover:bg-red-700/90 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    aria-label={`Quitar Boleta ${idx + 1}`}
                >
                    ✕
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tabla de Resultados */}
        {tableData.length > 0 && showTable && (
          <motion.div
            className="w-full max-w-7xl rounded-xl md:rounded-2xl shadow-2xl overflow-hidden mb-8"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-white/90 backdrop-blur-md rounded-t-xl md:rounded-t-2xl border-b border-gray-200"> {/* Header separado */}
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