import type { FeeBreakdown } from '../../types';
import { formatFeeAmount } from '../../utils/feeCalculation';

interface FeeDisplayProps {
    feeBreakdown: FeeBreakdown;
    hasMetadata: boolean;
}

// Metadata fee constant for display purposes
const METADATA_FEE = 3;

export function FeeDisplay({ feeBreakdown, hasMetadata }: FeeDisplayProps) {
    return (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Deployment Cost</h4>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-blue-800">
                    <span>Base Deployment:</span>
                    <span className="font-medium">{formatFeeAmount(feeBreakdown.baseFee)}</span>
                </div>
                {hasMetadata && (
                    <div className="flex justify-between text-blue-800">
                        <span>Metadata Upload:</span>
                        <span className="font-medium">+{formatFeeAmount(feeBreakdown.metadataFee)}</span>
                    </div>
                )}
                {!hasMetadata && (
                    <div className="flex justify-between text-blue-600 text-xs italic">
                        <span>Metadata Upload:</span>
                        <span>+{formatFeeAmount(METADATA_FEE)} (if added)</span>
                    </div>
                )}
                <div className="border-t border-blue-300 pt-2 mt-2">
                    <div className="flex justify-between text-blue-900 font-semibold text-base">
                        <span>Total Cost:</span>
                        <span>{formatFeeAmount(feeBreakdown.totalFee)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
