import { describe, expect, it } from 'vitest';
import { ErrorCode } from '../../types';
import {
    createError,
    ErrorHandler,
    ERROR_MESSAGES,
    ERROR_RECOVERY_SUGGESTIONS,
    getErrorMessage,
} from '../errors';

describe('errors utils', () => {
    it('createError uses standardized error messages', () => {
        const appError = createError(ErrorCode.NETWORK_ERROR, 'fetch failed');

        expect(appError.message).toBe(ERROR_MESSAGES[ErrorCode.NETWORK_ERROR]);
        expect(appError.details).toBe('fetch failed');
    });

    it('ErrorHandler returns user-friendly message and recovery', () => {
        const error = new Error('Network request failed');

        expect(ErrorHandler.getUserMessage(error)).toContain('Network error');
        expect(ErrorHandler.getRecoverySuggestion(error)).toBe(
            ERROR_RECOVERY_SUGGESTIONS[ErrorCode.NETWORK_ERROR]
        );
    });

    it('toHandledError includes severity and recovery suggestion', () => {
        const handled = ErrorHandler.toHandledError(new Error('Transaction failed due to timeout'));

        expect(handled.code).toBe(ErrorCode.TIMEOUT_ERROR);
        expect(handled.severity).toBe('medium');
        expect(handled.recoverySuggestion.length).toBeGreaterThan(0);
    });

    it('getErrorMessage handles unknown safely', () => {
        expect(getErrorMessage(undefined)).toBe('Transaction failed. Please try again: An unknown error occurred');
    });
});
