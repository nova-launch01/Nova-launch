import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTutorial } from '../useTutorial';
import type { TutorialStep } from '../TutorialOverlay';

const mockSteps: TutorialStep[] = [
    { id: 'step1', title: 'Step 1', content: 'Content 1' },
    { id: 'step2', title: 'Step 2', content: 'Content 2' },
    { id: 'step3', title: 'Step 3', content: 'Content 3' },
];

describe('useTutorial', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should initialize with correct default state', () => {
        const { result } = renderHook(() => useTutorial(mockSteps));

        expect(result.current.isActive).toBe(false);
        expect(result.current.currentStep).toBe(0);
        expect(result.current.hasCompletedBefore).toBe(false);
    });

    it('should start tutorial', () => {
        const { result } = renderHook(() => useTutorial(mockSteps));

        act(() => {
            result.current.start();
        });

        expect(result.current.isActive).toBe(true);
        expect(result.current.currentStep).toBe(0);
    });

    it('should navigate to next step', () => {
        const { result } = renderHook(() => useTutorial(mockSteps));

        act(() => {
            result.current.start();
        });

        act(() => {
            result.current.next();
        });

        expect(result.current.currentStep).toBe(1);
    });

    it('should navigate to previous step', () => {
        const { result } = renderHook(() => useTutorial(mockSteps));

        act(() => {
            result.current.start();
            result.current.next();
            result.current.next();
        });

        expect(result.current.currentStep).toBe(2);

        act(() => {
            result.current.previous();
        });

        expect(result.current.currentStep).toBe(1);
    });

    it('should not go beyond last step', () => {
        const { result } = renderHook(() => useTutorial(mockSteps));

        act(() => {
            result.current.start();
            result.current.next();
            result.current.next();
            result.current.next();
        });

        expect(result.current.currentStep).toBe(2);
    });

    it('should not go before first step', () => {
        const { result } = renderHook(() => useTutorial(mockSteps));

        act(() => {
            result.current.start();
            result.current.previous();
        });

        expect(result.current.currentStep).toBe(0);
    });

    it('should skip tutorial and mark as completed', () => {
        const { result } = renderHook(() => useTutorial(mockSteps));

        act(() => {
            result.current.start();
            result.current.skip();
        });

        expect(result.current.isActive).toBe(false);
        expect(result.current.hasCompletedBefore).toBe(true);
        expect(localStorage.getItem('stellar_tutorial_completed')).toBe('true');
    });

    it('should complete tutorial and mark as completed', () => {
        const { result } = renderHook(() => useTutorial(mockSteps));

        act(() => {
            result.current.start();
            result.current.complete();
        });

        expect(result.current.isActive).toBe(false);
        expect(result.current.hasCompletedBefore).toBe(true);
        expect(localStorage.getItem('stellar_tutorial_completed')).toBe('true');
    });

    it('should reset completion status', () => {
        const { result } = renderHook(() => useTutorial(mockSteps));

        act(() => {
            result.current.start();
            result.current.complete();
        });

        expect(result.current.hasCompletedBefore).toBe(true);

        act(() => {
            result.current.reset();
        });

        expect(result.current.hasCompletedBefore).toBe(false);
        expect(localStorage.getItem('stellar_tutorial_completed')).toBeNull();
    });

    it('should load completion status from localStorage', () => {
        localStorage.setItem('stellar_tutorial_completed', 'true');

        const { result } = renderHook(() => useTutorial(mockSteps));

        expect(result.current.hasCompletedBefore).toBe(true);
    });
});
