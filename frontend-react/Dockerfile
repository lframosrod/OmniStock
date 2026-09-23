# 1. Etapa Base
FROM node:22-alpine as base
WORKDIR /app
COPY package*.json ./
RUN npm install

# 2. Etapa de Desarrollo
FROM base as development
COPY . .
EXPOSE 80
CMD ["npm", "run", "dev"]

# 3. Etapa de Construcción
FROM base as builder
COPY . .
RUN npm run build

# 4. Etapa de Producción
FROM nginx:alpine as production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]