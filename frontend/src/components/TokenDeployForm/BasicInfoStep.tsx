import { useState } from 'react';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import {
    isValidTokenName,
    isValidTokenSymbol,
    isValidDecimals,
    isValidSupply,
    isValidStellarAddress,
} from '../../utils/validation';
import { getDeploymentFeeBreakdown } from '../../utils/feeCalculation';

interface BasicInfoStepProps {
    onNext: (data: BasicInfoData) => void;
    initialData?: BasicInfoData;
}

export interface BasicInfoData {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: string;
    adminWallet: string;
}

export function BasicInfoStep({ onNext, initialData }: BasicInfoStepProps) {
    const [formData, setFormData] = useState<BasicInfoData>(
        initialData || {
            name: '',
            symbol: '',
            decimals: 7,
            initialSupply: '',
            adminWallet: '',
        }
    );

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateField = (name: keyof BasicInfoData, value: string | number): string => {
        switch (name) {
            case 'name':
                return isValidTokenName(value as string)
                    ? ''
                    : 'Token name must be 1-32 alphanumeric characters';
            case 'symbol':
                return isValidTokenSymbol(value as string)
                    ? ''
                    : 'Token symbol must be 1-12 uppercase letters';
            case 'decimals':
                return isValidDecimals(value as number)
                    ? ''
                    : 'Decimals must be between 0 and 18';
            case 'initialSupply':
                return isValidSupply(value as string)
                    ? ''
                    : 'Initial supply must be a positive number';
            case 'adminWallet':
                return isValidStellarAddress(value as string)
                    ? ''
                    : 'Invalid Stellar address (must start with G)';
            default:
                return '';
        }
    };

    const handleChange = (field: keyof BasicInfoData, value: string | number) => {
        let processedValue = value;

        // Auto-uppercase symbol
        if (field === 'symbol' && typeof value === 'string') {
            processedValue = value.toUpperCase();
        }

        setFormData((prev) => ({ ...prev, [field]: processedValue }));

        // Validate on change if field was touched
        if (touched[field]) {
            const error = validateField(field, processedValue);
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    };

    const handleBlur = (field: keyof BasicInfoData) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const error = validateField(field, formData[field]);
        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const newErrors: Record<string, string> = {};
        (Object.keys(formData) as Array<keyof BasicInfoData>).forEach((field) => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);
        setTouched({
            name: true,
            symbol: true,
            decimals: true,
            initialSupply: true,
            adminWallet: true,
        });

        if (Object.keys(newErrors).length === 0) {
            onNext(formData);
        }
    };

    const isFormValid = Object.values(errors).every((error) => !error) &&
        formData.name &&
        formData.symbol &&
        formData.initialSupply &&
        formData.adminWallet;

    const getSuccess = (field: keyof BasicInfoData): boolean => {
        return touched[field] && !errors[field] && formData[field] !== '';
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Token Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                error={touched.name ? errors.name : ''}
                success={getSuccess('name')}
                helperText="1-32 characters, alphanumeric with spaces and hyphens"
                placeholder="My Awesome Token"
                maxLength={32}
                required
            />

            <Input
                label="Token Symbol"
                value={formData.symbol}
                onChange={(e) => handleChange('symbol', e.target.value)}
                onBlur={() => handleBlur('symbol')}
                error={touched.symbol ? errors.symbol : ''}
                success={getSuccess('symbol')}
                helperText="1-12 uppercase letters (e.g., BTC, ETH)"
                placeholder="MAT"
                maxLength={12}
                required
            />

            <Input
                label="Decimals"
                type="number"
                value={formData.decimals}
                onChange={(e) => handleChange('decimals', parseInt(e.target.value) || 0)}
                onBlur={() => handleBlur('decimals')}
                error={touched.decimals ? errors.decimals : ''}
                success={getSuccess('decimals')}
                helperText="Number of decimal places (0-18, typically 7)"
                min={0}
                max={18}
                required
            />

            <Input
                label="Initial Supply"
                value={formData.initialSupply}
                onChange={(e) => handleChange('initialSupply', e.target.value)}
                onBlur={() => handleBlur('initialSupply')}
                error={touched.initialSupply ? errors.initialSupply : ''}
                success={getSuccess('initialSupply')}
                helperText="Total tokens to mint initially"
                placeholder="1000000"
                required
            />

            <Input
                label="Admin Wallet Address"
                value={formData.adminWallet}
                onChange={(e) => handleChange('adminWallet', e.target.value)}
                onBlur={() => handleBlur('adminWallet')}
                error={touched.adminWallet ? errors.adminWallet : ''}
                success={getSuccess('adminWallet')}
                helperText="Stellar address that will control the token (starts with G)"
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                required
            />

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                    <span className="font-medium">Estimated Cost:</span> {getDeploymentFeeBreakdown(false).baseFee} XLM base fee
                    {' '}+ optional metadata (3 XLM)
                </p>
            </div>

            <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!isFormValid}
            >
                Next Step
            </Button>
        </form>
    );
}
