"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ASSET_PREFIX = '/pgapps/boletas'; // Definir prefijo

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-gradient-to-r from-teal-500/70 via-blue-500/70 to-cyan-500/70 shadow-lg">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 sm:px-6">

        <div className="flex items-center gap-2 flex-shrink-0">
          <Image
            src={`${ASSET_PREFIX}/images/logo.png`} // Prefijo añadido
            alt="Pgas Logo"
            width={50}
            height={50}
            priority
            className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
          />
          <Image
            src={`${ASSET_PREFIX}/images/logo-text.png`} // Prefijo añadido
            alt="Pgas"
            width={120} // Ajusta a proporción real
            height={40}  // Ajusta a proporción real
            className="h-auto w-20 sm:w-24 md:w-28 hidden sm:block object-contain"
          />
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 text-white hover:bg-white/20">
              <Info className="h-4 w-4" />
              <span>Cómo funciona</span>
            </Button>
          </DialogTrigger>
          <AnimatePresence>
            {isOpen && (
              <DialogContent
                className="sm:max-w-xl border-none shadow-xl bg-gradient-to-br from-white to-blue-50 p-0 overflow-hidden"
                style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset"}}
              >
                <div className="absolute right-0 top-0 pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="bg-red-600/70 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold hover:bg-red-700/90 transition-all backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">Cerrar</span>
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 rounded-t-lg">
                    <DialogTitle className="text-2xl font-bold text-white mb-2">
                      Cómo funciona nuestro escáner
                    </DialogTitle>
                    <DialogDescription className="text-blue-100 text-base opacity-90">
                      Información sobre el proceso de escaneo de boletas
                    </DialogDescription>
                  </div>
                  <div className="p-6 space-y-5 text-gray-700">
                    <p className="leading-relaxed">
                      Nuestro escáner de boletas utiliza tecnología de reconocimiento óptico de caracteres (OCR) para
                      extraer información de tus comprobantes de transferencia bancaria de manera rápida y precisa.
                    </p>
                    <div className="bg-blue-100/70 p-4 rounded-lg border-l-4 border-blue-500 flex items-start">
                      <div className="bg-blue-500 rounded-full p-1 mr-3 mt-0.5">
                        <Info className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-blue-800 font-medium">
                        <strong className="font-bold">Importante:</strong> No almacenamos ningún dato de tus boletas.
                        Todo el procesamiento se realiza en el momento y los datos no se guardan en nuestros servidores.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-700 mb-3">Proceso en 4 pasos:</h3>
                      <ol className="space-y-3">
                        {[
                          "Sube tus comprobantes de transferencia (formatos de imagen)",
                          "Nuestro sistema escanea y extrae la información relevante",
                          "Visualiza los datos extraídos en la tabla de resultados",
                          "Exporta toda la información a un archivo Excel",
                        ].map((step, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm mr-3">
                              {index + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </motion.div>
              </DialogContent>
            )}
          </AnimatePresence>
        </Dialog>
      </div>
    </header>
  );
}