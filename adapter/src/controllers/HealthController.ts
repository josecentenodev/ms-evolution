import { Router, Request, Response } from 'express';
import { logger } from '@/utils/logger';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// Health check básico
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    responseTime: Date.now() - startTime
  };

  logger.info('Health check realizado', healthData);
  
  res.status(200).json({
    success: true,
    data: healthData
  });
}));

// Health check detallado
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  // Verificar servicios externos
  const serviceChecks = {
    evolutionApi: await checkEvolutionApi(),
    redis: await checkRedis(),
    database: await checkDatabase()
  };

  const allServicesHealthy = Object.values(serviceChecks).every(check => check.status === 'healthy');
  
  const detailedHealthData = {
    status: allServicesHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    },
    cpu: process.cpuUsage(),
    services: serviceChecks,
    responseTime: Date.now() - startTime
  };

  logger.info('Health check detallado realizado', detailedHealthData);
  
  res.status(allServicesHealthy ? 200 : 503).json({
    success: allServicesHealthy,
    data: detailedHealthData
  });
}));

// Health check para load balancers
router.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Función para verificar Evolution API
async function checkEvolutionApi() {
  try {
    const evolutionApiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const response = await fetch(`${evolutionApiUrl}/health`);
    
    if (response.ok) {
      return {
        status: 'healthy',
        responseTime: Date.now(),
        url: evolutionApiUrl
      };
    } else {
      return {
        status: 'unhealthy',
        error: `HTTP ${response.status}`,
        url: evolutionApiUrl
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: (error as Error).message,
      url: process.env.EVOLUTION_API_URL || 'http://localhost:8080'
    };
  }
}

// Función para verificar Redis
async function checkRedis() {
  try {
    // Aquí implementarías la verificación de Redis
    // Por ahora retornamos un mock
    return {
      status: 'healthy',
      message: 'Redis connection available'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: (error as Error).message
    };
  }
}

// Función para verificar Database
async function checkDatabase() {
  try {
    // Aquí implementarías la verificación de la base de datos
    // Por ahora retornamos un mock
    return {
      status: 'healthy',
      message: 'Database connection available'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: (error as Error).message
    };
  }
}

export default router; 