import { Router, Request, Response } from 'express';
import { logger } from '@/utils/logger';
import { asyncHandler } from '@/middleware/errorHandler';
import { Errors } from '@/middleware/errorHandler';
import { InstanceService } from '@/services/InstanceService';
import { requireClientAccess } from '@/middleware/auth';

const router = Router();
const instanceService = new InstanceService();

// Crear nueva instancia
router.post('/create', requireClientAccess('clientId'), asyncHandler(async (req: Request, res: Response) => {
  const { instance, clientId, webhookUrl, webhookByEvents, events } = req.body;
  
  if (!instance || !clientId) {
    throw Errors.BAD_REQUEST('Instance y clientId son requeridos');
  }

  try {
    const result = await instanceService.createInstance(instance, {
      clientId,
      webhookUrl,
      webhookByEvents,
      events
    });
    
    logger.info('Instancia creada exitosamente', {
      instance,
      clientId: req.clientId
    });

    res.status(201).json({
      success: true,
      message: 'Instancia creada exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error creando instancia', {
      error: (error as Error).message,
      instance,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Conectar instancia (generar QR)
router.post('/connect/:instance', requireClientAccess('clientId'), asyncHandler(async (req: Request, res: Response) => {
  const { instance } = req.params;
  
  try {
    const result = await instanceService.connectInstance(instance);
    
    logger.info('Instancia conectada exitosamente', {
      instance,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      message: 'Instancia conectada exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error conectando instancia', {
      error: (error as Error).message,
      instance,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Desconectar instancia
router.post('/disconnect/:instance', requireClientAccess('clientId'), asyncHandler(async (req: Request, res: Response) => {
  const { instance } = req.params;
  
  try {
    const result = await instanceService.disconnectInstance(instance);
    
    logger.info('Instancia desconectada exitosamente', {
      instance,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      message: 'Instancia desconectada exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error desconectando instancia', {
      error: (error as Error).message,
      instance,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Eliminar instancia
router.delete('/delete/:instance', requireClientAccess('clientId'), asyncHandler(async (req: Request, res: Response) => {
  const { instance } = req.params;
  
  try {
    const result = await instanceService.deleteInstance(instance);
    
    logger.info('Instancia eliminada exitosamente', {
      instance,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      message: 'Instancia eliminada exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error eliminando instancia', {
      error: (error as Error).message,
      instance,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Obtener información de instancia
router.get('/info/:instance', asyncHandler(async (req: Request, res: Response) => {
  const { instance } = req.params;
  
  try {
    const info = await instanceService.getInstanceInfo(instance);
    
    logger.info('Información de instancia obtenida', {
      instance,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      data: info
    });
  } catch (error) {
    logger.error('Error obteniendo información de instancia', {
      error: (error as Error).message,
      instance,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Obtener estado de instancia
router.get('/status/:instance', asyncHandler(async (req: Request, res: Response) => {
  const { instance } = req.params;
  
  try {
    const status = await instanceService.getInstanceStatus(instance);
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error obteniendo estado de instancia', {
      error: (error as Error).message,
      instance,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Obtener QR de instancia
router.get('/qr/:instance', asyncHandler(async (req: Request, res: Response) => {
  const { instance } = req.params;
  
  try {
    const qr = await instanceService.getInstanceQR(instance);
    
    res.status(200).json({
      success: true,
      data: qr
    });
  } catch (error) {
    logger.error('Error obteniendo QR de instancia', {
      error: (error as Error).message,
      instance,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Listar todas las instancias de un cliente
router.get('/list', asyncHandler(async (req: Request, res: Response) => {
  const { clientId } = req.query;
  
  if (!clientId) {
    throw Errors.BAD_REQUEST('ClientId es requerido');
  }

  try {
    const instances = await instanceService.getInstancesByClient(clientId as string);
    
    logger.info('Lista de instancias obtenida', {
      clientId,
      count: instances.length
    });

    res.status(200).json({
      success: true,
      data: instances
    });
  } catch (error) {
    logger.error('Error obteniendo lista de instancias', {
      error: (error as Error).message,
      clientId,
      requestingClientId: req.clientId
    });
    
    throw error;
  }
}));

// Actualizar configuración de instancia
router.put('/config/:instance', requireClientAccess('clientId'), asyncHandler(async (req: Request, res: Response) => {
  const { instance } = req.params;
  const { webhookUrl, webhookByEvents, events, qrcode, number, token } = req.body;
  
  try {
    const result = await instanceService.updateInstanceConfig(instance, {
      webhookUrl,
      webhookByEvents,
      events,
      qrcode,
      number,
      token
    });
    
    logger.info('Configuración de instancia actualizada', {
      instance,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error actualizando configuración de instancia', {
      error: (error as Error).message,
      instance,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Obtener configuración de instancia
router.get('/config/:instance', asyncHandler(async (req: Request, res: Response) => {
  const { instance } = req.params;
  
  try {
    const config = await instanceService.getInstanceConfig(instance);
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Error obteniendo configuración de instancia', {
      error: (error as Error).message,
      instance,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Obtener chats de instancia
router.get('/chats/:instance', asyncHandler(async (req: Request, res: Response) => {
  const { instance } = req.params;
  const { limit = 50, cursor } = req.query;
  
  try {
    const chats = await instanceService.getInstanceChats(instance);
    
    logger.info('Chats de instancia obtenidos', {
      instance,
      count: chats.length,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    logger.error('Error obteniendo chats de instancia', {
      error: (error as Error).message,
      instance,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Obtener contactos de instancia
router.get('/contacts/:instance', asyncHandler(async (req: Request, res: Response) => {
  const { instance } = req.params;
  const { limit = 50, cursor } = req.query;
  
  try {
    const contacts = await instanceService.getInstanceContacts(instance);
    
    logger.info('Contactos de instancia obtenidos', {
      instance,
      count: contacts.length,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    logger.error('Error obteniendo contactos de instancia', {
      error: (error as Error).message,
      instance,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

export default router; 