# ---------- base: node + pnpm (vía corepack, versión fijada por packageManager) ----------
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------- build: deps completas + prisma generate + compilación ----------
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN pnpm prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN pnpm run build

# ---------- prod-deps: solo dependencias de producción ----------
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ---------- runner: imagen final mínima, usuario no-root ----------
FROM node:20-alpine AS runner
ENV NODE_ENV=prod
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

COPY --from=prod-deps /app/node_modules ./node_modules
# Client de Prisma generado en build (mismo SO/arquitectura que la imagen final).
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY package.json ./

# Los logs de archivo se escriben en /app/logs: montar un volumen para persistirlos.
RUN mkdir -p logs && chown -R nodeuser:nodejs /app

USER nodeuser
EXPOSE 3000

CMD ["node", "dist/app.js"]
