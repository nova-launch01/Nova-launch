import { useRetry } from '../hooks/useRetry';
import { RetryIndicator } from '../components/UI/RetryIndicator';
import { WalletService } from '../services/wallet';

/**
 * Example component demonstrating retry functionality
 */
export function ExampleRetryUsage() {
  const { execute, retry, isRetrying, retryAttempt, lastError } = useRetry({
    config: {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
    },
    onRetryAttempt: (attempt, delay, error) => {
      console.log(`Retry attempt ${attempt}, waiting ${delay}ms`, error);
    },
  });

  const handleConnect = async () => {
    try {
      await execute(async () => {
        const publicKey = await WalletService.getPublicKey();
        if (!publicKey) throw new Error('Failed to get wallet address');
        return publicKey;
      });
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleConnect}
        disabled={isRetrying}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isRetrying ? 'Connecting...' : 'Connect Wallet'}
      </button>

      <RetryIndicator
        isRetrying={isRetrying}
        attempt={retryAttempt}
        maxAttempts={3}
        error={lastError}
        onRetry={retry}
      />
    </div>
  );
}
