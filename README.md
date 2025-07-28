# MS-Evolution

Microservicio adapter para Evolution API que proporciona una capa de abstracción entre tu aplicación Next.js y la API de WhatsApp.

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Aurelia App   │    │  Evolution API   │    │  WhatsApp API   │
│   (Next.js)     │    │   Adapter        │    │   (External)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Webhook           │                       │
         │ (mensajes entrantes) │                       │
         │◄─────────────────────┤                       │
         │                       │                       │
         │ 2. Enviar mensaje    │                       │
         │─────────────────────►│                       │
         │                       │ 3. Forward to WA     │
         │                       │─────────────────────►│
         │                       │                       │
         │ 4. Respuesta         │                       │
         │◄─────────────────────┤                       │
         │                       │                       │
```

## 📁 Estructura del Proyecto

```
ms-evolution/
├── EvolutionAPI/           # Evolution API (Docker)
│   ├── docker-compose.yml
│   └── .env
├── adapter/                # Microservicio Adapter
│   ├── src/
│   │   ├── controllers/    # Controladores de la API
│   │   ├── services/       # Lógica de negocio
│   │   ├── middleware/     # Middlewares
│   │   ├── utils/          # Utilidades
│   │   └── config/         # Configuraciones
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── docker-compose.yml      # Orquestador principal
└── README.md
```

## 🚀 Características

### Evolution API Adapter
- **Webhook Receiver**: Recibe y procesa eventos de Evolution API
- **Message Sending**: Envía mensajes de diferentes tipos
- **Instance Management**: Gestiona instancias de WhatsApp por cliente
- **Rate Limiting**: Protección contra spam y abuso
- **Authentication**: Sistema de autenticación JWT por cliente
- **Logging**: Logging estructurado con Winston
- **Health Checks**: Monitoreo de salud del servicio
- **Docker Support**: Contenedorización completa

### Escalabilidad
- **Load Balancing**: Nginx como reverse proxy
- **Caching**: Redis para cache y rate limiting
- **Message Queue**: Preparado para RabbitMQ
- **Monitoring**: Health checks y métricas

## 🛠️ Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd ms-evolution
```

### 2. Configuración automática

**Para Linux/macOS:**
```bash
# Dar permisos de ejecución al script de configuración
chmod +x setup.sh

# Ejecutar configuración automática
./setup.sh
```

**Para Windows:**
```powershell
# Ejecutar configuración automática con PowerShell
.\setup.ps1
```

Este script automáticamente:
- Genera un `JWT_SECRET` seguro
- Crea los archivos `.env` necesarios
- Configura las variables de entorno básicas

### 3. Revisar configuración (opcional)
```bash
# Editar configuración de Evolution API si es necesario
nano EvolutionAPI/.env

# Editar configuración del adapter si es necesario
nano adapter/.env
```

### 4. Ejecutar con Docker Compose
```bash
# Levantar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Verificar estado
docker-compose ps
```

### 5. Verificar instalación
```bash
# Health check del adapter
curl http://localhost:3001/health

# Health check de Evolution API
curl http://localhost:8080/health
```

### 6. Generar token de prueba
```bash
# Generar token JWT para pruebas
node generate-test-token.js
```

### 7. Probar la API
```bash
# Usar el token generado para hacer pruebas
TOKEN="tu-token-generado"

# Health check con autenticación
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/health

# Listar instancias
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/instances/list
```

## 📡 API Endpoints

### Adapter (Puerto 3001)
- `GET /health` - Health check básico
- `GET /health/detailed` - Health check detallado
- `POST /api/webhook` - Recibir webhooks
- `POST /api/messages/send/text` - Enviar mensaje de texto
- `GET /api/instances/list` - Listar instancias

### Evolution API (Puerto 8080)
- `GET /health` - Health check
- `POST /instance/create` - Crear instancia
- `POST /instance/connect/:instance` - Conectar instancia

## 🔐 Autenticación

El adapter utiliza JWT para autenticación:

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

## 🚀 Uso con Aurelia Platform

### 1. Configurar webhook
```javascript
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

## 📊 Monitoreo

### Health Checks
```bash
# Adapter
curl http://localhost:3001/health

# Evolution API
curl http://localhost:8080/health
```

### Logs
```bash
# Ver logs del adapter
docker-compose logs -f evolution_adapter

# Ver logs de Evolution API
docker-compose logs -f evolution_api
```

## 🔧 Desarrollo

### Estructura de Desarrollo
```
adapter/
├── src/
│   ├── controllers/     # Controladores de la API
│   │   ├── WebhookController.ts
│   │   ├── MessageController.ts
│   │   ├── InstanceController.ts
│   │   └── HealthController.ts
│   ├── services/        # Lógica de negocio
│   │   ├── EvolutionService.ts
│   │   ├── WebhookService.ts
│   │   ├── MessageService.ts
│   │   └── InstanceService.ts
│   ├── middleware/      # Middlewares
│   │   ├── auth.ts
│   │   ├── rateLimit.ts
│   │   └── errorHandler.ts
│   └── utils/           # Utilidades
│       └── logger.ts
```

### Scripts de Desarrollo
```bash
# Entrar al contenedor del adapter
docker-compose exec evolution_adapter sh

# Ver logs en tiempo real
docker-compose logs -f evolution_adapter

# Reconstruir adapter
docker-compose build evolution_adapter
docker-compose up -d evolution_adapter
```

## 📈 Escalabilidad

### Para Alta Concurrencia (200+ conversaciones diarias)

1. **Load Balancer**: Nginx o Traefik
2. **Redis Cluster**: Para cache distribuido
3. **Message Queue**: RabbitMQ para procesamiento asíncrono
4. **Database**: PostgreSQL con read replicas
5. **Monitoring**: Prometheus + Grafana

### Configuración de Producción
```yaml
# docker-compose.prod.yml
version: '3.9'
services:
  evolution_adapter:
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Evolution API no responde**
   ```bash
   # Verificar que esté corriendo
   docker-compose ps evolution_api
   
   # Ver logs
   docker-compose logs evolution_api
   ```

2. **Webhooks no llegan**
   ```bash
   # Verificar configuración del webhook
   curl http://localhost:3001/api/webhook/config/your-instance
   ```

3. **Rate limiting**
   ```bash
   # Ver estadísticas
   curl http://localhost:3001/health/detailed
   ```

## 📋 Roadmap

### Fase 1: MVP ✅
- [x] Estructura básica del adapter
- [x] Webhook receiver
- [x] Message sending
- [x] Instance management
- [x] Authentication
- [x] Rate limiting
- [x] Docker support

### Fase 2: Escalabilidad 🔄
- [ ] Message queue (RabbitMQ)
- [ ] Database integration
- [ ] Advanced caching
- [ ] Load balancing
- [ ] Monitoring dashboard

### Fase 3: Alta Disponibilidad 📋
- [ ] Auto-scaling
- [ ] Disaster recovery
- [ ] Performance optimization
- [ ] Advanced metrics

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Para soporte técnico, contacta al equipo de desarrollo de Aurelia.

---

**Nota**: Este microservicio está diseñado para manejar alta concurrencia y proporcionar una capa de abstracción robusta entre tu aplicación Next.js y Evolution API.
