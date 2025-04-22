"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Particles } from "@/components/particles";
import { FileUploader } from "@/components/file-uploader";
import { ResultsTable } from "@/components/results-table";
import { Loader2, FileText } from "lucide-react";
import NextImage from "next/image";

const ASSET_PREFIX = "/pgapps/boletas";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (!selectedFiles.length) return;
    if (selectedFiles.length + files.length > 10) {
      alert("Máximo 10 boletas.");
      return;
    }
    const cf = [...files],
      cp = [...previews];
    const added: File[] = [],
      mapP: Record<string, string> = {};

    selectedFiles.forEach((f) => {
      const key = `${f.name}-${f.size}`;
      if (!cf.some((x) => `${x.name}-${x.size}` === key)) {
        added.push(f);
        mapP[key] = URL.createObjectURL(f);
      }
    });

    const finalFiles = [...cf, ...added];
    const finalPreviews = finalFiles.map((f) => {
      const key = `${f.name}-${f.size}`;
      const exist = cp.find((p, i) => `${cf[i]?.name}-${cf[i]?.size}` === key);
      return exist || mapP[key];
    });

    cp.forEach((u, i) => {
      if (
        cf[i] &&
        !finalFiles.some((f) => f.name === cf[i].name && f.size === cf[i].size)
      ) {
        URL.revokeObjectURL(u);
      }
    });

    setFiles(finalFiles);
    setPreviews(finalPreviews);
  };

  const handleRemoveBoleta = (idx: number) => {
    const nf = [...files],
      np = [...previews];
    if (np[idx]) URL.revokeObjectURL(np[idx]);
    nf.splice(idx, 1);
    np.splice(idx, 1);
    setFiles(nf);
    setPreviews(np);
    if (!nf.length) {
      setResults([]);
      setShowTable(false);
    }
  };

  const handleExtract = async () => {
    if (!files.length) return;
    setIsLoading(true);
    setResults([]);
    setShowTable(false);
    try {
      const fd = new FormData();
      const multi = files.length > 1;
      const urlPath = multi ? "extract-multi" : "extract";
      if (multi) files.forEach((f) => fd.append("files", f));
      else fd.append("file", files[0]);

      const res = await fetch(`${ASSET_PREFIX}/api/${urlPath}`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Error ${res.status}` }));
        throw new Error(err.error);
      }
      const json = await res.json();
      const out = multi ? json.results || [] : [json];
      setResults(out);
      setShowTable(true);
    } catch (e) {
      console.error("Error scanning files:", e);
      alert(
        `Error al procesar las boletas: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!results.length) {
      alert("No hay resultados para exportar.");
      return;
    }
    try {
      const fd = new FormData();
      const formatted = results.map((item, i) => {
        if (item.filename && item.extracted_data) return item;
        if (typeof item === "object" && !item.error) {
          return { filename: files[i]?.name || `resultado_${i + 1}`, extracted_data: item };
        }
        return {
          filename: item.filename || `error_${i + 1}`,
          extracted_data: { error: item.error || "Formato desconocido" },
        };
      });
      fd.append("extracted_results", JSON.stringify({ results: formatted }));

      const res = await fetch(`${ASSET_PREFIX}/api/export`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Error ${res.status}` }));
        throw new Error(err.error);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "extraccion_comprobantes.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error exporting:", e);
      alert(
        `Error al exportar a Excel: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  };

  return (
    <>
      {/* Fondo y partículas */}
      <div className="fixed inset-0 bg-animated -z-20" />
      <Particles className="fixed inset-0 -z-10" quantity={100} />

      <div className="min-h-screen w-full flex flex-col items-center justify-center pt-20 pb-10 px-4 space-y-6 text-white">
        {/* Header + uploader */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold drop-shadow-lg">
            Extracción de Boletas
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-white/80 max-w-xl mx-auto">
            Sube tus comprobantes y extrae la información automáticamente
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-md flex flex-col items-center"
        >
          <div className="flex items-center justify-center mb-4 gap-3">
            <NextImage
              src={`${ASSET_PREFIX}/images/logo.png`}
              alt="Logo"
              width={40}
              height={40}
              className="h-8 w-8 object-contain"
            />
            <label className="text-base sm:text-lg font-medium text-gray-900">
              Sube tus boletas (máx. 10)
            </label>
          </div>
          <FileUploader onFilesSelected={handleFilesSelected} />
          <button
            onClick={handleExtract}
            disabled={isLoading || !files.length}
            className="mt-5 w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 rounded-lg shadow transform transition duration-300 hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Extrayendo...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Extraer Datos
              </>
            )}
          </button>
        </motion.div>

        {/* Previews */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full max-w-5xl"
        >
          {previews.map((src, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              className="relative aspect-w-4 aspect-h-3 group"
            >
              <img
                src={src}
                alt={`Boleta ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover rounded-xl shadow-lg border-2 border-white/20"
              />
              <div className="absolute bottom-1.5 left-1.5 bg-black bg-opacity-70 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {files[i]?.name.length > 15
                  ? files[i].name.substring(0, 12) + "..."
                  : files[i].name}
              </div>
              <button
                onClick={() => handleRemoveBoleta(i)}
                className="absolute top-1.5 right-1.5 bg-red-600/70 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Resultados */}
        {results.length > 0 && showTable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="relative z-10 w-full max-w-7xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
              {/* Encabezado móvil-friendly */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
                <h2 className="text-xl font-bold text-gray-900">
                  Resultados Extraídos
                </h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowTable(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1.5 px-3 rounded text-sm"
                  >
                    Ocultar tabla
                  </button>
                  <button
                    onClick={handleExport}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-1.5 px-4 rounded-lg shadow transform transition duration-200 hover:scale-105 text-sm"
                  >
                    Exportar a Excel
                  </button>
                </div>
              </div>
              <ResultsTable results={results} />
            </div>
          </motion.div>
        )}

        {!showTable && results.length > 0 && (
          <motion.button
            onClick={() => setShowTable(true)}
            className="relative z-10 mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 px-6 rounded-lg shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
          >
            Mostrar tabla
          </motion.button>
        )}
      </div>
    </>
  );
}
