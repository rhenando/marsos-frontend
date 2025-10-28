# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
# Install dependencies and build
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
# no build step for pure JS, but keep for assets (if any)
RUN chown -R node:node /usr/src/app

FROM node:20-alpine
USER node
WORKDIR /home/node/app
COPY --from=builder /usr/src/app ./
ENV NODE_ENV=production
EXPOSE 5001
# do not run as root, use non-root user
# Drop capabilities in k8s via securityContext as well
CMD ["node", "src/index.js"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD wget -q -O - http://localhost:5001/healthz || exit 1
