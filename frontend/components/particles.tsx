"use client"

import { useEffect, useState, useRef } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
}

const NUM_PARTICLES = 250 // Aumentado de 100 a 250 partículas

export function Particles() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const particlesRef = useRef<Particle[]>([])
  const requestRef = useRef<number>()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Inicializar dimensiones y partículas
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Configurar dimensiones iniciales
    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    // Inicializar partículas
    particlesRef.current = Array.from({ length: NUM_PARTICLES }).map(() => createParticle())

    return () => {
      window.removeEventListener("resize", updateDimensions)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  // Crear una partícula con propiedades aleatorias
  const createParticle = (): Particle => {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 10 + 5, // Partículas pequeñas: entre 5 y 15
      speedX: Math.random() * 1 - 0.5, // Entre -0.5 y 0.5
      speedY: Math.random() * 1 - 0.5, // Entre -0.5 y 0.5
      opacity: Math.random() * 0.4 + 0.1, // Opacidad sutil: entre 0.1 y 0.5
      color: getRandomColor(),
    }
  }

  // Obtener un color aleatorio
  const getRandomColor = () => {
    const colors = [
      "rgba(45, 212, 191, 0.5)", // teal
      "rgba(56, 189, 248, 0.5)", // sky
      "rgba(14, 165, 233, 0.5)", // blue
      "rgba(255, 255, 255, 0.3)", // blanco
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Animar partículas
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Ajustar tamaño del canvas
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      // Actualizar y dibujar cada partícula
      particlesRef.current.forEach((particle, index) => {
        // Actualizar posición
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Rebote en los bordes
        if (particle.x <= 0 || particle.x >= dimensions.width) {
          particle.speedX = -particle.speedX
        }
        if (particle.y <= 0 || particle.y >= dimensions.height) {
          particle.speedY = -particle.speedY
        }

        // Dibujar partícula
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()

        // Borde sutil
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 1
        ctx.stroke()
      })

      requestRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [dimensions])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}
