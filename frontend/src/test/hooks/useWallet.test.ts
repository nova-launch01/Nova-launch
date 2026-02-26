import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWallet } from '../../hooks/useWallet';
import { WalletService } from '../../services/wallet';

vi.mock('../../services/wallet', () => ({
    WalletService: {
        isInstalled: vi.fn(),
        getPublicKey: vi.fn(),
        getNetwork: vi.fn(),
        watchChanges: vi.fn(),
    },
}));

describe('useWallet hook', () => {
    const mockPublicKey = 'GBTEST...';
    const mockNetwork = 'testnet';
    let cleanupFn: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        cleanupFn = vi.fn();

        vi.mocked(WalletService.isInstalled).mockResolvedValue(true);
        vi.mocked(WalletService.getPublicKey).mockResolvedValue(mockPublicKey);
        vi.mocked(WalletService.getNetwork).mockResolvedValue(mockNetwork as any);
        vi.mocked(WalletService.watchChanges).mockReturnValue(cleanupFn);
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    it('should initialize with disconnected state', () => {
        const { result } = renderHook(() => useWallet());

        expect(result.current.wallet.connected).toBe(false);
        expect(result.current.wallet.address).toBe(null);
        expect(result.current.wallet.network).toBe('testnet');
        expect(result.current.isConnecting).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should connect successfully and setup listeners', async () => {
        const { result } = renderHook(() => useWallet());

        await act(async () => {
            await result.current.connect();
        });

        expect(result.current.wallet.connected).toBe(true);
        expect(result.current.wallet.address).toBe(mockPublicKey);
        expect(result.current.wallet.network).toBe(mockNetwork);
        expect(localStorage.getItem('nova_wallet_connected')).toBe('true');
        expect(WalletService.watchChanges).toHaveBeenCalledTimes(1);
    });

    it('should disconnect and cleanup listeners', async () => {
        const { result } = renderHook(() => useWallet());

        await act(async () => {
            await result.current.connect();
        });

        act(() => {
            result.current.disconnect();
        });

        expect(result.current.wallet.connected).toBe(false);
        expect(result.current.wallet.address).toBe(null);
        expect(result.current.error).toBe(null);
        expect(localStorage.getItem('nova_wallet_connected')).toBe(null);
        expect(cleanupFn).toHaveBeenCalled();
    });

    it('should auto-reconnect on mount if previously connected', async () => {
        localStorage.setItem('nova_wallet_connected', 'true');

        const { result } = renderHook(() => useWallet());

        await waitFor(() => {
            expect(result.current.wallet.connected).toBe(true);
        });

        expect(result.current.wallet.address).toBe(mockPublicKey);
        expect(WalletService.watchChanges).toHaveBeenCalled();
    });

    it('should handle error when Freighter is not installed', async () => {
        vi.mocked(WalletService.isInstalled).mockResolvedValue(false);
        const { result } = renderHook(() => useWallet());

        await act(async () => {
            await result.current.connect();
        });

        expect(result.current.wallet.connected).toBe(false);
        expect(result.current.error).toBe('Freighter wallet is not installed');
        expect(WalletService.watchChanges).not.toHaveBeenCalled();
    });

    it('should detect account changes via watcher', async () => {
        let watchCallback: any;
        vi.mocked(WalletService.watchChanges).mockImplementation((cb: any) => {
            watchCallback = cb;
            return cleanupFn;
        });

        const { result } = renderHook(() => useWallet());

        await act(async () => {
            await result.current.connect();
        });

        const newAddress = 'GBNEWACCOUNT...';
        act(() => {
            watchCallback({ address: newAddress, network: 'testnet' });
        });

        expect(result.current.wallet.address).toBe(newAddress);
        expect(result.current.wallet.connected).toBe(true);
    });

    it('should detect network changes via watcher', async () => {
        let watchCallback: any;
        vi.mocked(WalletService.watchChanges).mockImplementation((cb: any) => {
            watchCallback = cb;
            return cleanupFn;
        });

        const { result } = renderHook(() => useWallet());

        await act(async () => {
            await result.current.connect();
        });

        act(() => {
            watchCallback({ address: mockPublicKey, network: 'public' });
        });

        expect(result.current.wallet.network).toBe('mainnet');
        expect(result.current.wallet.connected).toBe(true);
    });

    it('should disconnect when watcher returns empty address', async () => {
        let watchCallback: any;
        vi.mocked(WalletService.watchChanges).mockImplementation((cb: any) => {
            watchCallback = cb;
            return cleanupFn;
        });

        const { result } = renderHook(() => useWallet());

        await act(async () => {
            await result.current.connect();
        });

        act(() => {
            watchCallback({ address: '', network: 'testnet' });
        });

        expect(result.current.wallet.connected).toBe(false);
        expect(result.current.wallet.address).toBe(null);
    });

    it('should cleanup listeners on unmount', async () => {
        const { result, unmount } = renderHook(() => useWallet());

        await act(async () => {
            await result.current.connect();
        });

        act(() => {
            unmount();
        });

        expect(cleanupFn).toHaveBeenCalled();
    });

    it('should not auto-reconnect if wallet not previously connected', async () => {
        const { result } = renderHook(() => useWallet());

        await waitFor(() => {
            expect(result.current.wallet.connected).toBe(false);
        }, { timeout: 100 });

        expect(WalletService.watchChanges).not.toHaveBeenCalled();
    });

    it('should handle connection rejection', async () => {
        vi.mocked(WalletService.getPublicKey).mockResolvedValue(null);
        const { result } = renderHook(() => useWallet());

        await act(async () => {
            await result.current.connect();
        });

        expect(result.current.wallet.connected).toBe(false);
        expect(result.current.error).toBe('User rejected connection or account not found');
    });
});
