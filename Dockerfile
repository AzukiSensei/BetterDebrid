FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --global npm@11.6.4 && npm ci

FROM dependencies AS builder
COPY . .
RUN NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3333 \
    LOG_LEVEL=info \
    APP_KEY=build-only-key-0123456789abcdef0 \
    APP_URL=http://localhost:3333 \
    DATABASE_URL=postgresql://build:build@localhost:5432/build \
    SESSION_DRIVER=cookie \
    npm run build

FROM node:24-alpine AS production
RUN apk add --no-cache dumb-init ffmpeg
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3333

COPY package.json package-lock.json ./
RUN npm install --global npm@11.6.4 && npm ci --omit=dev && npm cache clean --force
COPY --from=builder --chown=node:node /app/build ./
RUN mkdir -p tmp && chown node:node tmp

USER node
EXPOSE 3333
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3333/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "node ace migration:run --force && exec node bin/server.js"]
