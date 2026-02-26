import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTokenInfo, useTransactionMonitor } from '../useStellar';
import { StellarService } from '../../services/stellar';

vi.mock('../../services/stellar');

describe('useStellar hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useTokenInfo', () => {
    it('fetches token info successfully', async () => {
      const mockTokenInfo = {
        address: 'CDLZ...',
        name: 'Test Token',
        symbol: 'TST',
        decimals: 7,
        totalSupply: '1000000',
        creator: 'GABC...',
        deployedAt: Date.now(),
        transactionHash: 'abc123',
      };

      vi.mocked(StellarService.prototype.getTokenInfo).mockResolvedValue(mockTokenInfo);

      const { result } = renderHook(() => useTokenInfo('testnet'));

      expect(result.current.loading).toBe(false);
      expect(result.current.tokenInfo).toBeNull();

      await result.current.fetchTokenInfo('CDLZ...');

      await waitFor(() => {
        expect(result.current.tokenInfo).toEqual(mockTokenInfo);
      });

      expect(result.current.error).toBeNull();
    });

    it('handles errors', async () => {
      vi.mocked(StellarService.prototype.getTokenInfo).mockRejectedValue(
        new Error('Invalid token address')
      );

      const { result } = renderHook(() => useTokenInfo('testnet'));

      await expect(result.current.fetchTokenInfo('invalid')).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid token address');
      });
    });
  });

  describe('useTransactionMonitor', () => {
    it('monitors transaction with progress updates', async () => {
      const mockResult = {
        hash: 'abc123',
        status: 'success' as const,
        timestamp: Date.now(),
        fee: '100',
      };

      vi.mocked(StellarService.prototype.monitorTransaction).mockImplementation(
        async (hash, onProgress) => {
          onProgress?.({ hash, status: 'pending', timestamp: Date.now(), fee: '0' });
          onProgress?.(mockResult);
          return mockResult;
        }
      );

      const { result } = renderHook(() => useTransactionMonitor('testnet'));

      const promise = result.current.monitorTransaction('abc123');

      await waitFor(() => {
        expect(result.current.status?.status).toBe('success');
      });

      const finalResult = await promise;
      expect(finalResult).toEqual(mockResult);
      expect(result.current.error).toBeNull();
    });
  });
});
