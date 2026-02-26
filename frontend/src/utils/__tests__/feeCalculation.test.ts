import { describe, it, expect } from 'vitest';
import { getDeploymentFeeBreakdown, formatFeeAmount } from '../feeCalculation';

describe('Fee Calculation', () => {
    describe('getDeploymentFeeBreakdown', () => {
        it('should calculate base fee only when no metadata', () => {
            const result = getDeploymentFeeBreakdown(false);
            
            expect(result.baseFee).toBe(7);
            expect(result.metadataFee).toBe(0);
            expect(result.totalFee).toBe(7);
        });

        it('should calculate base fee + metadata fee when metadata is included', () => {
            const result = getDeploymentFeeBreakdown(true);
            
            expect(result.baseFee).toBe(7);
            expect(result.metadataFee).toBe(3);
            expect(result.totalFee).toBe(10);
        });

        it('should have base fee in valid range (5-10 XLM)', () => {
            const result = getDeploymentFeeBreakdown(false);
            
            expect(result.baseFee).toBeGreaterThanOrEqual(5);
            expect(result.baseFee).toBeLessThanOrEqual(10);
        });

        it('should have metadata fee in valid range (2-5 XLM) when included', () => {
            const result = getDeploymentFeeBreakdown(true);
            
            expect(result.metadataFee).toBeGreaterThanOrEqual(2);
            expect(result.metadataFee).toBeLessThanOrEqual(5);
        });

        it('should have total equal to base + metadata', () => {
            const withMetadata = getDeploymentFeeBreakdown(true);
            const withoutMetadata = getDeploymentFeeBreakdown(false);
            
            expect(withMetadata.totalFee).toBe(withMetadata.baseFee + withMetadata.metadataFee);
            expect(withoutMetadata.totalFee).toBe(withoutMetadata.baseFee + withoutMetadata.metadataFee);
        });
    });

    describe('formatFeeAmount', () => {
        it('should format fee amount with XLM suffix', () => {
            expect(formatFeeAmount(7)).toBe('7 XLM');
            expect(formatFeeAmount(10)).toBe('10 XLM');
            expect(formatFeeAmount(3)).toBe('3 XLM');
        });

        it('should handle decimal amounts', () => {
            expect(formatFeeAmount(7.5)).toBe('7.5 XLM');
            expect(formatFeeAmount(10.25)).toBe('10.25 XLM');
        });

        it('should handle zero', () => {
            expect(formatFeeAmount(0)).toBe('0 XLM');
        });
    });
});
