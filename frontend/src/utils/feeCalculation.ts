import type { FeeBreakdown } from '../types';

/**
 * Fee structure for token deployment
 * Base fee: 7 XLM (range: 5-10 XLM)
 * Metadata fee: 3 XLM (range: 2-5 XLM) when metadata is included
 */
const BASE_FEE = 7;
const METADATA_FEE = 3;

/**
 * Calculate deployment fee breakdown based on whether metadata is included
 * @param hasMetadata - Whether the deployment includes metadata (image/description)
 * @returns Fee breakdown with base, metadata, and total fees in XLM
 */
export function getDeploymentFeeBreakdown(hasMetadata: boolean): FeeBreakdown {
    const baseFee = BASE_FEE;
    const metadataFee = hasMetadata ? METADATA_FEE : 0;
    const totalFee = baseFee + metadataFee;

    return {
        baseFee,
        metadataFee,
        totalFee,
    };
}

/**
 * Format XLM amount for display
 * @param amount - Amount in XLM
 * @returns Formatted string with XLM suffix
 */
export function formatFeeAmount(amount: number): string {
    return `${amount} XLM`;
}
