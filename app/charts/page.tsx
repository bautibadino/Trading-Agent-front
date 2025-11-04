'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient, Candle, MarketData } from '@/lib/api/client';
import CandlestickChart from '@/components/CandlestickChart';
import Link from 'next/link';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function ChartsPage() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('1m');
  const [symbol, setSymbol] = useState('ETHUSDT');

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h'];
  const symbols = ['ETHUSDT', 'BTCUSDT'];

  const loadChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getLogs({
        timeframe,
        symbol,
        limit: 500, // Últimas 500 registros
      });

      // Convertir MarketData a Candles
      // Usamos high24h, low24h y lastPrice para simular OHLC
      const extractedCandles: Candle[] = response.logs.map((data: MarketData) => ({
        timestamp: data.timestamp,
        open: data.lastPrice * 0.9995, // Aproximación
        high: data.high24h,
        low: data.low24h,
        close: data.lastPrice,
        volume: data.volume24h,
        symbol: data.symbol,
        interval: data.timeframe,
      }));

      setCandles(extractedCandles);
    } catch (err) {
      setError('Error al cargar datos del gráfico. Los gráficos requieren datos históricos completos.');
      console.error('Error loading chart data:', err);
    } finally {
      setLoading(false);
    }
  }, [timeframe, symbol]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-white mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 text-transparent bg-clip-text">
            Gráficos de Mercado
          </h1>
          <p className="text-gray-400 mt-2">Visualización de datos desde PostgreSQL</p>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200/80">
              <strong>Nota:</strong> Los gráficos actualmente muestran una aproximación basada en los datos de market data. 
              Para gráficos de velas precisos, considera usar los datos high24h/low24h o implementar un endpoint específico para OHLC.
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Timeframe Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
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
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {symbols.map((sym) => (
                  <option key={sym} value={sym}>{sym}</option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={loadChartData}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          {loading ? (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Cargando gráfico...</p>
              </div>
            </div>
          ) : candles.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{symbol}</h2>
                  <p className="text-sm text-gray-400">
                    {candles.length} registros • Timeframe: {timeframe}
                  </p>
                </div>
                {candles.length > 0 && (
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Último precio</div>
                    <div className="text-2xl font-bold text-white">
                      ${candles[candles.length - 1].close.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
              <CandlestickChart data={candles} symbol={symbol} />
            </>
          ) : (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No hay datos disponibles para mostrar</p>
                <p className="text-gray-500 text-sm mt-2">
                  Inicia un collector para generar datos de mercado
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
