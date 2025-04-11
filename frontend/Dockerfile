# Etapa 1: Construcción
FROM node:20 AS build

WORKDIR /app

# Copia package.json y lockfile
COPY package*.json ./

# Instala dependencias (incluye las devDependencies necesarias para compilar)
RUN npm install

# Copia el resto de los archivos de la app
COPY . .

# Construye la aplicación (Vite crea la carpeta /app/dist)
RUN npm run build

# Etapa 2: Producción
FROM nginx:alpine

# Copiamos los archivos estáticos generados en /app/dist
COPY --from=build /app/dist /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
