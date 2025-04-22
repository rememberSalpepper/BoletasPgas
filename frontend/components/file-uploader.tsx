"use client"

import type React from "react"
import { useRef } from "react"
import { Upload } from "lucide-react"
import { motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
}

export function FileUploader({ onFilesSelected }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMobile()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      onFilesSelected(newFiles)
      e.target.value = ""
    }
  }

  return (
    <div className="w-full">
      <motion.div
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors border-blue-300 hover:border-blue-500 bg-blue-50/50 mb-4"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          id="fileInput"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          <Upload className="h-8 w-8 text-blue-500" />
          <h3 className="text-base font-medium text-gray-700">
            {isMobile ? "Toca para subir" : "Arrastra y suelta o haz clic para subir"}
          </h3>
          <p className="text-sm text-gray-500">Soporta imágenes de comprobantes bancarios (JPG, PNG)</p>
        </div>
      </motion.div>
    </div>
  )
}
