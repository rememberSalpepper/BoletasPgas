// src/HowItWorksModal.jsx
import React from "react";
import { motion } from "framer-motion";

function HowItWorksModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Fondo semi-transparente que cierra el modal al hacer clic */}
      <div 
        className="absolute inset-0 bg-black opacity-50" 
        onClick={onClose}
      ></div>
      <motion.div 
        className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl p-8 z-50 max-w-lg mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold mb-4 text-gray-900">¿Cómo funciona?</h2>
        <p className="mb-4 text-gray-800">
          MiApp utiliza tecnología OCR para extraer datos de tus comprobantes o boletas. 
          Solo tienes que subir hasta 10 imágenes, revisar la previsualización y luego extraer 
          los datos que se muestran en la tabla. Finalmente, puedes exportar toda la información 
          a un archivo Excel.
        </p>
        <p className="mb-6 text-gray-800 text-sm">
          <em>Disclaimer: No almacenamos ningún dato personal. La información se procesa de forma local y 
          se elimina de nuestros servidores tan pronto como se realiza la extracción.</em>
        </p>
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default HowItWorksModal;
