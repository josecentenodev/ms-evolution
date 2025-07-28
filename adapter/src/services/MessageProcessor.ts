import { logger } from '@/utils/logger';

interface MessageData {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: any;
  messageTimestamp: number;
  pushName?: string;
}

interface MessageUpdate {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  update: {
    status: string;
  };
}

export class MessageProcessor {
  constructor() {
    // Inicializar el procesador de mensajes
  }

  async processIncomingMessage(instance: string, messageData: MessageData): Promise<void> {
    try {
      const { key, message, messageTimestamp, pushName } = messageData;
      
      logger.info('Procesando mensaje entrante', {
        instance,
        from: key.remoteJid,
        messageId: key.id,
        timestamp: messageTimestamp,
        pushName,
        messageType: this.getMessageType(message)
      });

      // Extraer el contenido del mensaje según su tipo
      const messageContent = this.extractMessageContent(message);
      
      // Aquí puedes implementar la lógica específica para procesar el mensaje
      // Por ejemplo:
      // - Guardar en base de datos
      // - Enviar a un sistema de IA para procesamiento
      // - Notificar a otros servicios
      // - Ejecutar respuestas automáticas
      
      await this.saveMessageToDatabase(instance, messageData, messageContent);
      await this.notifyOtherServices(instance, messageData, messageContent);
      
    } catch (error) {
      logger.error('Error procesando mensaje entrante', {
        instance,
        messageId: messageData.key.id,
        error: (error as Error).message
      });
    }
  }

  async processMessageUpdate(instance: string, messageUpdate: MessageUpdate): Promise<void> {
    try {
      const { key, update } = messageUpdate;
      
      logger.info('Procesando actualización de mensaje', {
        instance,
        messageId: key.id,
        status: update.status
      });

      // Aquí puedes implementar la lógica para manejar actualizaciones de estado
      // Por ejemplo:
      // - Actualizar el estado del mensaje en la base de datos
      // - Notificar cuando un mensaje ha sido leído
      // - Actualizar métricas de entrega
      
      await this.updateMessageStatus(instance, key.id, update.status);
      
    } catch (error) {
      logger.error('Error procesando actualización de mensaje', {
        instance,
        messageId: messageUpdate.key.id,
        error: (error as Error).message
      });
    }
  }

  private getMessageType(message: any): string {
    if (!message) return 'unknown';
    
    const messageTypes = Object.keys(message);
    return messageTypes.length > 0 ? messageTypes[0] : 'unknown';
  }

  private extractMessageContent(message: any): any {
    if (!message) return null;

    const messageType = this.getMessageType(message);
    
    switch (messageType) {
      case 'conversation':
      case 'extendedTextMessage':
        return {
          type: 'text',
          content: message[messageType]?.text || message.conversation || ''
        };
      
      case 'imageMessage':
        return {
          type: 'image',
          url: message.imageMessage?.url,
          mimetype: message.imageMessage?.mimetype,
          caption: message.imageMessage?.caption
        };
      
      case 'videoMessage':
        return {
          type: 'video',
          url: message.videoMessage?.url,
          mimetype: message.videoMessage?.mimetype,
          caption: message.videoMessage?.caption
        };
      
      case 'audioMessage':
        return {
          type: 'audio',
          url: message.audioMessage?.url,
          mimetype: message.audioMessage?.mimetype,
          ptt: message.audioMessage?.ptt
        };
      
      case 'documentMessage':
        return {
          type: 'document',
          url: message.documentMessage?.url,
          mimetype: message.documentMessage?.mimetype,
          fileName: message.documentMessage?.fileName,
          caption: message.documentMessage?.caption
        };
      
      case 'locationMessage':
        return {
          type: 'location',
          latitude: message.locationMessage?.degreesLatitude,
          longitude: message.locationMessage?.degreesLongitude,
          name: message.locationMessage?.name,
          address: message.locationMessage?.address
        };
      
      case 'contactMessage':
        return {
          type: 'contact',
          contacts: message.contactMessage?.contacts
        };
      
      case 'contactsArrayMessage':
        return {
          type: 'contacts',
          contacts: message.contactsArrayMessage?.contacts
        };
      
      case 'reactionMessage':
        return {
          type: 'reaction',
          key: message.reactionMessage?.key,
          text: message.reactionMessage?.text
        };
      
      case 'protocolMessage':
        return {
          type: 'protocol',
          key: message.protocolMessage?.key,
          protocolType: message.protocolMessage?.type
        };
      
      default:
        return {
          type: 'unknown',
          raw: message
        };
    }
  }

  private async saveMessageToDatabase(instance: string, messageData: MessageData, content: any): Promise<void> {
    try {
      // Aquí implementarías la lógica para guardar el mensaje en la base de datos
      // Por ejemplo, usando Prisma o cualquier ORM que prefieras
      
      logger.info('Mensaje guardado en base de datos', {
        instance,
        messageId: messageData.key.id,
        from: messageData.key.remoteJid,
        type: content.type
      });
      
    } catch (error) {
      logger.error('Error guardando mensaje en base de datos', {
        instance,
        messageId: messageData.key.id,
        error: (error as Error).message
      });
    }
  }

  private async notifyOtherServices(instance: string, messageData: MessageData, content: any): Promise<void> {
    try {
      // Aquí implementarías la lógica para notificar a otros servicios
      // Por ejemplo, enviar a un webhook, a una cola de mensajes, etc.
      
      logger.info('Notificando a otros servicios', {
        instance,
        messageId: messageData.key.id,
        from: messageData.key.remoteJid,
        type: content.type
      });
      
    } catch (error) {
      logger.error('Error notificando a otros servicios', {
        instance,
        messageId: messageData.key.id,
        error: (error as Error).message
      });
    }
  }

  async updateMessageStatus(instance: string, messageId: string, status: string): Promise<void> {
    try {
      // Aquí implementarías la lógica para actualizar el estado del mensaje
      // Por ejemplo, actualizar en la base de datos
      
      logger.info('Estado de mensaje actualizado', {
        instance,
        messageId,
        status
      });
      
    } catch (error) {
      logger.error('Error actualizando estado de mensaje', {
        instance,
        messageId,
        status,
        error: (error as Error).message
      });
    }
  }
} 