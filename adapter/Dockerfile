# Usar Node.js 18 Alpine como base
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p logs uploads

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health/ping', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para ejecutar la aplicación
CMD ["npm", "start"] 