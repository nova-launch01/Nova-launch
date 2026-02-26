import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TutorialProgressManager, TutorialProgress } from '../tutorialProgress';

describe('TutorialProgressManager', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should save progress', () => {
        const progress: TutorialProgress = {
            currentStep: 2,
            lastUpdated: Date.now(),
            isActive: true,
        };

        TutorialProgressManager.save(progress);
        
        const stored = localStorage.getItem('stellar_tutorial_progress');
        expect(stored).toBeTruthy();
        
        const parsed = JSON.parse(stored!) as TutorialProgress;
        expect(parsed.currentStep).toBe(2);
        expect(parsed.isActive).toBe(true);
    });

    it('should load progress', () => {
        const progress: TutorialProgress = {
            currentStep: 3,
            lastUpdated: Date.now(),
            isActive: true,
        };

        TutorialProgressManager.save(progress);
        const loaded = TutorialProgressManager.load();
        
        expect(loaded).toBeTruthy();
        expect(loaded?.currentStep).toBe(3);
        expect(loaded?.isActive).toBe(true);
    });

    it('should return null for expired progress', () => {
        const progress: TutorialProgress = {
            currentStep: 2,
            lastUpdated: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
            isActive: true,
        };

        TutorialProgressManager.save(progress);
        const loaded = TutorialProgressManager.load();
        
        expect(loaded).toBeNull();
    });

    it('should clear progress', () => {
        const progress: TutorialProgress = {
            currentStep: 2,
            lastUpdated: Date.now(),
            isActive: true,
        };

        TutorialProgressManager.save(progress);
        TutorialProgressManager.clear();
        
        const stored = localStorage.getItem('stellar_tutorial_progress');
        expect(stored).toBeNull();
    });

    it('should check if progress exists', () => {
        expect(TutorialProgressManager.hasProgress()).toBe(false);
        
        const progress: TutorialProgress = {
            currentStep: 1,
            lastUpdated: Date.now(),
            isActive: true,
        };

        TutorialProgressManager.save(progress);
        expect(TutorialProgressManager.hasProgress()).toBe(true);
    });

    it('should handle corrupted data gracefully', () => {
        localStorage.setItem('stellar_tutorial_progress', 'invalid json');
        
        const loaded = TutorialProgressManager.load();
        expect(loaded).toBeNull();
    });

    it('should load recent progress within 24 hours', () => {
        const progress: TutorialProgress = {
            currentStep: 4,
            lastUpdated: Date.now() - (23 * 60 * 60 * 1000), // 23 hours ago
            isActive: true,
        };

        TutorialProgressManager.save(progress);
        const loaded = TutorialProgressManager.load();
        
        expect(loaded).toBeTruthy();
        expect(loaded?.currentStep).toBe(4);
    });
});
