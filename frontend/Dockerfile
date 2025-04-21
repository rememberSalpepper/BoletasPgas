# --- Build Stage ---
    FROM node:20-alpine AS build

    # Instalar dependencias necesarias para build (si las hubiera, como python para node-gyp)
    # RUN apk add --no-cache libc6-compat python3 make g++
    
    WORKDIR /app
    
    # Copiar archivos de definición de dependencias
    COPY package*.json ./
    COPY tsconfig.json ./
    COPY next.config.mjs ./
    
    # Instalar dependencias (solo producción si no hay devDependencies para build)
    # O 'npm install' si necesitas devDependencies para el build
    RUN npm ci --only=production
    
    # Copiar el resto del código fuente
    # Es mejor copiar selectivamente que 'COPY . .'
    COPY . .
    
    # Variable de entorno para la URL de la API Python (se pasa en el deploy)
    # Next.js la leerá automáticamente durante el build si es necesaria ahí,
    # y en runtime desde el entorno del contenedor.
    ARG PYTHON_API_URL
    ENV PYTHON_API_URL=${PYTHON_API_URL}
    
    # Eliminar archivos innecesarios antes del build (opcional)
    # RUN rm -rf .next .git .github .vscode # etc.
    
    # Construir la aplicación Next.js
    # Esto genera la carpeta .next optimizada
    RUN npm run build
    
    # --- Production Stage ---
    FROM node:20-alpine AS production
    
    WORKDIR /app
    
    # Copiar solo lo necesario desde la etapa de build
    COPY --from=build /app/node_modules ./node_modules
    COPY --from=build /app/package.json ./package.json
    COPY --from=build /app/public ./public
    COPY --from=build /app/.next ./.next
    COPY --from=build /app/next.config.mjs ./ # Copiar config de Next
    
    # Variable de entorno para runtime (se pasará en Cloud Run)
    ARG PYTHON_API_URL
    ENV PYTHON_API_URL=${PYTHON_API_URL}
    # Next.js necesita saber que está en producción
    ENV NODE_ENV=production
    # Puerto que expondrá Next.js (Cloud Run espera 8080 por defecto)
    ENV PORT=8080
    EXPOSE 8080
    
    # Comando para iniciar el servidor de Next.js en producción
    CMD ["npm", "start"]