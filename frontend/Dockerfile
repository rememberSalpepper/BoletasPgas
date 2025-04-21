# --- Build Stage ---
    FROM node:20-alpine AS build
    WORKDIR /app
    COPY package*.json ./
    COPY tsconfig.json ./
    COPY next.config.mjs ./
    RUN npm install
    COPY . .
    ARG PYTHON_API_URL # <-- Nombre corregido
    ENV PYTHON_API_URL=${PYTHON_API_URL} # <-- Nombre corregido
    ENV NODE_ENV=production
    RUN npm run build
    
    # --- Production Stage ---
    FROM node:20-alpine AS production
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=8080
    RUN addgroup --system --gid 1001 nodejs
    RUN adduser --system --uid 1001 nextjs
    COPY --from=build /app/node_modules ./node_modules
    COPY --from=build /app/package.json ./package.json
    COPY --from=build /app/public ./public
    COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
    COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
    COPY --from=build /app/next.config.mjs ./
    ARG PYTHON_API_URL # <-- Nombre corregido
    ENV PYTHON_API_URL=${PYTHON_API_URL} # <-- Nombre corregido
    USER nextjs
    EXPOSE 8080
    CMD ["node", "server.js"]