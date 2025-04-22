# --- Build Stage ---
    FROM node:20 AS build
    WORKDIR /app
    COPY package.json package-lock.json* tsconfig.json next.config.mjs ./
    RUN npm install --legacy-peer-deps
    COPY . .
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
    # --- CAMBIO AQUÍ ---
    COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
    # -------------------
    COPY --from=build /app/next.config.mjs ./
    USER nextjs
    EXPOSE 8080
    CMD ["node_modules/.bin/next", "start"] # Usa next start
