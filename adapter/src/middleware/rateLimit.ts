import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '@/utils/logger';

// Rate limiter para requests generales
const generalLimiter = new RateLimiterMemory({
  points: 100, // Número de requests permitidos
  duration: 60, // En 60 segundos
  blockDuration: 60 * 15, // Bloquear por 15 minutos si se excede
});

// Rate limiter para webhooks (más permisivo)
const webhookLimiter = new RateLimiterMemory({
  points: 1000, // Más permisivo para webhooks
  duration: 60,
  blockDuration: 60 * 5,
});

// Rate limiter para envío de mensajes
const messageLimiter = new RateLimiterMemory({
  points: 50, // Límite más estricto para envío de mensajes
  duration: 60,
  blockDuration: 60 * 10,
});

// Middleware general de rate limiting
export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Aplicar límite diferente según la ruta
    if (req.path.startsWith('/api/webhook')) {
      await webhookLimiter.consume(key);
    } else if (req.path.startsWith('/api/messages')) {
      await messageLimiter.consume(key);
    } else {
      await generalLimiter.consume(key);
    }
    
    next();
  } catch (rejRes: any) {
    const secs = Math.round((rejRes.msBeforeNext || 60000) / 1000) || 1;
    
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      remainingPoints: rejRes.remainingPoints || 0,
      msBeforeNext: rejRes.msBeforeNext || 60000
    });

    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
      retryAfter: secs
    });
  }
};

// Middleware específico para webhooks
export const webhookRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    await webhookLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round((rejRes.msBeforeNext || 60000) / 1000) || 1;
    
    logger.warn(`Webhook rate limit exceeded for IP: ${req.ip}`);
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Demasiados webhooks. Intenta de nuevo más tarde.',
      retryAfter: secs
    });
  }
};

// Middleware específico para envío de mensajes
export const messageRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientId = (req as any).clientId || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${clientId}:${ip}`;
    
    await messageLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round((rejRes.msBeforeNext || 60000) / 1000) || 1;
    
    logger.warn(`Message rate limit exceeded for client: ${(req as any).clientId}`, {
      ip: req.ip,
      remainingPoints: rejRes.remainingPoints || 0
    });
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Límite de envío de mensajes excedido. Intenta de nuevo más tarde.',
      retryAfter: secs
    });
  }
};

// Función para obtener estadísticas de rate limiting
export const getRateLimitStats = () => {
  return {
    general: {
      points: 100,
      duration: 60,
      blockDuration: 60 * 15
    },
    webhook: {
      points: 1000,
      duration: 60,
      blockDuration: 60 * 5
    },
    message: {
      points: 50,
      duration: 60,
      blockDuration: 60 * 10
    }
  };
}; 