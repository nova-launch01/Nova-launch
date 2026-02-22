import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NetworkToggle } from './NetworkToggle';

describe('NetworkToggle', () => {
    const mockOnNetworkChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders with testnet selected', () => {
        render(<NetworkToggle network="testnet" onNetworkChange={mockOnNetworkChange} />);

        expect(screen.getByText('Testnet')).toBeInTheDocument();
        expect(screen.getByText('Mainnet')).toBeInTheDocument();
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });

    it('renders with mainnet selected', () => {
        render(<NetworkToggle network="mainnet" onNetworkChange={mockOnNetworkChange} />);

        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('shows warning badge when on testnet', () => {
        render(<NetworkToggle network="testnet" onNetworkChange={mockOnNetworkChange} />);

        expect(screen.getByLabelText('Testnet mode active')).toBeInTheDocument();
        expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('shows live indicator when on mainnet', () => {
        render(<NetworkToggle network="mainnet" onNetworkChange={mockOnNetworkChange} />);

        expect(screen.getByLabelText('Mainnet mode active')).toBeInTheDocument();
        expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('does not show testnet warning on mainnet', () => {
        render(<NetworkToggle network="mainnet" onNetworkChange={mockOnNetworkChange} />);

        expect(screen.queryByLabelText('Testnet mode active')).not.toBeInTheDocument();
    });

    it('does not show live indicator on testnet', () => {
        render(<NetworkToggle network="testnet" onNetworkChange={mockOnNetworkChange} />);

        expect(screen.queryByLabelText('Mainnet mode active')).not.toBeInTheDocument();
    });

    it('calls onNetworkChange with mainnet when toggling from testnet', () => {
        render(<NetworkToggle network="testnet" onNetworkChange={mockOnNetworkChange} />);

        fireEvent.click(screen.getByRole('switch'));
        expect(mockOnNetworkChange).toHaveBeenCalledWith('mainnet');
    });

    it('calls onNetworkChange with testnet when toggling from mainnet', () => {
        render(<NetworkToggle network="mainnet" onNetworkChange={mockOnNetworkChange} />);

        fireEvent.click(screen.getByRole('switch'));
        expect(mockOnNetworkChange).toHaveBeenCalledWith('testnet');
    });

    it('does not toggle when disabled', () => {
        render(<NetworkToggle network="testnet" onNetworkChange={mockOnNetworkChange} disabled />);

        const toggle = screen.getByRole('switch');
        expect(toggle).toBeDisabled();
    });

    it('supports keyboard interaction with Enter key', () => {
        render(<NetworkToggle network="testnet" onNetworkChange={mockOnNetworkChange} />);

        fireEvent.keyDown(screen.getByRole('switch'), { key: 'Enter' });
        expect(mockOnNetworkChange).toHaveBeenCalledWith('mainnet');
    });

    it('supports keyboard interaction with Space key', () => {
        render(<NetworkToggle network="testnet" onNetworkChange={mockOnNetworkChange} />);

        fireEvent.keyDown(screen.getByRole('switch'), { key: ' ' });
        expect(mockOnNetworkChange).toHaveBeenCalledWith('mainnet');
    });

    it('has proper accessibility attributes', () => {
        render(<NetworkToggle network="testnet" onNetworkChange={mockOnNetworkChange} />);

        const toggle = screen.getByRole('switch');
        expect(toggle).toHaveAttribute('aria-label', 'Switch to mainnet');
        expect(screen.getByRole('region', { name: 'Network selection' })).toBeInTheDocument();
    });

    it('updates aria-label based on current network', () => {
        render(<NetworkToggle network="mainnet" onNetworkChange={mockOnNetworkChange} />);

        expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Switch to testnet');
    });

    it('uses yellow/amber styling for testnet label', () => {
        render(<NetworkToggle network="testnet" onNetworkChange={mockOnNetworkChange} />);

        const testnetLabel = screen.getByText('Testnet');
        expect(testnetLabel).toHaveClass('text-amber-700');
    });

    it('uses green styling for mainnet label', () => {
        render(<NetworkToggle network="mainnet" onNetworkChange={mockOnNetworkChange} />);

        const mainnetLabel = screen.getByText('Mainnet');
        expect(mainnetLabel).toHaveClass('text-green-700');
    });
});
