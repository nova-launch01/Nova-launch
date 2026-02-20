import type { AppError } from '../types';
import { ErrorCode } from '../types';

export interface StellarErrorDetails {
    code: ErrorCode;
    message: string;
    details?: string;
    retryable: boolean;
    retrySuggestion?: string;
}

export class StellarError extends Error implements AppError {
    code: ErrorCode;
    details?: string;
    retryable: boolean;
    retrySuggestion?: string;

    constructor(errorDetails: StellarErrorDetails) {
        super(errorDetails.message);
        this.name = 'StellarError';
        this.code = errorDetails.code;
        this.details = errorDetails.details;
        this.retryable = errorDetails.retryable;
        this.retrySuggestion = errorDetails.retrySuggestion;
    }
}

export function parseStellarError(error: unknown): StellarError {
    // Wallet not connected
    if (error instanceof Error && error.message.includes('Freighter')) {
        return new StellarError({
            code: ErrorCode.WALLET_NOT_CONNECTED,
            message: 'Wallet not connected',
            details: 'Please install and connect Freighter wallet',
            retryable: true,
            retrySuggestion: 'Install Freighter extension and connect your wallet',
        });
    }

    // User rejected transaction
    if (error instanceof Error && (error.message.includes('User declined') || error.message.includes('rejected'))) {
        return new StellarError({
            code: ErrorCode.WALLET_REJECTED,
            message: 'Transaction was cancelled',
            details: 'You cancelled the transaction in your wallet',
            retryable: true,
            retrySuggestion: 'Try again and approve the transaction in your wallet',
        });
    }

    // Account not found
    if (error instanceof Error && error.message.includes('Account not found')) {
        return new StellarError({
            code: ErrorCode.ACCOUNT_NOT_FOUND,
            message: 'Account not found',
            details: 'The wallet address does not exist on the network',
            retryable: false,
            retrySuggestion: 'Ensure your wallet is funded with XLM',
        });
    }

    // Insufficient balance
    if (error instanceof Error && (error.message.includes('insufficient') || error.message.includes('balance'))) {
        return new StellarError({
            code: ErrorCode.INSUFFICIENT_BALANCE,
            message: 'Insufficient balance',
            details: 'Not enough XLM to cover transaction fees',
            retryable: true,
            retrySuggestion: 'Add more XLM to your wallet and try again',
        });
    }

    // Simulation failed
    if (error instanceof Error && error.message.includes('Simulation failed')) {
        const details = extractSimulationError(error.message);
        return new StellarError({
            code: ErrorCode.SIMULATION_FAILED,
            message: 'Transaction simulation failed',
            details,
            retryable: true,
            retrySuggestion: 'Check your parameters and try again',
        });
    }

    // Contract error
    if (error instanceof Error && error.message.includes('contract')) {
        return new StellarError({
            code: ErrorCode.CONTRACT_ERROR,
            message: 'Smart contract error',
            details: error.message,
            retryable: true,
            retrySuggestion: 'Verify contract parameters and try again',
        });
    }

    // Timeout
    if (error instanceof Error && error.message.includes('timeout')) {
        return new StellarError({
            code: ErrorCode.TIMEOUT_ERROR,
            message: 'Transaction timeout',
            details: 'Transaction took too long to confirm',
            retryable: true,
            retrySuggestion: 'The network may be congested. Try again in a few moments',
        });
    }

    // Network error
    if (error instanceof Error && (error.message.includes('network') || error.message.includes('fetch'))) {
        return new StellarError({
            code: ErrorCode.NETWORK_ERROR,
            message: 'Network error',
            details: 'Failed to connect to Stellar network',
            retryable: true,
            retrySuggestion: 'Check your internet connection and try again',
        });
    }

    // Generic transaction failed
    if (error instanceof Error && error.message.includes('Transaction failed')) {
        return new StellarError({
            code: ErrorCode.TRANSACTION_FAILED,
            message: 'Transaction failed',
            details: error.message,
            retryable: true,
            retrySuggestion: 'Review transaction details and try again',
        });
    }

    // Unknown error
    return new StellarError({
        code: ErrorCode.TRANSACTION_FAILED,
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
        retryable: true,
        retrySuggestion: 'Please try again',
    });
}

function extractSimulationError(message: string): string {
    const match = message.match(/Simulation failed: (.+)/);
    return match ? match[1] : message;
}

export function logStellarError(error: StellarError, context?: Record<string, unknown>): void {
    const logData = {
        timestamp: new Date().toISOString(),
        errorCode: error.code,
        message: error.message,
        details: error.details,
        retryable: error.retryable,
        retrySuggestion: error.retrySuggestion,
        context,
    };

    if (process.env.NODE_ENV === 'development') {
        console.error('[StellarError]', logData);
    }

    // In production, this would send to monitoring service
    // Example: Sentry.captureException(error, { extra: logData });
}
