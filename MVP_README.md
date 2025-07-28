# Evolution API Adapter - MVP

Microservicio adapter para Evolution API que actúa como intermediario entre tu aplicación Aurelia y la API de WhatsApp.

## 🚀 Características del MVP

- **Webhook Receiver**: Recibe y procesa eventos de Evolution API
- **Message Sending**: Envía mensajes de diferentes tipos (texto, imagen, documento, etc.)
- **Instance Management**: Gestiona instancias de WhatsApp por cliente
- **Rate Limiting**: Protección contra spam y abuso
- **Authentication**: Sistema de autenticación JWT por cliente
- **Logging**: Logging estructurado con Winston
- **Health Checks**: Monitoreo de salud del servicio
- **Docker Support**: Contenedorización completa
- **Base de Datos Local**: Conecta con tu base de datos `evolution_db` local

## 📋 Requisitos

- Node.js 18+
- Docker y Docker Compose
- Redis (para cache y rate limiting)
- Evolution API v2.1.1+
- PostgreSQL local con base de datos `evolution_db`

## 🛠️ Instalación y Configuración

### 1. Preparar la Base de Datos Local

Asegúrate de que tu base de datos PostgreSQL local tenga:

```sql
-- Crear la base de datos si no existe
CREATE DATABASE evolution_db;

-- Crear el usuario si no existe
CREATE USER evolution_user WITH PASSWORD 'evolution_password';

-- Dar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE evolution_db TO evolution_user;
```

### 2. Configurar Variables de Entorno

```bash
# Copiar el archivo de configuración MVP
cp mvp.env .env

# Editar las variables necesarias
nano .env
```

**Variables importantes a configurar:**

```bash
# API Key de Evolution (obtener desde Evolution API)
EVOLUTION_API_KEY=tu-api-key-aqui

# URL de tu base de datos local
DATABASE_URL=postgresql://evolution_user:evolution_password@localhost:5432/evolution_db

# Clave secreta para JWT (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu-clave-secreta-super-segura

# Orígenes permitidos para CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://tu-dominio-aurelia.com
```

### 3. Ejecutar el MVP

```bash
# Construir y ejecutar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f evolution_adapter

# Verificar que el servicio esté funcionando
curl http://localhost:3001/health
```

### 4. Verificar la Conexión

```bash
# Health check básico
curl http://localhost:3001/health

# Health check detallado
curl http://localhost:3001/health/detailed

# Verificar logs
docker-compose logs evolution_adapter
```

## 📡 API Endpoints Disponibles

### Health Checks

```http
GET /health
GET /health/detailed
GET /health/ping
```

### Webhooks

```http
POST /api/webhook
POST /api/webhook/configure
GET /api/webhook/config/:instance
```

### Mensajes

```http
POST /api/messages/send/text
POST /api/messages/send/image
POST /api/messages/send/document
POST /api/messages/send/audio
POST /api/messages/send/video
POST /api/messages/send/location
POST /api/messages/send/contact
POST /api/messages/send/buttons
GET /api/messages/history/:instance/:phone
GET /api/messages/status/:instance/:messageId
```

### Instancias

```http
POST /api/instances/create
POST /api/instances/connect/:instance
POST /api/instances/disconnect/:instance
DELETE /api/instances/delete/:instance
GET /api/instances/info/:instance
GET /api/instances/status/:instance
GET /api/instances/qr/:instance
GET /api/instances/list
PUT /api/instances/config/:instance
GET /api/instances/config/:instance
GET /api/instances/chats/:instance
GET /api/instances/contacts/:instance
```

## 🔐 Autenticación

El adapter utiliza JWT para autenticación. Incluye el token en el header:

```http
Authorization: Bearer <your-jwt-token>
```

### Generar Token de Prueba

```bash
# Usar el script incluido
node generate-test-token.js
```

### Estructura del Token

```json
{
  "clientId": "uuid-del-cliente",
  "clientName": "Nombre del Cliente",
  "userId": "uuid-del-usuario",
  "userRole": "admin"
}
```

