FROM node:20-alpine

WORKDIR /app

# Install backend dependencies only (faster and more reliable in CI)
COPY backend/package.json ./package.json
COPY backend/package-lock.json ./package-lock.json
RUN npm ci --omit=dev --no-audit --no-fund

# Copy backend source
COPY backend/ ./

# Back4App/containers usually inject PORT (often 8080)
EXPOSE 4000

CMD ["node", "server.js"]
