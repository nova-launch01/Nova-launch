/**
 * Sentry Configuration for Nova Launch Backend Services
 * Provides comprehensive error tracking, performance monitoring, and distributed tracing
 */

import * as Sentry from '@sentry/node';

// Environment configuration
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const SENTRY_DSN = process.env.SENTRY_DSN;
const RELEASE_VERSION = process.env.APP_VERSION || '1.0.0';
const SERVICE_NAME = process.env.SERVICE_NAME || 'nova-launch-backend';
const STELLAR_NETWORK = process.env.STELLAR_NETWORK || 'testnet';

// Performance monitoring configuration
const PERFORMANCE_CONFIG = {
  development: {
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  },
  staging: {
    tracesSampleRate: 0.5,
    profilesSampleRate: 0.1,
  },
  production: {
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.01,
  },
};

/**
 * Initialize Sentry for backend error tracking and performance monitoring
 */
export function initializeSentry(): void {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured, skipping initialization');
    return;
  }

  const config = PERFORMANCE_CONFIG[ENVIRONMENT as keyof typeof PERFORMANCE_CONFIG] || PERFORMANCE_CONFIG.development;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: `${SERVICE_NAME}@${RELEASE_VERSION}`,
    serverName: process.env.HOSTNAME || 'unknown',

    // Performance monitoring
    integrations: [
      // HTTP instrumentation
      new Sentry.Integrations.Http({ tracing: true }),
      
      // Profiling (optional - requires @sentry/profiling-node package)
      // nodeProfilingIntegration(),
    ],

    // Sampling rates
    ...config,

    // Error filtering
    beforeSend(event, hint) {
      const error = hint?.originalException;
      
      if (error instanceof Error) {
        // Filter out known non-critical errors
        if (error.message.includes('ECONNRESET') ||
            error.message.includes('ETIMEDOUT')) {
          // Only capture if it's a pattern (multiple occurrences)
          return Math.random() < 0.1 ? event : null;
        }
        
        // Filter out validation errors in development
        if (ENVIRONMENT === 'development' && 
            error.name === 'ValidationError') {
          return null;
        }
      }
      
      return event;
    },
  });

  // Set global tags
  Sentry.setTag('component', 'backend');
  Sentry.setTag('service', SERVICE_NAME);
  Sentry.setTag('network', STELLAR_NETWORK);
  Sentry.setTag('version', RELEASE_VERSION);

  // Global error handlers
  process.on('unhandledRejection', (reason, promise) => {
    Sentry.captureException(reason, {
      tags: { type: 'unhandledRejection' },
      extra: { promise },
    });
  });

  process.on('uncaughtException', (error) => {
    Sentry.captureException(error, {
      tags: { type: 'uncaughtException' },
    });
  });
}

/**
 * Express middleware for request tracking
 */
export function createSentryMiddleware() {
  return {
    requestHandler: Sentry.Handlers.requestHandler({
      user: ['id', 'wallet_address'],
      request: ['method', 'url', 'headers', 'query'],
      transaction: 'methodPath',
    }),
    
    tracingHandler: Sentry.Handlers.tracingHandler(),
    
    errorHandler: Sentry.Handlers.errorHandler({
      shouldHandleError(error: any) {
        // Only handle 4xx and 5xx errors
        const status = error.status || error.statusCode || 500;
        return status >= 400;
      },
    }),
  };
}

/**
 * Web3 specific error and performance tracking
 */
export class Web3BackendTracker {
  /**
   * Track smart contract interactions
   */
  static trackContractInteraction(params: {
    contractAddress: string;
    method: string;
    transactionHash?: string;
    gasUsed?: number;
    success: boolean;
    duration: number;
    error?: Error;
  }): void {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
    
    if (transaction) {
      transaction.setTag('contract.address', params.contractAddress);
      transaction.setTag('contract.method', params.method);
      transaction.setTag('contract.success', params.success);
      
      if (params.transactionHash) {
        transaction.setTag('transaction.hash', params.transactionHash);
      }
    }

    if (params.error) {
      Sentry.captureException(params.error, {
        tags: {
          contract_address: params.contractAddress,
          contract_method: params.method,
          transaction_hash: params.transactionHash,
        },
        extra: {
          gasUsed: params.gasUsed,
          duration: params.duration,
        },
      });
    }

    // Metrics
    Sentry.addBreadcrumb({
      category: 'contract.interaction',
      message: `Contract ${params.method} ${params.success ? 'succeeded' : 'failed'}`,
      data: {
        contract: params.contractAddress.slice(-8),
        method: params.method,
        success: params.success.toString(),
        network: STELLAR_NETWORK,
        duration: params.duration,
        gasUsed: params.gasUsed,
      },
    });
  }

  /**
   * Track RPC provider performance
   */
  static trackRPCCall(params: {
    provider: string;
    method: string;
    success: boolean;
    duration: number;
    error?: Error;
  }): void {
    if (params.error) {
      Sentry.captureException(params.error, {
        tags: {
          rpc_provider: params.provider,
          rpc_method: params.method,
        },
        extra: {
          duration: params.duration,
        },
      });
    }

    Sentry.addBreadcrumb({
      category: 'rpc.call',
      message: `RPC ${params.method} ${params.success ? 'succeeded' : 'failed'}`,
      data: {
        provider: params.provider,
        method: params.method,
        success: params.success.toString(),
        duration: params.duration,
      },
    });
  }

