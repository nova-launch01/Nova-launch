import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useToast } from '../useToast';
import { ToastProvider } from '../../providers/ToastProvider';

function ToastHarness() {
    const { success, error, info } = useToast();

    return (
        <div>
            <button onClick={() => success('Token deployed successfully!')}>Success</button>
            <button onClick={() => error('Transaction failed. Please try again.')}>Error</button>
            <button onClick={() => info('Info message')}>Info</button>
        </div>
    );
}

describe('useToast', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('queues multiple toasts and respects maxVisible', async () => {
        render(
            <ToastProvider maxVisible={2} defaultDuration={10000}>
                <ToastHarness />
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Success' }));
        fireEvent.click(screen.getByRole('button', { name: 'Error' }));
        fireEvent.click(screen.getByRole('button', { name: 'Info' }));

        expect(screen.getByText('Token deployed successfully!')).toBeInTheDocument();
        expect(screen.getByText('Transaction failed. Please try again.')).toBeInTheDocument();
        expect(screen.queryByText('Info message')).not.toBeInTheDocument();

        fireEvent.click(screen.getAllByRole('button', { name: 'Dismiss notification' })[0]);
        vi.advanceTimersByTime(200);

        await waitFor(() => {
            expect(screen.getByText('Info message')).toBeInTheDocument();
        });
    });

    it('auto-dismisses after duration', async () => {
        render(
            <ToastProvider defaultDuration={1000}>
                <ToastHarness />
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Success' }));
        expect(screen.getByText('Token deployed successfully!')).toBeInTheDocument();

        vi.advanceTimersByTime(1200);

        await waitFor(() => {
            expect(screen.queryByText('Token deployed successfully!')).not.toBeInTheDocument();
        });
    });

    it('dismisses manually', async () => {
        render(
            <ToastProvider defaultDuration={10000}>
                <ToastHarness />
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Error' }));
        expect(screen.getByText('Transaction failed. Please try again.')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
        vi.advanceTimersByTime(200);

        await waitFor(() => {
            expect(screen.queryByText('Transaction failed. Please try again.')).not.toBeInTheDocument();
        });
    });

    it('uses assertive live announcements for error toasts', () => {
        render(
            <ToastProvider defaultDuration={10000}>
                <ToastHarness />
            </ToastProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Error' }));

        const toast = screen.getByText('Transaction failed. Please try again.').closest('[role="alert"]');
        expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('throws when used outside provider', () => {
        const originalError = console.error;
        console.error = vi.fn();

        expect(() => render(<ToastHarness />)).toThrow('useToast must be used within a ToastProvider');

        console.error = originalError;
    });
});
