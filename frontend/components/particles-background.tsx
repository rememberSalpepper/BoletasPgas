"use client"

import { useEffect, useRef, useState } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  alpha: number
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [bgColor, setBgColor] = useState("rgb(224, 242, 254)") // Inicial: azul claro

  // Colores de la marca
  const colors = [
    "rgb(45, 212, 191)", // teal-400
    "rgb(56, 189, 248)", // sky-400
    "rgb(14, 165, 233)", // sky-500
  ]

  // Efecto para manejar el resize y la animación
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Ajustar dimensiones del canvas
    const updateDimensions = () => {
      if (canvas) {
        const { innerWidth, innerHeight } = window
        canvas.width = innerWidth
        canvas.height = innerHeight
        setDimensions({ width: innerWidth, height: innerHeight })
      }
    }

    // Inicializar dimensiones
    updateDimensions()

    // Escuchar cambios de tamaño
    window.addEventListener("resize", updateDimensions)

    // Crear partículas
    const particlesArray: Particle[] = []
    const particleCount = Math.min(Math.floor(dimensions.width * 0.05), 100) // Ajustar según ancho

    for (let i = 0; i < particleCount; i++) {
      particlesArray.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 5 + 1,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.1,
      })
    }

    // Cambio de color de fondo
    let colorIndex = 0
    const updateBackgroundColor = () => {
      colorIndex = (colorIndex + 1) % colors.length
      setBgColor(colors[colorIndex])
    }

    const bgInterval = setInterval(updateBackgroundColor, 10000) // Cambiar cada 10 segundos

    // Función de animación
    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      // Dibujar partículas
      particlesArray.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.alpha
        ctx.fill()

        // Actualizar posición
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Rebote en los bordes
        if (particle.x > dimensions.width || particle.x < 0) {
          particle.speedX = -particle.speedX
        }
        if (particle.y > dimensions.height || particle.y < 0) {
          particle.speedY = -particle.speedY
        }
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // Limpieza
    return () => {
      window.removeEventListener("resize", updateDimensions)
      cancelAnimationFrame(animationFrameId)
      clearInterval(bgInterval)
    }
  }, [dimensions])

  return (
    <>
      <div
        className="fixed inset-0 transition-colors duration-1000 ease-in-out z-0"
        style={{ backgroundColor: bgColor }}
      />
      <canvas ref={canvasRef} className="fixed inset-0 z-0" />
    </>
  )
}
