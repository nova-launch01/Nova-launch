import { useEffect, useState } from 'react';
import { Button } from '../UI/Button';

export interface TutorialStep {
    id: string;
    title: string;
    content: string;
    targetSelector?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    action?: 'highlight' | 'wait';
}

interface TutorialOverlayProps {
    steps: TutorialStep[];
    currentStep: number;
    onNext: () => void;
    onPrevious: () => void;
    onSkip: () => void;
    onComplete: () => void;
    isActive: boolean;
}

export function TutorialOverlay({
    steps,
    currentStep,
    onNext,
    onPrevious,
    onSkip,
    onComplete,
    isActive,
}: TutorialOverlayProps) {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    useEffect(() => {
        if (!isActive || !step?.targetSelector) {
            setTargetRect(null);
            return;
        }

        const updateTargetRect = () => {
            const element = document.querySelector(step.targetSelector!);
            if (element) {
                setTargetRect(element.getBoundingClientRect());
            } else {
                setTargetRect(null);
            }
        };

        updateTargetRect();
        window.addEventListener('resize', updateTargetRect);
        window.addEventListener('scroll', updateTargetRect);

        return () => {
            window.removeEventListener('resize', updateTargetRect);
            window.removeEventListener('scroll', updateTargetRect);
        };
    }, [isActive, step?.targetSelector]);

    if (!isActive || !step) return null;

    const getTooltipPosition = () => {
        if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

        const position = step.position || 'bottom';
        const padding = 16;

        switch (position) {
            case 'top':
                return {
                    top: `${targetRect.top - padding}px`,
                    left: `${targetRect.left + targetRect.width / 2}px`,
                    transform: 'translate(-50%, -100%)',
                };
            case 'bottom':
                return {
                    top: `${targetRect.bottom + padding}px`,
                    left: `${targetRect.left + targetRect.width / 2}px`,
                    transform: 'translate(-50%, 0)',
                };
            case 'left':
                return {
                    top: `${targetRect.top + targetRect.height / 2}px`,
                    left: `${targetRect.left - padding}px`,
                    transform: 'translate(-100%, -50%)',
                };
            case 'right':
                return {
                    top: `${targetRect.top + targetRect.height / 2}px`,
                    left: `${targetRect.right + padding}px`,
                    transform: 'translate(0, -50%)',
                };
            default:
                return {
                    top: `${targetRect.bottom + padding}px`,
                    left: `${targetRect.left + targetRect.width / 2}px`,
                    transform: 'translate(-50%, 0)',
                };
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9998] bg-black transition-opacity"
                style={{ opacity: targetRect ? 0.5 : 0.7 }}
            />

            {/* Highlight cutout */}
            {targetRect && (
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        top: `${targetRect.top - 4}px`,
                        left: `${targetRect.left - 4}px`,
                        width: `${targetRect.width + 8}px`,
                        height: `${targetRect.height + 8}px`,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.5)',
                        borderRadius: '8px',
                        border: '2px solid rgb(59, 130, 246)',
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                className="fixed z-[10000] bg-white rounded-lg shadow-2xl max-w-md w-full mx-4"
                style={getTooltipPosition()}
            >
                <div className="p-6">
                    {/* Progress indicator */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1">
                            {steps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-1.5 rounded-full transition-all ${
                                        index === currentStep
                                            ? 'w-8 bg-blue-600'
                                            : index < currentStep
                                            ? 'w-1.5 bg-blue-400'
                                            : 'w-1.5 bg-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={onSkip}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label="Skip tutorial"
                        >
                            Skip
                        </button>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-6">{step.content}</p>

                    {/* Navigation */}
                    <div className="flex gap-3">
                        {!isFirstStep && (
                            <Button variant="outline" onClick={onPrevious} className="flex-1">
                                Previous
                            </Button>
                        )}
                        <Button
                            onClick={isLastStep ? onComplete : onNext}
                            className="flex-1"
                        >
                            {isLastStep ? 'Finish' : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
