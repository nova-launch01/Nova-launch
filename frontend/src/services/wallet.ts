import {
    isConnected,
    getAddress,
    getNetwork,
    signTransaction,
    WatchWalletChanges,
} from '@stellar/freighter-api';

export class WalletService {
    // Check if Freighter is installed and ready
    static async isInstalled(): Promise<boolean> {
        try {
            await isConnected();
            return true;
        } catch (error) {
            console.error('Error checking Freighter connection:', error);
            return false;
        }
    }

    // Get current user's public key
    static async getPublicKey(): Promise<string | null> {
        try {
            const result = await getAddress();
            return result.address || null;
        } catch (error) {
            console.error('Error getting public key:', error);
            return null;
        }
    }

    // Check what network is active in Freighter
    static async getNetwork(): Promise<'testnet' | 'mainnet'> {
        try {
            const result = await getNetwork();
            const network = result.network || 'testnet';
            return network.toLowerCase().includes('public') ? 'mainnet' : 'testnet';
        } catch (error) {
            console.error('Error getting network:', error);
            return 'testnet';
        }
    }

    // Sign transaction XDR
    static async signTransaction(xdr: string, networkPassphrase?: string): Promise<string | null> {
        try {
            const result = await signTransaction(xdr, {
                networkPassphrase,
            });
            return result.signedTxXdr || null;
        } catch (error) {
            console.error('Error signing transaction:', error);
            return null;
        }
    }

    // Watch for any changes (account or network)
    static watchChanges(callback: (params: { address: string; network: string }) => void) {
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
