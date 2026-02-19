/**
 * Sentry Configuration for Nova Launch Frontend
 * Provides comprehensive error tracking and performance monitoring
 */

import * as Sentry from '@sentry/react';

// Environment configuration
const ENVIRONMENT = (import.meta as any).env?.VITE_ENVIRONMENT || 'development';
const SENTRY_DSN = (import.meta as any).env?.VITE_SENTRY_DSN;
const RELEASE_VERSION = (import.meta as any).env?.VITE_APP_VERSION || '1.0.0';
const STELLAR_NETWORK = (import.meta as any).env?.VITE_NETWORK || 'testnet';

// Performance monitoring configuration
const PERFORMANCE_CONFIG = {
  development: {
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
  },
  staging: {
    tracesSampleRate: 0.5,
    profilesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  },
  production: {
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.01,
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 0.5,
  },
};

/**
 * Initialize Sentry for frontend error tracking and performance monitoring
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
    release: `nova-launch-frontend@${RELEASE_VERSION}`,
    
    // Performance monitoring
    integrations: [
      new Sentry.BrowserTracing({
        // Capture interactions with buttons, links, etc.
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/api\.nova-launch\./,
          /^https:\/\/.*\.stellar\.org/,
          /^https:\/\/.*\.pinata\.cloud/,
        ],
      }),
      
      // Session replay for debugging
      new Sentry.Replay({
        maskAllText: false,
        maskAllInputs: true,
        blockAllMedia: true,
      }),
    ],

    // Sampling rates
    ...config,

    // Error filtering
    beforeSend(event: Sentry.Event, hint: Sentry.EventHint) {
      // Filter out known non-critical errors
      const error = hint.originalException;
      
      if (error instanceof Error) {
        // Filter wallet connection errors that are user-initiated
        if (error.message.includes('User rejected') || 
            error.message.includes('User cancelled')) {
          return null;
        }
        
        // Filter network errors during development
        if (ENVIRONMENT === 'development' && 
            error.message.includes('Network Error')) {
          return null;
        }
      }
      
      return event;
    },

    // Custom tags
    tags: {
      component: 'frontend',
      network: STELLAR_NETWORK,
      version: RELEASE_VERSION,
    },
  });

  // Set global tags
  Sentry.setTag('component', 'frontend');
  Sentry.setTag('network', STELLAR_NETWORK);
  Sentry.setTag('version', RELEASE_VERSION);

  // Set user context when wallet is connected
  window.addEventListener('wallet-connected', ((event: CustomEvent) => {
    Sentry.setUser({
      id: hashWalletAddress(event.detail.address),
      username: truncateAddress(event.detail.address),
    });
    
    Sentry.setTag('wallet.connected', 'true');
    Sentry.setTag('wallet.type', event.detail.walletType || 'unknown');
  }) as EventListener);

  // Clear user context when wallet is disconnected
  window.addEventListener('wallet-disconnected', () => {
    Sentry.setUser(null);
    Sentry.setTag('wallet.connected', 'false');
  });
}

/**
 * Custom error boundary for React components
 */
export const SentryErrorBoundary = Sentry.withErrorBoundary;

/**
 * Track custom Web3 events
 */
export class Web3EventTracker {
  /**
   * Track token deployment attempt
   */
  static trackTokenDeployment(params: {
    tokenName: string;
    symbol: string;
    initialSupply: string;
    hasMetadata: boolean;
    estimatedFee: string;
  }): void {
    Sentry.addBreadcrumb({
      category: 'web3.token',
      message: 'Token deployment initiated',
      level: 'info',
      data: {
        tokenName: params.tokenName,
        symbol: params.symbol,
        initialSupply: params.initialSupply,
        hasMetadata: params.hasMetadata,
        estimatedFee: params.estimatedFee,
      },
    });
  }

  /**
   * Track successful token deployment
   */
  static trackTokenDeploymentSuccess(params: {
    tokenAddress: string;
    transactionHash: string;
    actualFee: string;
    duration: number;
  }): void {
    Sentry.addBreadcrumb({
      category: 'web3.token',
      message: 'Token deployment successful',
      level: 'info',
      data: {
        tokenAddress: params.tokenAddress,
        transactionHash: params.transactionHash,
        actualFee: params.actualFee,
        duration: params.duration,
      },
    });
  }

