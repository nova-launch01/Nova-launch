import { useState } from 'react';
import { Card } from '../UI';
import { BasicInfoStep } from './BasicInfoStep.tsx';
import { MetadataStep } from './MetadataStep.tsx';
import { ReviewStep } from './ReviewStep.tsx';
import { ProgressIndicator } from './ProgressIndicator.tsx';
import type { TokenDeployParams, FeeBreakdown } from '../../types';

export interface FormData {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  adminWallet: string;
  metadata?: {
    image: File | null;
    description: string;
  };
}

const INITIAL_FORM_DATA: FormData = {
  name: '',
  symbol: '',
  decimals: 7,
  initialSupply: '',
  adminWallet: '',
  metadata: {
    image: null,
    description: '',
  },
};

const STEPS = [
  { id: 1, name: 'Basic Info', description: 'Token details' },
  { id: 2, name: 'Metadata', description: 'Optional image & description' },
  { id: 3, name: 'Review', description: 'Confirm & deploy' },
];

export function TokenDeployForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    // Allow navigation to previous steps or current step
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const calculateFees = (): FeeBreakdown => {
    const baseFee = 7; // 7 XLM base fee
    const metadataFee = formData.metadata?.image ? 3 : 0; // 3 XLM for metadata
    return {
      baseFee,
      metadataFee,
      totalFee: baseFee + metadataFee,
    };
  };

  const handleDeploy = async () => {
    // Convert FormData to TokenDeployParams
    const params: TokenDeployParams = {
      name: formData.name,
      symbol: formData.symbol,
      decimals: formData.decimals,
      initialSupply: formData.initialSupply,
      adminWallet: formData.adminWallet,
      metadata: formData.metadata?.image
        ? {
            image: formData.metadata.image,
            description: formData.metadata.description,
          }
        : undefined,
    };

    // TODO: Implement actual deployment logic
    console.log('Deploying token with params:', params);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <ProgressIndicator
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      <Card className="p-6">
        {currentStep === 1 && (
          <BasicInfoStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <MetadataStep
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <ReviewStep
            data={formData}
            fees={calculateFees()}
            onBack={handleBack}
            onDeploy={handleDeploy}
            onReset={handleReset}
          />
        )}
      </Card>
    </div>
  );
}
