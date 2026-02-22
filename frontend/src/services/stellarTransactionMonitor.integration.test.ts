/**
 * Integration tests for StellarTransactionMonitor
 * Covers pending, success, failure, timeout, invalid hash, and polling behavior
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    StellarTransactionMonitor,
    createMockStellarResponse,
} from './StellarTransactionMonitor.integration';
import type { TransactionStatusUpdate } from './transactionMonitor';
import { createTestMonitoringConfig, waitForStatus } from './transactionMonitor.test-helpers';

const ensureFetchAvailable = () => {
    if (!globalThis.fetch) {
        globalThis.fetch = vi.fn() as unknown as typeof fetch;
    }
};

describe('StellarTransactionMonitor - Integration Tests', () => {
    let monitor: StellarTransactionMonitor;
    let fetchSpy: ReturnType<typeof vi.spyOn> | null = null;

    beforeEach(() => {
        ensureFetchAvailable();
        monitor = new StellarTransactionMonitor('testnet', createTestMonitoringConfig());
    });

    afterEach(() => {
        monitor.destroy();
        if (fetchSpy) {
            fetchSpy.mockRestore();
            fetchSpy = null;
        }
        vi.restoreAllMocks();
    });

    it('should monitor pending then success transaction', async () => {
        const hash = 'a'.repeat(64);
        const statusUpdates: TransactionStatusUpdate[] = [];
        let callCount = 0;

        fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
            callCount += 1;
            if (callCount < 3) {
                return createMockStellarResponse('pending');
            }
            return createMockStellarResponse('success');
        });

        monitor.startMonitoring(hash, (update) => {
            statusUpdates.push(update);
        });

        await new Promise((resolve) => setTimeout(resolve, 20));
        const pendingSession = monitor.getSession(hash);
        expect(pendingSession?.status).toBe('pending');
        expect(pendingSession?.attempts).toBeGreaterThan(0);

        await waitForStatus(statusUpdates, 'success', 2000);

        const finalUpdate = statusUpdates[statusUpdates.length - 1];
        expect(finalUpdate.status).toBe('success');
        expect(finalUpdate.hash).toBe(hash);
        expect(callCount).toBeGreaterThanOrEqual(3);

        const session = monitor.getSession(hash);
        expect(session?.status).toBe('success');
        expect(session?.attempts).toBeGreaterThanOrEqual(3);
    });

    it('should detect failed transaction from Horizon response', async () => {
        const hash = 'b'.repeat(64);
        const statusUpdates: TransactionStatusUpdate[] = [];

        fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            createMockStellarResponse('failed')
        );

        monitor.startMonitoring(hash, (update) => {
            statusUpdates.push(update);
        });

        await waitForStatus(statusUpdates, 'failed', 2000);

        const finalUpdate = statusUpdates[statusUpdates.length - 1];
        expect(finalUpdate.status).toBe('failed');
        expect(finalUpdate.error).toBeUndefined();

        const session = monitor.getSession(hash);
        expect(session?.status).toBe('failed');
    });

    it('should retry after network timeout and then succeed', async () => {
        const hash = 'c'.repeat(64);
        const statusUpdates: TransactionStatusUpdate[] = [];
        const errors: Error[] = [];
        let callCount = 0;

        fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
            callCount += 1;
            if (callCount === 1) {
                throw new Error('Network timeout');
            }
            return createMockStellarResponse('success');
        });

        monitor.startMonitoring(
            hash,
            (update) => statusUpdates.push(update),
            (error) => errors.push(error)
        );

        await waitForStatus(statusUpdates, 'success', 2000);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain('Network timeout');
        expect(statusUpdates[statusUpdates.length - 1].status).toBe('success');
    });

    it('should timeout after repeated pending responses', async () => {
        const hash = 'd'.repeat(64);
        const statusUpdates: TransactionStatusUpdate[] = [];

        monitor.destroy();
        monitor = new StellarTransactionMonitor(
            'testnet',
            createTestMonitoringConfig({
                maxRetries: 2,
                timeout: 5000,
            })
        );

        fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            createMockStellarResponse('pending')
        );

        monitor.startMonitoring(hash, (update) => {
            statusUpdates.push(update);
        });

        await waitForStatus(statusUpdates, 'timeout', 2000);

        const finalUpdate = statusUpdates[statusUpdates.length - 1];
        expect(finalUpdate.status).toBe('timeout');
        expect(finalUpdate.error).toContain('Max retries');
    });

    it('should handle invalid transaction hash with API errors', async () => {
        const hash = 'INVALID@#$%';
        const statusUpdates: TransactionStatusUpdate[] = [];
        const errors: Error[] = [];

        monitor.destroy();
        monitor = new StellarTransactionMonitor(
            'testnet',
            createTestMonitoringConfig({
                maxRetries: 2,
                timeout: 5000,
            })
        );

        fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response('Bad Request', { status: 400, statusText: 'Bad Request' })
        );

        monitor.startMonitoring(
            hash,
            (update) => statusUpdates.push(update),
            (error) => errors.push(error)
        );

        await waitForStatus(statusUpdates, 'timeout', 2000);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain('API error');
        expect(statusUpdates[statusUpdates.length - 1].status).toBe('timeout');
    });

    it('should respect polling interval between status checks', async () => {
        const hash = 'e'.repeat(64);
        const timestamps: number[] = [];

        monitor.destroy();
        monitor = new StellarTransactionMonitor(
            'testnet',
            createTestMonitoringConfig({
                pollingInterval: 20,
                maxRetries: 5,
                timeout: 5000,
                backoffMultiplier: 1.0,
            })
        );

        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

        fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
            timestamps.push(Date.now());
            return createMockStellarResponse('pending');
        });

        monitor.startMonitoring(hash);

        await new Promise((resolve) => setTimeout(resolve, 120));
        monitor.destroy();
        randomSpy.mockRestore();

        expect(timestamps.length).toBeGreaterThan(1);

        for (let i = 1; i < timestamps.length; i += 1) {
            const interval = timestamps[i] - timestamps[i - 1];
            expect(interval).toBeGreaterThanOrEqual(15);
        }
    });
});