  /**
   * Track failed token deployment
   */
  static trackTokenDeploymentFailure(params: {
    error: Error;
    stage: 'validation' | 'signing' | 'submission' | 'confirmation';
    duration: number;
  }): void {
    Sentry.captureException(params.error, {
      tags: {
        deployment_stage: params.stage,
        network: STELLAR_NETWORK,
      },
      extra: {
        duration: params.duration,
      },
    });
  }

  /**
   * Track wallet interactions
   */
  static trackWalletInteraction(params: {
    action: 'connect' | 'disconnect' | 'sign' | 'reject';
    walletType?: string;
    error?: Error;
  }): void {
    if (params.error) {
      Sentry.captureException(params.error, {
        tags: {
          wallet_action: params.action,
          wallet_type: params.walletType || 'unknown',
        },
      });
    } else {
      Sentry.addBreadcrumb({
        category: 'wallet',
        message: `Wallet ${params.action}`,
        level: 'info',
        data: {
          action: params.action,
          walletType: params.walletType,
        },
      });
    }
  }

  /**
   * Track IPFS operations
   */
  static trackIPFSOperation(params: {
    operation: 'upload' | 'retrieve';
    success: boolean;
    duration: number;
    fileSize?: number;
    error?: Error;
  }): void {
    if (params.error) {
      Sentry.captureException(params.error, {
        tags: {
          ipfs_operation: params.operation,
        },
        extra: {
          duration: params.duration,
          fileSize: params.fileSize,
        },
      });
    }

    Sentry.addBreadcrumb({
      category: 'ipfs',
      message: `IPFS ${params.operation} ${params.success ? 'succeeded' : 'failed'}`,
      data: {
        operation: params.operation,
        success: params.success,
        duration: params.duration,
        fileSize: params.fileSize,
      },
    });
  }

  /**
   * Track user journey through the application
   */
  static trackUserJourney(step: string, metadata?: Record<string, any>): void {
    Sentry.addBreadcrumb({
      category: 'user.journey',
      message: `User reached: ${step}`,
      level: 'info',
      data: metadata,
    });
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceTracker {
  private static transactions = new Map<string, Sentry.Transaction>();

  /**
   * Start a performance transaction
   */
  static startTransaction(name: string, op: string): string {
    const transaction = Sentry.startTransaction({
      name,
      op,
      tags: {
        network: STELLAR_NETWORK,
      },
    });

    const transactionId = `${name}-${Date.now()}`;
    this.transactions.set(transactionId, transaction);
    
    return transactionId;
  }

  /**
   * Finish a performance transaction
   */
  static finishTransaction(transactionId: string, status?: string): void {
    const transaction = this.transactions.get(transactionId);
    if (transaction) {
      if (status) {
        transaction.setStatus(status);
      }
      transaction.finish();
      this.transactions.delete(transactionId);
    }
  }

  /**
   * Add span to existing transaction
   */
  static addSpan(transactionId: string, operation: string, description: string): void {
    const transaction = this.transactions.get(transactionId);
    if (transaction) {
      const span = transaction.startChild({
        op: operation,
        description,
      });
      
      // Auto-finish span after 30 seconds to prevent memory leaks
      setTimeout(() => span.finish(), 30000);
    }
  }
}

// Utility functions
function hashWalletAddress(address: string): string {
  // Simple hash for privacy - in production, use a proper hashing library
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `user_${Math.abs(hash)}`;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Export types for TypeScript
export interface DeploymentParams {
  tokenName: string;
  symbol: string;
  initialSupply: string;
  hasMetadata: boolean;
  estimatedFee: string;
}

export interface DeploymentResult {
  tokenAddress: string;
  transactionHash: string;
  actualFee: string;
  duration: number;
}

export interface WalletInteraction {
  action: 'connect' | 'disconnect' | 'sign' | 'reject';
  walletType?: string;
  error?: Error;
}