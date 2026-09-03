FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --global npm@11.6.4 && npm ci

FROM dependencies AS builder
COPY . .
RUN npm run build

FROM node:24-alpine AS production
RUN apk add --no-cache dumb-init
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3333

COPY package.json package-lock.json ./
RUN npm install --global npm@11.6.4 && npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/build ./
RUN mkdir -p tmp && chown -R node:node /app

USER node
EXPOSE 3333
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3333/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "node ace migration:run --force && exec node bin/server.js"]
