import { logger } from '@/utils/logger';
import { MessageProcessor } from './MessageProcessor';

interface WebhookData {
  event: string;
  instance: string;
  data: any;
  timestamp: number;
}

export class WebhookService {
  private messageProcessor: MessageProcessor;

  constructor() {
    this.messageProcessor = new MessageProcessor();
  }

  async processWebhook(webhookData: WebhookData): Promise<void> {
    try {
      logger.info('Procesando webhook', {
        event: webhookData.event,
        instance: webhookData.instance,
        timestamp: webhookData.timestamp
      });

      switch (webhookData.event) {
        case 'messages.upsert':
          await this.handleMessageUpsert(webhookData);
          break;
        case 'messages.update':
          await this.handleMessageUpdate(webhookData);
          break;
        case 'connection.update':
          await this.handleConnectionUpdate(webhookData);
          break;
        case 'qr.update':
          await this.handleQrUpdate(webhookData);
          break;
        case 'groups.upsert':
          await this.handleGroupUpsert(webhookData);
          break;
        case 'groups.update':
          await this.handleGroupUpdate(webhookData);
          break;
        case 'presence.update':
          await this.handlePresenceUpdate(webhookData);
          break;
        case 'contacts.upsert':
          await this.handleContactUpsert(webhookData);
          break;
        case 'contacts.update':
          await this.handleContactUpdate(webhookData);
          break;
        default:
          logger.warn('Evento de webhook no manejado', {
            event: webhookData.event,
            instance: webhookData.instance
          });
      }
    } catch (error) {
      logger.error('Error procesando webhook', {
        event: webhookData.event,
        instance: webhookData.instance,
        error: (error as Error).message
      });
    }
  }

  private async handleMessageUpsert(webhookData: WebhookData): Promise<void> {
    try {
      const message = webhookData.data;
      
      // Solo procesar mensajes entrantes (no enviados por nosotros)
      if (message.key.fromMe) {
        return;
      }

      logger.info('Nuevo mensaje recibido', {
        instance: webhookData.instance,
        from: message.key.remoteJid,
        messageType: message.message ? Object.keys(message.message)[0] : 'unknown'
      });

      await this.messageProcessor.processIncomingMessage(webhookData.instance, message);
    } catch (error) {
      logger.error('Error procesando mensaje entrante', {
        instance: webhookData.instance,
        error: (error as Error).message
      });
    }
  }

  private async handleMessageUpdate(webhookData: WebhookData): Promise<void> {
    try {
      const messageUpdate = webhookData.data;
      
      logger.info('Mensaje actualizado', {
        instance: webhookData.instance,
        messageId: messageUpdate.key.id,
        status: messageUpdate.update.status
      });

      await this.messageProcessor.processMessageUpdate(webhookData.instance, messageUpdate);
    } catch (error) {
      logger.error('Error procesando actualización de mensaje', {
        instance: webhookData.instance,
        error: (error as Error).message
      });
    }
  }

  private async handleConnectionUpdate(webhookData: WebhookData): Promise<void> {
    try {
      const connectionData = webhookData.data;
      
      logger.info('Estado de conexión actualizado', {
        instance: webhookData.instance,
        status: connectionData.state,
        lastDisconnect: connectionData.lastDisconnect
      });

      // Aquí podrías implementar lógica para manejar cambios de estado de conexión
      // Por ejemplo, notificar a otros servicios sobre el estado de la instancia
    } catch (error) {
      logger.error('Error procesando actualización de conexión', {
        instance: webhookData.instance,
        error: (error as Error).message
      });
    }
  }

  async handleQrUpdate(webhookData: WebhookData): Promise<void> {
    try {
      const qrData = webhookData.data;
      
      logger.info('QR actualizado', {
        instance: webhookData.instance,
        qrCode: qrData.qrcode
      });

      // Aquí podrías implementar lógica para manejar actualizaciones de QR
      // Por ejemplo, almacenar el QR para que el usuario lo escanee
    } catch (error) {
      logger.error('Error procesando actualización de QR', {
        instance: webhookData.instance,
        error: (error as Error).message
      });
    }
  }

  private async handleGroupUpsert(webhookData: WebhookData): Promise<void> {
    try {
      const groupData = webhookData.data;
      
      logger.info('Grupo creado/actualizado', {
        instance: webhookData.instance,
        groupId: groupData.id,
        name: groupData.subject
      });

      // Aquí podrías implementar lógica para manejar grupos
    } catch (error) {
      logger.error('Error procesando upsert de grupo', {
        instance: webhookData.instance,
        error: (error as Error).message
      });
    }
  }

