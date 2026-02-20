import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tutorialAnalytics, TutorialEvent } from '../tutorialAnalytics';

describe('TutorialAnalytics', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should track tutorial start', () => {
        tutorialAnalytics.start();
        const stats = tutorialAnalytics.getStats();
        
        expect(stats.events).toHaveLength(1);
        expect(stats.events[0].type).toBe('started');
    });

    it('should track step views', () => {
        tutorialAnalytics.start();
        tutorialAnalytics.viewStep('step-1', 0);
        
        const stats = tutorialAnalytics.getStats();
        expect(stats.events).toHaveLength(2);
        expect(stats.events[1].type).toBe('step_viewed');
        expect(stats.events[1].stepId).toBe('step-1');
        expect(stats.events[1].stepIndex).toBe(0);
    });

    it('should track step completion with time spent', () => {
        tutorialAnalytics.start();
        tutorialAnalytics.viewStep('step-1', 0);
        
        // Simulate time passing
        setTimeout(() => {
            tutorialAnalytics.completeStep('step-1', 0);
            
            const stats = tutorialAnalytics.getStats();
            const completeEvent = stats.events.find(e => e.type === 'step_completed');
            
            expect(completeEvent).toBeDefined();
            expect(completeEvent?.timeSpent).toBeGreaterThan(0);
        }, 100);
    });

    it('should track tutorial skip', () => {
        tutorialAnalytics.start();
        tutorialAnalytics.skip();
        
        const stored = tutorialAnalytics.getStoredAnalytics();
        const skipEvent = stored.find(e => e.type === 'skipped');
        
        expect(skipEvent).toBeDefined();
        expect(skipEvent?.timeSpent).toBeGreaterThanOrEqual(0);
    });

    it('should track tutorial completion', () => {
        tutorialAnalytics.start();
        tutorialAnalytics.complete();
        
        const stored = tutorialAnalytics.getStoredAnalytics();
        const completeEvent = stored.find(e => e.type === 'completed');
        
        expect(completeEvent).toBeDefined();
    });

    it('should save events to localStorage', () => {
        tutorialAnalytics.start();
        tutorialAnalytics.complete();
        
        const stored = localStorage.getItem('stellar_tutorial_analytics');
        expect(stored).toBeTruthy();
        
        const events = JSON.parse(stored!) as TutorialEvent[];
        expect(events.length).toBeGreaterThan(0);
    });

    it('should clear analytics', () => {
        tutorialAnalytics.start();
        tutorialAnalytics.complete();
        
        tutorialAnalytics.clearAnalytics();
        
        const stored = localStorage.getItem('stellar_tutorial_analytics');
        expect(stored).toBeNull();
    });

    it('should calculate total time', () => {
        tutorialAnalytics.start();
        
        setTimeout(() => {
            const stats = tutorialAnalytics.getStats();
            expect(stats.totalTime).toBeGreaterThan(0);
        }, 100);
    });
});
