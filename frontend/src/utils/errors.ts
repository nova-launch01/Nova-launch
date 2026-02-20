import type { AppError } from '../types';
import { ErrorCode } from '../types';

/**
 * Error handling utilities
 */

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
    [ErrorCode.WALLET_NOT_CONNECTED]: 'Please connect your wallet to continue',
    [ErrorCode.INSUFFICIENT_BALANCE]: 'Insufficient XLM balance for transaction fees',
    [ErrorCode.INVALID_INPUT]: 'Please check your input and try again',
    [ErrorCode.IPFS_UPLOAD_FAILED]: 'Failed to upload image to IPFS. Please try again',
    [ErrorCode.TRANSACTION_FAILED]: 'Transaction failed. Please try again',
    [ErrorCode.WALLET_REJECTED]: 'Transaction was cancelled',
    [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection',
    [ErrorCode.SIMULATION_FAILED]: 'Transaction simulation failed',
    [ErrorCode.CONTRACT_ERROR]: 'Smart contract error occurred',
    [ErrorCode.TIMEOUT_ERROR]: 'Transaction confirmation timeout',
    [ErrorCode.ACCOUNT_NOT_FOUND]: 'Account not found on network',
    [ErrorCode.INVALID_SIGNATURE]: 'Invalid transaction signature',
};

export function createError(code: ErrorCode, details?: string): AppError {
    return {
        code,
        message: ERROR_MESSAGES[code],
        details,
    };
}

export function isAppError(error: unknown): error is AppError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error
    );
}

export function getErrorMessage(error: unknown): string {
    if (isAppError(error)) {
        return error.details ? `${error.message}: ${error.details}` : error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unknown error occurred';
}
