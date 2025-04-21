"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog"; // Importa DialogClose y DialogHeader
import { Info, X, ScanLine, BrainCircuit, Table, FileDown, Upload } from "lucide-react"; // Importa todos los iconos
import { motion, AnimatePresence } from "framer-motion";

const ASSET_PREFIX = '/pgapps/boletas'; // Definir prefijo

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-gradient-to-r from-teal-500/70 via-blue-500/70 to-cyan-500/70 shadow-lg">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 sm:px-6">

        <div className="flex items-center gap-2 flex-shrink-0">
          <Image
            src={`${ASSET_PREFIX}/images/logo.png`}
            alt="Pgas Logo"
            width={50} height={50} priority
            className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
          />
          <Image
            src={`${ASSET_PREFIX}/images/logo-text.png`}
            alt="Pgas"
            width={120} height={40}
            className="h-auto w-20 sm:w-24 md:w-28 hidden sm:block object-contain"
          />
        </div>

        {/* --- INICIO MODAL --- */}
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
                // Clases para responsividad y scroll
                className="w-full max-w-md sm:max-w-lg lg:max-w-2xl max-h-[85vh] overflow-hidden p-0 border-none shadow-xl bg-white flex flex-col"
                // Evitar que el overlay cierre al hacer click fuera si se prefiere: onInteractOutside={(e) => e.preventDefault()}
              >
                 {/* Encabezado Fijo */}
                 <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-500 p-4 sm:p-6 text-white shadow-md">
                     <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3">
                             <div className="bg-white/20 rounded-full p-2">
                                 <BrainCircuit className="h-6 w-6 text-white" />
                             </div>
                             <div>
                                 <DialogTitle className="text-xl sm:text-2xl font-bold">Cómo Funciona (OCR + IA)</DialogTitle>
                                 <DialogDescription className="text-blue-100 text-sm sm:text-base opacity-90 mt-1">
                                     Extracción inteligente de datos de tus comprobantes.
                                 </DialogDescription>
                             </div>
                         </div>
                         {/* Botón de cierre único */}
                         <DialogClose asChild>
                            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/20 rounded-full">
                                 <X className="h-5 w-5" />
                                 <span className="sr-only">Cerrar</span>
                            </Button>
                         </DialogClose>
                     </div>
                 </DialogHeader>

                 {/* Contenido Principal con Scroll Interno */}
                 <div className="p-4 sm:p-6 space-y-5 text-gray-700 overflow-y-auto flex-1">
                    <p className="leading-relaxed text-base sm:text-lg">
                      Nuestra herramienta combina **Reconocimiento Óptico de Caracteres (OCR)** para leer el texto de tus imágenes, y luego usa **Inteligencia Artificial (IA - Google Gemini)** para comprender y extraer la información clave de forma estructurada y precisa.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-800 text-sm sm:text-base">
                        <strong className="font-semibold">Tu Privacidad es Primero:</strong> No almacenamos tus imágenes ni los datos extraídos permanentemente. El procesamiento es instantáneo y seguro.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-3">Proceso Inteligente:</h3>
                      <ol className="space-y-4">
                        {[
                          { icon: Upload, text: "Sube uno o varios comprobantes (JPG, PNG)." },
                          { icon: ScanLine, text: "La tecnología OCR digitaliza el texto de las imágenes." },
                          { icon: BrainCircuit, text: "Nuestra IA analiza el texto, identifica los campos relevantes (monto, fecha, RUT, etc.) y los extrae." },
                          { icon: Table, text: "Revisa la información organizada en la tabla de resultados." },
                          { icon: FileDown, text: "Exporta fácilmente todos los datos a un archivo Excel con un clic." },
                        ].map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-base mt-0.5 shadow">
                              <step.icon className="h-4 w-4" />
                            </span>
                            <span className="text-base">{step.text}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                 </div>
              </DialogContent>
            )}
          </AnimatePresence>
        </Dialog>
         {/* --- FIN MODAL --- */}

      </div>
    </header>
  );
}