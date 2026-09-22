FROM node:22-alpine

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

EXPOSE 3000

# Node index.js para producción
CMD ["node", "index.js"]