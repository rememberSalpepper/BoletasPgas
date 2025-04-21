"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Particles } from "@/components/particles";
import { FileUploader } from "@/components/file-uploader";
import { ResultsTable } from "@/components/results-table";
import { Loader2, FileText } from "lucide-react";
import Image from "next/image";

const ASSET_PREFIX = '/pgapps/boletas';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    if (selectedFiles.length + files.length > 10) {
      alert("Máximo 10 boletas.");
      return;
    }
    const currentFiles = [...files];
    const currentPreviews = [...previews];
    const addedFiles: File[] = [];
    const addedPreviewsMap: Record<string, string> = {};
    selectedFiles.forEach((file) => {
      const fileKey = `${file.name}-${file.size}`;
      if (!currentFiles.some((f) => `${f.name}-${f.size}` === fileKey)) {
        addedFiles.push(file);
        addedPreviewsMap[fileKey] = URL.createObjectURL(file);
      }
    });
    const finalFiles = [...currentFiles, ...addedFiles];
    const finalPreviews = finalFiles.map((file) => {
       const fileKey = `${file.name}-${file.size}`;
       const existingPreview = currentPreviews.find((p, i) => `${currentFiles[i]?.name}-${currentFiles[i]?.size}` === fileKey);
       return existingPreview || addedPreviewsMap[fileKey];
    });
     currentPreviews.forEach((previewUrl, i) => {
        if (currentFiles[i] && !finalFiles.some(f => f.name === currentFiles[i].name && f.size === currentFiles[i].size)) {
             URL.revokeObjectURL(previewUrl);
        }
    });
    setFiles(finalFiles);
    setPreviews(finalPreviews);
  };

  const handleRemoveBoleta = (index: number) => {
    const updatedFiles = [...files];
    const updatedPreviews = [...previews];
    if (updatedPreviews[index]) {
      URL.revokeObjectURL(updatedPreviews[index]);
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

  const handleExtract = async () => {
    if (files.length === 0) return;
    setIsLoading(true);
    setResults([]); // Limpiar resultados anteriores
    setShowTable(false);
    try {
      const formData = new FormData();
      let apiUrl = "";
      let requiresMulti = files.length > 1;

      if (requiresMulti) {
        files.forEach((file) => formData.append("files", file));
        apiUrl = "/api/extract-multi";
      } else {
        formData.append("file", files[0]);
        apiUrl = "/api/extract";
      }

      const response = await fetch(apiUrl, { method: "POST", body: formData });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Error HTTP ${response.status}` }));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      // Normalizar la respuesta para que 'results' siempre sea un array
      setResults(requiresMulti ? (data.results || []) : [data]);
      if ((requiresMulti && data.results?.length > 0) || (!requiresMulti && data)) {
          setShowTable(true);
      }

    } catch (error) {
      console.error("Error scanning files:", error);
      alert(`Error al procesar las boletas: ${error instanceof Error ? error.message : String(error)}`);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (results.length === 0) { alert("No hay resultados para exportar."); return; }
    try {
      const formData = new FormData();
      // Enviar la estructura que espera el backend { "results": [...] }
      // Asegurándose de que cada item en results tenga la estructura { filename: ..., extracted_data: ... }
      // Si tu estado `results` ya tiene esa estructura por `extract-multi`, perfecto.
      // Si viene de `extract` (único), `handleExtract` lo puso en un array `[data]`,
      // pero 'data' puede ser directamente el objeto gemini_data. Necesitamos asegurar la estructura.
      const formattedResults = results.map(item => {
          if (item && item.filename && item.extracted_data) {
              return item; // Ya tiene el formato correcto (probablemente de extract-multi)
          } else if (item && !item.filename && !item.error) {
               // Asume que es el resultado directo de /extract (solo gemini_data)
               // Intenta obtener el nombre del archivo original si es posible
               const originalFile = files.find((f, i) => i === results.indexOf(item)); // Encuentra el archivo correspondiente
               return { filename: originalFile?.name || `resultado_${results.indexOf(item) + 1}`, extracted_data: item };
          } else {
               // Es un item con error o formato inesperado
               return { filename: item?.filename || `error_${results.indexOf(item) + 1}`, extracted_data: { error: item?.error || "Formato desconocido" } };
          }
      });

      formData.append("extracted_results", JSON.stringify({ results: formattedResults }));

      const response = await fetch("/api/export", { method: "POST", body: formData });
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ error: `Error HTTP ${response.status}` }));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "extraccion_comprobantes.xlsx";
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert(`Error al exportar a Excel: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 }}};
  const itemVariants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 }};

  return (
    <>
      <div className="fixed inset-0 bg-animated -z-20"></div>
      <Particles className="fixed inset-0 -z-10" quantity={100} />

      <div className="min-h-screen w-full flex flex-col items-center justify-center relative pt-20 sm:pt-24 pb-10 px-4 space-y-6 sm:space-y-8 text-white">

        <motion.div
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
          className="text-center"
        >
          <motion.h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold drop-shadow-lg text-center" >
            Extracción de Boletas
          </motion.h1>
          <motion.p className="mt-3 sm:mt-4 text-lg sm:text-xl text-white/80 max-w-xl mx-auto" >
            Sube tus comprobantes y extrae la información automáticamente
          </motion.p>
        </motion.div>

        <motion.div
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-md flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4 gap-3">
            <Image
              src={`${ASSET_PREFIX}/images/logo.png`}
              alt="Logo"
              width={40} height={40}
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
            />
            <label className="text-base sm:text-lg font-medium text-gray-900 text-center">Sube tus boletas (máx. 10)</label>
          </div>

          <FileUploader onFilesSelected={handleFilesSelected} />

          <motion.button
            onClick={handleExtract} disabled={isLoading || files.length === 0}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-5 flex items-center justify-center"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
          >
            {isLoading ? ( <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Extrayendo...</> )
                       : ( <><FileText className="mr-2 h-5 w-5" /> Extraer Datos</> )}
          </motion.button>
        </motion.div>

        {previews.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full max-w-5xl"
            variants={containerVariants} initial="hidden" animate="visible"
          >
            {previews.map((src, idx) => (
              <motion.div key={idx} className="relative aspect-w-4 aspect-h-3 group" variants={itemVariants}>
                <Image
                  src={src || "/placeholder.svg"} // Usa src directamente, ya es un ObjectURL
                  alt={`Boleta ${idx + 1}`}
                  fill // Usa fill para llenar el contenedor aspect-ratio
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" // Ayuda a optimizar
                  className="object-cover rounded-xl shadow-lg border-2 border-white/20" // object-cover con fill
                />
                <div className="absolute bottom-1.5 left-1.5 bg-black bg-opacity-70 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                   {files[idx]?.name ? (files[idx].name.length > 15 ? files[idx].name.substring(0,12)+'...' : files[idx].name) : `Boleta ${idx+1}`} {/* Mostrar nombre corto */}
                </div>
                <motion.button
                  onClick={() => handleRemoveBoleta(idx)}
                  className="absolute top-1.5 right-1.5 bg-red-600/70 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold hover:bg-red-700/90 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  aria-label={`Quitar ${files[idx]?.name || `Boleta ${idx + 1}`}`}
                  whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {results.length > 0 && showTable && (
          <motion.div
             className="w-full max-w-7xl" // Ajusta max-w si es necesario
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: "spring" }}
           >
            <div className="flex justify-between items-center mb-4 px-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white/90">Resultados Extraídos</h2>
               <motion.button
                 onClick={() => setShowTable(false)} // Añadir botón para ocultar tabla
                 className="bg-gradient-to-r from-slate-500/70 to-gray-600/70 hover:from-slate-600 hover:to-gray-700 text-white font-bold py-1.5 px-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 text-sm"
                 whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
               >
                 Ocultar Tabla
               </motion.button>
            </div>
            <ResultsTable results={results} /> {/* Pasa los resultados al componente de tabla */}
           </motion.div>
        )}

        {!showTable && results.length > 0 && (
          <motion.button onClick={() => setShowTable(true)} className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3, type: "spring" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} >
            Mostrar tabla
          </motion.button>
        )}

         {/* Botón Exportar visible solo si hay resultados */}
         {results.length > 0 && (
           <motion.button
             onClick={handleExport}
             className="mt-6 sm:mt-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
           >
             Exportar a Excel
           </motion.button>
         )}

      </div>
    </>
  )
}