import { describe, it, expect, vi } from 'vitest';
import { withRetry, isRecoverableError, RetryError, DEFAULT_RETRY_CONFIG } from '../retry';

describe('retry utilities', () => {
  describe('isRecoverableError', () => {
    it('identifies network errors as recoverable', () => {
      expect(isRecoverableError(new Error('Network error occurred'))).toBe(true);
      expect(isRecoverableError(new Error('Connection timeout'))).toBe(true);
      expect(isRecoverableError(new Error('fetch failed'))).toBe(true);
    });

    it('identifies non-recoverable errors', () => {
      expect(isRecoverableError(new Error('Invalid parameters'))).toBe(false);
      expect(isRecoverableError(new Error('Unauthorized'))).toBe(false);
    });
  });

  describe('withRetry', () => {
    it('succeeds on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await withRetry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('retries on recoverable errors', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      const result = await withRetry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('throws RetryError after max attempts', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Network error'));
      
      await expect(withRetry(operation, { ...DEFAULT_RETRY_CONFIG, maxAttempts: 2 }))
        .rejects.toThrow(RetryError);
      
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('does not retry non-recoverable errors', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Invalid input'));
      
      await expect(withRetry(operation)).rejects.toThrow('Invalid input');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('calls onRetry callback', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      const onRetry = vi.fn();
      
      await withRetry(operation, DEFAULT_RETRY_CONFIG, onRetry);
      
      expect(onRetry).toHaveBeenCalledWith(1, 1000, expect.any(Error));
    });

    it('implements exponential backoff', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      const delays: number[] = [];
      const onRetry = vi.fn((_, delay) => delays.push(delay));
      
      await withRetry(operation, DEFAULT_RETRY_CONFIG, onRetry);
      
      expect(delays[0]).toBe(1000);
      expect(delays[1]).toBe(2000);
    });
  });
});