  /**
   * Track database operations
   */
  static trackDatabaseOperation(params: {
    operation: 'select' | 'insert' | 'update' | 'delete';
    table: string;
    success: boolean;
    duration: number;
    rowsAffected?: number;
    error?: Error;
  }): void {
    if (params.error) {
      Sentry.captureException(params.error, {
        tags: {
          db_operation: params.operation,
          db_table: params.table,
        },
        extra: {
          duration: params.duration,
          rowsAffected: params.rowsAffected,
        },
      });
    }

    Sentry.addBreadcrumb({
      category: 'db.operation',
      message: `Database ${params.operation} on ${params.table}`,
      data: {
        operation: params.operation,
        table: params.table,
        success: params.success.toString(),
        duration: params.duration,
        rowsAffected: params.rowsAffected,
      },
    });
  }

  /**
   * Track background job execution
   */
  static trackBackgroundJob(params: {
    jobName: string;
    jobId: string;
    success: boolean;
    duration: number;
    retryCount?: number;
    error?: Error;
  }): void {
    const transaction = Sentry.startTransaction({
      name: `job.${params.jobName}`,
      op: 'background.job',
      tags: {
        job_name: params.jobName,
        job_id: params.jobId,
        retry_count: params.retryCount?.toString() || '0',
      },
    });

    if (params.error) {
      Sentry.captureException(params.error, {
        tags: {
          job_name: params.jobName,
          job_id: params.jobId,
          retry_count: params.retryCount?.toString() || '0',
        },
        extra: {
          duration: params.duration,
        },
      });
      
      transaction.setStatus('internal_error');
    } else {
      transaction.setStatus('ok');
    }

    transaction.finish();

    Sentry.addBreadcrumb({
      category: 'job.execution',
      message: `Job ${params.jobName} ${params.success ? 'succeeded' : 'failed'}`,
      data: {
        job_name: params.jobName,
        job_id: params.jobId,
        success: params.success.toString(),
        retry_count: params.retryCount?.toString() || '0',
        duration: params.duration,
      },
    });
  }

  /**
   * Track business metrics
   */
  static trackBusinessMetric(params: {
    metric: 'token.deployed' | 'user.registered' | 'transaction.completed' | 'revenue.generated';
    value: number;
    tags?: Record<string, string>;
  }): void {
    // Track as custom event for business intelligence
    Sentry.addBreadcrumb({
      category: 'business.metric',
      message: `${params.metric}: ${params.value}`,
      data: {
        metric: params.metric,
        value: params.value,
        network: STELLAR_NETWORK,
        tags: params.tags,
      },
    });
  }
}

/**
 * Distributed tracing utilities
 */
export class DistributedTracing {
  /**
   * Create a trace context for cross-service communication
   */
  static createTraceContext(): Record<string, string> {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
    if (!transaction) {
      return {};
    }

    const traceContext = transaction.toTraceparent();
    return {
      'sentry-trace': traceContext,
    };
  }

  /**
   * Add custom span to current transaction
   */
  static addSpan<T>(
    operation: string,
    description: string,
    callback: (span: any) => Promise<T> | T
  ): Promise<T> | T {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
    if (!transaction) {
      return callback({});
    }

    const span = transaction.startChild({
      op: operation,
      description,
    });

    try {
      const result = callback(span);
      
      if (result instanceof Promise) {
        return result
          .then((value) => {
            span.setStatus('ok');
            span.finish();
            return value;
          })
          .catch((error) => {
            span.setStatus('internal_error');
            span.finish();
            throw error;
          });
      } else {
        span.setStatus('ok');
        span.finish();
        return result;
      }
    } catch (error) {
      span.setStatus('internal_error');
      span.finish();
      throw error;
    }
  }
}

/**
 * Health check integration
 */
export class HealthCheckTracker {
  /**
   * Track health check results
   */
  static trackHealthCheck(params: {
    service: string;
    check: string;
    success: boolean;
    duration: number;
    error?: Error;
  }): void {
    if (params.error) {
      Sentry.captureException(params.error, {
        tags: {
          health_service: params.service,
          health_check: params.check,
        },
        extra: {
          duration: params.duration,
        },
      });
    }

    Sentry.addBreadcrumb({
      category: 'health.check',
      message: `Health check ${params.check} ${params.success ? 'passed' : 'failed'}`,
      data: {
        service: params.service,
        check: params.check,
        success: params.success.toString(),
        duration: params.duration,
      },
    });
  }
}

// Export middleware factory for different frameworks
export function createExpressMiddleware() {
  const middleware = createSentryMiddleware();
  return {
    requestHandler: middleware.requestHandler,
    tracingHandler: middleware.tracingHandler,
    errorHandler: middleware.errorHandler,
  };
}

// Export types
export interface ContractInteractionParams {
  contractAddress: string;
  method: string;
  transactionHash?: string;
  gasUsed?: number;
  success: boolean;
  duration: number;
  error?: Error;
}

export interface RPCCallParams {
  provider: string;
  method: string;
  success: boolean;
  duration: number;
  error?: Error;
}

export interface DatabaseOperationParams {
  operation: 'select' | 'insert' | 'update' | 'delete';
  table: string;
  success: boolean;
  duration: number;
  rowsAffected?: number;
  error?: Error;
}

export interface BackgroundJobParams {
  jobName: string;
  jobId: string;
  success: boolean;
  duration: number;
  retryCount?: number;
  error?: Error;
}