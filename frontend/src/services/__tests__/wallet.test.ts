import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WalletService } from '../wallet';
import * as freighterApi from '@stellar/freighter-api';

vi.mock('@stellar/freighter-api');

describe('WalletService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('isInstalled', () => {
        it('returns true when Freighter is installed', async () => {
            vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true });

            const result = await WalletService.isInstalled();

            expect(result).toBe(true);
            expect(freighterApi.isConnected).toHaveBeenCalled();
        });

        it('returns false when Freighter is not installed', async () => {
            vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: false });

            const result = await WalletService.isInstalled();

            expect(result).toBe(false);
        });

        it('returns false when isConnected throws error', async () => {
            vi.mocked(freighterApi.isConnected).mockRejectedValue(new Error('Not available'));

            const result = await WalletService.isInstalled();

            expect(result).toBe(false);
        });
    });

    describe('connect', () => {
        it('successfully connects and returns wallet address', async () => {
            const mockAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
            vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true });
            vi.mocked(freighterApi.requestAccess).mockResolvedValue({ address: mockAddress });
            vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: mockAddress });

            const address = await WalletService.connect();

            expect(address).toBe(mockAddress);
            expect(freighterApi.requestAccess).toHaveBeenCalled();
            expect(freighterApi.getAddress).toHaveBeenCalled();
        });

        it('throws error when Freighter is not installed', async () => {
            vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: false });

            await expect(WalletService.connect()).rejects.toThrow(
                'Freighter wallet is not installed'
            );
        });

        it('throws error when user rejects connection', async () => {
            vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true });
            vi.mocked(freighterApi.requestAccess).mockRejectedValue(
                new Error('User declined access')
            );

            await expect(WalletService.connect()).rejects.toThrow(
                'Connection request rejected by user'
            );
        });

        it('throws error when address retrieval fails', async () => {
            vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true });
            vi.mocked(freighterApi.requestAccess).mockResolvedValue({ address: '' });
            vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: '' });

            await expect(WalletService.connect()).rejects.toThrow(
                'Failed to retrieve wallet address'
            );
        });
    });

    describe('disconnect', () => {
        it('executes without error', () => {
            expect(() => WalletService.disconnect()).not.toThrow();
        });
    });

    describe('getPublicKey', () => {
        it('returns address when available', async () => {
            const mockAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
            vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: mockAddress });

            const address = await WalletService.getPublicKey();

            expect(address).toBe(mockAddress);
        });

        it('returns null when address is not available', async () => {
            vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: '' });

            const address = await WalletService.getPublicKey();

            expect(address).toBeNull();
        });

        it('returns null on error', async () => {
            vi.mocked(freighterApi.getAddress).mockRejectedValue(new Error('Failed'));

            const address = await WalletService.getPublicKey();

            expect(address).toBeNull();
        });
    });

    describe('getNetwork', () => {
        it('returns testnet for Test SDF Network', async () => {
            vi.mocked(freighterApi.getNetwork).mockResolvedValue({
                network: 'Test SDF Network ; September 2015',
            });

            const network = await WalletService.getNetwork();

            expect(network).toBe('testnet');
        });

        it('returns mainnet for Public Global Stellar Network', async () => {
            vi.mocked(freighterApi.getNetwork).mockResolvedValue({
                network: 'Public Global Stellar Network ; September 2015',
            });

            const network = await WalletService.getNetwork();

            expect(network).toBe('mainnet');
        });

        it('returns testnet as default on error', async () => {
            vi.mocked(freighterApi.getNetwork).mockRejectedValue(new Error('Failed'));

            const network = await WalletService.getNetwork();

            expect(network).toBe('testnet');
        });
    });

    describe('getBalance', () => {
        const mockAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

        beforeEach(() => {
            vi.mocked(freighterApi.getNetwork).mockResolvedValue({
                network: 'Test SDF Network ; September 2015',
            });
        });

        it('returns XLM balance for valid address', async () => {
            const mockAccount = {
                balances: [
                    { asset_type: 'native', balance: '100.0000000' },
                ],
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockAccount,
            });

            const balance = await WalletService.getBalance(mockAddress);

            expect(balance).toBe('100.0000000');
        });

        it('throws error for invalid address format', async () => {
            await expect(WalletService.getBalance('invalid')).rejects.toThrow(
                'Invalid Stellar address'
            );
        });

        it('throws error when account not found', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            });

            await expect(WalletService.getBalance(mockAddress)).rejects.toThrow(
                'Account not found'
            );
        });

        it('returns 0 when no native balance exists', async () => {
            const mockAccount = {
                balances: [],
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockAccount,
            });

            const balance = await WalletService.getBalance(mockAddress);

            expect(balance).toBe('0');
        });

        it('throws error on network failure', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            });

            await expect(WalletService.getBalance(mockAddress)).rejects.toThrow(
                'Failed to fetch balance'
            );
        });
    });

    describe('signTransaction', () => {
        const mockXdr = 'AAAAAgAAAABelb7...(mock XDR)';
        const mockSignedXdr = 'AAAAAgAAAABelb7...(mock signed XDR)';

        it('signs transaction and returns signed XDR', async () => {
            vi.mocked(freighterApi.signTransaction).mockResolvedValue({
                signedTxXdr: mockSignedXdr,
            });

            const result = await WalletService.signTransaction(mockXdr);

            expect(result).toBe(mockSignedXdr);
            expect(freighterApi.signTransaction).toHaveBeenCalledWith(mockXdr, {
                networkPassphrase: undefined,
            });
        });

        it('passes network passphrase when provided', async () => {
            const networkPassphrase = 'Test SDF Network ; September 2015';
            vi.mocked(freighterApi.signTransaction).mockResolvedValue({
                signedTxXdr: mockSignedXdr,
            });

            await WalletService.signTransaction(mockXdr, networkPassphrase);

            expect(freighterApi.signTransaction).toHaveBeenCalledWith(mockXdr, {
                networkPassphrase,
            });
        });

        it('returns null on error', async () => {
            vi.mocked(freighterApi.signTransaction).mockRejectedValue(
                new Error('User rejected')
            );

            const result = await WalletService.signTransaction(mockXdr);

            expect(result).toBeNull();
        });
    });

    describe('watchChanges', () => {
        it('sets up wallet change listener', () => {
            const mockCallback = vi.fn();
            const mockWatch = vi.fn();
            const mockStop = vi.fn();

            vi.mocked(freighterApi.WatchWalletChanges).mockImplementation(
                () =>
                    ({
                        watch: mockWatch,
                        stop: mockStop,
                    }) as any
            );

            const cleanup = WalletService.watchChanges(mockCallback);

            expect(mockWatch).toHaveBeenCalled();
            expect(typeof cleanup).toBe('function');

            cleanup();
            expect(mockStop).toHaveBeenCalled();
        });

        it('invokes callback with wallet changes', () => {
            const mockCallback = vi.fn();
            let watchCallback: any;

            vi.mocked(freighterApi.WatchWalletChanges).mockImplementation(
                () =>
                    ({
                        watch: (cb: any) => {
                            watchCallback = cb;
                        },
                        stop: vi.fn(),
                    }) as any
            );

            WalletService.watchChanges(mockCallback);

            const mockParams = {
                address: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                network: 'testnet',
            };
            watchCallback(mockParams);

            expect(mockCallback).toHaveBeenCalledWith(mockParams);
        });
    });
});
