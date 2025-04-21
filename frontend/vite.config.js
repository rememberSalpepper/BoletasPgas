// vite.config.js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/pgapps/boletas/',
  plugins: [
    react(),
    tailwindcss() // Correcto: usando el plugin importado
  ]
  // SIN sección css.postcss aquí
})