import { useState, useEffect } from 'react';
import { Button } from '../UI/Button';
import type { TutorialStep } from './TutorialOverlay';

interface MobileTutorialProps {
    steps: TutorialStep[];
    currentStep: number;
    onNext: () => void;
    onPrevious: () => void;
    onSkip: () => void;
    onComplete: () => void;
    isActive: boolean;
}

/**
 * Mobile-optimized tutorial component
 * Uses bottom sheet design pattern for better mobile UX
 */
export function MobileTutorial({
    steps,
    currentStep,
    onNext,
    onPrevious,
    onSkip,
    onComplete,
    isActive,
}: MobileTutorialProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    
    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    useEffect(() => {
        if (isActive) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isActive]);

    // Swipe gesture handling
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && !isLastStep) {
            onNext();
        }
        if (isRightSwipe && !isFirstStep) {
            onPrevious();
        }

        setTouchStart(0);
        setTouchEnd(0);
    };

    if (!isActive || !step) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9998] bg-black bg-opacity-50 transition-opacity md:hidden"
                onClick={onSkip}
            />

            {/* Bottom Sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[10000] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 md:hidden ${
                    isVisible ? 'translate-y-0' : 'translate-y-full'
                }`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                <div className="px-6 pb-8 pt-2">
                    {/* Progress */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                {steps.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-2 rounded-full transition-all ${
                                            index === currentStep
                                                ? 'w-8 bg-blue-600'
                                                : index < currentStep
                                                ? 'w-2 bg-blue-400'
                                                : 'w-2 bg-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 font-medium">
                                {currentStep + 1}/{steps.length}
                            </span>
                        </div>
                        <button
                            onClick={onSkip}
                            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                        >
                            Skip
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h2>
                        <p className="text-base text-gray-600 leading-relaxed">{step.content}</p>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3">
                        {!isFirstStep && (
                            <Button
                                variant="outline"
                                onClick={onPrevious}
                                className="flex-1"
                                size="lg"
                            >
                                Back
                            </Button>
                        )}
                        <Button
                            onClick={isLastStep ? onComplete : onNext}
                            className="flex-1"
                            size="lg"
                        >
                            {isLastStep ? 'Finish' : 'Next'}
                        </Button>
                    </div>

                    {/* Swipe hint */}
                    <p className="text-xs text-gray-400 text-center mt-4">
                        Swipe left or right to navigate
                    </p>
                </div>
            </div>
        </>
    );
}
