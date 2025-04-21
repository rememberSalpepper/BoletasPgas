# --- Build Stage ---
# Usamos una imagen completa de Node 20 para tener herramientas de build
FROM node:20 AS build

WORKDIR /app

# Copiar archivos de definición de dependencias y configuración
COPY package.json package-lock.json* tsconfig.json next.config.mjs ./
# El * en package-lock.json* maneja ambos nombres si cambias entre npm/yarn

# Instalar TODAS las dependencias, ignorando conflictos de peer deps
RUN npm install --legacy-peer-deps

# Copiar el resto del código fuente de la aplicación
COPY . .

# Definir el argumento que se pasará durante el build de Docker
ARG PYTHON_API_URL # Usando el nombre consistente
# Establecer la variable de entorno para que esté disponible durante el build de Next.js
ENV PYTHON_API_URL=${PYTHON_API_URL}
# Asegurar que el build se ejecute en modo producción
ENV NODE_ENV=production

# Construir la aplicación Next.js
RUN npm run build

# --- Production Stage ---
# Usamos una imagen más ligera para producción
FROM node:20-alpine AS production

WORKDIR /app

# Establecer el entorno a producción
ENV NODE_ENV=production
# Puerto que expondrá Next.js (Cloud Run usa 8080 por defecto)
ENV PORT=8080

# Crear usuario no privilegiado para correr la aplicación
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar dependencias de producción desde la etapa de build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Copiar artefactos de build de Next.js y archivos públicos
COPY --from=build /app/public ./public
# Copia la carpeta .next completa (ya que no usamos output: standalone)
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
# Copia la configuración de Next.js
COPY --from=build /app/next.config.mjs ./

# Pasar la variable de entorno de la API para runtime
ARG PYTHON_API_URL # Usando el nombre consistente
ENV PYTHON_API_URL=${PYTHON_API_URL}

# Cambiar al usuario no privilegiado
USER nextjs

EXPOSE 8080

# Comando para iniciar el servidor de Next.js estándar
CMD ["node_modules/.bin/next", "start"]