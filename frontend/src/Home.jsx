// src/Home.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function Home() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(true); // Estado para controlar la visibilidad de la tabla

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + files.length > 10) {
      alert("Máximo 10 boletas permitidas en total.");
      return;
    }
    const newFiles = [...files, ...selected];
    setFiles(newFiles);
    const newPreviews = selected.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const handleRemoveBoleta = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
  };

  // Conexión a API: extrae los datos de las imágenes
  const handleExtract = async () => {
    if (!files.length) {
      alert("Por favor, selecciona al menos un archivo.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("http://127.0.0.1:8000/extract_multi", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }
      const result = await res.json();
      setTableData(result.results || []);
      setShowTable(true);  // Aseguramos que la tabla se muestre al extraer nuevos datos
    } catch (error) {
      console.error("Error al extraer datos:", error);
      alert(
        "Ocurrió un error al extraer los datos. Verifica la consola para más detalles."
      );
    }
    setLoading(false);
  };

  // Conexión a API: exporta los datos extraídos a Excel
  const handleExport = async () => {
    if (!tableData.length) {
      alert("No hay datos para exportar.");
      return;
    }
    const extractedData = JSON.stringify(
      tableData.length === 1
        ? tableData[0].datos
        : tableData.map((item) => item.datos)
    );
    const formData = new FormData();
    formData.append("extracted_data", extractedData);

    try {
      const response = await fetch("http://127.0.0.1:8000/export", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Export API Error: ${response.statusText}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged_data.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      alert(
        "Ocurrió un error al exportar los datos. Verifica la consola para más detalles."
      );
    }
  };

  return (
    <>
      {/* Fondo animado */}
      <style>{`
        .bg-animated {
          background: linear-gradient(270deg, #20DBC8, #0CA0D9, #005FD9);
          background-size: 600% 600%;
          animation: gradientAnimation 12s ease infinite;
        }
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className="absolute inset-0 bg-animated -z-20"></div>
      {/* Nota: El componente Particles duplicado se ha eliminado de aquí.
          Se asume que está siendo renderizado de forma centralizada (por ejemplo, en App.jsx). */}

      <div className="min-h-screen w-screen overflow-x-hidden flex flex-col items-center justify-center relative pt-24 pb-10 p-8 space-y-10 text-white">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold drop-shadow-lg text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Extracción de Boletas
        </motion.h1>

        <motion.div
          className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <label
            htmlFor="fileInput"
            className="text-lg font-medium mb-2 text-gray-900"
          >
            Sube tus boletas (máx. 10)
          </label>
          <input
            id="fileInput"
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-blue-600 hover:file:bg-gray-200 mb-4"
          />
          <button
            onClick={handleExtract}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
          >
            {loading ? "Extrayendo..." : "Extraer Datos"}
          </button>
        </motion.div>

        {previews.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {previews.map((src, idx) => (
              <motion.div
                key={idx}
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <img
                  src={src}
                  alt={`Boleta ${idx + 1}`}
                  className="w-full h-60 object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                  Boleta {idx + 1}
                </div>
                <button
                  onClick={() => handleRemoveBoleta(idx)}
                  className="absolute top-3 right-3 bg-red-600 text-white text-xs rounded-full px-2 py-1 hover:bg-red-700 transition-colors"
                >
                  X
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {tableData.length > 0 && showTable && (
          <motion.div
            className="w-full max-w-6xl bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-2xl p-6 overflow-x-auto mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Datos Extraídos
              </h2>
              <button
                onClick={() => setShowTable(false)}
                className="bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white font-bold py-1 px-4 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
              >
              X
              </button>
            </div>
            <table className="min-w-full text-gray-900">
              <thead>
                <tr className="border-b border-gray-300">
                  {[
                    "Archivo",
                    "Estado",
                    "Monto",
                    "Destinatario",
                    "Cuenta",
                    "Fecha",
                    "Hora",
                    "Código",
                    "Asunto",
                  ].map((header, idx) => (
                    <th key={idx} className="py-3 px-4 text-left font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((item, idx) => (
                  <motion.tr
                    key={idx}
                    className="border-b border-gray-300 hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <td className="py-3 px-4">
                      {item.filename || `Boleta ${idx + 1}`}
                    </td>
                    <td className="py-3 px-4">{item.datos.estado || "-"}</td>
                    <td className="py-3 px-4">{item.datos.monto || "-"}</td>
                    <td className="py-3 px-4">{item.datos.destinatario || "-"}</td>
                    <td className="py-3 px-4">{item.datos.cuenta || "-"}</td>
                    <td className="py-3 px-4">{item.datos.fecha || "-"}</td>
                    <td className="py-3 px-4">{item.datos.hora || "-"}</td>
                    <td className="py-3 px-4">{item.datos.codigo_transf || "-"}</td>
                    <td className="py-3 px-4">{item.datos.asunto || "-"}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {!showTable && tableData.length > 0 && (
          <button
            onClick={() => setShowTable(true)}
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-full shadow-md transition-all duration-300 hover:scale-105"
          >
            Mostrar tabla
          </button>
        )}

        {tableData.length > 0 && (
          <motion.button
          onClick={handleExport}
          className="mt-8 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
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
