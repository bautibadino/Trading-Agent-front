'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient, MarketData } from '@/lib/api/client';
import Link from 'next/link';
import { RefreshCw, AlertCircle, TrendingUp, TrendingDown, Activity, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('1m');
  const [symbol, setSymbol] = useState('ETHUSDT');
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<MarketData | null>(null);

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h'];
  const symbols = ['ETHUSDT', 'BTCUSDT'];

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getLogs({
        timeframe,
        symbol,
        limit,
        offset,
      });

      setLogs(response.logs);
      setTotal(response.total);
    } catch (err) {
      setError('Error al cargar datos de mercado');
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  }, [timeframe, symbol, limit, offset]);

  useEffect(() => {
    if (timeframe && symbol) {
      loadLogs();
    }
  }, [timeframe, symbol, loadLogs]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const goToPage = (page: number) => {
    setOffset((page - 1) * limit);
  };

  const getRsiColor = (rsi: number | null) => {
    if (!rsi) return 'text-gray-400';
    if (rsi > 70) return 'text-red-400';
    if (rsi < 30) return 'text-green-400';
    return 'text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-white mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            Market Data Explorer
          </h1>
          <p className="text-gray-400 mt-2">Datos de mercado en tiempo real desde PostgreSQL</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Timeframe */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => { setTimeframe(e.target.value); setOffset(0); }}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {timeframes.map((tf) => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </div>

            {/* Symbol */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Símbolo
              </label>
              <select
                value={symbol}
                onChange={(e) => { setSymbol(e.target.value); setOffset(0); }}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {symbols.map((sym) => (
                  <option key={sym} value={sym}>{sym}</option>
                ))}
              </select>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Por página
              </label>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setOffset(0); }}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value={10}>10 registros</option>
                <option value={25}>25 registros</option>
                <option value={50}>50 registros</option>
                <option value={100}>100 registros</option>
              </select>
            </div>

            {/* Page Info */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Página
              </label>
              <div className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white">
                {currentPage} / {totalPages || 1}
              </div>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={loadLogs}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors"
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Registros</p>
                <p className="text-xl font-bold text-white">{total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Último Precio</p>
                <p className="text-xl font-bold text-white">
                  {logs[0] ? formatCurrency(logs[0].lastPrice) : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                {logs[0]?.buyPressure ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
              </div>
              <div>
                <p className="text-sm text-gray-400">Presión</p>
                <p className="text-xl font-bold text-white">
                  {logs[0]?.buyPressure ? 'Compradora' : 'Vendedora'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">RSI(14)</p>
                <p className={`text-xl font-bold ${getRsiColor(logs[0]?.rsi14 || null)}`}>
                  {logs[0]?.rsi14?.toFixed(2) || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Historial de Market Data</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Cargando datos...</p>
              </div>
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Spread</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">RSI</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estado RSI</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Presión</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Vol 24h</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-900/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white font-bold">
                        {formatCurrency(log.lastPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                        {log.spreadBps.toFixed(2)} bps
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono font-bold ${getRsiColor(log.rsi14)}`}>
                        {log.rsi14?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          log.rsiState === 'overbought' ? 'bg-red-900/50 text-red-300' :
                          log.rsiState === 'oversold' ? 'bg-green-900/50 text-green-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {log.rsiState}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.buyPressure ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <TrendingUp className="w-4 h-4" />
                            Buy
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400">
                            <TrendingDown className="w-4 h-4" />
                            Sell
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                        ${(log.volume24h / 1000000).toFixed(2)}M
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center p-16">
              <div className="text-center">
                <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No se encontraron datos</p>
                <p className="text-gray-500 text-sm mt-2">
                  Inicia un collector para generar datos de mercado
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
            <div className="text-sm text-gray-400">
              Mostrando {offset + 1} - {Math.min(offset + limit, total)} de {total} registros
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
              <h3 className="text-2xl font-bold text-white">Detalles Completos</h3>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-lg font-semibold text-purple-400 mb-3">Información Básica</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Símbolo</p>
                    <p className="text-white font-bold">{selectedLog.symbol}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Timeframe</p>
                    <p className="text-white font-bold">{selectedLog.timeframe}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Precio</p>
                    <p className="text-white font-bold">{formatCurrency(selectedLog.lastPrice)}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Timestamp</p>
                    <p className="text-white text-sm">{formatTimestamp(selectedLog.timestamp)}</p>
                  </div>
                </div>
              </div>

              {/* Order Book */}
              <div>
                <h4 className="text-lg font-semibold text-blue-400 mb-3">Order Book</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Best Bid</p>
                    <p className="text-green-400 font-mono">{formatCurrency(selectedLog.bestBidPrice)}</p>
                    <p className="text-gray-500 text-xs">{selectedLog.bestBidQty.toFixed(4)}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Best Ask</p>
                    <p className="text-red-400 font-mono">{formatCurrency(selectedLog.bestAskPrice)}</p>
                    <p className="text-gray-500 text-xs">{selectedLog.bestAskQty.toFixed(4)}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Spread</p>
                    <p className="text-white font-mono">{selectedLog.spreadBps.toFixed(2)} bps</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Imbalance</p>
                    <p className={`font-mono ${selectedLog.imbalance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(selectedLog.imbalance * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Indicators */}
              <div>
                <h4 className="text-lg font-semibold text-yellow-400 mb-3">Indicadores Técnicos</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">RSI(14)</p>
                    <p className={`font-mono text-lg font-bold ${getRsiColor(selectedLog.rsi14)}`}>
                      {selectedLog.rsi14?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">SMA(20)</p>
                    <p className="text-white font-mono">{selectedLog.sma20 ? formatCurrency(selectedLog.sma20) : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">EMA(9)</p>
                    <p className="text-white font-mono">{selectedLog.ema9 ? formatCurrency(selectedLog.ema9) : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">EMA(21)</p>
                    <p className="text-white font-mono">{selectedLog.ema21 ? formatCurrency(selectedLog.ema21) : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Volatilidad</p>
                    <p className="text-white font-mono">{selectedLog.volatility ? `${selectedLog.volatility.toFixed(2)}%` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Market Stats */}
              <div>
                <h4 className="text-lg font-semibold text-emerald-400 mb-3">Estadísticas de Mercado</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Funding Rate</p>
                    <p className="text-white font-mono">{(selectedLog.fundingRate * 100).toFixed(4)}%</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Index Price</p>
                    <p className="text-white font-mono">{formatCurrency(selectedLog.indexPrice)}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Vol 24h</p>
                    <p className="text-white font-mono">${(selectedLog.volume24h / 1000000).toFixed(2)}M</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">High 24h</p>
                    <p className="text-green-400 font-mono">{formatCurrency(selectedLog.high24h)}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Low 24h</p>
                    <p className="text-red-400 font-mono">{formatCurrency(selectedLog.low24h)}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Liquidaciones</p>
                    <p className="text-white font-mono">${selectedLog.liquidationVolume.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Micro Flow */}
              <div>
                <h4 className="text-lg font-semibold text-orange-400 mb-3">Micro Flow</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Taker Buy</p>
                    <p className="text-green-400 font-mono">${selectedLog.takerBuyQuote.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Taker Sell</p>
                    <p className="text-red-400 font-mono">${selectedLog.takerSellQuote.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Buy Ratio</p>
                    <p className="text-white font-mono">{(selectedLog.takerBuyRatio * 100).toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