## 🚀 Uso con Aurelia Platform

### 1. Configurar webhook en Evolution API

```javascript
// En tu aplicación Aurelia
const response = await fetch('http://localhost:3001/api/webhook/configure', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-jwt-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    instance: 'your-instance-name',
    webhookUrl: 'http://localhost:3001/api/webhook'
  })
});
```

### 2. Enviar mensaje

```javascript
const response = await fetch('http://localhost:3001/api/messages/send/text', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-jwt-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    instance: 'your-instance-name',
    to: '5511999999999',
    message: 'Hola desde Aurelia!',
    clientId: 'your-client-id'
  })
});
```

### 3. Recibir webhooks

Los webhooks se envían automáticamente a tu aplicación Aurelia cuando Evolution API recibe mensajes.

## 🔧 Desarrollo

### Estructura del Proyecto

```
ms-evolution/
├── adapter/                 # Microservicio adapter
│   ├── src/
│   │   ├── controllers/     # Controladores de la API
│   │   ├── services/        # Lógica de negocio
│   │   ├── middleware/      # Middlewares (auth, rate limit, etc.)
│   │   └── utils/           # Utilidades (logger, etc.)
│   ├── docker-compose.yml   # Configuración Docker para adapter
│   └── Dockerfile          # Dockerfile del adapter
├── docker-compose.yml       # Configuración principal
├── mvp.env                 # Variables de entorno para MVP
└── MVP_README.md           # Este archivo
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run start        # Ejecutar en producción
npm run test         # Ejecutar tests
npm run lint         # Linting
npm run format       # Formatear código

# Docker
docker-compose up -d     # Ejecutar todos los servicios
docker-compose down      # Detener todos los servicios
docker-compose logs -f   # Ver logs en tiempo real
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Evolution API no responde**
   ```bash
   # Verificar que Evolution API esté corriendo
   curl http://localhost:8080/health
   
   # Verificar logs
   docker-compose logs evolution_api
   ```

2. **Base de datos no conecta**
   ```bash
   # Verificar que PostgreSQL esté corriendo
   psql -h localhost -U evolution_user -d evolution_db
   
   # Verificar la URL de conexión en .env
   DATABASE_URL=postgresql://evolution_user:evolution_password@localhost:5432/evolution_db
   ```

3. **Redis no conecta**
   ```bash
   # Verificar que Redis esté corriendo
   redis-cli ping
   
   # Verificar logs de Redis
   docker-compose logs redis
   ```

4. **Webhooks no llegan**
   ```bash
   # Verificar configuración de webhook
   curl http://localhost:3001/api/webhook/config/your-instance
   
   # Verificar logs del adapter
   docker-compose logs evolution_adapter
   ```

### Logs

```bash
# Ver logs en tiempo real
docker-compose logs -f evolution_adapter

# Ver logs de errores
docker-compose logs evolution_adapter | grep ERROR

# Ver logs de un servicio específico
docker-compose logs evolution_api
docker-compose logs redis
```

## 📈 Monitoreo

### Health Checks

```bash
# Health check básico
curl http://localhost:3001/health

# Health check detallado
curl http://localhost:3001/health/detailed

# Health check para load balancers
curl http://localhost:3001/health/ping
```

### Métricas

```bash
# Estadísticas de rate limiting
curl http://localhost:3001/health/detailed
```

## 🔒 Seguridad

### Variables de Entorno Críticas

- `JWT_SECRET`: Cambiar en producción
- `EVOLUTION_API_KEY`: Configurar correctamente
- `ALLOWED_ORIGINS`: Restringir a dominios permitidos

### Rate Limiting

El servicio incluye rate limiting configurado:
- 100 requests por 15 minutos para endpoints generales
- 1000 requests por 15 minutos para webhooks
- 50 requests por 15 minutos para envío de mensajes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Para soporte técnico, contacta al equipo de desarrollo de Aurelia. 