import Link from 'next/link';
import { Activity, BarChart3, Database, Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
            Trading Bot Dashboard
          </h1>
          <p className="text-xl text-gray-400">
            Monitorea y controla tu bot de trading en tiempo real
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Dashboard Card */}
          <Link href="/dashboard" className="group">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Activity className="w-8 h-8 text-blue-400" />
                </div>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Dashboard</h2>
              <p className="text-gray-400">Vista general del sistema y métricas en tiempo real</p>
            </div>
          </Link>

          {/* Charts Card */}
          <Link href="/charts" className="group">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-emerald-500 transition-all hover:shadow-lg hover:shadow-emerald-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-emerald-400" />
                </div>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Gráficos</h2>
              <p className="text-gray-400">Visualiza velas y datos de mercado en tiempo real</p>
            </div>
          </Link>

          {/* Logs Card */}
          <Link href="/logs" className="group">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Database className="w-8 h-8 text-purple-400" />
                </div>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Market Data</h2>
              <p className="text-gray-400">Explora datos históricos desde PostgreSQL (31 campos por registro)</p>
            </div>
          </Link>

          {/* Collectors Card */}
          <Link href="/collectors" className="group">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-amber-500 transition-all hover:shadow-lg hover:shadow-amber-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <Settings className="w-8 h-8 text-amber-400" />
                </div>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Collectors</h2>
              <p className="text-gray-400">Inicia y detén collectors de datos de mercado</p>
            </div>
          </Link>
        </div>

        {/* Status Bar */}
        <div className="mt-16 max-w-7xl mx-auto">
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-300">API Conectada</span>
              </div>
              <div className="text-sm text-gray-500">
                v2.0.0 • PostgreSQL + Prisma Accelerate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

