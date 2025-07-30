import { Router, Request, Response } from 'express';
import { logger } from '@/utils/logger';
import { asyncHandler } from '@/middleware/errorHandler';
import { DiagnosticService } from '@/utils/diagnostic';

const router = Router();
const diagnosticService = new DiagnosticService();

// Health check básico
router.get('/ping', asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Evolution Adapter is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
}));

// Diagnóstico completo
router.get('/diagnostic', asyncHandler(async (req: Request, res: Response) => {
  logger.info('Ejecutando diagnóstico completo...');
  
  const diagnostics = await diagnosticService.runDiagnostics();
  
  logger.info('Diagnóstico completado', {
    errors: diagnostics.errors.length,
    hasEvolutionApiHealth: !!diagnostics.evolutionApiHealth,
    hasAdapterHealth: !!diagnostics.adapterHealth
  });

  res.status(200).json({
    success: true,
    message: 'Diagnóstico completado',
    data: diagnostics
  });
}));

// Test de creación de instancia
router.post('/test-instance', asyncHandler(async (req: Request, res: Response) => {
  const { instanceName } = req.body;
  
  if (!instanceName) {
    res.status(400).json({
      success: false,
      message: 'instanceName es requerido'
    });
    return;
  }

  logger.info(`Probando creación de instancia: ${instanceName}`);
  
  const result = await diagnosticService.testInstanceCreation(instanceName);
  
  res.status(200).json({
    success: true,
    message: 'Test de instancia completado',
    data: result
  });
}));

export default router; 