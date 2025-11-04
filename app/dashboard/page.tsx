'use client';

import { useEffect, useState } from 'react';
import { apiClient, HealthResponse, StatsResponse } from '@/lib/api/client';
import { Activity, Database, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [healthData, statsData] = await Promise.all([
        apiClient.health(),
        apiClient.getStats(),
      ]);
      setHealth(healthData);
      setStats(statsData);
    } catch (err) {
      setError('Error al conectar con la API. ¿Está el backend corriendo?');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-white mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Monitoreo del sistema en tiempo real</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-red-400 font-medium">{error}</p>
              <p className="text-red-500/70 text-sm mt-1">
                Asegúrate de que el backend esté corriendo en el puerto 3000
              </p>
            </div>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* API Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <div className={`w-3 h-3 rounded-full ${health ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Estado API</h3>
            <p className="text-2xl font-bold text-white">
              {health?.status === 'ok' ? 'Online' : 'Offline'}
            </p>
          </div>

          {/* Uptime */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Uptime</h3>
            <p className="text-2xl font-bold text-white">
              {health ? formatUptime(health.uptime) : '-'}
            </p>
          </div>

          {/* Total Files */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Archivos de Logs</h3>
            <p className="text-2xl font-bold text-white">
              {stats ? Object.values(stats.stats).reduce((acc, s) => acc + s.files, 0) : '-'}
            </p>
          </div>

          {/* Total Data */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Datos Totales</h3>
            <p className="text-2xl font-bold text-white">
              {stats ? Object.values(stats.stats).reduce((acc, s) => acc + s.totalLines, 0).toLocaleString() : '-'}
            </p>
          </div>
        </div>

        {/* Timeframes Stats */}
        {stats && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Estadísticas por Timeframe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.stats).map(([timeframe, data]) => (
                <div key={timeframe} className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{timeframe}</h3>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      {data.files} archivos
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Líneas:</span>
                      <span className="text-white font-medium">{data.totalLines.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tamaño:</span>
                      <span className="text-white font-medium">{data.totalSizeMB} MB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/charts" className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
            <h3 className="text-xl font-bold text-white mb-2">Ver Gráficos</h3>
            <p className="text-emerald-100">Visualiza datos de mercado en tiempo real</p>
          </Link>

          <Link href="/logs" className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 hover:shadow-lg hover:shadow-purple-500/20 transition-all">
            <h3 className="text-xl font-bold text-white mb-2">Explorar Logs</h3>
            <p className="text-purple-100">Revisa el historial de datos</p>
          </Link>

          <Link href="/collectors" className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-6 hover:shadow-lg hover:shadow-amber-500/20 transition-all">
            <h3 className="text-xl font-bold text-white mb-2">Gestionar Collectors</h3>
            <p className="text-amber-100">Inicia o detén la recolección de datos</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

