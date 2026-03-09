FROM node:18-alpine

WORKDIR /app

# Copier les fichiers
COPY package*.json ./
COPY backend/ ./backend/

# Installer les dépendances
RUN npm install --production

# Port
EXPOSE 4000

# Start
CMD ["node", "backend/server.js"]
