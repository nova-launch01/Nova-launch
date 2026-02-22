import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { formatXLM, truncateAddress, formatNumber } from '../../utils/formatting';
import type { BasicInfoData } from './BasicInfoStep';
import type { MetadataData } from './MetadataStep';

interface ReviewStepProps {
    basicInfo: BasicInfoData;
    metadata: MetadataData;
    walletBalance?: string;
    onConfirm: () => void;
    onEdit: (step: number) => void;
    onBack: () => void;
    isDeploying?: boolean;
}

const BASE_FEE = 7;
const METADATA_FEE = 3;

export function ReviewStep({
    basicInfo,
    metadata,
    walletBalance,
    onConfirm,
    onEdit,
    onBack,
    isDeploying = false,
}: ReviewStepProps) {
    const totalFee = metadata.includeMetadata ? BASE_FEE + METADATA_FEE : BASE_FEE;
    const balance = walletBalance ? parseFloat(walletBalance) : 0;
    const hasSufficientBalance = balance >= totalFee;

    return (
        <div className="space-y-6">
            {/* Token Details */}
            <Card title="Token Details">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{basicInfo.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Symbol</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{basicInfo.symbol}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Decimals</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{basicInfo.decimals}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Initial Supply</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                                {formatNumber(basicInfo.initialSupply)}
                            </p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Admin Wallet</p>
                        <p className="text-sm font-mono text-gray-900 mt-1 break-all">
                            {truncateAddress(basicInfo.adminWallet, 10, 10)}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(0)}
                        className="w-full"
                    >
                        Edit Details
                    </Button>
                </div>
            </Card>

            {/* Metadata Preview */}
            {metadata.includeMetadata && (
                <Card title="Metadata">
                    <div className="space-y-4">
                        {metadata.image && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Image</p>
                                <img
                                    src={URL.createObjectURL(metadata.image)}
                                    alt="Token preview"
                                    className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                                />
                            </div>
                        )}
                        {metadata.description && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Description</p>
                                <p className="text-sm text-gray-900 mt-1">{metadata.description}</p>
                            </div>
                        )}
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => onEdit(1)}
                            className="w-full"
                        >
                            Edit Metadata
                        </Button>
                    </div>
                </Card>
            )}

            {/* Fee Breakdown */}
            <Card title="Fee Breakdown">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base deployment fee</span>
                        <span className="font-medium text-gray-900">{formatXLM(BASE_FEE)} XLM</span>
                    </div>
                    {metadata.includeMetadata && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Metadata fee</span>
                            <span className="font-medium text-gray-900">{formatXLM(METADATA_FEE)} XLM</span>
                        </div>
                    )}
                    <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between">
                            <span className="text-base font-semibold text-gray-900">Total Cost</span>
                            <span className="text-lg font-bold text-blue-600">{formatXLM(totalFee)} XLM</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Balance Check */}
            {walletBalance && (
                <div
                    className={`p-4 rounded-lg border ${
                        hasSufficientBalance
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                    }`}
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Wallet Balance</p>
                            <p className="text-xs text-gray-600 mt-1">
                                {hasSufficientBalance ? 'Sufficient funds' : 'Insufficient funds'}
                            </p>
                        </div>
                        <span className={`text-lg font-bold ${
                            hasSufficientBalance ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {formatXLM(balance)} XLM
                        </span>
                    </div>
                </div>
            )}

            {/* Total Cost Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm opacity-90">Total Deployment Cost</p>
                        <p className="text-3xl font-bold mt-1">{formatXLM(totalFee)} XLM</p>
                    </div>
                    <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={onBack}
                    disabled={isDeploying}
                    className="flex-1"
                >
                    Back
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={onConfirm}
                    disabled={!hasSufficientBalance || isDeploying}
                    loading={isDeploying}
                    className="flex-1"
                >
                    {isDeploying ? 'Deploying...' : 'Confirm Deployment'}
                </Button>
            </div>

            {!hasSufficientBalance && walletBalance && (
                <p className="text-sm text-red-600 text-center">
                    You need {formatXLM(totalFee - balance)} more XLM to deploy this token
                </p>
            )}
        </div>
    );
}
