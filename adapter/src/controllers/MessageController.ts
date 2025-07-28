import { Router, Request, Response } from 'express';
import { logger } from '@/utils/logger';
import { asyncHandler } from '@/middleware/errorHandler';
import { Errors } from '@/middleware/errorHandler';
import { MessageService } from '@/services/MessageService';
import { requireClientAccess } from '@/middleware/auth';
import { messageRateLimiter } from '@/middleware/rateLimit';

const router = Router();
const messageService = new MessageService();

// Enviar mensaje de texto
router.post('/send/text', messageRateLimiter, requireClientAccess('clientId'), asyncHandler(async (req: Request, res: Response) => {
  const { instance, to, message, clientId } = req.body;
  
  if (!instance || !to || !message) {
    throw Errors.BAD_REQUEST('Instance, to y message son requeridos');
  }

  try {
    const result = await messageService.sendTextMessage(instance, {
      number: to,
      text: message
    });
    
    logger.info('Mensaje de texto enviado exitosamente', {
      instance,
      to,
      messageId: result.messageId,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error enviando mensaje de texto', {
      error: (error as Error).message,
      instance,
      to,
      message,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Enviar mensaje de imagen
router.post('/send/image', messageRateLimiter, requireClientAccess('clientId'), asyncHandler(async (req: Request, res: Response) => {
  const { instance, to, imageUrl, caption, clientId } = req.body;
  
  if (!instance || !to || !imageUrl) {
    throw Errors.BAD_REQUEST('Instance, to e imageUrl son requeridos');
  }

  try {
    const result = await messageService.sendImageMessage(instance, {
      number: to,
      mediaUrl: imageUrl,
      caption: caption
    });
    
    logger.info('Mensaje de imagen enviado exitosamente', {
      instance,
      to,
      messageId: result.messageId,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      message: 'Imagen enviada exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error enviando mensaje de imagen', {
      error: (error as Error).message,
      instance,
      to,
      imageUrl,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Enviar mensaje de documento
router.post('/send/document', messageRateLimiter, requireClientAccess('clientId'), asyncHandler(async (req: Request, res: Response) => {
  const { instance, to, documentUrl, fileName, caption, clientId } = req.body;
  
  if (!instance || !to || !documentUrl || !fileName) {
    throw Errors.BAD_REQUEST('Instance, to, documentUrl y fileName son requeridos');
  }

  try {
    const result = await messageService.sendDocumentMessage(instance, {
      number: to,
      mediaUrl: documentUrl,
      caption: caption
    });
    
    logger.info('Documento enviado exitosamente', {
      instance,
      to,
      messageId: result.messageId,
      fileName,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      message: 'Documento enviado exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error enviando documento', {
      error: (error as Error).message,
      instance,
      to,
      documentUrl,
      fileName,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Enviar mensaje de audio
router.post('/send/audio', messageRateLimiter, requireClientAccess('clientId'), asyncHandler(async (req: Request, res: Response) => {
  const { instance, to, audioUrl, clientId } = req.body;
  
  if (!instance || !to || !audioUrl) {
    throw Errors.BAD_REQUEST('Instance, to y audioUrl son requeridos');
  }

  try {
    const result = await messageService.sendAudioMessage(instance, {
      number: to,
      mediaUrl: audioUrl
    });
    
    logger.info('Audio enviado exitosamente', {
      instance,
      to,
      messageId: result.messageId,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      message: 'Audio enviado exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error enviando audio', {
      error: (error as Error).message,
      instance,
      to,
      audioUrl,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Enviar mensaje de video
router.post('/send/video', messageRateLimiter, requireClientAccess('clientId'), asyncHandler(async (req: Request, res: Response) => {
  const { instance, to, videoUrl, caption, clientId } = req.body;
  
  if (!instance || !to || !videoUrl) {
    throw Errors.BAD_REQUEST('Instance, to y videoUrl son requeridos');
  }

  try {
    const result = await messageService.sendVideoMessage(instance, {
      number: to,
      mediaUrl: videoUrl,
      caption: caption
    });
    
    logger.info('Video enviado exitosamente', {
      instance,
      to,
      messageId: result.messageId,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      message: 'Video enviado exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error enviando video', {
      error: (error as Error).message,
      instance,
      to,
      videoUrl,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Enviar mensaje de ubicación
router.post('/send/location', messageRateLimiter, requireClientAccess('clientId'), asyncHandler(async (req: Request, res: Response) => {
  const { instance, to, latitude, longitude, name, address, clientId } = req.body;
  
  if (!instance || !to || !latitude || !longitude) {
    throw Errors.BAD_REQUEST('Instance, to, latitude y longitude son requeridos');
  }

  try {
    const result = await messageService.sendLocationMessage(instance, {
      number: to,
      latitude: latitude,
      longitude: longitude,
      name: name,
      address: address
    });
    
    logger.info('Ubicación enviada exitosamente', {
      instance,
      to,
      messageId: result.messageId,
      latitude,
      longitude,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      message: 'Ubicación enviada exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error enviando ubicación', {
      error: (error as Error).message,
      instance,
      to,
      latitude,
      longitude,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Enviar mensaje de contacto
router.post('/send/contact', messageRateLimiter, requireClientAccess('clientId'), asyncHandler(async (req: Request, res: Response) => {
  const { instance, to, contactNumber, contactName, clientId } = req.body;
  
  if (!instance || !to || !contactNumber || !contactName) {
    throw Errors.BAD_REQUEST('Instance, to, contactNumber y contactName son requeridos');
  }

  try {
    const result = await messageService.sendContactMessage(instance, {
      number: to,
      contacts: [{
        number: contactNumber,
        name: contactName
      }]
    });
    
    logger.info('Contacto enviado exitosamente', {
      instance,
      to,
      messageId: result.messageId,
      contactNumber,
      contactName,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      message: 'Contacto enviado exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error enviando contacto', {
      error: (error as Error).message,
      instance,
      to,
      contactNumber,
      contactName,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Enviar mensaje de botones
router.post('/send/buttons', messageRateLimiter, requireClientAccess('clientId'), asyncHandler(async (req: Request, res: Response) => {
  const { instance, to, title, body, buttons, clientId } = req.body;
  
  if (!instance || !to || !title || !body || !buttons) {
    throw Errors.BAD_REQUEST('Instance, to, title, body y buttons son requeridos');
  }

  try {
    const result = await messageService.sendButtonMessage(instance, {
      number: to,
      title: title,
      description: body,
      buttons: buttons
    });
    
    logger.info('Mensaje con botones enviado exitosamente', {
      instance,
      to,
      messageId: result.messageId,
      title,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      message: 'Mensaje con botones enviado exitosamente',
      data: result
    });
  } catch (error) {
    logger.error('Error enviando mensaje con botones', {
      error: (error as Error).message,
      instance,
      to,
      title,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Obtener historial de mensajes
router.get('/history/:instance/:phone', asyncHandler(async (req: Request, res: Response) => {
  const { instance, phone } = req.params;
  const { limit = 50, cursor } = req.query;
  
  try {
    const messages = await messageService.getMessageHistory(instance, phone, Number(limit));
    
    logger.info('Historial de mensajes obtenido', {
      instance,
      phone,
      count: messages.length,
      clientId: req.clientId
    });

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    logger.error('Error obteniendo historial de mensajes', {
      error: (error as Error).message,
      instance,
      phone,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

// Obtener estado de un mensaje
router.get('/status/:instance/:messageId', asyncHandler(async (req: Request, res: Response) => {
  const { instance, messageId } = req.params;
  
  try {
    const status = await messageService.getMessageStatus(instance, messageId);
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error obteniendo estado de mensaje', {
      error: (error as Error).message,
      instance,
      messageId,
      clientId: req.clientId
    });
    
    throw error;
  }
}));

export default router; 