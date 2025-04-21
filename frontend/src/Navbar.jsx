// src/Navbar.jsx
import React from "react";
import Pgas from "./assets/Pgas.jpg";
import PgasTexto from "./assets/PgasTexto.png";

function Navbar({ openModal }) {
  return (
    <nav className="fixed top-0 w-full flex items-center px-6 py-4 z-50 bg-transparent">
      {/* Sección izquierda: Logo de Pgas */}
      <div className="flex-1 flex justify-start">
        <img
          src={Pgas}
          alt="Pgas Logo"
          className="h-22 w-auto object-contain"
        />
      </div>

      {/* Sección central: Logo de PgasTexto */}
      <div className="flex-1 flex justify-center">
        <img
          src={PgasTexto}
          alt="Pgas Texto Logo"
          className="h-26 w-auto object-contain"
        />
      </div>

      {/* Sección derecha: Botón "¿Cómo funciona?" */}
      <div className="flex-1 flex justify-end">
        <button
          onClick={openModal}
          className="px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-full shadow-md transition-all duration-300 hover:scale-105"
        >
          ¿Cómo funciona?
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
