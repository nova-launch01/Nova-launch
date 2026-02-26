# Health Check and Monitoring Endpoints

This document describes the health check and monitoring endpoints available in the backend API.

## Endpoints

### GET /api/health

Basic health check endpoint that returns the overall status of the application and its dependencies.

#### Response Schema

```typescript
{
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string; // ISO 8601 format
  uptime: number; // seconds since application start
  version: string; // application version
  services: {
    database: {
      status: 'up' | 'down' | 'degraded';
      responseTime?: number; // milliseconds
      message?: string;
      error?: string;
    };
    stellarHorizon: {
      status: 'up' | 'down' | 'degraded';
      responseTime?: number;
      message?: string;
      error?: string;
    };
    stellarSoroban: {
      status: 'up' | 'down' | 'degraded';
      responseTime?: number;
      message?: string;
      error?: string;
    };
    ipfs: {
      status: 'up' | 'down' | 'degraded';
      responseTime?: number;
      message?: string;
      error?: string;
    };
    cache: {
      status: 'up' | 'down' | 'degraded';
      responseTime?: number;
      message?: string;
      error?: string;
    };
  };
}
```

#### Status Codes

- `200 OK`: Application is healthy or degraded
- `503 Service Unavailable`: Application is unhealthy

#### Status Determination

- **healthy**: All services are operational
- **degraded**: Some non-critical services are experiencing issues
- **unhealthy**: Critical services (especially database) are down

#### Example Response (Healthy)

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "version": "0.1.0",
  "services": {
    "database": {
      "status": "up",
      "responseTime": 12
    },
    "stellarHorizon": {
      "status": "up",
      "responseTime": 45
    },
    "stellarSoroban": {
      "status": "up",
      "responseTime": 38
    },
    "ipfs": {
      "status": "up",
      "responseTime": 120
    },
    "cache": {
      "status": "up",
      "responseTime": 2
    }
  }
}
```

#### Example Response (Degraded)

```json
{
  "status": "degraded",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "version": "0.1.0",
  "services": {
    "database": {
      "status": "up",
      "responseTime": 12
    },
    "stellarHorizon": {
      "status": "degraded",
      "responseTime": 2500,
      "message": "HTTP 429"
    },
    "stellarSoroban": {
      "status": "up",
      "responseTime": 38
    },
    "ipfs": {
      "status": "up",
      "responseTime": 120
    },
    "cache": {
      "status": "up",
      "responseTime": 2
    }
  }
}
```

#### Example Response (Unhealthy)

```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "version": "0.1.0",
  "services": {
    "database": {
      "status": "down",
      "responseTime": 5000,
      "error": "Connection timeout"
    },
    "stellarHorizon": {
      "status": "up",
      "responseTime": 45
    },
    "stellarSoroban": {
      "status": "up",
      "responseTime": 38
    },
    "ipfs": {
      "status": "up",
      "responseTime": 120
    },
    "cache": {
      "status": "up",
      "responseTime": 2
    }
  }
}
```

### GET /api/health/detailed

Detailed health check endpoint that includes all basic health information plus system metrics and performance data.

#### Response Schema

Extends the basic health check response with additional metrics:

```typescript
{
  // ... all fields from basic health check
  metrics: {
    memory: {
      used: number; // bytes
      total: number; // bytes
      percentage: number; // 0-100
    };
    cpu: {
      usage: number; // percentage
    };
    database: {
      poolSize?: number;
      activeConnections?: number;
      idleConnections?: number;
    };
    requests: {
      total: number;
      errorRate: number; // percentage
    };
  };
}
```

#### Status Codes

- `200 OK`: Application is healthy or degraded
- `503 Service Unavailable`: Application is unhealthy

#### Example Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "version": "0.1.0",
  "services": {
    "database": {
      "status": "up",
      "responseTime": 12
    },
    "stellarHorizon": {
      "status": "up",
      "responseTime": 45
    },
    "stellarSoroban": {
      "status": "up",
      "responseTime": 38
    },
    "ipfs": {
      "status": "up",
      "responseTime": 120
    },
    "cache": {
      "status": "up",
      "responseTime": 2
    }
  },
  "metrics": {
    "memory": {
      "used": 52428800,
      "total": 104857600,
      "percentage": 50
    },
    "cpu": {
      "usage": 25
    },
    "database": {
      "poolSize": 10,
      "activeConnections": 2,
      "idleConnections": 8
    },
    "requests": {
      "total": 15420,
      "errorRate": 2
    }
  }
}
```

