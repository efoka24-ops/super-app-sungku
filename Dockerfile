FROM node:20-alpine

WORKDIR /app

# Install backend dependencies only (faster and more reliable in CI)
COPY backend/package.json ./package.json
RUN npm install --omit=dev --no-audit --no-fund

# Copy backend source
COPY backend/ ./

# Back4App/containers usually inject PORT (often 8080)
EXPOSE 8080

CMD ["node", "server.js"]
