import { useState, useEffect, useMemo } from 'react';
import { useWallet } from './useWallet';

export interface Transaction {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  contractAddress: string;
  timestamp: number;
  walletAddress: string;
  // Add other relevant fields like supply, etc.
}

export const useTransactionHistory = () => {
  const { wallet } = useWallet();
  const address = wallet.address;
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Load history from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('nova_transaction_history');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
    setLoading(false);
  }, []);

  // 2. Add new deployments
  const addTransaction = (newTx: Omit<Transaction, 'timestamp' | 'walletAddress'>) => {
    const transaction: Transaction = {
      ...newTx,
      timestamp: Date.now(),
      walletAddress: address || 'unknown',
    };
    
    const updatedHistory = [transaction, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('nova_transaction_history', JSON.stringify(updatedHistory));
  };

  // 3. Refresh token info (Placeholder for Chain Logic)
  const refreshFromChain = async () => {
    // Implement Soroban RPC calls here to update token status/info
    console.log("Refreshing token data from Stellar network...");
  };

  // 4. Filter by wallet and Sort by date (Acceptance Criteria)
  const filteredAndSortedHistory = useMemo(() => {
    return history
      .filter((tx) => tx.walletAddress === address)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [history, address]);

  return {
    history: filteredAndSortedHistory,
    addTransaction,
    refreshFromChain,
    loading,
    isEmpty: filteredAndSortedHistory.length === 0
  };
};