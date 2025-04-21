// src/App.jsx
import React, { useState } from "react";
import Navbar from "./Navbar"; // Asegúrate que la ruta es correcta
import HowItWorksModal from "./HowItWorksModal"; // Asegúrate que la ruta es correcta
import Home from "./Home";
import Particles from "./Particles"; // Asegúrate que la ruta es correcta
// import { Helmet } from "react-helmet"; // Descomenta si usas Helmet

function App() {
  // ... state ...
  return (
    // Añade bg-pink-500 aquí
    <div className="bg-pink-500">
      <Navbar openModal={() => setModalOpen(true)} />
      <HowItWorksModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      {/* <div className="fixed inset-0 bg-animated -z-20"></div> */} {/* Comenta el fondo temporalmente */}
      {/* <Particles /> */} {/* Comenta partículas temporalmente */}
      <Home />
    </div>
  );
}

export default App;