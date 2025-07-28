import axios from 'axios';
import { logger } from '@/utils/logger';

interface InstanceConfig {
  clientId: string;
  webhookUrl?: string;
  webhookByEvents?: boolean;
  events?: string[];
}

interface ConnectResult {
  qrcode?: string;
  status: string;
  message: string;
}

export class InstanceService {
  private evolutionApiUrl: string;
  private evolutionApiKey: string;

  constructor() {
    this.evolutionApiUrl = process.env.EVOLUTION_API_URL || 'http://evolution-api:8080';
    this.evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
  }

  async createInstance(instance: string, config: InstanceConfig): Promise<any> {
    try {
      const response = await axios.post(`${this.evolutionApiUrl}/instance/create`, {
        instanceName: instance,
        webhook: config.webhookUrl,
        webhookByEvents: config.webhookByEvents,
        events: config.events
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.evolutionApiKey
        }
      });

      logger.info('Instancia creada en Evolution API', { instance });
      return response.data;
    } catch (error) {
      logger.error('Error creando instancia en Evolution API', { 
        instance, 
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error creando instancia: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }

  async connectInstance(instance: string): Promise<ConnectResult> {
    try {
      const response = await axios.get(`${this.evolutionApiUrl}/instance/connect/${instance}`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });

      logger.info('Instancia conectada en Evolution API', { instance });
      return response.data;
    } catch (error) {
      logger.error('Error conectando instancia en Evolution API', { 
        instance, 
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error conectando instancia: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }

  async disconnectInstance(instance: string): Promise<any> {
    try {
      const response = await axios.delete(`${this.evolutionApiUrl}/instance/logout/${instance}`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });

      logger.info('Instancia desconectada en Evolution API', { instance });
      return response.data;
    } catch (error) {
      logger.error('Error desconectando instancia en Evolution API', { 
        instance, 
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error desconectando instancia: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }

  async getInstanceInfo(instance: string): Promise<any> {
    try {
      const response = await axios.get(`${this.evolutionApiUrl}/instance/fetchInstances`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });

      const instances = response.data;
      const instanceInfo = instances.find((inst: any) => inst.instance.instanceName === instance);
      
      if (!instanceInfo) {
        throw new Error('Instancia no encontrada');
      }

      return instanceInfo;
    } catch (error) {
      logger.error('Error obteniendo información de instancia', { 
        instance, 
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error obteniendo información de instancia: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }

  async deleteInstance(instance: string): Promise<any> {
    try {
      const response = await axios.delete(`${this.evolutionApiUrl}/instance/delete/${instance}`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });

      logger.info('Instancia eliminada en Evolution API', { instance });
      return response.data;
    } catch (error) {
      logger.error('Error eliminando instancia en Evolution API', { 
        instance, 
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error eliminando instancia: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }

  async getInstanceStatus(instance: string): Promise<any> {
    try {
      const response = await axios.get(`${this.evolutionApiUrl}/instance/fetchInstances`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });

      const instances = response.data;
      const instanceInfo = instances.find((inst: any) => inst.instance.instanceName === instance);
      
      if (!instanceInfo) {
        throw new Error('Instancia no encontrada');
      }

      return {
        status: instanceInfo.instance.status,
        connected: instanceInfo.instance.status === 'open'
      };
    } catch (error) {
      logger.error('Error obteniendo estado de instancia', { 
        instance, 
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error obteniendo estado de instancia: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }

  async getInstanceQR(instance: string): Promise<any> {
    try {
      const response = await axios.get(`${this.evolutionApiUrl}/instance/connect/${instance}`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error obteniendo QR de instancia', { 
        instance, 
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error obteniendo QR de instancia: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }

  async getInstancesByClient(clientId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.evolutionApiUrl}/instance/fetchInstances`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });

      // Filtrar instancias por clientId (esto dependería de cómo almacenes esta información)
      const instances = response.data.filter((inst: any) => {
        // Aquí implementarías la lógica para filtrar por clientId
        return true; // Por ahora retornamos todas
      });

      return instances;
    } catch (error) {
      logger.error('Error obteniendo instancias por cliente', { 
        clientId, 
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error obteniendo instancias por cliente: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }

  async updateInstanceConfig(instance: string, config: any): Promise<any> {
    try {
      const response = await axios.put(`${this.evolutionApiUrl}/instance/setConfig/${instance}`, config, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.evolutionApiKey
        }
      });

      logger.info('Configuración de instancia actualizada', { instance });
      return response.data;
    } catch (error) {
      logger.error('Error actualizando configuración de instancia', { 
        instance, 
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error actualizando configuración de instancia: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }

  async getInstanceConfig(instance: string): Promise<any> {
    try {
      const response = await axios.get(`${this.evolutionApiUrl}/instance/getConfig/${instance}`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error obteniendo configuración de instancia', { 
        instance, 
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error obteniendo configuración de instancia: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }

  async getInstanceChats(instance: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.evolutionApiUrl}/chat/findChats/${instance}`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error obteniendo chats de instancia', { 
        instance, 
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error obteniendo chats de instancia: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }

  async getInstanceContacts(instance: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.evolutionApiUrl}/chat/findContacts/${instance}`, {
        headers: {
          'apikey': this.evolutionApiKey
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error obteniendo contactos de instancia', { 
        instance, 
        error: (error as any).response?.data || (error as Error).message 
      });
      throw new Error(`Error obteniendo contactos de instancia: ${(error as any).response?.data?.message || (error as Error).message}`);
    }
  }
} 