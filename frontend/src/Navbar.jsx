// src/Navbar.jsx
import React from "react";
import Pgas from "./assets/Pgas.jpg";       // Asegúrate que estas rutas sean correctas
import PgasTexto from "./assets/PgasTexto.png"; // Asegúrate que estas rutas sean correctas

function Navbar({ openModal }) {
  return (
    // --- Clases Añadidas/Modificadas ---
    // fixed top-0 left-0 right-0: Posicionamiento fijo (OK)
    // z-50: Asegura que esté por encima (OK)
    // bg-gradient-to-r from-[#005FD9]/80 to-[#0CA0D9]/80: Fondo semi-transparente (¡NUEVO!) - Ajusta colores/opacidad si quieres
    // backdrop-blur-md: Efecto blur en lo que está detrás (¡NUEVO!)
    // shadow-lg: Sombra sutil para separación (¡NUEVO!)
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#005FD9]/80 to-[#0CA0D9]/80 backdrop-blur-md shadow-lg flex items-center px-4 sm:px-6 py-2 sm:py-3">
      {/* Ajustado padding (py) para que no sea tan alta */}

      {/* Sección izquierda: Logo de Pgas */}
      <div className="flex-1 flex justify-start">
        <img
          src={Pgas}
          alt="Pgas Logo"
          // Ajustar altura para que quepa bien
          className="h-8 sm:h-10 w-auto object-contain"
        />
      </div>

      {/* Sección central: Logo de PgasTexto */}
      <div className="flex-1 flex justify-center">
        <img
          src={PgasTexto}
          alt="Pgas Texto Logo"
           // Ajustar altura para que quepa bien
          className="h-8 sm:h-10 w-auto object-contain" // Reducir si es necesario
        />
      </div>

      {/* Sección derecha: Botón "¿Cómo funciona?" */}
      <div className="flex-1 flex justify-end">
        <button
          onClick={openModal}
          // Ajustar padding/tamaño fuente si es necesario para que quepa
          className="px-4 py-1.5 sm:px-5 sm:py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-full shadow-md transition-all duration-300 hover:scale-105 text-sm sm:text-base"
        >
          ¿Cómo funciona?
        </button>
      </div>
    </nav>
  );
}

export default Navbar;