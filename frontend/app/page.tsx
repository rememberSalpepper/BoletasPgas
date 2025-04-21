"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Particles } from "@/components/particles"
import { FileUploader } from "@/components/file-uploader"
import { ResultsTable } from "@/components/results-table"
import { Loader2, FileText } from "lucide-react"
import Image from "next/image"

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showTable, setShowTable] = useState(false)

  // Limpiar URLs de objetos al desmontar
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return
    if (selectedFiles.length + files.length > 10) {
      alert("Máximo 10 boletas.")
      return
    }

    const currentFiles = [...files]
    const currentPreviews = [...previews]
    const addedFiles: File[] = []
    const addedPreviews: string[] = []

    selectedFiles.forEach((file) => {
      if (!currentFiles.some((f) => f.name === file.name && f.size === file.size)) {
        addedFiles.push(file)
        addedPreviews.push(URL.createObjectURL(file))
      }
    })

    const finalFiles = [...currentFiles, ...addedFiles]
    const finalPreviews = finalFiles.map((file) => {
      const existingPreview =
        currentPreviews[currentFiles.findIndex((f) => f.name === file.name && f.size === file.size)]
      const newPreview = addedPreviews[addedFiles.findIndex((f) => f.name === file.name && f.size === file.size)]
      return existingPreview || newPreview
    })

    setFiles(finalFiles)
    setPreviews(finalPreviews)
  }

  const handleRemoveBoleta = (index: number) => {
    const newFiles = [...files]
    const newPreviews = [...previews]

    // Revocar URL del objeto
    URL.revokeObjectURL(newPreviews[index])

    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)

    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  const handleExtract = async () => {
    if (files.length === 0) return

    setIsLoading(true)
    try {
      const formData = new FormData()

      if (files.length === 1) {
        // Single file upload
        formData.append("file", files[0])

        const response = await fetch("/api/extract", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        setResults([data])
      } else {
        // Multiple files upload
        files.forEach((file) => {
          formData.append("files", file)
        })

        const response = await fetch("/api/extract-multi", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        setResults(data.results)
      }

      // Mostrar tabla automáticamente después de extraer
      setShowTable(true)
    } catch (error) {
      console.error("Error scanning files:", error)
      alert("Error al procesar las boletas. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    if (results.length === 0) return

    try {
      const formData = new FormData()
      formData.append("extracted_results", JSON.stringify({ results }))

      const response = await fetch("/api/export", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Create a download link for the Excel file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "extraccion_comprobantes.xlsx"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      alert("Error al exportar a Excel. Intente nuevamente.")
    }
  }

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <>
      <div className="fixed inset-0 bg-animated -z-20"></div>
      <Particles />

      <div className="min-h-screen w-full flex flex-col items-center justify-center relative pt-20 pb-10 px-4 space-y-8 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="text-center"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold drop-shadow-lg text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Extracción de Boletas
          </motion.h1>
          <motion.p
            className="mt-4 text-xl text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Sube tus comprobantes y extrae la información automáticamente
          </motion.p>
        </motion.div>

        <motion.div
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
        >
          <div className="flex items-center justify-center mb-4 gap-3">
            <Image src="images/logo.png" alt="Logo" width={40} height={40} className="h-10 w-auto" />
            <label className="text-lg font-medium text-gray-900 text-center">Sube tus boletas (máx. 10)</label>
          </div>

          <FileUploader onFilesSelected={handleFilesSelected} />

          <motion.button
            onClick={handleExtract}
            disabled={isLoading || files.length === 0}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
          </motion.button>
        </motion.div>

        {/* Previews */}
        {previews.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full max-w-5xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {previews.map((src, idx) => (
              <motion.div key={idx} className="relative aspect-w-4 aspect-h-3 group" variants={itemVariants}>
                <img
                  src={src || "/placeholder.svg"}
                  alt={`Boleta ${idx + 1}`}
                  className="w-full h-full object-cover rounded-xl shadow-lg border-2 border-white/30"
                />
                <div className="absolute bottom-1.5 left-1.5 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                  Boleta {idx + 1}
                </div>
                <motion.button
                  onClick={() => handleRemoveBoleta(idx)}
                  className="absolute top-1.5 right-1.5 bg-red-600/70 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold hover:bg-red-700/90 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  aria-label={`Quitar Boleta ${idx + 1}`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tabla de Resultados */}
        {results.length > 0 && showTable && (
          <motion.div
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-full max-w-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Resultados Extraídos</h2>
              <motion.button
                onClick={handleExport}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Exportar a Excel
              </motion.button>
            </div>
            <div className="overflow-x-auto">
              <ResultsTable results={results} />
            </div>
          </motion.div>
        )}

        {/* Botón para mostrar tabla si está oculta */}
        {!showTable && results.length > 0 && (
          <motion.button
            onClick={() => setShowTable(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Mostrar tabla
          </motion.button>
        )}
      </div>
    </>
  )
}
