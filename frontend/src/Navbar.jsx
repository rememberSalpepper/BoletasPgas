// src/Navbar.jsx
import React from "react";
import Pgas from "./assets/Pgas.jpg";
import PgasTexto from "./assets/PgasTexto.png"; // Asegúrate que las rutas sean correctas

function Navbar({ openModal }) {
  return (
    // --- Clases Clave Añadidas ---
    // bg-gradient.../80: Fondo semi-transparente (¡IMPORTANTE!)
    // backdrop-blur-md: Efecto blur
    // shadow-lg: Sombra
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#005FD9]/80 to-[#0CA0D9]/80 backdrop-blur-md shadow-lg flex items-center px-4 sm:px-6 py-2 sm:py-3">

      {/* Sección izquierda: Logo Pgas */}
      <div className="flex-1 flex justify-start">
        <img
          src={Pgas}
          alt="Pgas Logo"
          className="h-8 sm:h-10 w-auto object-contain" // Altura ajustada
        />
      </div>

      {/* Sección central: Logo PgasTexto */}
      <div className="flex-1 flex justify-center">
        <img
          src={PgasTexto}
          alt="Pgas Texto Logo"
          className="h-8 sm:h-10 w-auto object-contain" // Altura ajustada
        />
      </div>

      {/* Sección derecha: Botón */}
      <div className="flex-1 flex justify-end">
        <button
          onClick={openModal}
          className="px-4 py-1.5 sm:px-5 sm:py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-full shadow-md transition-all duration-300 hover:scale-105 text-sm sm:text-base"
        >
          ¿Cómo funciona?
        </button>
      </div>
    </nav>
  );
}

export default Navbar;