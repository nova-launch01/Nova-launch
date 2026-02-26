import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { TutorialStep } from './TutorialOverlay';
import { tutorialAnalytics } from './tutorialAnalytics';
import { TutorialProgressManager } from './tutorialProgress';

interface TutorialContextValue {
    isActive: boolean;
    currentStep: number;
    hasCompletedBefore: boolean;
    steps: TutorialStep[];
    start: () => void;
    next: () => void;
    previous: () => void;
    skip: () => void;
    complete: () => void;
    reset: () => void;
    goToStep: (stepIndex: number) => void;
    setSteps: (steps: TutorialStep[]) => void;
}

const TutorialContext = createContext<TutorialContextValue | undefined>(undefined);

interface TutorialProviderProps {
    children: ReactNode;
    initialSteps?: TutorialStep[];
    autoStart?: boolean;
    autoStartDelay?: number;
}

const TUTORIAL_STORAGE_KEY = 'stellar_tutorial_completed';

export function TutorialProvider({
    children,
    initialSteps = [],
    autoStart = false,
    autoStartDelay = 1000,
}: TutorialProviderProps) {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [hasCompletedBefore, setHasCompletedBefore] = useState(false);
    const [steps, setSteps] = useState<TutorialStep[]>(initialSteps);

    useEffect(() => {
        const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
        setHasCompletedBefore(completed === 'true');

        // Auto-start if enabled and not completed
        if (autoStart && completed !== 'true') {
            const timer = setTimeout(() => {
                start();
            }, autoStartDelay);
            return () => clearTimeout(timer);
        }
    }, [autoStart, autoStartDelay]);

    // Track step views
    useEffect(() => {
        if (isActive && steps[currentStep]) {
            tutorialAnalytics.viewStep(steps[currentStep].id, currentStep);
        }
    }, [isActive, currentStep, steps]);

    // Save progress
    useEffect(() => {
        if (isActive) {
            TutorialProgressManager.save({
                currentStep,
                lastUpdated: Date.now(),
                isActive: true,
            });
        }
    }, [isActive, currentStep]);

    const start = useCallback(() => {
        setIsActive(true);
        setCurrentStep(0);
        tutorialAnalytics.start();
    }, []);

    const next = useCallback(() => {
        if (currentStep < steps.length - 1) {
            tutorialAnalytics.completeStep(steps[currentStep].id, currentStep);
            setCurrentStep((prev) => prev + 1);
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
        TutorialProgressManager.clear();
    }, []);

    const complete = useCallback(() => {
        tutorialAnalytics.complete();
        setIsActive(false);
        setCurrentStep(0);
        localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
        setHasCompletedBefore(true);
        TutorialProgressManager.clear();
    }, []);

    const reset = useCallback(() => {
        localStorage.removeItem(TUTORIAL_STORAGE_KEY);
        setHasCompletedBefore(false);
        setCurrentStep(0);
        TutorialProgressManager.clear();
    }, []);

    const goToStep = useCallback((stepIndex: number) => {
        if (stepIndex >= 0 && stepIndex < steps.length) {
            setCurrentStep(stepIndex);
        }
    }, [steps.length]);

    const value: TutorialContextValue = {
        isActive,
        currentStep,
        hasCompletedBefore,
        steps,
        start,
        next,
        previous,
        skip,
        complete,
        reset,
        goToStep,
        setSteps,
    };

    return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}

export function useTutorialContext() {
    const context = useContext(TutorialContext);
    if (context === undefined) {
        throw new Error('useTutorialContext must be used within a TutorialProvider');
    }
    return context;
}
