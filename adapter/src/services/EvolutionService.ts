import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '@/utils/logger';

export interface EvolutionConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
}

export interface EvolutionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class EvolutionService {
  private client: AxiosInstance;
  private config: EvolutionConfig;

  constructor(config?: Partial<EvolutionConfig>) {
    this.config = {
      baseURL: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
      apiKey: process.env.EVOLUTION_API_KEY,
      timeout: 30000,
      ...config
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'apikey': this.config.apiKey })
      }
    });

    // Interceptor para logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('Evolution API Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('Evolution API Request Error', {
          error: error.message,
          config: error.config
        });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Evolution API Response', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error) => {
        logger.error('Evolution API Response Error', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  // Métodos para instancias
  async createInstance(instance: string, config: any): Promise<EvolutionResponse> {
    try {
      const response = await this.client.post(`/instance/create`, {
        instance,
        ...config
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'createInstance');
    }
  }

  async connectInstance(instance: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.post(`/instance/connect/${instance}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'connectInstance');
    }
  }

  async disconnectInstance(instance: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.post(`/instance/disconnect/${instance}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'disconnectInstance');
    }
  }

  async deleteInstance(instance: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.delete(`/instance/delete/${instance}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'deleteInstance');
    }
  }

  async getInstanceInfo(instance: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.get(`/instance/info/${instance}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getInstanceInfo');
    }
  }

  async getInstanceStatus(instance: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.get(`/instance/status/${instance}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getInstanceStatus');
    }
  }

  async getInstanceQR(instance: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.get(`/instance/qrcode/${instance}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getInstanceQR');
    }
  }

  async updateInstanceConfig(instance: string, config: any): Promise<EvolutionResponse> {
    try {
      const response = await this.client.put(`/instance/config/${instance}`, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'updateInstanceConfig');
    }
  }

  async getInstanceConfig(instance: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.get(`/instance/config/${instance}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getInstanceConfig');
    }
  }

  // Métodos para mensajes
  async sendTextMessage(instance: string, to: string, message: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.post(`/message/sendText/${instance}`, {
        number: to,
        text: message
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'sendTextMessage');
    }
  }

  async sendImageMessage(instance: string, to: string, imageUrl: string, caption?: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.post(`/message/sendImage/${instance}`, {
        number: to,
        image: imageUrl,
        caption
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'sendImageMessage');
    }
  }

  async sendDocumentMessage(instance: string, to: string, documentUrl: string, fileName: string, caption?: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.post(`/message/sendDocument/${instance}`, {
        number: to,
        document: documentUrl,
        fileName,
        caption
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'sendDocumentMessage');
    }
  }

  async sendAudioMessage(instance: string, to: string, audioUrl: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.post(`/message/sendAudio/${instance}`, {
        number: to,
        audio: audioUrl
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'sendAudioMessage');
    }
  }

  async sendVideoMessage(instance: string, to: string, videoUrl: string, caption?: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.post(`/message/sendVideo/${instance}`, {
        number: to,
        video: videoUrl,
        caption
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'sendVideoMessage');
    }
  }

  async sendLocationMessage(instance: string, to: string, latitude: number, longitude: number, name?: string, address?: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.post(`/message/sendLocation/${instance}`, {
        number: to,
        latitude,
        longitude,
        name,
        address
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'sendLocationMessage');
    }
  }

  async sendContactMessage(instance: string, to: string, contactNumber: string, contactName: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.post(`/message/sendContact/${instance}`, {
        number: to,
        contact: {
          number: contactNumber,
          name: contactName
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'sendContactMessage');
    }
  }

  async sendButtonMessage(instance: string, to: string, title: string, body: string, buttons: string[]): Promise<EvolutionResponse> {
    try {
      const response = await this.client.post(`/message/sendButtons/${instance}`, {
        number: to,
        title,
        body,
        buttons
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'sendButtonMessage');
    }
  }

  async getMessageHistory(instance: string, phone: string, options?: { limit?: number; cursor?: string }): Promise<EvolutionResponse> {
    try {
      const response = await this.client.get(`/message/findAll/${instance}`, {
        params: {
          number: phone,
          limit: options?.limit || 50,
          cursor: options?.cursor
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getMessageHistory');
    }
  }

  async getMessageStatus(instance: string, messageId: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.get(`/message/findOne/${instance}/${messageId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getMessageStatus');
    }
  }

  // Métodos para chats y contactos
  async getInstanceChats(instance: string, options?: { limit?: number; cursor?: string }): Promise<EvolutionResponse> {
    try {
      const response = await this.client.get(`/chat/findAll/${instance}`, {
        params: {
          limit: options?.limit || 50,
          cursor: options?.cursor
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getInstanceChats');
    }
  }

  async getInstanceContacts(instance: string, options?: { limit?: number; cursor?: string }): Promise<EvolutionResponse> {
    try {
      const response = await this.client.get(`/contact/findAll/${instance}`, {
        params: {
          limit: options?.limit || 50,
          cursor: options?.cursor
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getInstanceContacts');
    }
  }

  // Métodos para webhooks
  async configureWebhook(instance: string, webhookUrl: string, events?: string[]): Promise<EvolutionResponse> {
    try {
      const response = await this.client.post(`/webhook/set/${instance}`, {
        url: webhookUrl,
        events: events || ['messages.upsert', 'messages.update', 'connection.update']
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'configureWebhook');
    }
  }

  async getWebhookConfig(instance: string): Promise<EvolutionResponse> {
    try {
      const response = await this.client.get(`/webhook/find/${instance}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'getWebhookConfig');
    }
  }

  // Método para health check
  async healthCheck(): Promise<EvolutionResponse> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'healthCheck');
    }
  }

  // Método para manejar errores
  private handleError(error: any, method: string): Error {
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
    const statusCode = error.response?.status || 500;
    
    logger.error(`Evolution API Error in ${method}`, {
      statusCode,
      message: errorMessage,
      url: error.config?.url,
      method: error.config?.method
    });

    const customError = new Error(`Evolution API Error: ${errorMessage}`);
    (customError as any).statusCode = statusCode;
    (customError as any).originalError = error;
    
    return customError;
  }

  // Método para verificar conectividad
  async isConnected(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default EvolutionService; 