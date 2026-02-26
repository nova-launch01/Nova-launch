# Health Check Quick Start Guide

## Endpoints

### Basic Health Check
```bash
curl http://localhost:3001/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "version": "0.1.0",
  "services": {
    "database": { "status": "up", "responseTime": 12 },
    "stellarHorizon": { "status": "up", "responseTime": 45 },
    "stellarSoroban": { "status": "up", "responseTime": 38 },
    "ipfs": { "status": "up", "responseTime": 120 },
    "cache": { "status": "up", "responseTime": 2 }
  }
}
```

### Detailed Health Check
```bash
curl http://localhost:3001/api/health/detailed
```

**Response includes all basic fields plus:**
```json
{
  "metrics": {
    "memory": { "used": 52428800, "total": 104857600, "percentage": 50 },
    "cpu": { "usage": 25 },
    "database": { "poolSize": 10, "activeConnections": 2, "idleConnections": 8 },
    "requests": { "total": 15420, "errorRate": 2 }
  }
}
```

## Status Codes

- `200` - Healthy or degraded
- `503` - Unhealthy (critical services down)

## Status Values

- `healthy` - All services operational
- `degraded` - Some non-critical services have issues
- `unhealthy` - Critical services (database) or multiple services down

## Using in Code

```typescript
import { healthService } from '@/lib/health';

// Basic health check
const health = await healthService.checkHealth();
console.log(`Status: ${health.status}`);

// Detailed health check
const detailed = await healthService.checkDetailedHealth();
console.log(`Memory: ${detailed.metrics.memory.percentage}%`);

// Track metrics
healthService.incrementRequestCount();
healthService.incrementErrorCount();

// Get info
const uptime = healthService.getUptime(); // seconds
const version = healthService.getVersion();
```

## Kubernetes Health Probes

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 10
  periodSeconds: 5
```

## Docker Compose Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 40s
```

## Monitoring Integration

### Prometheus
Use `/api/health/detailed` and parse metrics

### Uptime Monitoring
- URL: `https://your-domain.com/api/health`
- Method: GET
- Expected: 200 status code
- Interval: 1-5 minutes

## Testing

```bash
# Run all health tests
npm test -- src/lib/health src/app/api/health --run

# Run specific test
npm test -- src/lib/health/__tests__/health.service.test.ts --run
```

## Configuration

Set in `.env`:
```env
DATABASE_URL=file:./dev.db
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
IPFS_GATEWAY_URL=https://ipfs.io
```

## Troubleshooting

### All services down
- Check network connectivity
- Verify environment variables
- Ensure app started successfully

### Database down
- Check `DATABASE_URL`
- Verify database is running
- Check database credentials

### High error rate
- Check application logs
- Review recent deployments
- Verify external service status

## Performance

- Response time: < 100ms (cached)
- Cache TTL: 30 seconds
- Timeout per check: 5 seconds
- All checks run in parallel

## Documentation

- Full API docs: `HEALTH_ENDPOINTS.md`
- Implementation details: `HEALTH_CHECK_IMPLEMENTATION.md`
- Service docs: `src/lib/health/README.md`
