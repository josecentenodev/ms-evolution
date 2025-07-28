import axios from 'axios';
import { logger } from '@/utils/logger';

interface MessageData {
  number: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: string;
  caption?: string;
  buttons?: Array<{
    id: string;
    body: string;
  }>;
  title?: string;
  description?: string;
  footer?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  address?: string;
  contacts?: any[];
}

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class MessageService {
  private evolutionApiUrl: string;
  private evolutionApiKey: string;

  constructor() {
    this.evolutionApiUrl = process.env.EVOLUTION_API_URL || 'http://evolution-api:8080';
    this.evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
  }

  async sendTextMessage(instance: string, data: MessageData): Promise<SendMessageResult> {
    try {
      const response = await axios.post(`${this.evolutionApiUrl}/message/sendText/${instance}`, {
        number: data.number,
        text: data.text
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.evolutionApiKey
        }
      });

      logger.info('Mensaje de texto enviado exitosamente', { 
        instance, 
        number: data.number,
        messageId: response.data.key?.id 
      });

      return {
        success: true,
        messageId: response.data.key?.id
      };
    } catch (error) {
      logger.error('Error enviando mensaje de texto', { 
        instance, 
        number: data.number,
        error: (error as any).response?.data || (error as Error).message 
      });
      
      return {
        success: false,
        error: (error as any).response?.data?.message || (error as Error).message
      };
    }
  }

  async sendMediaMessage(instance: string, data: MessageData): Promise<SendMessageResult> {
    try {
      const response = await axios.post(`${this.evolutionApiUrl}/message/sendMedia/${instance}`, {
        number: data.number,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        caption: data.caption
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.evolutionApiKey
        }
      });

      logger.info('Mensaje multimedia enviado exitosamente', { 
        instance, 
        number: data.number,
        mediaType: data.mediaType,
        messageId: response.data.key?.id 
      });

      return {
        success: true,
        messageId: response.data.key?.id
      };
    } catch (error) {
      logger.error('Error enviando mensaje multimedia', { 
        instance, 
        number: data.number,
        mediaType: data.mediaType,
        error: (error as any).response?.data || (error as Error).message 
      });
      
      return {
        success: false,
        error: (error as any).response?.data?.message || (error as Error).message
      };
    }
  }

  async sendButtonMessage(instance: string, data: MessageData): Promise<SendMessageResult> {
    try {
      const response = await axios.post(`${this.evolutionApiUrl}/message/sendButtons/${instance}`, {
        number: data.number,
        title: data.title,
        description: data.description,
        footer: data.footer,
        buttons: data.buttons
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.evolutionApiKey
        }
      });

      logger.info('Mensaje con botones enviado exitosamente', { 
        instance, 
        number: data.number,
        messageId: response.data.key?.id 
      });

      return {
        success: true,
        messageId: response.data.key?.id
      };
    } catch (error) {
      logger.error('Error enviando mensaje con botones', { 
        instance, 
        number: data.number,
        error: (error as any).response?.data || (error as Error).message 
      });
      
      return {
        success: false,
        error: (error as any).response?.data?.message || (error as Error).message
      };
    }
  }

  async sendTemplateMessage(instance: string, data: MessageData): Promise<SendMessageResult> {
    try {
      const response = await axios.post(`${this.evolutionApiUrl}/message/sendTemplate/${instance}`, {
        number: data.number,
        title: data.title,
        description: data.description,
        footer: data.footer,
        mediaUrl: data.mediaUrl
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.evolutionApiKey
        }
      });

      logger.info('Mensaje template enviado exitosamente', { 
        instance, 
        number: data.number,
        messageId: response.data.key?.id 
      });

      return {
        success: true,
        messageId: response.data.key?.id
      };
    } catch (error) {
      logger.error('Error enviando mensaje template', { 
        instance, 
        number: data.number,
        error: (error as any).response?.data || (error as Error).message 
      });
      
      return {
        success: false,
        error: (error as any).response?.data?.message || (error as Error).message
      };
    }
  }

  async getMessageHistory(instance: string, number: string, limit: number = 50): Promise<any> {
    try {
      const response = await axios.get(`${this.evolutionApiUrl}/chat/findMessages/${instance}/${number}`, {
        headers: {
          'apikey': this.evolutionApiKey
        },
        params: {
          limit
        }
      });

      logger.info('Historial de mensajes obtenido', { 
        instance, 
        number,
        messageCount: response.data.length 
      });

      return response.data;
    } catch (error) {
      logger.error('Error obteniendo historial de mensajes', { 
        instance, 
        number,
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error obteniendo historial de mensajes: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }

  async sendImageMessage(instance: string, data: MessageData): Promise<SendMessageResult> {
    return this.sendMediaMessage(instance, { ...data, mediaType: 'image' });
  }

  async sendDocumentMessage(instance: string, data: MessageData): Promise<SendMessageResult> {
    return this.sendMediaMessage(instance, { ...data, mediaType: 'document' });
  }

  async sendAudioMessage(instance: string, data: MessageData): Promise<SendMessageResult> {
    return this.sendMediaMessage(instance, { ...data, mediaType: 'audio' });
  }

  async sendVideoMessage(instance: string, data: MessageData): Promise<SendMessageResult> {
    return this.sendMediaMessage(instance, { ...data, mediaType: 'video' });
  }

  async sendLocationMessage(instance: string, data: MessageData): Promise<SendMessageResult> {
    try {
      const response = await axios.post(`${this.evolutionApiUrl}/message/sendLocation/${instance}`, {
        number: data.number,
        latitude: data.latitude,
        longitude: data.longitude,
        name: data.name,
        address: data.address
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.evolutionApiKey
        }
      });

      logger.info('Mensaje de ubicación enviado exitosamente', { 
        instance, 
        number: data.number,
        messageId: response.data.key?.id 
      });

      return {
        success: true,
        messageId: response.data.key?.id
      };
    } catch (error) {
      logger.error('Error enviando mensaje de ubicación', { 
        instance, 
        number: data.number,
        error: (error as any).response?.data || (error as Error).message 
      });
      
      return {
        success: false,
        error: (error as any).response?.data?.message || (error as Error).message
      };
    }
  }

  async sendContactMessage(instance: string, data: MessageData): Promise<SendMessageResult> {
    try {
      const response = await axios.post(`${this.evolutionApiUrl}/message/sendContact/${instance}`, {
        number: data.number,
        contacts: data.contacts
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.evolutionApiKey
        }
      });

      logger.info('Mensaje de contacto enviado exitosamente', { 
        instance, 
        number: data.number,
        messageId: response.data.key?.id 
      });

      return {
        success: true,
        messageId: response.data.key?.id
      };
    } catch (error) {
      logger.error('Error enviando mensaje de contacto', { 
        instance, 
        number: data.number,
        error: (error as any).response?.data || (error as Error).message 
      });
      
      return {
        success: false,
        error: (error as any).response?.data?.message || (error as Error).message
      };
    }
  }

  async getMessageStatus(instance: string, messageId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.evolutionApiUrl}/message/findMessage/${instance}/${messageId}`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error obteniendo estado de mensaje', { 
        instance, 
        messageId,
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error obteniendo estado de mensaje: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }
} 