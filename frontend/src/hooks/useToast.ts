import { useState, useCallback } from 'react';

interface ToastState {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

export function useToast() {
    const [toasts, setToasts] = useState<ToastState[]>([]);

    const showToast = useCallback(
        (message: string, type: ToastState['type'] = 'info') => {
            const id = Date.now();
            setToasts((prev) => [...prev, { id, message, type }]);
        },
        []
    );

    const hideToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback(
        (message: string) => showToast(message, 'success'),
        [showToast]
    );

    const error = useCallback(
        (message: string) => showToast(message, 'error'),
        [showToast]
    );

    const info = useCallback(
        (message: string) => showToast(message, 'info'),
        [showToast]
    );

    const warning = useCallback(
        (message: string) => showToast(message, 'warning'),
        [showToast]
    );

    return {
        toasts,
        showToast,
        hideToast,
        success,
        error,
        info,
        warning,
    };
}
