/**
 * Tutorial Recorder
 * Records user interactions to help create tutorials automatically
 */

export interface RecordedAction {
    type: 'click' | 'input' | 'scroll' | 'navigate';
    timestamp: number;
    target: {
        selector: string;
        text?: string;
        value?: string;
    };
    position?: {
        x: number;
        y: number;
    };
}

export interface RecordedSession {
    id: string;
    startTime: number;
    endTime?: number;
    actions: RecordedAction[];
    url: string;
}

export class TutorialRecorder {
    private isRecording = false;
    private session: RecordedSession | null = null;
    private listeners: Array<() => void> = [];

    /**
     * Start recording user interactions
     */
    start(): void {
        if (this.isRecording) {
            console.warn('Recording already in progress');
            return;
        }

        this.session = {
            id: `session-${Date.now()}`,
            startTime: Date.now(),
            actions: [],
            url: window.location.href,
        };

        this.isRecording = true;
        this.attachListeners();
        console.log('Tutorial recording started');
    }

    /**
     * Stop recording
     */
    stop(): RecordedSession | null {
        if (!this.isRecording || !this.session) {
            console.warn('No recording in progress');
            return null;
        }

        this.session.endTime = Date.now();
        this.isRecording = false;
        this.removeListeners();

        const session = this.session;
        this.session = null;

        console.log('Tutorial recording stopped', session);
        return session;
    }

    /**
     * Check if currently recording
     */
    isActive(): boolean {
        return this.isRecording;
    }

    /**
     * Get current session
     */
    getCurrentSession(): RecordedSession | null {
        return this.session;
    }

    /**
     * Attach event listeners
     */
    private attachListeners(): void {
        const handleClick = (e: MouseEvent) => {
            if (!this.isRecording || !this.session) return;

            const target = e.target as HTMLElement;
            const selector = this.getSelector(target);

            this.session.actions.push({
                type: 'click',
                timestamp: Date.now(),
                target: {
                    selector,
                    text: target.textContent?.trim().substring(0, 50),
                },
                position: {
                    x: e.clientX,
                    y: e.clientY,
                },
            });
        };

        const handleInput = (e: Event) => {
            if (!this.isRecording || !this.session) return;

            const target = e.target as HTMLInputElement;
            const selector = this.getSelector(target);

            this.session.actions.push({
                type: 'input',
                timestamp: Date.now(),
                target: {
                    selector,
                    value: target.value.substring(0, 50),
                },
            });
        };

        const handleScroll = () => {
            if (!this.isRecording || !this.session) return;

            this.session.actions.push({
                type: 'scroll',
                timestamp: Date.now(),
                target: {
                    selector: 'window',
                },
                position: {
                    x: window.scrollX,
                    y: window.scrollY,
                },
            });
        };

        document.addEventListener('click', handleClick, true);
        document.addEventListener('input', handleInput, true);
        window.addEventListener('scroll', handleScroll, { passive: true });

        this.listeners = [
            () => document.removeEventListener('click', handleClick, true),
            () => document.removeEventListener('input', handleInput, true),
            () => window.removeEventListener('scroll', handleScroll),
        ];
    }

    /**
     * Remove event listeners
     */
    private removeListeners(): void {
        this.listeners.forEach((remove) => remove());
        this.listeners = [];
    }

    /**
     * Generate a CSS selector for an element
     */
    private getSelector(element: HTMLElement): string {
        // Try data-tutorial attribute first
        if (element.hasAttribute('data-tutorial')) {
            return `[data-tutorial="${element.getAttribute('data-tutorial')}"]`;
        }

        // Try ID
        if (element.id) {
            return `#${element.id}`;
        }

        // Try unique class combination
        if (element.className) {
            const classes = Array.from(element.classList)
                .filter((c) => !c.startsWith('hover:') && !c.startsWith('focus:'))
                .slice(0, 3)
                .join('.');
            if (classes) {
                return `.${classes}`;
            }
        }

        // Fallback to tag name with nth-child
        const parent = element.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children);
            const index = siblings.indexOf(element) + 1;
            return `${element.tagName.toLowerCase()}:nth-child(${index})`;
        }

        return element.tagName.toLowerCase();
    }

    /**
     * Export session as JSON
     */
    exportSession(session: RecordedSession): string {
        return JSON.stringify(session, null, 2);
    }

    /**
     * Import session from JSON
     */
    importSession(json: string): RecordedSession {
        return JSON.parse(json) as RecordedSession;
    }

    /**
     * Generate tutorial steps from recorded session
     */
    generateTutorialSteps(session: RecordedSession): Array<{
        title: string;
        content: string;
        targetSelector: string;
    }> {
        const steps: Array<{ title: string; content: string; targetSelector: string }> = [];
        const clickActions = session.actions.filter((a) => a.type === 'click');

        clickActions.forEach((action, index) => {
            steps.push({
                title: `Step ${index + 1}`,
                content: action.target.text
                    ? `Click on "${action.target.text}"`
                    : `Click on this element`,
                targetSelector: action.target.selector,
            });
        });

        return steps;
    }

    /**
     * Save session to localStorage
     */
    saveSession(session: RecordedSession): void {
        try {
            const sessions = this.getSavedSessions();
            sessions.push(session);
            localStorage.setItem('tutorial_recorded_sessions', JSON.stringify(sessions));
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    }

    /**
     * Get all saved sessions
     */
    getSavedSessions(): RecordedSession[] {
        try {
            const data = localStorage.getItem('tutorial_recorded_sessions');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    /**
     * Clear all saved sessions
     */
    clearSavedSessions(): void {
        localStorage.removeItem('tutorial_recorded_sessions');
    }
}

// Singleton instance
export const tutorialRecorder = new TutorialRecorder();
