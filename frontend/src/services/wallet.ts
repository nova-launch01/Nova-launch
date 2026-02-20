import {
    isConnected,
    getAddress,
    getNetwork,
    signTransaction,
    WatchWalletChanges,
    requestAccess,
} from '@stellar/freighter-api';
import { getNetworkConfig } from '../config/stellar';
import { withRetry, DEFAULT_RETRY_CONFIG } from '../utils/retry';

export class WalletService {
    static async isInstalled(): Promise<boolean> {
        try {
            const result = await withRetry(() => isConnected(), DEFAULT_RETRY_CONFIG);
            return !!result.isConnected;
        } catch {
            return false;
        }
    }

    static async connect(): Promise<string> {
        const installed = await this.isInstalled();
        if (!installed) {
            throw new Error('Freighter wallet is not installed. Please install it from https://www.freighter.app/');
        }

        try {
            await requestAccess();
            const result = await getAddress();
            if (!result.address) {
                throw new Error('Failed to retrieve wallet address');
            }
            return result.address;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('User declined')) {
                    throw new Error('Connection request rejected by user');
                }
                throw error;
            }
            throw new Error('Failed to connect to Freighter wallet');
        }
    }

    static disconnect(): void {
        // Freighter doesn't have a disconnect method
        // Disconnection is handled by the app clearing its state
    }

    static async getPublicKey(): Promise<string | null> {
        try {
            const result = await withRetry(() => getAddress(), DEFAULT_RETRY_CONFIG);
            return result.address || null;
        } catch {
            return null;
        }
    }

    static async getNetwork(): Promise<'testnet' | 'mainnet'> {
        try {
            const result = await withRetry(() => getNetwork(), DEFAULT_RETRY_CONFIG);
            const network = result.network || 'testnet';
            return network.toLowerCase().includes('public') ? 'mainnet' : 'testnet';
        } catch {
            return 'testnet';
        }
    }

    static async getBalance(address: string): Promise<string> {
        if (!address || address.length !== 56 || !address.startsWith('G')) {
            throw new Error('Invalid Stellar address');
        }

        try {
            const network = await this.getNetwork();
            const config = getNetworkConfig(network);
            
            const response = await fetch(`${config.horizonUrl}/accounts/${address}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Account not found. Please fund your account first.');
                }
                throw new Error(`Failed to fetch balance: ${response.statusText}`);
            }

            const account = await response.json();
            const nativeBalance = account.balances?.find(
                (b: any) => b.asset_type === 'native'
            );

            return nativeBalance?.balance || '0';
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to retrieve account balance');
        }
    }

    static async signTransaction(xdr: string, networkPassphrase?: string): Promise<string | null> {
        try {
            const result = await signTransaction(xdr, { networkPassphrase });
            return result.signedTxXdr || null;
        } catch (error) {
            console.error('Error signing transaction:', error);
            return null;
        }
    }

    static watchChanges(callback: (params: { address: string; network: string }) => void): () => void {
        const watcher = new WatchWalletChanges();
        watcher.watch((params) => {
            callback({
                address: params.address,
                network: params.network,
            });
        });
        return () => watcher.stop();
    }
}
