import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  // Log del error
  logger.error(`Error ${statusCode}: ${message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: error.stack
  });

  // En desarrollo, incluir stack trace
  const response: any = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  // Errores específicos de validación
  if (error.name === 'ValidationError') {
    response.message = 'Error de validación';
    response.errors = (error as any).details;
  }

  // Errores de JWT
  if (error.name === 'JsonWebTokenError') {
    response.message = 'Token inválido';
  }

  // Errores de JWT expirado
  if (error.name === 'TokenExpiredError') {
    response.message = 'Token expirado';
  }

  res.status(statusCode).json(response);
};

// Middleware para capturar errores asíncronos
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Función para crear errores personalizados
export const createError = (message: string, statusCode: number = 500): CustomError => {
  return new CustomError(message, statusCode);
};

// Errores comunes
export const Errors = {
  BAD_REQUEST: (message: string = 'Solicitud incorrecta') => createError(message, 400),
  UNAUTHORIZED: (message: string = 'No autorizado') => createError(message, 401),
  FORBIDDEN: (message: string = 'Acceso prohibido') => createError(message, 403),
  NOT_FOUND: (message: string = 'Recurso no encontrado') => createError(message, 404),
  CONFLICT: (message: string = 'Conflicto de datos') => createError(message, 409),
  INTERNAL_SERVER: (message: string = 'Error interno del servidor') => createError(message, 500),
  SERVICE_UNAVAILABLE: (message: string = 'Servicio no disponible') => createError(message, 503)
}; 