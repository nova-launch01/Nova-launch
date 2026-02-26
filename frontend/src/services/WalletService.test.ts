import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletService } from './WalletService';

describe('WalletService', () => {
  let walletService: WalletService;
  const mockXdr = 'AAAAAgAAAABelb7...(mock XDR)';
  const mockSignedXdr = 'AAAAAgAAAABelb7...(mock signed XDR)';

  beforeEach(() => {
    walletService = new WalletService('testnet');
    delete window.freighterApi;
  });

  describe('signTransaction', () => {
    it('accepts transaction XDR string and returns signed XDR', async () => {
      window.freighterApi = {
        signTransaction: vi.fn().mockResolvedValue(mockSignedXdr),
      };

      const result = await walletService.signTransaction(mockXdr);

      expect(result).toBe(mockSignedXdr);
      expect(window.freighterApi?.signTransaction).toHaveBeenCalledWith(mockXdr, {
        network: 'testnet',
      });
    });

    it('prompts user for signature via Freighter with correct network', async () => {
      const signTransactionMock = vi.fn().mockResolvedValue(mockSignedXdr);
      window.freighterApi = { signTransaction: signTransactionMock };

      walletService.setNetwork('mainnet');
      await walletService.signTransaction(mockXdr);

      expect(signTransactionMock).toHaveBeenCalledWith(mockXdr, {
        network: 'mainnet',
      });
    });

    it('throws error when Freighter is not installed', async () => {
      await expect(walletService.signTransaction(mockXdr)).rejects.toThrow(
        'Freighter wallet not installed'
      );
    });

    it('throws appropriate error on user rejection', async () => {
      window.freighterApi = {
        signTransaction: vi.fn().mockRejectedValue(new Error('User declined to sign')),
      };

      await expect(walletService.signTransaction(mockXdr)).rejects.toThrow(
        'Transaction signing rejected by user'
      );
    });

    it('propagates other errors unchanged', async () => {
      const networkError = new Error('Network error');
      window.freighterApi = {
        signTransaction: vi.fn().mockRejectedValue(networkError),
      };

      await expect(walletService.signTransaction(mockXdr)).rejects.toThrow('Network error');
    });
  });

  describe('network management', () => {
    it('defaults to testnet', () => {
      expect(walletService.getNetwork()).toBe('testnet');
    });

    it('allows setting network to mainnet', () => {
      walletService.setNetwork('mainnet');
      expect(walletService.getNetwork()).toBe('mainnet');
    });
  });
});
