import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TokenDeployForm } from '../TokenDeployForm';
import type { WalletState } from '../../../types';

// Mock the hooks
vi.mock('../../../hooks/useTokenDeploy', () => ({
    useTokenDeploy: () => ({
        deploy: vi.fn(),
        reset: vi.fn(),
        status: 'idle',
        statusMessage: '',
        isDeploying: false,
        error: null,
        getFeeBreakdown: (hasMetadata: boolean) => ({
            baseFee: 7,
            metadataFee: hasMetadata ? 3 : 0,
            totalFee: hasMetadata ? 10 : 7,
        }),
    }),
}));

describe('TokenDeployForm - Fee Integration', () => {
    const mockWallet: WalletState = {
        connected: true,
        address: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        network: 'testnet',
    };

    const mockOnConnectWallet = vi.fn();

    it('should show base fee of 7 XLM initially', async () => {
        render(
            <TokenDeployForm
                wallet={mockWallet}
                onConnectWallet={mockOnConnectWallet}
                isConnectingWallet={false}
            />
        );

        // Fill in basic info
        fireEvent.change(screen.getByLabelText(/Token Name/i), {
            target: { value: 'Test Token' },
        });
        fireEvent.change(screen.getByLabelText(/Token Symbol/i), {
            target: { value: 'TEST' },
        });
        fireEvent.change(screen.getByLabelText(/Initial Supply/i), {
            target: { value: '1000000' },
        });
        fireEvent.change(screen.getByLabelText(/Admin Wallet/i), {
            target: { value: mockWallet.address },
        });

        // Go to review step
        fireEvent.click(screen.getByText('Next Step'));

        await waitFor(() => {
            expect(screen.getByText('Deployment Cost')).toBeInTheDocument();
            expect(screen.getByText('7 XLM')).toBeInTheDocument();
        });
    });

    it('should update to 10 XLM when metadata is added', async () => {
        render(
            <TokenDeployForm
                wallet={mockWallet}
                onConnectWallet={mockOnConnectWallet}
                isConnectingWallet={false}
            />
        );

        // Fill in basic info and go to review
        fireEvent.change(screen.getByLabelText(/Token Name/i), {
            target: { value: 'Test Token' },
        });
        fireEvent.change(screen.getByLabelText(/Token Symbol/i), {
            target: { value: 'TEST' },
        });
        fireEvent.change(screen.getByLabelText(/Initial Supply/i), {
            target: { value: '1000000' },
        });
        fireEvent.change(screen.getByLabelText(/Admin Wallet/i), {
            target: { value: mockWallet.address },
        });
        fireEvent.click(screen.getByText('Next Step'));

        await waitFor(() => {
            expect(screen.getByText('7 XLM')).toBeInTheDocument();
        });

        // Add metadata description
        const descriptionInput = screen.getByLabelText(/Description/i);
        fireEvent.change(descriptionInput, {
            target: { value: 'Test token description' },
        });

        await waitFor(() => {
            expect(screen.getByText('10 XLM')).toBeInTheDocument();
            expect(screen.getByText('+3 XLM')).toBeInTheDocument();
        });
    });

    it('should show metadata fee breakdown when metadata is present', async () => {
        render(
            <TokenDeployForm
                wallet={mockWallet}
                onConnectWallet={mockOnConnectWallet}
                isConnectingWallet={false}
            />
        );

        // Navigate to review with metadata
        fireEvent.change(screen.getByLabelText(/Token Name/i), {
            target: { value: 'Test Token' },
        });
        fireEvent.change(screen.getByLabelText(/Token Symbol/i), {
            target: { value: 'TEST' },
        });
        fireEvent.change(screen.getByLabelText(/Initial Supply/i), {
            target: { value: '1000000' },
        });
        fireEvent.change(screen.getByLabelText(/Admin Wallet/i), {
            target: { value: mockWallet.address },
        });
        fireEvent.click(screen.getByText('Next Step'));

        await waitFor(() => {
            expect(screen.getByText('Base Deployment:')).toBeInTheDocument();
        });

        // Add metadata
        fireEvent.change(screen.getByLabelText(/Description/i), {
            target: { value: 'Test description' },
        });

        await waitFor(() => {
            expect(screen.getByText('Metadata Upload:')).toBeInTheDocument();
            expect(screen.getByText('Total Cost:')).toBeInTheDocument();
        });
    });

    it('should show fee preview in basic info step', () => {
        render(
            <TokenDeployForm
                wallet={mockWallet}
                onConnectWallet={mockOnConnectWallet}
                isConnectingWallet={false}
            />
        );

        expect(screen.getByText(/7 XLM base fee/i)).toBeInTheDocument();
        expect(screen.getByText(/optional metadata \(3 XLM\)/i)).toBeInTheDocument();
    });
});
