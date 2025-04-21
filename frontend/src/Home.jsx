'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Helper moneda (sin cambios)
const formatCurrency = (value) => { /* ... */ };

function Home() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  // No necesitamos fileNames state si usamos el input estilizado con file:

  useEffect(() => { /* ... */ }, []);
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    // ... (misma lógica de validación y manejo de archivos/previews que antes) ...
    if (selected.length === 0) return;
    if (selected.length + files.length > 10) { alert("Máximo 10 boletas."); e.target.value = null; return; }
    const currentFiles = [...files]; const currentPreviews = [...previews];
    const addedFiles = []; const addedPreviews = [];
    selected.forEach(file => {
      if (!currentFiles.some(f => f.name === file.name && f.size === file.size)) {
        addedFiles.push(file); addedPreviews.push(URL.createObjectURL(file));
      }
    });
    const finalFiles = [...currentFiles, ...addedFiles];
    const finalPreviews = finalFiles.map(file => {
        const existingPreview = currentPreviews.find((p, i) => currentFiles[i]?.name === file.name && currentFiles[i]?.size === file.size);
        const newPreview = addedPreviews.find((p, i) => addedFiles[i]?.name === file.name && addedFiles[i]?.size === file.size);
        return existingPreview || newPreview;
    });
     // Limpiar previews viejos si es necesario (puede omitirse por simplicidad)
    currentPreviews.forEach((previewUrl, i) => {
        if (!finalFiles.some(f => f.name === currentFiles[i]?.name && f.size === currentFiles[i]?.size)) {
             URL.revokeObjectURL(previewUrl);
        }
    });
    setFiles(finalFiles); setPreviews(finalPreviews);
    e.target.value = null;
   };
  const handleRemoveBoleta = (index) => { /* ... (Sin cambios lógicos) ... */ };
  const handleExtract = async () => { /* ... (Sin cambios lógicos) ... */ };
  const handleExport = async () => { /* ... (Sin cambios lógicos) ... */ };
  const renderTable = () => { /* ... (Función sin cambios lógicos, solo estilos internos como antes) ... */ };

  return (
    <>
      {/* Fondo animado fijo */}
      <style>{`/* ... estilos fondo ... */`}</style>
      <div className="fixed inset-0 bg-animated -z-20"></div>

      {/* Contenedor Principal Centrado */}
      {/* Clave: justify-center funciona ahora que body no interfiere */}
      {/* Clave: Ajustar pt-... según altura REAL de tu Navbar final */}
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative pt-20 pb-10 px-4 space-y-8 text-white">
         {/* === AJUSTA pt-20 (5rem) A LA ALTURA DE TU NAVBAR === */}
         {/* Ejemplo: si mide 64px (4rem), pt-16 o pt-20 está bien */}

        {/* Título más grande en móvil */}
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold drop-shadow-lg text-center"
          initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        >
          Extracción de Boletas
        </motion.h1>

        {/* Sección de Carga */}
        <motion.div
          className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col items-center" // Padding uniforme
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
        >
           <label className="text-lg font-medium mb-4 text-gray-900 text-center"> {/* Tamaño de texto base */}
             Sube tus boletas (máx. 10)
           </label>

           {/* --- Input File Estilizado con Tailwind --- */}
           <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm mb-4 cursor-pointer
                           text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-blue-100 file:text-blue-700
                           hover:file:bg-blue-200" // Estilos directos para el input
            />
           {/* ------------------------------------------- */}

           <button
             onClick={handleExtract}
             disabled={loading || files.length === 0}
             className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading ? "Extrayendo..." : "Extraer Datos"}
           </button>
        </motion.div>

        {/* Previews (Más grandes en móvil) */}
        {previews.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full max-w-5xl" // Gap uniforme
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
          >
            {previews.map((src, idx) => (
              <motion.div
                key={idx}
                className="relative aspect-w-4 aspect-h-3 group" // Proporción 4:3
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
               >
                 {/* Imágenes un poco más grandes */}
                <img src={src} alt={`Boleta ${idx + 1}`} className="w-full h-full object-cover rounded-xl shadow-lg border-2 border-white/30" />
                <div className="absolute bottom-1.5 left-1.5 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded-full backdrop-blur-sm"> Boleta {idx + 1} </div>
                <button onClick={() => handleRemoveBoleta(idx)} className="absolute top-1.5 right-1.5 bg-red-600/70 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold hover:bg-red-700/90 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50" aria-label={`Quitar Boleta ${idx + 1}`} >✕</button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tabla de Resultados (sin cambios lógicos) */}
        {tableData.length > 0 && showTable && (
           <motion.div /* ... */ >
             {/* ... header tabla ... */}
             {renderTable()} {/* Asegúrate que renderTable tenga estilos responsivos internos si es necesario */}
           </motion.div>
        )}

        {/* Botones Mostrar/Exportar (sin cambios lógicos) */}
        {!showTable && tableData.length > 0 && ( <button /* ... */ > Mostrar tabla </button> )}
        {tableData.length > 0 && showTable && ( <motion.button /* ... */ > Exportar a Excel </motion.button> )}
      </div>
    </>
  );
}

export default Home;