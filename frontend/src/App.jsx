// src/App.jsx
import React, { useState } from "react";
import Navbar from "./Navbar"; // Asegúrate que la ruta es correcta
import HowItWorksModal from "./HowItWorksModal"; // Asegúrate que la ruta es correcta
import Home from "./Home";
import Particles from "./Particles"; // Asegúrate que la ruta es correcta
// import { Helmet } from "react-helmet"; // Descomenta si usas Helmet

function App() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Navbar - Su posición será controlada por sus propias clases CSS (fixed) */}
      <Navbar openModal={() => setModalOpen(true)} />
      <HowItWorksModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Fondo Animado - Fijo y detrás de todo */}
      <div className="fixed inset-0 bg-animated -z-20"></div>

      {/* Partículas - Fijas y detrás */}
      <Particles />

      {/* Home - Contiene el contenido principal que será centrado */}
      <Home />
    </>
  );
}

export default App;