import { useEffect, useState } from 'react';

interface RetryIndicatorProps {
  isRetrying: boolean;
  attempt: number;
  maxAttempts: number;
  error?: Error | null;
  onRetry?: () => void;
}

export function RetryIndicator({
  isRetrying,
  attempt,
  maxAttempts,
  error,
  onRetry,
}: RetryIndicatorProps) {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!isRetrying || attempt === 0) return;

    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
    setCountdown(Math.ceil(delay / 1000));

    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRetrying, attempt]);

  if (!error && !isRetrying) return null;

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      {isRetrying && attempt > 0 ? (
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              Retrying operation... (Attempt {attempt}/{maxAttempts})
            </p>
            {countdown > 0 && (
              <p className="text-xs text-yellow-600">Next attempt in {countdown}s</p>
            )}
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Operation failed</p>
            <p className="text-xs text-red-600">{error.message}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded bg-yellow-600 px-3 py-1 text-sm font-medium text-white hover:bg-yellow-700"
            >
              Retry
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
