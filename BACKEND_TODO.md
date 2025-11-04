# 📋 Tareas para el Backend - Gestión de Collectors

El frontend está preparado para consumir estos nuevos endpoints. Implementar lo siguiente en el backend:

## 🔧 Endpoints a Implementar

### 1. **GET /api/collectors/status**

Devolver lista de collectors actualmente corriendo.

**Respuesta esperada:**
```json
{
  "collectors": [
    {
      "pid": 12345,
      "timeframe": "1m",
      "symbol": "ETHUSDT",
      "status": "running",
      "startedAt": "2025-11-04T10:30:00Z",
      "uptime": 3600
    }
  ]
}
```

**Campos:**
- `pid` (number): Process ID del collector
- `timeframe` (string): Timeframe configurado (1m, 5m, 15m, 30m, 1h, 4h)
- `symbol` (string): Par de trading (ETHUSDT, BTCUSDT, etc)
- `status` (string): Estado actual ("running", "stopped", "error")
- `startedAt` (string): Timestamp ISO8601 de cuando inició
- `uptime` (number): Segundos que lleva corriendo

---

### 2. **POST /api/collectors/stop**

Detener un collector específico por su PID.

**Request Body:**
```json
{
  "pid": 12345
}
```

**Respuesta exitosa:**
```json
{
  "message": "Collector detenido exitosamente",
  "pid": 12345
}
```

**Respuesta de error:**
```json
{
  "error": "Collector no encontrado o ya detenido",
  "pid": 12345
}
```

---

## 💾 Persistencia de Collectors

Para que los collectors persistan al recargar, necesitas:

### Opción A: Base de datos (Recomendado)
Agregar una tabla `collectors` con:
```sql
CREATE TABLE collectors (
  pid INTEGER PRIMARY KEY,
  timeframe VARCHAR(10) NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  started_at TIMESTAMP NOT NULL,
  stopped_at TIMESTAMP
);
```

### Opción B: Archivo JSON (Más simple)
Crear un archivo `collectors-state.json` que se actualice cada vez que:
- Se inicia un collector → Agregar entrada
- Se detiene un collector → Marcar como stopped
- Se consulta el estado → Verificar si el PID aún existe con `process.kill(pid, 0)`

```json
{
  "collectors": [
    {
      "pid": 12345,
      "timeframe": "1m",
      "symbol": "ETHUSDT",
      "status": "running",
      "startedAt": "2025-11-04T10:30:00.000Z"
    }
  ]
}
```

---

## 🔄 Flujo de Implementación

### 1. Modificar `/api/collectors/start` (existente)
Al iniciar un collector:
```typescript
// Después de spawn del proceso
const collectorData = {
  pid: collectorProcess.pid,
  timeframe: req.body.timeframe,
  symbol: req.body.symbol,
  status: 'running',
  startedAt: new Date().toISOString()
};

// Guardar en BD o archivo JSON
await saveCollectorState(collectorData);
```

### 2. Implementar `GET /api/collectors/status`
```typescript
app.get('/api/collectors/status', async (req, res) => {
  try {
    // Leer de BD o archivo JSON
    let collectors = await getCollectors();
    
    // Verificar que los PIDs aún existen
    collectors = collectors.filter(c => {
      try {
        process.kill(c.pid, 0); // No mata, solo verifica
        return true;
      } catch {
        // PID no existe, eliminar de BD/archivo
        removeCollector(c.pid);
        return false;
      }
    });
    
    // Calcular uptime
    collectors = collectors.map(c => ({
      ...c,
      uptime: Math.floor((Date.now() - new Date(c.startedAt).getTime()) / 1000)
    }));
    
    res.json({ collectors });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estado' });
  }
});
```

### 3. Implementar `POST /api/collectors/stop`
```typescript
app.post('/api/collectors/stop', async (req, res) => {
  try {
    const { pid } = req.body;
    
    if (!pid) {
      return res.status(400).json({ error: 'PID requerido' });
    }
    
    // Verificar que existe
    try {
      process.kill(pid, 0);
    } catch {
      return res.status(404).json({ 
        error: 'Collector no encontrado o ya detenido',
        pid 
      });
    }
    
    // Matar proceso
    process.kill(pid, 'SIGTERM');
    
    // Actualizar en BD/archivo
    await updateCollectorStatus(pid, 'stopped');
    
    res.json({ 
      message: 'Collector detenido exitosamente',
      pid 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error deteniendo collector',
      message: error.message 
    });
  }
});
```

---

## 📝 Notas Importantes

1. **Verificación de PIDs**: Usar `process.kill(pid, 0)` para verificar sin matar
2. **Cleanup**: Limpiar collectors muertos al consultar el estado
3. **SIGTERM vs SIGKILL**: Usar SIGTERM primero para permitir cleanup graceful
4. **Error Handling**: Manejar casos donde el PID no existe o no se puede detener
5. **Seguridad**: Validar que solo se puedan detener collectors propios (no cualquier PID del sistema)

---

## ✅ Checklist de Implementación

- [ ] Implementar persistencia (BD o archivo JSON)
- [ ] Modificar POST `/api/collectors/start` para guardar estado
- [ ] Implementar GET `/api/collectors/status`
- [ ] Implementar POST `/api/collectors/stop`
- [ ] Agregar verificación de PIDs vivos
- [ ] Agregar cálculo de uptime
- [ ] Agregar manejo de errores
- [ ] Probar inicio de collector
- [ ] Probar consulta de estado
- [ ] Probar detención de collector
- [ ] Probar que persiste al recargar
- [ ] Deploy a Railway

---

## 🧪 Testing

Prueba con curl o Postman:

```bash
# Iniciar collector
curl -X POST http://localhost:3000/api/collectors/start \
  -H "Content-Type: application/json" \
  -d '{"timeframe":"1m","symbol":"ETHUSDT"}'

# Ver estado
curl http://localhost:3000/api/collectors/status

# Detener collector (reemplazar PID)
curl -X POST http://localhost:3000/api/collectors/stop \
  -H "Content-Type: application/json" \
  -d '{"pid":12345}'
```

---

## 📚 Referencias

- Verificar PIDs en Node.js: `process.kill(pid, 0)`
- Matar procesos: `process.kill(pid, 'SIGTERM')`
- Fecha ISO8601: `new Date().toISOString()`
- Calcular diferencia de tiempo: `Date.now() - startTime`

