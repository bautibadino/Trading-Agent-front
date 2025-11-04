'use client';

import { useEffect, useState } from 'react';
import { apiClient, CollectorInfo } from '@/lib/api/client';
import Link from 'next/link';
import { Play, AlertCircle, CheckCircle, Settings, Info, StopCircle, RefreshCw } from 'lucide-react';

interface CollectorStatus {
  timeframe: string;
  symbol: string;
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
  pid?: number;
}

export default function CollectorsPage() {
  const [activeCollectors, setActiveCollectors] = useState<CollectorInfo[]>([]);
  const [recentStarts, setRecentStarts] = useState<CollectorStatus[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [selectedSymbol, setSelectedSymbol] = useState('ETHUSDT');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [stoppingPid, setStoppingPid] = useState<number | null>(null);

  useEffect(() => {
    loadCollectorsStatus();
    // Actualizar cada 10 segundos
    const interval = setInterval(loadCollectorsStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h'];
  const symbols = ['ETHUSDT', 'BTCUSDT'];

  const loadCollectorsStatus = async () => {
    try {
      setLoadingStatus(true);
      const response = await apiClient.getCollectorsStatus();
      setActiveCollectors(response.collectors);
    } catch (error) {
      console.error('Error loading collectors status:', error);
      // Si el endpoint no existe aún, simplemente no mostramos error
    } finally {
      setLoadingStatus(false);
    }
  };

  const startCollector = async () => {
    try {
      setLoading(true);

      const response = await apiClient.startCollector({
        timeframe: selectedTimeframe,
        symbol: selectedSymbol,
      });

      const newCollector: CollectorStatus = {
        timeframe: selectedTimeframe,
        symbol: selectedSymbol,
        status: 'success',
        message: response.message,
        pid: response.pid,
      };

      setRecentStarts([newCollector, ...recentStarts]);
      
      // Recargar el estado de collectors activos
      await loadCollectorsStatus();
    } catch (err: any) {
      const errorCollector: CollectorStatus = {
        timeframe: selectedTimeframe,
        symbol: selectedSymbol,
        status: 'error',
        message: err.response?.data?.error || 'Error al iniciar collector',
      };

      setRecentStarts([errorCollector, ...recentStarts]);
    } finally {
      setLoading(false);
    }
  };

  const stopCollector = async (pid: number) => {
    try {
      setStoppingPid(pid);
      await apiClient.stopCollector({ pid });
      
      // Recargar el estado
      await loadCollectorsStatus();
      
      // Agregar al historial de stops
      const stoppedCollector = activeCollectors.find(c => c.pid === pid);
      if (stoppedCollector) {
        const stopStatus: CollectorStatus = {
          timeframe: stoppedCollector.timeframe,
          symbol: stoppedCollector.symbol,
          status: 'idle' as any,
          message: `Collector detenido (PID: ${pid})`,
          pid,
        };
        setRecentStarts([stopStatus, ...recentStarts]);
      }
    } catch (error: any) {
      console.error('Error stopping collector:', error);
      const errorStatus: CollectorStatus = {
        timeframe: '',
        symbol: '',
        status: 'error',
        message: error.response?.data?.error || 'Error al detener collector',
        pid,
      };
      setRecentStarts([errorStatus, ...recentStarts]);
    } finally {
      setStoppingPid(null);
    }
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusBadge = (status: CollectorStatus['status']) => {
    switch (status) {
      case 'success':
        return (
          <span className="flex items-center gap-1 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Iniciado
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-white mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-transparent bg-clip-text">
            Gestión de Collectors
          </h1>
          <p className="text-gray-400 mt-2">Inicia collectors para recopilar datos de mercado</p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-blue-300 font-semibold mb-2">Acerca de los Collectors</h3>
              <p className="text-blue-200/80 text-sm leading-relaxed">
                Los collectors se conectan a Binance WebSocket para recopilar datos de mercado en tiempo real. 
                Una vez iniciado, el collector correrá en background y guardará los datos en <span className="font-semibold text-blue-300">PostgreSQL con Prisma Accelerate</span> (31 campos de datos por registro: order book, indicadores técnicos, heurísticas y estadísticas de mercado). 
                Los datos se pueden visualizar en la sección de Market Data Explorer.
              </p>
            </div>
          </div>
        </div>

        {/* Active Collectors */}
        {activeCollectors.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Collectors Activos</h2>
              <button
                onClick={loadCollectorsStatus}
                disabled={loadingStatus}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loadingStatus ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCollectors.map((collector) => (
                <div
                  key={collector.pid}
                  className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-white font-semibold">{collector.symbol}</span>
                      </div>
                      <div className="text-sm text-gray-300">{collector.timeframe}</div>
                    </div>
                    <button
                      onClick={() => stopCollector(collector.pid)}
                      disabled={stoppingPid === collector.pid}
                      className="text-red-400 hover:text-red-300 disabled:text-gray-600 transition-colors"
                      title="Detener collector"
                    >
                      <StopCircle className={`w-5 h-5 ${stoppingPid === collector.pid ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>PID:</span>
                      <span className="font-mono text-gray-300">{collector.pid}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Uptime:</span>
                      <span className="text-gray-300">{formatUptime(collector.uptime)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Estado:</span>
                      <span className="text-green-400">{collector.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Start Collector Panel */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <Settings className="w-6 h-6 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Iniciar Collector</h2>
            </div>

            <div className="space-y-4">
              {/* Timeframe Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Timeframe
                </label>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {timeframes.map((tf) => (
                    <option key={tf} value={tf}>{tf}</option>
                  ))}
                </select>
              </div>

              {/* Symbol Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Par de Trading
                </label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {symbols.map((sym) => (
                    <option key={sym} value={sym}>{sym}</option>
                  ))}
                </select>
              </div>

              {/* Start Button */}
              <button
                onClick={startCollector}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg px-6 py-3 flex items-center justify-center gap-2 font-semibold transition-all shadow-lg hover:shadow-amber-500/20"
              >
                <Play className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
                {loading ? 'Iniciando...' : 'Iniciar Collector'}
              </button>
            </div>

            {/* Quick Start Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Inicio Rápido</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedTimeframe('1m');
                    setSelectedSymbol('ETHUSDT');
                  }}
                  className="text-left bg-gray-900/50 hover:bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <div className="text-white font-medium">ETH 1m</div>
                  <div className="text-gray-500 text-xs">Scalping</div>
                </button>
                <button
                  onClick={() => {
                    setSelectedTimeframe('5m');
                    setSelectedSymbol('ETHUSDT');
                  }}
                  className="text-left bg-gray-900/50 hover:bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <div className="text-white font-medium">ETH 5m</div>
                  <div className="text-gray-500 text-xs">Day Trading</div>
                </button>
                <button
                  onClick={() => {
                    setSelectedTimeframe('1h');
                    setSelectedSymbol('BTCUSDT');
                  }}
                  className="text-left bg-gray-900/50 hover:bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <div className="text-white font-medium">BTC 1h</div>
                  <div className="text-gray-500 text-xs">Swing Trading</div>
                </button>
                <button
                  onClick={() => {
                    setSelectedTimeframe('4h');
                    setSelectedSymbol('BTCUSDT');
                  }}
                  className="text-left bg-gray-900/50 hover:bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <div className="text-white font-medium">BTC 4h</div>
                  <div className="text-gray-500 text-xs">Position Trading</div>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Actividad Reciente</h2>

            {recentStarts.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-center">
                <div>
                  <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No hay collectors iniciados</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Inicia un collector para comenzar a recopilar datos
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {recentStarts.map((collector, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      collector.status === 'success'
                        ? 'bg-green-900/20 border-green-500/50'
                        : 'bg-red-900/20 border-red-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">
                            {collector.symbol}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-300">{collector.timeframe}</span>
                        </div>
                        {collector.pid && (
                          <div className="text-xs text-gray-500 mt-1">
                            PID: {collector.pid}
                          </div>
                        )}
                      </div>
                      {getStatusBadge(collector.status)}
                    </div>
                    {collector.message && (
                      <p className={`text-sm mt-2 ${
                        collector.status === 'success' ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {collector.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Timeframes Info */}
        <div className="mt-8 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Timeframes Disponibles</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {timeframes.map((tf) => (
              <div key={tf} className="text-center">
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-4">
                  <div className="text-2xl font-bold text-white">{tf}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