  private async handleGroupUpdate(webhookData: WebhookData): Promise<void> {
    try {
      const groupUpdate = webhookData.data;
      
      logger.info('Grupo actualizado', {
        instance: webhookData.instance,
        groupId: groupUpdate.id,
        updateType: Object.keys(groupUpdate.update)[0]
      });

      // Aquí podrías implementar lógica para manejar actualizaciones de grupos
    } catch (error) {
      logger.error('Error procesando actualización de grupo', {
        instance: webhookData.instance,
        error: (error as Error).message
      });
    }
  }

  private async handlePresenceUpdate(webhookData: WebhookData): Promise<void> {
    try {
      const presenceData = webhookData.data;
      
      logger.info('Presencia actualizada', {
        instance: webhookData.instance,
        userId: presenceData.id,
        presence: presenceData.presence
      });

      // Aquí podrías implementar lógica para manejar actualizaciones de presencia
    } catch (error) {
      logger.error('Error procesando actualización de presencia', {
        instance: webhookData.instance,
        error: (error as Error).message
      });
    }
  }

  private async handleContactUpsert(webhookData: WebhookData): Promise<void> {
    try {
      const contactData = webhookData.data;
      
      logger.info('Contacto creado/actualizado', {
        instance: webhookData.instance,
        contactId: contactData.id,
        name: contactData.name
      });

      // Aquí podrías implementar lógica para manejar contactos
    } catch (error) {
      logger.error('Error procesando upsert de contacto', {
        instance: webhookData.instance,
        error: (error as Error).message
      });
    }
  }

  private async handleContactUpdate(webhookData: WebhookData): Promise<void> {
    try {
      const contactUpdate = webhookData.data;
      
      logger.info('Contacto actualizado', {
        instance: webhookData.instance,
        contactId: contactUpdate.id,
        updateType: Object.keys(contactUpdate.update)[0]
      });

      // Aquí podrías implementar lógica para manejar actualizaciones de contactos
    } catch (error) {
      logger.error('Error procesando actualización de contacto', {
        instance: webhookData.instance,
        error: (error as Error).message
      });
    }
  }

  async validateWebhook(webhookData: any): Promise<boolean> {
    try {
      // Validar que el webhook tiene los campos requeridos
      if (!webhookData.event || !webhookData.instance) {
        return false;
      }

      // Validar que el evento es válido
      const validEvents = [
        'messages.upsert',
        'messages.update',
        'connection.update',
        'qr.update',
        'groups.upsert',
        'groups.update',
        'presence.update',
        'contacts.upsert',
        'contacts.update'
      ];

      return validEvents.includes(webhookData.event);
    } catch (error) {
      logger.error('Error validando webhook', { error: (error as Error).message });
      return false;
    }
  }

  async configureWebhook(instance: string, webhookUrl: string, events: string[]): Promise<any> {
    try {
      logger.info('Configurando webhook', {
        instance,
        webhookUrl,
        events
      });

      // Aquí implementarías la lógica para configurar el webhook
      // Por ejemplo, guardar en base de datos o enviar a Evolution API

      return {
        success: true,
        message: 'Webhook configurado exitosamente'
      };
    } catch (error) {
      logger.error('Error configurando webhook', {
        instance,
        error: (error as Error).message
      });
      throw error;
    }
  }

  async getWebhookConfig(instance: string): Promise<any> {
    try {
      logger.info('Obteniendo configuración de webhook', { instance });

      // Aquí implementarías la lógica para obtener la configuración del webhook
      // Por ejemplo, consultar base de datos

      return {
        webhookUrl: 'https://example.com/webhook',
        events: ['messages.upsert', 'messages.update']
      };
    } catch (error) {
      logger.error('Error obteniendo configuración de webhook', {
        instance,
        error: (error as Error).message
      });
      throw error;
    }
  }

  async updateConnectionStatus(instance: string, status: string): Promise<void> {
    try {
      logger.info('Actualizando estado de conexión', {
        instance,
        status
      });

      // Aquí implementarías la lógica para actualizar el estado de conexión
    } catch (error) {
      logger.error('Error actualizando estado de conexión', {
        instance,
        status,
        error: (error as Error).message
      });
    }
  }

  async updatePresence(instance: string, userId: string, presence: string): Promise<void> {
    try {
      logger.info('Actualizando presencia', {
        instance,
        userId,
        presence
      });

      // Aquí implementarías la lógica para actualizar la presencia
    } catch (error) {
      logger.error('Error actualizando presencia', {
        instance,
        userId,
        presence,
        error: (error as Error).message
      });
    }
  }

  async updateGroupInfo(instance: string, groupId: string, info: any): Promise<void> {
    try {
      logger.info('Actualizando información de grupo', {
        instance,
        groupId,
        info
      });

      // Aquí implementarías la lógica para actualizar información de grupo
    } catch (error) {
      logger.error('Error actualizando información de grupo', {
        instance,
        groupId,
        error: (error as Error).message
      });
    }
  }
} 