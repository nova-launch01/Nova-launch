import { useState, useEffect, useCallback } from 'react';
import type { TutorialStep } from './TutorialOverlay';

const TUTORIAL_STORAGE_KEY = 'stellar_tutorial_completed';

export function useTutorial(steps: TutorialStep[]) {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [hasCompletedBefore, setHasCompletedBefore] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
        setHasCompletedBefore(completed === 'true');
    }, []);

    const start = useCallback(() => {
        setIsActive(true);
        setCurrentStep(0);
    }, []);

    const next = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    }, [currentStep, steps.length]);

    const previous = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [currentStep]);

    const skip = useCallback(() => {
        setIsActive(false);
        setCurrentStep(0);
        localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
        setHasCompletedBefore(true);
    }, []);

    const complete = useCallback(() => {
        setIsActive(false);
        setCurrentStep(0);
        localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
        setHasCompletedBefore(true);
    }, []);

    const reset = useCallback(() => {
        localStorage.removeItem(TUTORIAL_STORAGE_KEY);
        setHasCompletedBefore(false);
        setCurrentStep(0);
    }, []);

    return {
        isActive,
        currentStep,
        hasCompletedBefore,
        start,
        next,
        previous,
        skip,
        complete,
        reset,
    };
}
