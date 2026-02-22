import { useState } from 'react';
import { Button } from '../UI/Button';
import { ImageUpload } from '../UI/ImageUpload';
import { Card } from '../UI/Card';
import { formatXLM } from '../../utils/formatting';
import type { ImageValidationResult } from '../../utils/imageValidation';

interface MetadataStepProps {
    onNext: (data: MetadataData) => void;
    onBack: () => void;
    initialData?: MetadataData;
}

export interface MetadataData {
    includeMetadata: boolean;
    image?: File;
    description?: string;
}

const BASE_FEE = 7;
const METADATA_FEE = 3;
const MAX_DESCRIPTION_LENGTH = 500;

export function MetadataStep({ onNext, onBack, initialData }: MetadataStepProps) {
    const [includeMetadata, setIncludeMetadata] = useState(initialData?.includeMetadata ?? false);
    const [image, setImage] = useState<File | undefined>(initialData?.image);
    const [description, setDescription] = useState(initialData?.description ?? '');
    const [imageError, setImageError] = useState('');

    const totalFee = includeMetadata ? BASE_FEE + METADATA_FEE : BASE_FEE;
    const remainingChars = MAX_DESCRIPTION_LENGTH - description.length;

    const handleToggle = () => {
        const newValue = !includeMetadata;
        setIncludeMetadata(newValue);
        if (!newValue) {
            setImage(undefined);
            setDescription('');
            setImageError('');
        }
    };

    const handleImageSelect = (file: File, result: ImageValidationResult) => {
        if (result.valid) {
            setImage(file);
            setImageError('');
        } else {
            setImage(undefined);
            setImageError(result.errors[0] || 'Invalid image');
        }
    };

    const handleImageRemove = () => {
        setImage(undefined);
        setImageError('');
    };

    const handleNext = () => {
        if (includeMetadata && !image) {
            setImageError('Please upload an image or disable metadata');
            return;
        }

        onNext({
            includeMetadata,
            image: includeMetadata ? image : undefined,
            description: includeMetadata ? description : undefined,
        });
    };

    const handleSkip = () => {
        onNext({
            includeMetadata: false,
            image: undefined,
            description: undefined,
        });
    };

    const isValid = !includeMetadata || (image && !imageError);

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-6">
                    {/* Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <label htmlFor="metadata-toggle" className="text-sm font-medium text-gray-900 cursor-pointer">
                                Add metadata
                            </label>
                            <p className="text-xs text-gray-600 mt-1">
                                Include image and description (+{METADATA_FEE} XLM)
                            </p>
                        </div>
                        <input
                            id="metadata-toggle"
                            type="checkbox"
                            checked={includeMetadata}
                            onChange={handleToggle}
                            className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                    </div>

                    {/* Metadata Fields */}
                    {includeMetadata && (
                        <div className="space-y-6 pt-4">
                            <ImageUpload
                                onImageSelect={handleImageSelect}
                                onImageRemove={handleImageRemove}
                                label="Token Image"
                                helperText="PNG, JPG, or SVG (max 5MB, recommended 512x512px)"
                                required
                            />

                            {/* Description */}
                            <div className="space-y-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    maxLength={MAX_DESCRIPTION_LENGTH}
                                    rows={4}
                                    placeholder="Describe your token..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Optional</span>
                                    <span className={remainingChars < 50 ? 'text-orange-600' : 'text-gray-500'}>
                                        {remainingChars} characters remaining
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fee Display */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">Total Fee</span>
                            <span className="text-lg font-bold text-blue-600">{formatXLM(totalFee)} XLM</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                            <div className="flex justify-between">
                                <span>Base deployment fee</span>
                                <span>{formatXLM(BASE_FEE)} XLM</span>
                            </div>
                            {includeMetadata && (
                                <div className="flex justify-between">
                                    <span>Metadata fee</span>
                                    <span>{formatXLM(METADATA_FEE)} XLM</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
                <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={onBack}
                    className="flex-1"
                >
                    Back
                </Button>
                {!includeMetadata && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={handleSkip}
                        className="flex-1"
                    >
                        Skip
                    </Button>
                )}
                <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleNext}
                    disabled={!isValid}
                    className="flex-1"
                >
                    Next Step
                </Button>
            </div>
        </div>
    );
}
