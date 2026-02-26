interface FreighterApi {
  signTransaction: (xdr: string, options: { network: string }) => Promise<string>;
}

declare global {
  interface Window {
    freighterApi?: FreighterApi;
  }
}

export class WalletService {
  private network: 'testnet' | 'mainnet';

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
  }

  async signTransaction(xdr: string): Promise<string> {
    if (!window.freighterApi) {
      throw new Error('Freighter wallet not installed');
    }

    try {
      const signedXdr = await window.freighterApi.signTransaction(xdr, {
        network: this.network,
      });
      return signedXdr;
    } catch (error) {
      if (error instanceof Error && error.message.includes('User declined')) {
        throw new Error('Transaction signing rejected by user');
      }
      throw error;
    }
  }

  setNetwork(network: 'testnet' | 'mainnet'): void {
    this.network = network;
  }

  getNetwork(): 'testnet' | 'mainnet' {
    return this.network;
  }
}
