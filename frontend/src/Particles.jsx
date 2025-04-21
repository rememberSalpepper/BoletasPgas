// src/Particles.jsx
import React, { useState, useEffect } from "react";

const NUM_PARTICLES = 40;

function Particles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generamos partículas con propiedades aleatorias
    const newParticles = Array.from({ length: NUM_PARTICLES }).map(() => ({
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      size: Math.floor(Math.random() * 30 + 10) + "px",    // Entre 10px y 40px
      duration: Math.random() * 5 + 10 + "s",  // Entre 10s y 15s
      delay: Math.random() * 2 + "s",          // Entre 0 y 2s
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="particle-overlay">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        ></div>
      ))}
    </div>
  );
}

export default Particles;
