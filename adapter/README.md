# Evolution API Adapter

Microservicio adapter para Evolution API que actúa como intermediario entre tu aplicación Next.js y la API de WhatsApp.

## 🚀 Características

- **Webhook Receiver**: Recibe y procesa eventos de Evolution API
- **Message Sending**: Envía mensajes de diferentes tipos (texto, imagen, documento, etc.)
- **Instance Management**: Gestiona instancias de WhatsApp por cliente
- **Rate Limiting**: Protección contra spam y abuso
- **Authentication**: Sistema de autenticación JWT por cliente
- **Logging**: Logging estructurado con Winston
- **Health Checks**: Monitoreo de salud del servicio
- **Docker Support**: Contenedorización completa

## 📋 Requisitos

- Node.js 18+
- Docker y Docker Compose
- Redis (para cache y rate limiting)
- Evolution API v2.1.1+

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd ms-evolution/adapter
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp env.example .env
# Editar .env con tus configuraciones
```

### 4. Desarrollo local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

### 5. Con Docker

```bash
# Construir y ejecutar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f evolution-adapter

# Detener servicios
docker-compose down
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto del servidor | `3001` |
| `EVOLUTION_API_URL` | URL de Evolution API | `http://localhost:8080` |
| `EVOLUTION_API_KEY` | API Key de Evolution | - |
| `JWT_SECRET` | Clave secreta para JWT | - |
| `ALLOWED_ORIGINS` | Orígenes permitidos para CORS | `http://localhost:3000` |
| `REDIS_URL` | URL de Redis | `redis://localhost:6379` |

## 📡 API Endpoints

### Health Check

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

### Estructura del Token

```json
{
  "clientId": "uuid-del-cliente",
  "clientName": "Nombre del Cliente",
  "userId": "uuid-del-usuario",
  "userRole": "admin"
}
```

## 📊 Monitoreo

### Health Check

```bash
curl http://localhost:3001/health
```

### Logs

Los logs se guardan en:
- `logs/combined.log` - Todos los logs
- `logs/error.log` - Solo errores

### Métricas

```bash
# Estadísticas de rate limiting
curl http://localhost:3001/health/detailed
```

## 🚀 Uso con Aurelia Platform

### 1. Configurar webhook en Evolution API

```javascript
// En tu aplicación Next.js
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

Los webhooks se envían automáticamente a tu aplicación Next.js cuando Evolution API recibe mensajes.

## 🔧 Desarrollo

### Estructura del Proyecto

```
src/
├── controllers/     # Controladores de la API
├── services/        # Lógica de negocio
├── middleware/      # Middlewares (auth, rate limit, etc.)
├── utils/           # Utilidades (logger, etc.)
└── config/          # Configuraciones
```

### Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run start        # Ejecutar en producción
npm run test         # Ejecutar tests
npm run lint         # Linting
npm run format       # Formatear código
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Evolution API no responde**
   - Verificar que Evolution API esté corriendo en el puerto 8080
   - Verificar la URL en `EVOLUTION_API_URL`

2. **Webhooks no llegan**
   - Verificar que el webhook esté configurado correctamente
   - Verificar que el puerto 3001 esté abierto

3. **Rate limiting**
   - Ajustar límites en `rateLimit.ts`
   - Verificar logs para identificar IPs problemáticas

### Logs

```bash
# Ver logs en tiempo real
docker-compose logs -f evolution-adapter

# Ver logs de errores
tail -f logs/error.log
```

## 📈 Escalabilidad

### Para Alta Concurrencia

1. **Load Balancer**: Usar Nginx o Traefik
2. **Redis Cluster**: Para cache distribuido
3. **Message Queue**: RabbitMQ para procesamiento asíncrono
4. **Database**: PostgreSQL con read replicas

### Configuración de Producción

```yaml
# docker-compose.prod.yml
version: '3.9'
services:
  evolution-adapter:
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte técnico, contacta al equipo de desarrollo de Aurelia. 