import * as StellarSdk from '@stellar/stellar-sdk';
import type { TokenInfo, TransactionDetails } from '../types';

const TESTNET_HORIZON = 'https://horizon-testnet.stellar.org';
const MAINNET_HORIZON = 'https://horizon.stellar.org';

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_TIME_MS = 60000;
const MAX_BACKOFF_MS = 10000;

export class StellarService {
  private horizonUrl: string;

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.horizonUrl = network === 'testnet' ? TESTNET_HORIZON : MAINNET_HORIZON;
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      StellarSdk.Address.fromString(tokenAddress);
    } catch {
      throw new Error('Invalid token address');
    }

    // Fetch transaction history to get deployment info
    const txHistory = await fetch(`${this.horizonUrl}/accounts/${tokenAddress}/transactions?limit=1&order=asc`);
    const txData = await txHistory.json();
    const firstTx = txData._embedded?.records?.[0];

    // For now, return basic info from Horizon
    // In production, this would query the contract via Soroban RPC
    return {
      address: tokenAddress,
      name: '', // Would be fetched from contract
      symbol: '', // Would be fetched from contract
      decimals: 7, // Would be fetched from contract
      totalSupply: '0', // Would be fetched from contract
      creator: firstTx?.source_account || '',
      metadataUri: undefined,
      deployedAt: firstTx ? new Date(firstTx.created_at).getTime() : Date.now(),
      transactionHash: firstTx?.hash || '',
    };
  }

  async monitorTransaction(
    hash: string,
    onProgress?: (status: TransactionDetails) => void
  ): Promise<TransactionDetails> {
    const startTime = Date.now();
    let backoff = POLL_INTERVAL_MS;

    while (Date.now() - startTime < MAX_POLL_TIME_MS) {
      try {
        const response = await fetch(`${this.horizonUrl}/transactions/${hash}`);
        
        if (response.ok) {
          const tx = await response.json();
          const result: TransactionDetails = {
            hash,
            status: tx.successful ? 'success' : 'failed',
            timestamp: new Date(tx.created_at).getTime(),
            fee: tx.fee_charged || '0',
          };
          onProgress?.(result);
          return result;
        }

        if (response.status === 404) {
          const pending: TransactionDetails = {
            hash,
            status: 'pending',
            timestamp: Date.now(),
            fee: '0',
          };
          onProgress?.(pending);
          await this.sleep(backoff);
          backoff = Math.min(backoff * 1.5, MAX_BACKOFF_MS);
          continue;
        }

        throw new Error(`HTTP ${response.status}`);
      } catch {
        if (Date.now() - startTime >= MAX_POLL_TIME_MS) {
          throw new Error('Transaction monitoring timeout');
        }
        await this.sleep(backoff);
        backoff = Math.min(backoff * 1.5, MAX_BACKOFF_MS);
      }
    }

    throw new Error('Transaction monitoring timeout');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
