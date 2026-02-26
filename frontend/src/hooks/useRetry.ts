import { useState, useCallback } from 'react';
import { withRetry, RetryConfig, DEFAULT_RETRY_CONFIG } from '../utils/retry';

interface UseRetryOptions {
  config?: RetryConfig;
  onRetryAttempt?: (attempt: number, delay: number, error: Error) => void;
}

interface UseRetryReturn<T> {
  execute: (operation: () => Promise<T>) => Promise<T>;
  retry: () => Promise<T | undefined>;
  isRetrying: boolean;
  retryAttempt: number;
  lastError: Error | null;
}

export function useRetry<T>(options: UseRetryOptions = {}): UseRetryReturn<T> {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [lastOperation, setLastOperation] = useState<(() => Promise<T>) | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T> => {
      setIsRetrying(true);
      setRetryAttempt(0);
      setLastError(null);
      setLastOperation(() => operation);

      try {
        const result = await withRetry(
          operation,
          options.config || DEFAULT_RETRY_CONFIG,
          (attempt, delay, error) => {
            setRetryAttempt(attempt);
            setLastError(error);
            options.onRetryAttempt?.(attempt, delay, error);
          }
        );
        return result;
      } catch (error) {
        setLastError(error instanceof Error ? error : new Error(String(error)));
        throw error;
      } finally {
        setIsRetrying(false);
      }
    },
    [options]
  );

  const retry = useCallback(async (): Promise<T | undefined> => {
    if (!lastOperation) return undefined;
    return execute(lastOperation);
  }, [lastOperation, execute]);

  return { execute, retry, isRetrying, retryAttempt, lastError };
}
