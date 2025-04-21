// src/Navbar.jsx
import React from "react";
import Pgas from "./assets/Pgas.jpg";
import PgasTexto from "./assets/PgasTexto.png";

function Navbar({ openModal }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/70 backdrop-blur-lg shadow-md flex items-center px-4 sm:px-6 py-2"> {/* Fondo oscuro semi-transparente, blur, sombra, padding reducido */}
      {/* Sección izquierda: Logo Pgas */}
      <div className="flex-shrink-0"> {/* Evita que se encoja demasiado */}
        <img
          src={Pgas}
          alt="Pgas Logo"
          className="h-8 md:h-10 w-auto" // Altura responsiva
        />
      </div>

      {/* Sección central: Logo PgasTexto (Quizás ocultar en móvil si no cabe) */}
      <div className="flex-1 flex justify-center px-4 hidden sm:flex"> {/* Oculto en pantallas extra pequeñas (xs) */}
        <img
          src={PgasTexto}
          alt="Pgas Texto Logo"
          className="h-7 md:h-9 w-auto" // Altura responsiva
        />
      </div>

      {/* Sección derecha: Botón */}
      <div className="flex-shrink-0"> {/* Evita que se encoja */}
        <button
          onClick={openModal}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full shadow-md transition-all duration-300 hover:scale-105 text-xs sm:text-sm" // Tamaño/padding responsivo
        >
          ¿Cómo funciona?
        </button>
      </div>
    </nav>
  );
}

export default Navbar;