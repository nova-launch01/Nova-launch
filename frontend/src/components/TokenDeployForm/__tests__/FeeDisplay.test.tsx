import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeeDisplay } from '../FeeDisplay';
import type { FeeBreakdown } from '../../../types';

describe('FeeDisplay', () => {
    const baseFeeBreakdown: FeeBreakdown = {
        baseFee: 7,
        metadataFee: 0,
        totalFee: 7,
    };

    const withMetadataFeeBreakdown: FeeBreakdown = {
        baseFee: 7,
        metadataFee: 3,
        totalFee: 10,
    };

    it('should render base deployment fee', () => {
        render(<FeeDisplay feeBreakdown={baseFeeBreakdown} hasMetadata={false} />);
        
        expect(screen.getByText('Deployment Cost')).toBeInTheDocument();
        expect(screen.getByText('Base Deployment:')).toBeInTheDocument();
        expect(screen.getByText('7 XLM')).toBeInTheDocument();
    });

    it('should show total cost', () => {
        render(<FeeDisplay feeBreakdown={baseFeeBreakdown} hasMetadata={false} />);
        
        expect(screen.getByText('Total Cost:')).toBeInTheDocument();
        expect(screen.getByText('7 XLM')).toBeInTheDocument();
    });

    it('should show metadata fee when metadata is included', () => {
        render(<FeeDisplay feeBreakdown={withMetadataFeeBreakdown} hasMetadata={true} />);
        
        expect(screen.getByText('Metadata Upload:')).toBeInTheDocument();
        expect(screen.getByText('+3 XLM')).toBeInTheDocument();
        expect(screen.getByText('10 XLM')).toBeInTheDocument();
    });

    it('should show potential metadata fee when no metadata', () => {
        render(<FeeDisplay feeBreakdown={baseFeeBreakdown} hasMetadata={false} />);
        
        expect(screen.getByText('Metadata Upload:')).toBeInTheDocument();
        expect(screen.getByText('+3 XLM (if added)')).toBeInTheDocument();
    });

    it('should update total when metadata is added', () => {
        const { rerender } = render(
            <FeeDisplay feeBreakdown={baseFeeBreakdown} hasMetadata={false} />
        );
        
        expect(screen.getByText('7 XLM')).toBeInTheDocument();
        
        rerender(<FeeDisplay feeBreakdown={withMetadataFeeBreakdown} hasMetadata={true} />);
        
        expect(screen.getByText('10 XLM')).toBeInTheDocument();
    });

    it('should display fees in prominent blue styling', () => {
        const { container } = render(
            <FeeDisplay feeBreakdown={withMetadataFeeBreakdown} hasMetadata={true} />
        );
        
        const feeContainer = container.querySelector('.border-blue-200.bg-blue-50');
        expect(feeContainer).toBeInTheDocument();
    });

    it('should show clear breakdown with separator', () => {
        const { container } = render(
            <FeeDisplay feeBreakdown={withMetadataFeeBreakdown} hasMetadata={true} />
        );
        
        const separator = container.querySelector('.border-t.border-blue-300');
        expect(separator).toBeInTheDocument();
    });
});
