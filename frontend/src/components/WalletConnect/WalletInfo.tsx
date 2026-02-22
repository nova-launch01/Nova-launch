import { useState, useEffect, useCallback } from 'react';
import { Button, Tooltip } from '../UI';
import { WalletService } from '../../services/wallet';
import { truncateAddress, formatXLM } from '../../utils/formatting';
import type { WalletState } from '../../types';

interface WalletInfoProps {
    wallet: WalletState;
    onDisconnect: () => void;
    className?: string;
}

export function WalletInfo({ wallet, onDisconnect, className = '' }: WalletInfoProps) {
    const [balance, setBalance] = useState<string | null>(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [copied, setCopied] = useState(false);
    const [balanceError, setBalanceError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        if (!wallet.address) return;

        setIsLoadingBalance(true);
        setBalanceError(null);
        try {
            const bal = await WalletService.getBalance(wallet.address);
            setBalance(bal);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch balance';
            setBalanceError(message);
            setBalance(null);
        } finally {
            setIsLoadingBalance(false);
        }
    }, [wallet.address]);

    useEffect(() => {
        fetchBalance();
        const interval = setInterval(fetchBalance, 30_000);
        return () => clearInterval(interval);
    }, [fetchBalance]);

    const copyAddress = useCallback(async () => {
        if (!wallet.address) return;
        try {
            await navigator.clipboard.writeText(wallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = wallet.address;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [wallet.address]);

    if (!wallet.connected || !wallet.address) {
        return null;
    }

    return (
        <div
            className={`flex items-center gap-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 px-3 py-2 shadow-sm ${className}`}
            role="region"
            aria-label="Wallet information"
        >
            {/* Wallet icon */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
                </svg>
            </div>

            {/* Address with copy */}
            <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                    <Tooltip content={wallet.address} position="bottom">
                        <span
                            className="text-sm font-mono font-medium text-gray-800 cursor-default"
                            aria-label={`Wallet address: ${wallet.address}`}
                        >
                            {truncateAddress(wallet.address)}
                        </span>
                    </Tooltip>
                    <button
                        onClick={copyAddress}
                        className="p-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                        aria-label={copied ? 'Address copied' : 'Copy address to clipboard'}
                        title={copied ? 'Copied!' : 'Copy address'}
                    >
                        {copied ? (
                            <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Balance */}
                <div className="text-xs text-gray-500">
                    {isLoadingBalance ? (
                        <span className="inline-flex items-center gap-1">
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Loading...
                        </span>
                    ) : balanceError ? (
                        <Tooltip content={balanceError} position="bottom">
                            <button
                                onClick={fetchBalance}
                                className="text-amber-600 hover:text-amber-700 underline decoration-dotted cursor-pointer"
                                aria-label="Balance unavailable, click to retry"
                            >
                                Balance unavailable
                            </button>
                        </Tooltip>
                    ) : balance !== null ? (
                        <span aria-label={`Balance: ${formatXLM(balance)} XLM`}>
                            {formatXLM(balance)} <span className="text-gray-400 font-medium">XLM</span>
                        </span>
                    ) : null}
                </div>
            </div>

            {/* Disconnect */}
            <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                className="ml-1 flex-shrink-0 !border-gray-200 !text-gray-500 hover:!text-red-600 hover:!border-red-200 hover:!bg-red-50"
                aria-label="Disconnect wallet"
            >
                <svg className="w-4 h-4 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span className="hidden sm:inline">Disconnect</span>
            </Button>
        </div>
    );
}
