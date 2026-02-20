import { describe, it, expect } from 'vitest';
import { parseStellarError, StellarError } from '../stellarErrors';
import { ErrorCode } from '../../types';

describe('stellarErrors', () => {
    describe('parseStellarError', () => {
        it('should parse wallet not connected error', () => {
            const error = new Error('Freighter wallet not found');
            const result = parseStellarError(error);

            expect(result).toBeInstanceOf(StellarError);
            expect(result.code).toBe(ErrorCode.WALLET_NOT_CONNECTED);
            expect(result.retryable).toBe(true);
            expect(result.retrySuggestion).toBeDefined();
        });

        it('should parse user rejected error', () => {
            const error = new Error('User declined to sign');
            const result = parseStellarError(error);

            expect(result.code).toBe(ErrorCode.WALLET_REJECTED);
            expect(result.retryable).toBe(true);
        });

        it('should parse account not found error', () => {
            const error = new Error('Account not found');
            const result = parseStellarError(error);

            expect(result.code).toBe(ErrorCode.ACCOUNT_NOT_FOUND);
            expect(result.retryable).toBe(false);
        });

        it('should parse insufficient balance error', () => {
            const error = new Error('insufficient balance');
            const result = parseStellarError(error);

            expect(result.code).toBe(ErrorCode.INSUFFICIENT_BALANCE);
            expect(result.retryable).toBe(true);
        });

        it('should parse simulation failed error', () => {
            const error = new Error('Simulation failed: invalid parameters');
            const result = parseStellarError(error);

            expect(result.code).toBe(ErrorCode.SIMULATION_FAILED);
            expect(result.details).toContain('invalid parameters');
        });

        it('should parse contract error', () => {
            const error = new Error('contract execution failed');
            const result = parseStellarError(error);

            expect(result.code).toBe(ErrorCode.CONTRACT_ERROR);
            expect(result.retryable).toBe(true);
        });

        it('should parse timeout error', () => {
            const error = new Error('Transaction confirmation timeout');
            const result = parseStellarError(error);

            expect(result.code).toBe(ErrorCode.TIMEOUT_ERROR);
            expect(result.retryable).toBe(true);
        });

        it('should parse network error', () => {
            const error = new Error('network connection failed');
            const result = parseStellarError(error);

            expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
            expect(result.retryable).toBe(true);
        });

        it('should parse transaction failed error', () => {
            const error = new Error('Transaction failed');
            const result = parseStellarError(error);

            expect(result.code).toBe(ErrorCode.TRANSACTION_FAILED);
            expect(result.retryable).toBe(true);
        });

        it('should handle unknown errors', () => {
            const error = new Error('Something unexpected');
            const result = parseStellarError(error);

            expect(result.code).toBe(ErrorCode.TRANSACTION_FAILED);
            expect(result.retryable).toBe(true);
            expect(result.details).toBe('Something unexpected');
        });

        it('should handle string errors', () => {
            const error = 'String error message';
            const result = parseStellarError(error);

            expect(result).toBeInstanceOf(StellarError);
            expect(result.details).toBe('String error message');
        });

        it('should handle non-Error objects', () => {
            const error = { custom: 'error' };
            const result = parseStellarError(error);

            expect(result).toBeInstanceOf(StellarError);
            expect(result.code).toBe(ErrorCode.TRANSACTION_FAILED);
        });
    });

    describe('StellarError', () => {
        it('should create error with all properties', () => {
            const error = new StellarError({
                code: ErrorCode.INSUFFICIENT_BALANCE,
                message: 'Not enough funds',
                details: 'Need 10 XLM',
                retryable: true,
                retrySuggestion: 'Add more XLM',
            });

            expect(error.name).toBe('StellarError');
            expect(error.code).toBe(ErrorCode.INSUFFICIENT_BALANCE);
            expect(error.message).toBe('Not enough funds');
            expect(error.details).toBe('Need 10 XLM');
            expect(error.retryable).toBe(true);
            expect(error.retrySuggestion).toBe('Add more XLM');
        });

        it('should work without optional properties', () => {
            const error = new StellarError({
                code: ErrorCode.NETWORK_ERROR,
                message: 'Network failed',
                retryable: true,
            });

            expect(error.details).toBeUndefined();
            expect(error.retrySuggestion).toBeUndefined();
        });
    });
});
