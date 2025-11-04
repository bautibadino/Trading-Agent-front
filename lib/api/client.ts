import axios, { AxiosInstance } from 'axios';

// Tipos auxiliares para charts (construidos a partir de MarketData)
export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol?: string;
  interval?: string;
}

// Tipos de datos - Market Data desde Prisma
export interface MarketData {
  id: number;
  timestamp: string;
  symbol: string;
  timeframe: string;
  lastPrice: number;
  
  // Order Book
  bestBidPrice: number;
  bestBidQty: number;
  bestAskPrice: number;
  bestAskQty: number;
  midPrice: number;
  spread: number;
  spreadBps: number;
  imbalance: number;
  microprice: number;
  
  // Micro Flow
  takerBuyQuote: number;
  takerSellQuote: number;
  takerBuyRatio: number;
  
  // Indicators
  rsi14: number | null;
  sma20: number | null;
  ema9: number | null;
  ema21: number | null;
  volatility: number | null;
  
  // Heuristics
  ema9Above21: boolean | null;
  rsiState: string;
  buyPressure: boolean;
  
  // Market Stats
  fundingRate: number;
  indexPrice: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  openInterest: number | null;
  liquidationVolume: number;
  
  createdAt: string;
}

export interface LogsResponse {
  logs: MarketData[];
  total: number;
  limit: number;
  offset: number;
  timeframe: string;
  symbol: string;
}

export interface StatsSymbol {
  symbol: string;
  count: number;
}

export interface StatsTimeframe {
  timeframe: string;
  count: number;
}

export interface StatsResponse {
  stats: {
    total: number;
    symbols: StatsSymbol[];
    timeframes: StatsTimeframe[];
  };
}

export interface CollectorStartRequest {
  timeframe: string;
  symbol?: string;
}

export interface CollectorStartResponse {
  message: string;
  pid?: number;
}

export interface CollectorInfo {
  pid: number;
  timeframe: string;
  symbol: string;
  status: string;
  startedAt: string;
  uptime?: number;
}

export interface CollectorStatusResponse {
  collectors: CollectorInfo[];
}

export interface CollectorStopRequest {
  pid: number;
}

export interface CollectorStopResponse {
  message: string;
  pid: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

class TradingBotAPI {
  private client: AxiosInstance;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Health check
  async health(): Promise<HealthResponse> {
    const { data } = await this.client.get<HealthResponse>('/health');
    return data;
  }

  // Obtener market data (logs)
  async getLogs(params: {
    timeframe?: string;
    symbol?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<LogsResponse> {
    const { data } = await this.client.get<LogsResponse>('/api/logs', { params });
    return data;
  }

  // Obtener último market data
  async getLatestMarketData(params: {
    symbol: string;
    timeframe: string;
  }): Promise<MarketData> {
    const { data } = await this.client.get<MarketData>('/api/logs/latest', { params });
    return data;
  }

  // Obtener estadísticas
  async getStats(params?: {
    symbol?: string;
    timeframe?: string;
  }): Promise<StatsResponse> {
    const { data } = await this.client.get<StatsResponse>('/api/logs/stats', { params });
    return data;
  }

  // Iniciar collector
  async startCollector(request: CollectorStartRequest): Promise<CollectorStartResponse> {
    const { data } = await this.client.post<CollectorStartResponse>('/api/collectors/start', request);
    return data;
  }

  // Obtener estado de collectors (nuevo endpoint que debe agregar el backend)
  async getCollectorsStatus(): Promise<CollectorStatusResponse> {
    try {
      const { data } = await this.client.get<CollectorStatusResponse>('/api/collectors/status');
      return data;
    } catch (error: any) {
      // Si el endpoint no existe aún, devolver array vacío
      if (error.response?.status === 404) {
        return { collectors: [] };
      }
      throw error;
    }
  }

  // Detener collector (nuevo endpoint que debe agregar el backend)
  async stopCollector(request: CollectorStopRequest): Promise<CollectorStopResponse> {
    const { data } = await this.client.post<CollectorStopResponse>('/api/collectors/stop', request);
    return data;
  }
}

// Instancia singleton
export const apiClient = new TradingBotAPI();

export default TradingBotAPI;

