import { Router, Request, Response } from 'express';
import { logger } from '@/utils/logger';
import { asyncHandler } from '@/middleware/errorHandler';
import { Errors } from '@/middleware/errorHandler';
import { WebhookService } from '@/services/WebhookService';
import { MessageProcessor } from '@/services/MessageProcessor';

const router = Router();
const webhookService = new WebhookService();
const messageProcessor = new MessageProcessor();

// Endpoint para recibir webhooks de Evolution API
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Validar que el webhook viene de Evolution API
    const isValidWebhook = await webhookService.validateWebhook(req);
    
    if (!isValidWebhook) {
      logger.warn('Webhook inválido recibido', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body
      });
      throw Errors.BAD_REQUEST('Webhook inválido');
    }

    // Procesar el evento del webhook
    const event = req.body;
    const eventType = event.event || 'unknown';
    
    logger.info(`Webhook recibido: ${eventType}`, {
      eventType,
      instance: event.instance,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });

    // Procesar según el tipo de evento
    switch (eventType) {
      case 'messages.upsert':
        await handleMessageUpsert(event);
        break;
      
      case 'messages.update':
        await handleMessageUpdate(event);
        break;
      
      case 'connection.update':
        await handleConnectionUpdate(event);
        break;
      
      case 'qr.update':
        await handleQrUpdate(event);
        break;
      
      case 'presence.update':
        await handlePresenceUpdate(event);
        break;
      
      case 'groups.update':
        await handleGroupsUpdate(event);
        break;
      
      default:
        logger.info(`Evento no manejado: ${eventType}`, {
          eventType,
          instance: event.instance
        });
    }

    const responseTime = Date.now() - startTime;
    
    logger.info(`Webhook procesado exitosamente`, {
      eventType,
      instance: event.instance,
      responseTime
    });

    res.status(200).json({
      success: true,
      message: 'Webhook procesado exitosamente',
      eventType,
      responseTime
    });

  } catch (error) {
    logger.error('Error procesando webhook', {
      error: (error as Error).message,
      body: req.body,
      ip: req.ip,
      responseTime: Date.now() - startTime
    });
    
    throw error;
  }
}));

// Endpoint para configurar webhook URL en Evolution API
router.post('/configure', asyncHandler(async (req: Request, res: Response) => {
  const { instance, webhookUrl } = req.body;
  
  if (!instance || !webhookUrl) {
    throw Errors.BAD_REQUEST('Instance y webhookUrl son requeridos');
  }

  try {
    const result = await webhookService.configureWebhook(instance, webhookUrl, ['messages.upsert', 'messages.update']);
    
    logger.info('Webhook configurado exitosamente', {
      instance,
      webhookUrl,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      message: 'Webhook configurado exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error configurando webhook', {
      error: (error as Error).message,
      instance,
      webhookUrl,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Endpoint para obtener configuración de webhook
router.get('/config/:instance', asyncHandler(async (req: Request, res: Response) => {
  const { instance } = req.params;
  
  try {
    const config = await webhookService.getWebhookConfig(instance);
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Error obteniendo configuración de webhook', {
      error: (error as Error).message,
      instance,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Función para manejar mensajes nuevos
async function handleMessageUpsert(event: any) {
  const { instance, data } = event;
  
  logger.info('Procesando mensaje nuevo', {
    instance,
    messageId: data.key?.id,
    from: data.participant || data.key?.remoteJid,
    type: data.message?.conversation ? 'text' : 'media'
  });

  // Procesar el mensaje
  await messageProcessor.processIncomingMessage(instance, data);
}

// Función para manejar actualizaciones de mensajes
async function handleMessageUpdate(event: any) {
  const { instance, data } = event;
  
  logger.info('Procesando actualización de mensaje', {
    instance,
    messageId: data.key?.id,
    status: data.update?.status
  });

  // Actualizar estado del mensaje
  await messageProcessor.updateMessageStatus(instance, data.key?.id, data.update?.status);
}

// Función para manejar actualizaciones de conexión
async function handleConnectionUpdate(event: any) {
  const { instance, data } = event;
  
  logger.info('Procesando actualización de conexión', {
    instance,
    status: data.status,
    lastSeen: data.lastSeen
  });

  // Actualizar estado de conexión
  await webhookService.updateConnectionStatus(instance, data.status);
}

// Función para manejar actualizaciones de QR
async function handleQrUpdate(event: any) {
  const { instance, data } = event;
  
  logger.info('Procesando actualización de QR', {
    instance,
    qrCode: data.qrcode ? 'presente' : 'no presente'
  });

  // Manejar QR code
  await webhookService.handleQrUpdate({ 
    event: 'qr.update',
    instance, 
    data,
    timestamp: Date.now()
  });
}

// Función para manejar actualizaciones de presencia
async function handlePresenceUpdate(event: any) {
  const { instance, data } = event;
  
  logger.info('Procesando actualización de presencia', {
    instance,
    participant: data.participant,
    presence: data.presence
  });

  // Actualizar presencia
  await webhookService.updatePresence(instance, data.participant, data.presence);
}

// Función para manejar actualizaciones de grupos
async function handleGroupsUpdate(event: any) {
  const { instance, data } = event;
  
  logger.info('Procesando actualización de grupo', {
    instance,
    groupId: data.id,
    action: data.action
  });

  // Actualizar información de grupo
  await webhookService.updateGroupInfo(instance, data.id, data);
}

export default router; 