## Service Checks

### Database

Performs a simple query (`SELECT 1`) to verify database connectivity and responsiveness.

- **Timeout**: 5 seconds (configurable)
- **Critical**: Yes (database failure results in unhealthy status)

### Stellar Horizon

Checks connectivity to the Stellar Horizon API by making a request to the root endpoint.

- **Timeout**: 5 seconds (configurable)
- **Critical**: No (failure results in degraded status)
- **Configuration**: `STELLAR_HORIZON_URL` environment variable

### Stellar Soroban RPC

Checks connectivity to the Stellar Soroban RPC by calling the `getHealth` method.

- **Timeout**: 5 seconds (configurable)
- **Critical**: No (failure results in degraded status)
- **Configuration**: `STELLAR_SOROBAN_RPC_URL` environment variable

### IPFS Gateway

Checks connectivity to the IPFS gateway by making a request to the root endpoint.

- **Timeout**: 5 seconds (configurable)
- **Critical**: No (failure results in degraded status)
- **Configuration**: `IPFS_GATEWAY_URL` environment variable (defaults to https://ipfs.io)

### Cache

Verifies cache functionality by performing a write-read-delete cycle.

- **Timeout**: 5 seconds (configurable)
- **Critical**: No (failure results in degraded status)

## Caching

Health check results are cached for 30 seconds to prevent excessive dependency calls. This ensures:

- Reduced load on external services
- Faster response times for monitoring tools
- Protection against cascading failures

The cache is automatically invalidated after 30 seconds, ensuring fresh data is retrieved regularly.

## Monitoring Integration

### Kubernetes/Docker

Use the basic health endpoint for liveness and readiness probes:

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 5
  failureThreshold: 2
```

### Prometheus

The detailed endpoint provides metrics suitable for Prometheus scraping. You can create a custom exporter or use the metrics directly.

### Uptime Monitoring

Services like UptimeRobot, Pingdom, or StatusCake can monitor the basic health endpoint:

- **URL**: `https://your-domain.com/api/health`
- **Method**: GET
- **Expected Status**: 200
- **Check Interval**: 1-5 minutes

### Alerting

Set up alerts based on:

1. **Status changes**: Alert when status changes from healthy to degraded or unhealthy
2. **Response time**: Alert when service response times exceed thresholds
3. **Error rate**: Alert when error rate exceeds acceptable levels
4. **Memory usage**: Alert when memory usage exceeds 80%
5. **CPU usage**: Alert when CPU usage exceeds 80%

## Performance Considerations

- Health checks are designed to be lightweight and fast
- All checks run in parallel to minimize total response time
- Timeouts prevent slow dependencies from blocking the health check
- Caching reduces load on dependencies
- Failed checks don't cascade to other services

## Security Considerations

- Health endpoints are public and don't require authentication
- No sensitive information is exposed in responses
- Error messages are sanitized to prevent information leakage
- Rate limiting should be applied at the infrastructure level

## Troubleshooting

### All Services Down

If all services show as down, check:

1. Network connectivity
2. Environment variables are correctly set
3. Application has started successfully

### Database Down

If only the database shows as down:

1. Verify `DATABASE_URL` environment variable
2. Check database server is running
3. Verify network connectivity to database
4. Check database credentials

### External Services Down

If Stellar or IPFS services show as down:

1. Verify the external service is operational
2. Check network connectivity
3. Verify environment variables are correct
4. Check for rate limiting or API key issues

### High Error Rate

If the error rate is high:

1. Check application logs for errors
2. Review recent deployments or changes
3. Check external service status
4. Verify database performance

## Configuration

### Environment Variables

- `STELLAR_HORIZON_URL`: Stellar Horizon API URL
- `STELLAR_SOROBAN_RPC_URL`: Stellar Soroban RPC URL
- `IPFS_GATEWAY_URL`: IPFS gateway URL (optional, defaults to https://ipfs.io)
- `DATABASE_URL`: Database connection string

### Timeouts

Default timeout for all checks is 5 seconds. This can be adjusted by modifying the `HealthService` configuration.

### Cache TTL

Default cache TTL is 30 seconds. This can be adjusted in the `HealthService` constructor.
