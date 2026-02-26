/**
 * Tutorial Progress Manager
 * Saves and restores tutorial progress so users can resume where they left off
 */

const PROGRESS_KEY = 'stellar_tutorial_progress';

export interface TutorialProgress {
    currentStep: number;
    lastUpdated: number;
    isActive: boolean;
}

export class TutorialProgressManager {
    static save(progress: TutorialProgress): void {
        try {
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
        } catch (error) {
            console.warn('Failed to save tutorial progress:', error);
        }
    }

    static load(): TutorialProgress | null {
        try {
            const data = localStorage.getItem(PROGRESS_KEY);
            if (!data) return null;

            const progress = JSON.parse(data) as TutorialProgress;
            
            // Only restore if progress is recent (within 24 hours)
            const hoursSinceUpdate = (Date.now() - progress.lastUpdated) / (1000 * 60 * 60);
            if (hoursSinceUpdate > 24) {
                this.clear();
                return null;
            }

            return progress;
        } catch {
            return null;
        }
    }

    static clear(): void {
        localStorage.removeItem(PROGRESS_KEY);
    }

    static hasProgress(): boolean {
        return this.load() !== null;
    }
}
