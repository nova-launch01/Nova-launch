import { useState, useEffect, useCallback } from 'react';
import type { TutorialStep } from './TutorialOverlay';
import { tutorialAnalytics } from './tutorialAnalytics';

const TUTORIAL_STORAGE_KEY = 'stellar_tutorial_completed';

export function useTutorial(steps: TutorialStep[]) {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [hasCompletedBefore, setHasCompletedBefore] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
        setHasCompletedBefore(completed === 'true');
    }, []);

    // Track step views
    useEffect(() => {
        if (isActive && steps[currentStep]) {
            tutorialAnalytics.viewStep(steps[currentStep].id, currentStep);
        }
    }, [isActive, currentStep, steps]);

    const start = useCallback(() => {
        setIsActive(true);
        setCurrentStep(0);
        tutorialAnalytics.start();
    }, []);

    const next = useCallback(() => {
        if (currentStep < steps.length - 1) {
            tutorialAnalytics.completeStep(steps[currentStep].id, currentStep);
            setCurrentStep((prev) => prev + 1);
            tutorialAnalytics.viewStep(steps[currentStep + 1].id, currentStep + 1);
        }
    }, [currentStep, steps]);

    const previous = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [currentStep]);

    const skip = useCallback(() => {
        tutorialAnalytics.skip();
        setIsActive(false);
        setCurrentStep(0);
        localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
        setHasCompletedBefore(true);
    }, []);

    const complete = useCallback(() => {
        tutorialAnalytics.complete();
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
