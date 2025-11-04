# 🚀 Trading Bot Frontend

Dashboard moderno y completo para monitorear y controlar el Bot de Trading. Construido con Next.js 15, React 18, TypeScript y TailwindCSS.

## ✨ Características

### 📊 **Dashboard Principal**
- Monitoreo en tiempo real del estado del sistema
- Estadísticas de datos recopilados por timeframe
- Enlaces rápidos a todas las secciones
- Health check automático del backend

### 📈 **Visualización de Gráficos**
- Gráficos de velas (candlestick charts) interactivos usando Lightweight Charts
- Soporte para múltiples timeframes (1m, 5m, 15m, 30m, 1h, 4h)
- Visualización de múltiples pares de trading (ETHUSDT, BTCUSDT)
- Actualización en tiempo real de datos
- Zoom y navegación interactiva

### 📋 **Explorador de Logs**
- Visualización tabular de datos históricos
- Filtros por timeframe, símbolo y límite de registros
- Información detallada de cada vela (OHLCV)
- Búsqueda y exploración rápida

### 🔧 **Gestión de Collectors**
- Panel para iniciar collectors de datos en tiempo real
- Configuración de timeframe y símbolo
- Presets rápidos para estrategias comunes (scalping, day trading, swing trading)
- Historial de collectors iniciados
- Seguimiento de PIDs de procesos

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **UI:** React 18, TailwindCSS
- **Lenguaje:** TypeScript
- **Gráficos:** Lightweight Charts (TradingView)
- **HTTP Client:** Axios
- **Iconos:** Lucide React

## 📦 Instalación

### 1. Instalar dependencias

```bash
cd trading-bot-frontend
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Si tu API corre en otro puerto o dirección, ajusta la URL correspondientemente.

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:3001**

## 🚀 Scripts Disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Compilar para producción
npm run start    # Iniciar servidor de producción
npm run lint     # Ejecutar linter
```

## 📁 Estructura del Proyecto

```
trading-bot-frontend/
├── app/                    # App Router de Next.js
│   ├── page.tsx           # Página de inicio
│   ├── layout.tsx         # Layout principal
│   ├── globals.css        # Estilos globales
│   ├── dashboard/         # Página de dashboard
│   ├── charts/            # Página de gráficos
│   ├── logs/              # Página de logs
│   └── collectors/        # Página de collectors
├── components/            # Componentes reutilizables
│   └── CandlestickChart.tsx  # Componente de gráfico de velas
├── lib/                   # Librerías y utilidades
│   └── api/
│       └── client.ts      # Cliente API para el backend
├── public/                # Archivos estáticos
└── next.config.ts         # Configuración de Next.js
```

## 🔌 Conexión con el Backend

El frontend se conecta automáticamente con el backend de Trading Bot API. Asegúrate de que el backend esté corriendo antes de usar el frontend.

### Endpoints utilizados:

- `GET /health` - Health check
- `GET /api/logs` - Obtener logs con filtros
- `GET /api/logs/files` - Listar archivos de logs
- `GET /api/logs/stats` - Obtener estadísticas
- `POST /api/collectors/start` - Iniciar collector

## 📖 Guía de Uso

### 1. Verificar Estado del Sistema
1. Navega a la página de **Dashboard**
2. Verifica que el estado de la API esté "Online"
3. Revisa las estadísticas de datos recopilados

### 2. Iniciar Collector de Datos
1. Ve a la sección **Collectors**
2. Selecciona un timeframe (ej: 1m, 5m, 1h)
3. Selecciona un par de trading (ej: ETHUSDT)
4. Haz clic en "Iniciar Collector"
5. El collector comenzará a recopilar datos en background

### 3. Visualizar Gráficos
1. Navega a **Gráficos**
2. Selecciona el timeframe y símbolo que deseas visualizar
3. El gráfico mostrará las velas en tiempo real
4. Usa el mouse para hacer zoom y navegar

### 4. Explorar Logs Históricos
1. Ve a la sección **Logs**
2. Configura los filtros (timeframe, símbolo, límite)
3. Haz clic en "Buscar"
4. Explora los datos en la tabla

## 🎨 Capturas de Pantalla

### Página de Inicio
Dashboard con navegación a todas las secciones

### Dashboard
Métricas y estadísticas en tiempo real

### Gráficos
Visualización interactiva de velas

### Logs
Explorador de datos históricos

### Collectors
Panel de gestión de collectors

## ⚙️ Configuración Avanzada

### Cambiar Puerto del Frontend

Por defecto Next.js usa el puerto 3000, pero como el backend también lo usa, puedes cambiar el puerto del frontend:

```bash
# En package.json, modifica el script dev:
"dev": "next dev -p 3001"
```

O ejecuta directamente:

```bash
npm run dev -- -p 3001
```

### Variables de Entorno

- `NEXT_PUBLIC_API_URL`: URL del backend (default: http://localhost:3000)

Las variables que comienzan con `NEXT_PUBLIC_` son accesibles en el cliente.

## 🐛 Troubleshooting

### Error: Cannot connect to API

**Problema:** El frontend no puede conectarse al backend.

**Solución:**
1. Verifica que el backend esté corriendo en el puerto 3000
2. Revisa que la URL en `.env.local` sea correcta
3. Verifica que no haya problemas de CORS

### Gráficos no se muestran

**Problema:** Los gráficos aparecen vacíos.

**Solución:**
1. Verifica que hay datos en los logs para ese timeframe/símbolo
2. Inicia un collector si no hay datos disponibles
3. Revisa la consola del navegador para errores

### Error al iniciar collector

**Problema:** El collector no se inicia.

**Solución:**
1. Verifica que el backend tenga los scripts compilados en `dist/`
2. Revisa los logs del backend para más detalles
3. Asegúrate de que el timeframe sea válido (1m, 5m, 15m, 30m, 1h, 4h)

## 🚀 Deploy a Producción

### Build de Producción

```bash
npm run build
npm run start
```

### Deploy en Vercel

El proyecto está optimizado para deploy en Vercel:

```bash
# Instala Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Variables de Entorno en Producción

No olvides configurar la variable `NEXT_PUBLIC_API_URL` con la URL de tu backend en producción.

## 📝 Notas

- El frontend actualiza automáticamente el dashboard cada 5 segundos
- Los collectors iniciados corren en background en el servidor del backend
- Los gráficos soportan hasta 500 velas para mejor rendimiento
- Todos los timestamps se muestran en formato local

## 🤝 Contribuir

Este proyecto es parte del sistema Trading Bot. Para contribuir:

1. Crea una rama feature desde tu rama actual
2. Haz tus cambios
3. Envía un pull request al jefe del equipo

## 📄 Licencia

MIT

## 👤 Autor

Bautista Badino

---

¿Necesitas ayuda? Revisa la documentación del backend en `trading-bot-api/PROYECTO.md`

# Trading-Agent-front
