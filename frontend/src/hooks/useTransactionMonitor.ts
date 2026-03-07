import { useState, useCallback, useEffect, useRef } from 'react';

interface UseTransactionMonitorReturn {
    monitoring: boolean;
    status: 'pending' | 'success' | 'failed' | 'timeout' | null;
    progress: number;
    estimatedTimeMs?: number;
    error: string | null;
    startMonitoring: (hash: string) => void;
    stopMonitoring: () => void;
}

const POLLING_INTERVAL = 3000; // 3 seconds
const MAX_ATTEMPTS = 40; // ~2 minutes
const ESTIMATED_CONFIRMATION_TIME = 10000; // 10 seconds average

export function useTransactionMonitor(): UseTransactionMonitorReturn {
    const [monitoring, setMonitoring] = useState(false);
    const [status, setStatus] = useState<'pending' | 'success' | 'failed' | 'timeout' | null>(null);
    const [progress, setProgress] = useState(0);
    const [estimatedTimeMs, setEstimatedTimeMs] = useState<number | undefined>();
    const [error, setError] = useState<string | null>(null);
    const [attempts, setAttempts] = useState(0);
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    const stopMonitoring = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setMonitoring(false);
    }, []);

    const checkTransaction = useCallback(async (hash: string) => {
        try {
            // Mock transaction check - replace with actual Stellar API call
            const response = await fetch(`https://horizon-testnet.stellar.org/transactions/${hash}`);
            
            if (response.ok) {
                setStatus('success');
                setProgress(100);
                setEstimatedTimeMs(0);
                stopMonitoring();
                return true;
            }
            
            if (response.status === 404) {
                // Still pending
                return false;
            }
            
            throw new Error('Transaction failed');
        } catch (err) {
            if (attempts >= MAX_ATTEMPTS - 1) {
                setStatus('timeout');
                setError('Transaction confirmation timeout');
                stopMonitoring();
                return true;
            }
            return false;
        }
    }, [attempts, stopMonitoring]);

    const startMonitoring = useCallback((hash: string) => {
        setMonitoring(true);
        setStatus('pending');
        setProgress(0);
        setAttempts(0);
        setError(null);
        startTimeRef.current = Date.now();
        setEstimatedTimeMs(ESTIMATED_CONFIRMATION_TIME);

        let currentAttempt = 0;

        intervalRef.current = setInterval(async () => {
            currentAttempt++;
            setAttempts(currentAttempt);

            // Update progress (0-90% during monitoring, 100% on success)
            const progressPercent = Math.min(90, (currentAttempt / MAX_ATTEMPTS) * 90);
            setProgress(progressPercent);

            // Update estimated time
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, ESTIMATED_CONFIRMATION_TIME - elapsed);
            setEstimatedTimeMs(remaining);

            const completed = await checkTransaction(hash);
            if (completed) {
                stopMonitoring();
            }
        }, POLLING_INTERVAL);
    }, [checkTransaction, stopMonitoring]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        monitoring,
        status,
        progress,
        estimatedTimeMs,
        error,
        startMonitoring,
        stopMonitoring,
    };
}
