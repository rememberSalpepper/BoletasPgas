// src/App.jsx
import React, { useState } from "react";
import Navbar from "./Navbar";
import HowItWorksModal from "./HowItWorksModal";
import Home from "./Home";
import Particles from "./Particles";  // Importa el componente consolidado
import { Helmet } from "react-helmet";

function App() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Navbar y Modal de instrucciones */}
      <Navbar openModal={() => setModalOpen(true)} />
      <HowItWorksModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Fondo animado fijo */}
      <div className="fixed inset-0 bg-animated -z-10"></div>

      {/* Componente de partículas unificado */}
      <Particles />

      {/* Contenido principal */}
      <Home />
    </>
  );
}

export default App;
