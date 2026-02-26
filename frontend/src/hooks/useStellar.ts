import { useState, useCallback } from 'react';
import { StellarService } from '../services/stellar';
import type { TokenInfo, TransactionDetails } from '../types';

export function useTokenInfo(network: 'testnet' | 'mainnet' = 'testnet') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  const fetchTokenInfo = useCallback(async (tokenAddress: string) => {
    setLoading(true);
    setError(null);
    try {
      const service = new StellarService(network);
      const info = await service.getTokenInfo(tokenAddress);
      setTokenInfo(info);
      return info;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch token info';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [network]);

  return { tokenInfo, loading, error, fetchTokenInfo };
}

export function useTransactionMonitor(network: 'testnet' | 'mainnet' = 'testnet') {
  const [status, setStatus] = useState<TransactionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const monitorTransaction = useCallback(async (hash: string) => {
    setError(null);
    setStatus({ hash, status: 'pending', timestamp: Date.now(), fee: '0' });
    
    try {
      const service = new StellarService(network);
      const result = await service.monitorTransaction(hash, (progress) => {
        setStatus(progress);
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction monitoring failed';
      setError(message);
      throw err;
    }
  }, [network]);

  return { status, error, monitorTransaction };
}
