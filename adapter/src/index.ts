import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { rateLimiter } from '@/middleware/rateLimit';
import { authMiddleware } from '@/middleware/auth';
import webhookRoutes from '@/controllers/WebhookController';
import messageRoutes from '@/controllers/MessageController';
import instanceRoutes from '@/controllers/InstanceController';
import healthRoutes from '@/controllers/HealthController';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad y optimización
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Rate limiting
app.use(rateLimiter);

// Health check (sin autenticación)
app.use('/health', healthRoutes);

// Rutas protegidas
app.use('/api/webhook', authMiddleware, webhookRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/instances', authMiddleware, instanceRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`🚀 Evolution Adapter iniciado en puerto ${PORT}`);
  logger.info(`📊 Health check disponible en http://localhost:${PORT}/health`);
  logger.info(`🔗 Webhook endpoint: http://localhost:${PORT}/api/webhook`);
});

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

export default app; 