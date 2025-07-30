import axios from 'axios';
import { logger } from './logger';

export class DiagnosticService {
  private evolutionApiUrl: string;
  private evolutionApiKey: string;

  constructor() {
    this.evolutionApiUrl = process.env.EVOLUTION_API_URL || 'http://evolution_api:8080';
    this.evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
  }

  async runDiagnostics(): Promise<any> {
    const results = {
      adapterConfig: {
        evolutionApiUrl: this.evolutionApiUrl,
        evolutionApiKey: this.evolutionApiKey ? '***' + this.evolutionApiKey.slice(-4) : 'NOT_SET',
        timestamp: new Date().toISOString()
      },
      evolutionApiHealth: null as any,
      adapterHealth: null as any,
      networkConnectivity: null as any,
      errors: [] as string[]
    };

    try {
      // Verificar salud del adapter
      logger.info('Verificando salud del adapter...');
      try {
        const adapterHealth = await axios.get('http://localhost:3001/health/ping');
        results.adapterHealth = {
          status: adapterHealth.status,
          data: adapterHealth.data
        };
      } catch (error: any) {
        results.errors.push(`Adapter health check failed: ${error.message}`);
      }

      // Verificar conectividad con Evolution API
      logger.info('Verificando conectividad con Evolution API...');
      try {
        const evolutionHealth = await axios.get(`${this.evolutionApiUrl}/health`, {
          headers: {
            'apikey': this.evolutionApiKey
          },
          timeout: 10000
        });
        results.evolutionApiHealth = {
          status: evolutionHealth.status,
          data: evolutionHealth.data
        };
      } catch (error: any) {
        results.errors.push(`Evolution API health check failed: ${error.message}`);
        if (error.response) {
          results.errors.push(`Response status: ${error.response.status}`);
          results.errors.push(`Response data: ${JSON.stringify(error.response.data)}`);
        }
      }

      // Verificar instancias en Evolution API
      logger.info('Verificando instancias en Evolution API...');
      try {
        const instancesResponse = await axios.get(`${this.evolutionApiUrl}/instance/fetchInstances`, {
          headers: {
            'apikey': this.evolutionApiKey
          },
          timeout: 10000
        });
        results.evolutionApiHealth = {
          ...results.evolutionApiHealth,
          instances: instancesResponse.data
        };
      } catch (error: any) {
        results.errors.push(`Fetch instances failed: ${error.message}`);
        if (error.response) {
          results.errors.push(`Response status: ${error.response.status}`);
          results.errors.push(`Response data: ${JSON.stringify(error.response.data)}`);
        }
      }

    } catch (error: any) {
      results.errors.push(`General diagnostic error: ${error.message}`);
    }

    return results;
  }

  async testInstanceCreation(instanceName: string): Promise<any> {
    try {
      logger.info(`Probando creación de instancia: ${instanceName}`);
      
      const response = await axios.post(`${this.evolutionApiUrl}/instance/create`, {
        instanceName,
        webhookByEvents: true,
        events: ['messages.upsert', 'messages.update', 'connection.update', 'qr.update'],
        integration: 'EVOLUTION'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.evolutionApiKey
        },
        timeout: 30000
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      logger.error('Error en test de creación de instancia', {
        instanceName,
        error: error.message,
        response: error.response?.data
      });

      return {
        success: false,
        error: error.message,
        response: error.response?.data
      };
    }
  }
} 