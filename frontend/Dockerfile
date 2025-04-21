# Etapa 1: Construcción
FROM node:20 AS build

WORKDIR /app

# Agregar un argumento para la variable de entorno
ARG VITE_API_URL

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias (incluye devDependencies)
RUN npm install

# Crear archivo .env usando el valor del argumento
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env

# Copiar el resto de los archivos de la app
COPY . .

# Construir la aplicación (Vite generará la carpeta /app/dist)
RUN npm run build

# Etapa 2: Producción
FROM nginx:alpine

# Copiar los archivos estáticos generados en /app/dist al contenedor de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
