/**
 * Prometheus Metrics Configuration for Nova Launch
 * Provides comprehensive application and business metrics collection
 */

import client from 'prom-client';

// Environment configuration
const SERVICE_NAME = process.env.SERVICE_NAME || 'nova-launch';
const STELLAR_NETWORK = process.env.STELLAR_NETWORK || 'testnet';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Default labels for all metrics
const defaultLabels = {
  service: SERVICE_NAME,
  environment: ENVIRONMENT,
  network: STELLAR_NETWORK,
};

// Create registry
export const register = new client.Registry();

// Add default labels
register.setDefaultLabels(defaultLabels);

// Collect default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'nova_launch_',
});

/**
 * HTTP Request Metrics
 */
export const httpRequestDuration = new client.Histogram({
  name: 'nova_launch_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10],
  registers: [register],
});

export const httpRequestTotal = new client.Counter({
  name: 'nova_launch_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestSize = new client.Histogram({
  name: 'nova_launch_http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 10000, 100000, 1000000],
  registers: [register],
});

export const httpResponseSize = new client.Histogram({
  name: 'nova_launch_http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 10000, 100000, 1000000],
  registers: [register],
});

/**
 * Smart Contract Metrics
 */
export const contractInteractionDuration = new client.Histogram({
  name: 'nova_launch_contract_interaction_duration_seconds',
  help: 'Duration of smart contract interactions in seconds',
  labelNames: ['contract_address', 'method', 'success'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

export const contractInteractionTotal = new client.Counter({
  name: 'nova_launch_contract_interactions_total',
  help: 'Total number of smart contract interactions',
  labelNames: ['contract_address', 'method', 'success'],
  registers: [register],
});

export const contractGasUsed = new client.Histogram({
  name: 'nova_launch_contract_gas_used',
  help: 'Gas used in smart contract interactions',
  labelNames: ['contract_address', 'method'],
  buckets: [1000, 5000, 10000, 50000, 100000, 500000, 1000000],
  registers: [register],
});

export const tokenDeploymentTotal = new client.Counter({
  name: 'nova_launch_token_deployments_total',
  help: 'Total number of token deployments',
  labelNames: ['success', 'has_metadata'],
  registers: [register],
});

export const tokenDeploymentDuration = new client.Histogram({
  name: 'nova_launch_token_deployment_duration_seconds',
  help: 'Duration of token deployment process in seconds',
  labelNames: ['success', 'has_metadata'],
  buckets: [1, 5, 10, 30, 60, 120, 300],
  registers: [register],
});

export const tokenDeploymentFees = new client.Histogram({
  name: 'nova_launch_token_deployment_fees_xlm',
  help: 'Fees paid for token deployments in XLM',
  labelNames: ['has_metadata'],
  buckets: [1, 5, 10, 20, 50, 100],
  registers: [register],
});

/**
 * RPC Provider Metrics
 */
export const rpcCallDuration = new client.Histogram({
  name: 'nova_launch_rpc_call_duration_seconds',
  help: 'Duration of RPC calls in seconds',
  labelNames: ['provider', 'method', 'success'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const rpcCallTotal = new client.Counter({
  name: 'nova_launch_rpc_calls_total',
  help: 'Total number of RPC calls',
  labelNames: ['provider', 'method', 'success'],
  registers: [register],
});

export const rpcErrorTotal = new client.Counter({
  name: 'nova_launch_rpc_errors_total',
  help: 'Total number of RPC errors',
  labelNames: ['provider', 'method', 'error_type'],
  registers: [register],
});

/**
 * Database Metrics
 */
export const dbQueryDuration = new client.Histogram({
  name: 'nova_launch_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table', 'success'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

export const dbQueryTotal = new client.Counter({
  name: 'nova_launch_db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'success'],
  registers: [register],
});

export const dbConnectionsActive = new client.Gauge({
  name: 'nova_launch_db_connections_active',
  help: 'Number of active database connections',
  registers: [register],
});

export const dbConnectionsIdle = new client.Gauge({
  name: 'nova_launch_db_connections_idle',
  help: 'Number of idle database connections',
  registers: [register],
});

/**
 * Wallet Interaction Metrics
 */
export const walletInteractionTotal = new client.Counter({
  name: 'nova_launch_wallet_interactions_total',
  help: 'Total number of wallet interactions',
  labelNames: ['action', 'wallet_type', 'success'],
  registers: [register],
});

export const walletConnectionDuration = new client.Histogram({
  name: 'nova_launch_wallet_connection_duration_seconds',
  help: 'Duration of wallet connection process in seconds',
  labelNames: ['wallet_type', 'success'],
  buckets: [0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

export const walletSigningDuration = new client.Histogram({
  name: 'nova_launch_wallet_signing_duration_seconds',
  help: 'Duration of transaction signing in seconds',
  labelNames: ['wallet_type', 'success'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

/**
 * IPFS Metrics
 */
export const ipfsOperationDuration = new client.Histogram({
  name: 'nova_launch_ipfs_operation_duration_seconds',
  help: 'Duration of IPFS operations in seconds',
  labelNames: ['operation', 'success'],
  buckets: [0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

export const ipfsOperationTotal = new client.Counter({
  name: 'nova_launch_ipfs_operations_total',
  help: 'Total number of IPFS operations',
  labelNames: ['operation', 'success'],
  registers: [register],
});

export const ipfsFileSize = new client.Histogram({
  name: 'nova_launch_ipfs_file_size_bytes',
  help: 'Size of files uploaded to IPFS in bytes',
  buckets: [1024, 10240, 102400, 1048576, 10485760], // 1KB to 10MB
  registers: [register],
});

/**
 * Business Metrics
 */
export const activeUsers = new client.Gauge({
  name: 'nova_launch_active_users',
  help: 'Number of active users',
  labelNames: ['period'], // daily, weekly, monthly
  registers: [register],
});

export const revenueTotal = new client.Counter({
  name: 'nova_launch_revenue_total_xlm',
  help: 'Total revenue generated in XLM',
  labelNames: ['source'], // deployment_fees, metadata_fees
  registers: [register],
});

export const userConversionFunnel = new client.Counter({
  name: 'nova_launch_user_conversion_funnel_total',
  help: 'User conversion funnel metrics',
  labelNames: ['stage'], // visit, connect_wallet, start_deployment, complete_deployment
  registers: [register],
});

export const featureUsage = new client.Counter({
  name: 'nova_launch_feature_usage_total',
  help: 'Feature usage metrics',
  labelNames: ['feature'], // token_deployment, metadata_upload, transaction_history
  registers: [register],
});

/**
 * Error Metrics
 */
export const errorTotal = new client.Counter({
  name: 'nova_launch_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity', 'component'],
  registers: [register],
});

export const errorRate = new client.Gauge({
  name: 'nova_launch_error_rate',
  help: 'Error rate percentage',
  labelNames: ['component'],
  registers: [register],
});

/**
 * Background Job Metrics
 */
export const jobExecutionDuration = new client.Histogram({
  name: 'nova_launch_job_execution_duration_seconds',
  help: 'Duration of background job execution in seconds',
  labelNames: ['job_name', 'success'],
  buckets: [1, 5, 10, 30, 60, 300, 600],
  registers: [register],
});

export const jobExecutionTotal = new client.Counter({
  name: 'nova_launch_job_executions_total',
  help: 'Total number of background job executions',
  labelNames: ['job_name', 'success'],
  registers: [register],
});

export const jobQueueSize = new client.Gauge({
  name: 'nova_launch_job_queue_size',
  help: 'Number of jobs in queue',
  labelNames: ['queue_name'],
  registers: [register],
});

/**
 * Health Check Metrics
 */
export const healthCheckStatus = new client.Gauge({
  name: 'nova_launch_health_check_status',
  help: 'Health check status (1 = healthy, 0 = unhealthy)',
  labelNames: ['service', 'check'],
  registers: [register],
});

export const healthCheckDuration = new client.Histogram({
  name: 'nova_launch_health_check_duration_seconds',
  help: 'Duration of health checks in seconds',
  labelNames: ['service', 'check'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

/**
 * Metrics Collection Helper Class
 */
export class MetricsCollector {
  /**
   * Record HTTP request metrics
   */
  static recordHttpRequest(params: {
    method: string;
    route: string;
    statusCode: number;
    duration: number;
    requestSize?: number;
    responseSize?: number;
  }): void {
    const labels = {
      method: params.method,
      route: params.route,
      status_code: params.statusCode.toString(),
    };

    httpRequestTotal.inc(labels);
    httpRequestDuration.observe(labels, params.duration / 1000);

    if (params.requestSize) {
      httpRequestSize.observe(
        { method: params.method, route: params.route },
        params.requestSize
      );
    }

    if (params.responseSize) {
      httpResponseSize.observe(
        { method: params.method, route: params.route },
        params.responseSize
      );
    }
  }

  /**
   * Record smart contract interaction metrics
   */
  static recordContractInteraction(params: {
    contractAddress: string;
    method: string;
    success: boolean;
    duration: number;
    gasUsed?: number;
  }): void {
    const labels = {
      contract_address: params.contractAddress.slice(-8), // Last 8 chars for privacy
      method: params.method,
      success: params.success.toString(),
    };

    contractInteractionTotal.inc(labels);
    contractInteractionDuration.observe(labels, params.duration / 1000);

    if (params.gasUsed) {
      contractGasUsed.observe(
        {
          contract_address: params.contractAddress.slice(-8),
          method: params.method,
        },
        params.gasUsed
      );
    }
  }

  /**
   * Record token deployment metrics
   */
  static recordTokenDeployment(params: {
    success: boolean;
    hasMetadata: boolean;
    duration: number;
    fee: number;
  }): void {
    const labels = {
      success: params.success.toString(),
      has_metadata: params.hasMetadata.toString(),
    };

    tokenDeploymentTotal.inc(labels);
    tokenDeploymentDuration.observe(labels, params.duration / 1000);
    tokenDeploymentFees.observe(
      { has_metadata: params.hasMetadata.toString() },
      params.fee
    );
  }

  /**
   * Record RPC call metrics
   */
  static recordRPCCall(params: {
    provider: string;
    method: string;
    success: boolean;
    duration: number;
    errorType?: string;
  }): void {
    const labels = {
      provider: params.provider,
      method: params.method,
      success: params.success.toString(),
    };

    rpcCallTotal.inc(labels);
    rpcCallDuration.observe(labels, params.duration / 1000);

    if (!params.success && params.errorType) {
      rpcErrorTotal.inc({
        provider: params.provider,
        method: params.method,
        error_type: params.errorType,
      });
    }
  }

  /**
   * Record database query metrics
   */
  static recordDatabaseQuery(params: {
    operation: string;
    table: string;
    success: boolean;
    duration: number;
  }): void {
    const labels = {
      operation: params.operation,
      table: params.table,
      success: params.success.toString(),
    };

    dbQueryTotal.inc(labels);
    dbQueryDuration.observe(labels, params.duration / 1000);
  }

  /**
   * Record wallet interaction metrics
   */
  static recordWalletInteraction(params: {
    action: string;
    walletType: string;
    success: boolean;
    duration?: number;
  }): void {
    const labels = {
      action: params.action,
      wallet_type: params.walletType,
      success: params.success.toString(),
    };

    walletInteractionTotal.inc(labels);

    if (params.duration) {
      if (params.action === 'connect') {
        walletConnectionDuration.observe(
          { wallet_type: params.walletType, success: params.success.toString() },
          params.duration / 1000
        );
      } else if (params.action === 'sign') {
        walletSigningDuration.observe(
          { wallet_type: params.walletType, success: params.success.toString() },
          params.duration / 1000
        );
      }
    }
  }

  /**
   * Record IPFS operation metrics
   */
  static recordIPFSOperation(params: {
    operation: string;
    success: boolean;
    duration: number;
    fileSize?: number;
  }): void {
    const labels = {
      operation: params.operation,
      success: params.success.toString(),
    };

    ipfsOperationTotal.inc(labels);
    ipfsOperationDuration.observe(labels, params.duration / 1000);

    if (params.fileSize) {
      ipfsFileSize.observe(params.fileSize);
    }
  }

  /**
   * Record business metrics
   */
  static recordBusinessMetric(params: {
    type: 'active_users' | 'revenue' | 'conversion' | 'feature_usage';
    value: number;
    labels: Record<string, string>;
  }): void {
    switch (params.type) {
      case 'active_users':
        activeUsers.set(params.labels, params.value);
        break;
      case 'revenue':
        revenueTotal.inc(params.labels, params.value);
        break;
      case 'conversion':
        userConversionFunnel.inc(params.labels, params.value);
        break;
      case 'feature_usage':
        featureUsage.inc(params.labels, params.value);
        break;
    }
  }

  /**
   * Record error metrics
   */
  static recordError(params: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    component: string;
  }): void {
    errorTotal.inc({
      type: params.type,
      severity: params.severity,
      component: params.component,
    });
  }

  /**
   * Record background job metrics
   */
  static recordBackgroundJob(params: {
    jobName: string;
    success: boolean;
    duration: number;
  }): void {
    const labels = {
      job_name: params.jobName,
      success: params.success.toString(),
    };

    jobExecutionTotal.inc(labels);
    jobExecutionDuration.observe(labels, params.duration / 1000);
  }

  /**
   * Record health check metrics
   */
  static recordHealthCheck(params: {
    service: string;
    check: string;
    healthy: boolean;
    duration: number;
  }): void {
    const labels = {
      service: params.service,
      check: params.check,
    };

    healthCheckStatus.set(labels, params.healthy ? 1 : 0);
    healthCheckDuration.observe(labels, params.duration / 1000);
  }

  /**
   * Update database connection metrics
   */
  static updateDatabaseConnections(active: number, idle: number): void {
    dbConnectionsActive.set(active);
    dbConnectionsIdle.set(idle);
  }

  /**
   * Update job queue size
   */
  static updateJobQueueSize(queueName: string, size: number): void {
    jobQueueSize.set({ queue_name: queueName }, size);
  }

  /**
   * Calculate and update error rates
   */
  static updateErrorRate(component: string, rate: number): void {
    errorRate.set({ component }, rate);
  }
}

/**
 * Express middleware for automatic HTTP metrics collection
 */
export function createMetricsMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // Override res.end to capture metrics
    const originalEnd = res.end;
    res.end = function(...args: any[]) {
      const duration = Date.now() - startTime;
      
      MetricsCollector.recordHttpRequest({
        method: req.method,
        route: req.route?.path || req.path || 'unknown',
        statusCode: res.statusCode,
        duration,
        requestSize: req.headers['content-length'] ? parseInt(req.headers['content-length']) : undefined,
        responseSize: res.get('content-length') ? parseInt(res.get('content-length')) : undefined,
      });

      originalEnd.apply(res, args);
    };

    next();
  };
}

// Export the registry for /metrics endpoint
export { register as metricsRegistry };