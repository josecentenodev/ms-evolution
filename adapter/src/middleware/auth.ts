import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { logger } from '@/utils/logger';
import { Errors } from '@/middleware/errorHandler';

// Extender la interfaz Request para incluir información del cliente
declare global {
  namespace Express {
    interface Request {
      clientId?: string;
      clientName?: string;
      userId?: string;
      userRole?: string;
    }
  }
}

export interface JWTPayload {
  clientId: string;
  clientName: string;
  userId?: string;
  userRole?: string;
  iat?: number;
  exp?: number;
}

// Middleware de autenticación
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw Errors.UNAUTHORIZED('Token de autorización requerido');
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      throw Errors.UNAUTHORIZED('Token de autorización requerido');
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
    
    // Agregar información del cliente al request
    req.clientId = decoded.clientId;
    req.clientName = decoded.clientName;
    req.userId = decoded.userId;
    req.userRole = decoded.userRole;

    // Log de autenticación exitosa
    logger.info(`Autenticación exitosa para cliente: ${decoded.clientName}`, {
      clientId: decoded.clientId,
      userId: decoded.userId,
      endpoint: req.originalUrl,
      method: req.method
    });

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Token JWT inválido', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw Errors.UNAUTHORIZED('Token inválido');
    }
    
    if (error.name === 'TokenExpiredError') {
      logger.warn('Token JWT expirado', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw Errors.UNAUTHORIZED('Token expirado');
    }

    logger.error('Error en autenticación', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    throw Errors.UNAUTHORIZED('Error de autenticación');
  }
};

// Middleware para verificar roles específicos
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      throw Errors.FORBIDDEN('Rol requerido');
    }

    if (!roles.includes(req.userRole)) {
      logger.warn(`Acceso denegado: rol ${req.userRole} no tiene permisos`, {
        clientId: req.clientId,
        userId: req.userId,
        endpoint: req.originalUrl,
        requiredRoles: roles
      });
      throw Errors.FORBIDDEN('Permisos insuficientes');
    }

    next();
  };
};

// Middleware para verificar que el cliente tiene acceso a un recurso específico
export const requireClientAccess = (clientIdParam: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const targetClientId = req.params[clientIdParam] || req.body.clientId;
    
    if (!targetClientId) {
      throw Errors.BAD_REQUEST('ClientId requerido');
    }

    if (req.clientId !== targetClientId) {
      logger.warn(`Acceso denegado: cliente ${req.clientId} intenta acceder a ${targetClientId}`, {
        clientId: req.clientId,
        targetClientId,
        endpoint: req.originalUrl
      });
      throw Errors.FORBIDDEN('Acceso denegado a este cliente');
    }

    next();
  };
};

// Función para generar token JWT
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  // @ts-ignore
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Función para verificar token sin middleware
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
};

// Middleware opcional de autenticación (no falla si no hay token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
    
    req.clientId = decoded.clientId;
    req.clientName = decoded.clientName;
    req.userId = decoded.userId;
    req.userRole = decoded.userRole;

    next();
  } catch (error) {
    // En autenticación opcional, solo logear el error pero continuar
    logger.debug('Error en autenticación opcional', {
      error: (error as Error).message,
      ip: req.ip
    });
    next();
  }
}; 