# Health Check Service

A comprehensive health monitoring service for the backend application that provides real-time status information about the application and its dependencies.

## Features

- **Multi-service monitoring**: Checks database, Stellar Horizon, Stellar Soroban RPC, IPFS, and cache
- **Deterministic status**: Aggregates service statuses into overall health (healthy, degraded, unhealthy)
- **Response time tracking**: Measures and reports response times for each dependency
- **System metrics**: Collects memory, CPU, database pool, and request statistics
- **Caching**: Short-lived caching (30s) to prevent excessive dependency calls
- **Timeout protection**: All checks have configurable timeouts to prevent blocking
- **Graceful failure**: Failed checks don't cascade to other services
- **Singleton pattern**: Single instance tracks metrics across the application lifecycle

## Architecture

### HealthService

The core service that manages health checks and metrics collection.

```typescript
import { healthService } from '@/lib/health';

// Basic health check
const health = await healthService.checkHealth();

// Detailed health check with metrics
const detailedHealth = await healthService.checkDetailedHealth();

// Track metrics
healthService.incrementRequestCount();
healthService.incrementErrorCount();

// Get application info
const uptime = healthService.getUptime(); // seconds
const version = healthService.getVersion();
```

### Types

```typescript
type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
type ServiceStatus = 'up' | 'down' | 'degraded';

interface ServiceHealth {
  status: ServiceStatus;
  responseTime?: number;
  message?: string;
  error?: string;
}

interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: ServiceHealth;
    stellarHorizon: ServiceHealth;
    stellarSoroban: ServiceHealth;
    ipfs: ServiceHealth;
    cache: ServiceHealth;
  };
}

interface DetailedHealthCheckResult extends HealthCheckResult {
  metrics: {
    memory: { used: number; total: number; percentage: number };
    cpu: { usage: number };
    database: { poolSize?: number; activeConnections?: number; idleConnections?: number };
    requests: { total: number; errorRate: number };
  };
}
```

## Service Checks

### Database
- **Check**: Executes `SELECT 1` query
- **Timeout**: 5 seconds
- **Critical**: Yes (failure = unhealthy)
- **Config**: `DATABASE_URL`

### Stellar Horizon
- **Check**: HTTP GET to root endpoint
- **Timeout**: 5 seconds
- **Critical**: No (failure = degraded)
- **Config**: `STELLAR_HORIZON_URL`

### Stellar Soroban RPC
- **Check**: JSON-RPC `getHealth` call
- **Timeout**: 5 seconds
- **Critical**: No (failure = degraded)
- **Config**: `STELLAR_SOROBAN_RPC_URL`

### IPFS Gateway
- **Check**: HTTP GET to gateway root
- **Timeout**: 5 seconds
- **Critical**: No (failure = degraded)
- **Config**: `IPFS_GATEWAY_URL` (default: https://ipfs.io)

### Cache
- **Check**: Write-read-delete cycle
- **Timeout**: 5 seconds
- **Critical**: No (failure = degraded)

## Status Determination

The overall health status is determined by:

1. **Unhealthy**: Database is down OR any service is down
2. **Degraded**: Any service is degraded (but none are down)
3. **Healthy**: All services are up

## Caching Strategy

Health check results are cached for 30 seconds to:
- Reduce load on external services
- Improve response times
- Prevent cascading failures during high traffic

Cache keys:
- `health-check-basic`: Basic health check results
- `health-check-detailed`: Detailed health check with metrics

## Metrics Collection

### Memory Metrics
- **used**: Heap memory used (bytes)
- **total**: Total heap memory (bytes)
- **percentage**: Memory usage percentage (0-100)

### CPU Metrics
- **usage**: CPU usage percentage based on process CPU time

### Database Metrics
- **poolSize**: Connection pool size (if available)
- **activeConnections**: Active database connections
- **idleConnections**: Idle database connections

### Request Metrics
- **total**: Total requests processed
- **errorRate**: Error rate percentage (0-100)

## Usage Examples

### Basic Health Check

```typescript
import { healthService } from '@/lib/health';

const health = await healthService.checkHealth({ timeout: 5000 });

console.log(`Status: ${health.status}`);
console.log(`Uptime: ${health.uptime}s`);
console.log(`Database: ${health.services.database.status}`);
```

### Detailed Health Check

```typescript
const health = await healthService.checkDetailedHealth();

console.log(`Memory: ${health.metrics.memory.percentage}%`);
console.log(`CPU: ${health.metrics.cpu.usage}%`);
console.log(`Error Rate: ${health.metrics.requests.errorRate}%`);
```

### Tracking Metrics

```typescript
// In middleware or request handlers
healthService.incrementRequestCount();

// In error handlers
healthService.incrementErrorCount();
```

## Testing

The health service includes comprehensive tests:

```bash
# Run all health tests
npm test -- src/lib/health --run

# Run specific test file
npm test -- src/lib/health/__tests__/health.service.test.ts --run
```

Test coverage includes:
- Singleton pattern
- Uptime tracking
- Version retrieval
- Request/error counting
- Healthy state detection
- Degraded state detection
- Unhealthy state detection
- Service timeout handling
- Cache functionality
- Response time tracking
- Metrics collection
- Schema validation

## Performance Considerations

- All service checks run in parallel
- Timeouts prevent slow dependencies from blocking
- Caching reduces dependency load
- Lightweight checks minimize overhead
- No blocking operations in critical path

## Security Considerations

- No sensitive information in responses
- Error messages are sanitized
- No authentication required (public endpoints)
- Rate limiting should be applied at infrastructure level

## Configuration

### Environment Variables

```env
DATABASE_URL=file:./dev.db
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
IPFS_GATEWAY_URL=https://ipfs.io
```

### Timeouts

Default timeout is 5 seconds. Can be customized per check:

```typescript
const health = await healthService.checkHealth({ timeout: 10000 });
```

### Cache TTL

Default cache TTL is 30 seconds. Modify in `HealthService` constructor:

```typescript
this.cache = new NodeCache({ stdTTL: 30, checkperiod: 10 });
```

## Troubleshooting

### All Services Down
- Check network connectivity
- Verify environment variables
- Ensure application started successfully

### High Response Times
- Check network latency to external services
- Verify database performance
- Review application logs

### Cache Issues
- Verify NodeCache is properly initialized
- Check cache TTL settings
- Review cache hit/miss rates

## Future Enhancements

- [ ] Prometheus metrics export
- [ ] Custom health check plugins
- [ ] Configurable service criticality
- [ ] Historical metrics storage
- [ ] Alert threshold configuration
- [ ] Service dependency graph
- [ ] Health check scheduling
