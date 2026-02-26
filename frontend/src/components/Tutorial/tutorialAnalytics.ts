/**
 * Tutorial Analytics Tracker
 * Tracks user interactions with the tutorial for insights and improvements
 */

export interface TutorialEvent {
    type: 'started' | 'step_viewed' | 'step_completed' | 'skipped' | 'completed';
    stepId?: string;
    stepIndex?: number;
    timestamp: number;
    timeSpent?: number;
}

class TutorialAnalytics {
    private events: TutorialEvent[] = [];
    private stepStartTime: number | null = null;
    private tutorialStartTime: number | null = null;

    start() {
        this.tutorialStartTime = Date.now();
        this.logEvent({ type: 'started', timestamp: Date.now() });
    }

    viewStep(stepId: string, stepIndex: number) {
        this.stepStartTime = Date.now();
        this.logEvent({
            type: 'step_viewed',
            stepId,
            stepIndex,
            timestamp: Date.now(),
        });
    }

    completeStep(stepId: string, stepIndex: number) {
        const timeSpent = this.stepStartTime ? Date.now() - this.stepStartTime : 0;
        this.logEvent({
            type: 'step_completed',
            stepId,
            stepIndex,
            timestamp: Date.now(),
            timeSpent,
        });
    }

    skip() {
        const timeSpent = this.tutorialStartTime ? Date.now() - this.tutorialStartTime : 0;
        this.logEvent({
            type: 'skipped',
            timestamp: Date.now(),
            timeSpent,
        });
        this.saveToStorage();
    }

    complete() {
        const timeSpent = this.tutorialStartTime ? Date.now() - this.tutorialStartTime : 0;
        this.logEvent({
            type: 'completed',
            timestamp: Date.now(),
            timeSpent,
        });
        this.saveToStorage();
    }

    private logEvent(event: TutorialEvent) {
        this.events.push(event);
    }

    private saveToStorage() {
        try {
            const existingData = localStorage.getItem('stellar_tutorial_analytics');
            const allEvents = existingData ? JSON.parse(existingData) : [];
            allEvents.push(...this.events);
            localStorage.setItem('stellar_tutorial_analytics', JSON.stringify(allEvents));
        } catch (error) {
            console.warn('Failed to save tutorial analytics:', error);
        }
    }

    getStats() {
        return {
            events: this.events,
            totalTime: this.tutorialStartTime ? Date.now() - this.tutorialStartTime : 0,
        };
    }

    getStoredAnalytics(): TutorialEvent[] {
        try {
            const data = localStorage.getItem('stellar_tutorial_analytics');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    clearAnalytics() {
        localStorage.removeItem('stellar_tutorial_analytics');
    }
}

export const tutorialAnalytics = new TutorialAnalytics();
