# Hook Tests

Comprehensive test suite for all custom React hooks in the application.

## Test Coverage

### Completed Tests

1. **useWallet** - Wallet connection and state management
   - Initial state and configuration
   - Connection flow (success, failure, rejection)
   - Disconnection and cleanup
   - Network changes
   - Auto-reconnect on mount
   - Wallet change listeners
   - Error handling

2. **useTokenDeploy** - Token deployment workflow
   - Initial state
   - Deployment with/without metadata
   - IPFS upload integration
   - Validation (params, images, descriptions)
   - Status updates during deployment
   - Error handling (IPFS, deployment, validation)
   - localStorage persistence

3. **useCopyToClipboard** - Clipboard operations
   - Copy functionality
   - Auto-reset after delay
   - Fallback to execCommand
   - Manual reset
   - Edge cases (empty strings, special characters)

4. **useRetry** - Retry logic with exponential backoff
   - Successful operations
   - Retry on failure
   - Max attempts handling
   - Retry callbacks
   - Error state management
   - Custom configuration

5. **useNetwork** - Network switching (testnet/mainnet)
   - Initial state and localStorage
   - Network switching
   - Toggle functionality
   - Transition states
   - localStorage persistence
   - Error handling

6. **useAnalytics** - Analytics tracking
   - Initialization
   - DNT and privacy controls
   - Page view tracking
   - Event tracking (wallet, tokens, tutorials, PWA)
   - Custom events
   - Enabled/disabled state

7. **useIntersectionObserver** - Intersection detection
   - Visibility detection
   - Freeze on visible option
   - Custom thresholds and margins
   - Cleanup
   - useLazyLoad variant

8. **usePWA** - Progressive Web App features
   - Initial state detection
   - Update availability
   - Install prompt
   - Online/offline detection
   - Event handling
   - Cleanup

9. **useConfetti** - Celebration animations
   - Fire confetti
   - Custom colors and duration
   - Reduced motion support
   - Stop functionality
   - Cleanup

10. **useToast** - Toast notifications (existing)
    - Queue management
    - Auto-dismiss
    - Manual dismiss
    - Accessibility

11. **useStellar** - Stellar network operations (existing)
    - Token info fetching
    - Transaction monitoring

12. **useConfirmDialog** - Confirmation dialogs (existing)
    - Dialog state management
    - Confirmation flow

13. **useTransactionHistory** - Transaction history management
    - Loading from localStorage
    - Adding transactions
    - Filtering by wallet
    - Sorting by timestamp
    - Chain refresh placeholder

14. **useIPFSUpload** - IPFS file and metadata upload
    - Initial state
    - Image upload with progress tracking
    - Metadata upload
    - Progress updates and time estimation
    - Error handling (image/metadata failures)
    - Reset functionality
    - Edge cases (empty files, large files, special characters)
    - Cleanup on unmount

15. **useTransactionMonitor** - Transaction status monitoring
    - Initial state
    - Polling transaction status
    - Progress tracking
    - Time estimation
    - Success/failure/timeout handling
    - Manual stop
    - Cleanup on unmount
    - Edge cases (rapid start/stop, concurrent monitoring)

16. **useVaultContract** - Recurring payment contract operations
    - Initial state and configuration
    - Fetching recurring payments
    - Scheduling new payments
    - Executing payments
    - Pausing/resuming payments
    - Canceling payments
    - Payment history
    - Validation (address, amount, interval)
    - Error handling
    - Utility functions (formatInterval, formatCountdown, truncateAddress)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm test useWallet.test.ts
```

## Test Patterns

### Hook Testing Setup

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useMyHook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('tests something', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(expected);
  });
});
```

### Async Operations

```typescript
await act(async () => {
  await result.current.asyncFunction();
});

await waitFor(() => {
  expect(result.current.state).toBe(expected);
});
```

### Timers

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

act(() => {
  vi.advanceTimersByTime(1000);
});
```

### Mocking Services

```typescript
vi.mock('../../services/myService');

vi.mocked(MyService.method).mockResolvedValue(mockData);
vi.mocked(MyService.method).mockRejectedValue(new Error('Failed'));
```

## Coverage Goals

- Line Coverage: >90%
- Branch Coverage: >90%
- Function Coverage: >90%
- Statement Coverage: >90%

## Best Practices

1. Test initial state
2. Test state updates
3. Test side effects
4. Test cleanup functions
5. Test error scenarios
6. Test edge cases
7. Mock external dependencies
8. Use descriptive test names
9. Group related tests with describe blocks
10. Clean up after each test

## Additional Hooks to Test

If new hooks are added, follow the same testing patterns:

- Test all state changes
- Test all side effects
- Test cleanup
- Test error handling
- Test edge cases
- Mock external dependencies
- Achieve >90% coverage
