import type { TutorialStep } from './TutorialOverlay';

/**
 * Tutorial Builder - Fluent API for creating tutorial flows
 * Makes it easy to create custom tutorials programmatically
 */
export class TutorialBuilder {
    private steps: TutorialStep[] = [];

    /**
     * Add a welcome step (no target element)
     */
    welcome(title: string, content: string): this {
        this.steps.push({
            id: `welcome-${this.steps.length}`,
            title,
            content,
            position: 'bottom',
        });
        return this;
    }

    /**
     * Add a step that highlights an element
     */
    highlight(
        title: string,
        content: string,
        targetSelector: string,
        position: 'top' | 'bottom' | 'left' | 'right' = 'bottom'
    ): this {
        this.steps.push({
            id: `step-${this.steps.length}`,
            title,
            content,
            targetSelector,
            position,
        });
        return this;
    }

    /**
     * Add a step that waits for user action
     */
    waitFor(title: string, content: string, targetSelector: string): this {
        this.steps.push({
            id: `wait-${this.steps.length}`,
            title,
            content,
            targetSelector,
            action: 'wait',
        });
        return this;
    }

    /**
     * Add a completion step
     */
    complete(title: string, content: string): this {
        this.steps.push({
            id: `complete-${this.steps.length}`,
            title,
            content,
            position: 'bottom',
        });
        return this;
    }

    /**
     * Add a custom step
     */
    custom(step: TutorialStep): this {
        this.steps.push(step);
        return this;
    }

    /**
     * Build and return the tutorial steps
     */
    build(): TutorialStep[] {
        return this.steps;
    }

    /**
     * Get the number of steps
     */
    count(): number {
        return this.steps.length;
    }

    /**
     * Clear all steps
     */
    clear(): this {
        this.steps = [];
        return this;
    }

    /**
     * Remove a step by index
     */
    removeStep(index: number): this {
        if (index >= 0 && index < this.steps.length) {
            this.steps.splice(index, 1);
        }
        return this;
    }

    /**
     * Insert a step at a specific position
     */
    insertStep(index: number, step: TutorialStep): this {
        if (index >= 0 && index <= this.steps.length) {
            this.steps.splice(index, 0, step);
        }
        return this;
    }

    /**
     * Update a step by index
     */
    updateStep(index: number, updates: Partial<TutorialStep>): this {
        if (index >= 0 && index < this.steps.length) {
            this.steps[index] = { ...this.steps[index], ...updates };
        }
        return this;
    }

    /**
     * Clone this builder
     */
    clone(): TutorialBuilder {
        const builder = new TutorialBuilder();
        builder.steps = [...this.steps];
        return builder;
    }
}

/**
 * Create a new tutorial builder
 */
export function createTutorial(): TutorialBuilder {
    return new TutorialBuilder();
}

/**
 * Pre-built tutorial templates
 */
export const TutorialTemplates = {
    /**
     * Basic onboarding template
     */
    basicOnboarding: () =>
        createTutorial()
            .welcome('Welcome!', 'Let\'s get you started with a quick tour.')
            .highlight('Navigation', 'This is the main navigation menu.', '[data-tutorial="nav"]', 'bottom')
            .highlight('Actions', 'Here you can perform key actions.', '[data-tutorial="actions"]', 'left')
            .complete('All Set!', 'You\'re ready to go. Enjoy the app!')
            .build(),

    /**
     * Feature introduction template
     */
    featureIntro: (featureName: string, selector: string) =>
        createTutorial()
            .welcome(`New Feature: ${featureName}`, `We've added a new feature. Let us show you how it works.`)
            .highlight('Here it is', `This is the new ${featureName} feature.`, selector, 'bottom')
            .complete('Try it out!', `Feel free to explore the new ${featureName} feature.`)
            .build(),

    /**
     * Form walkthrough template
     */
    formWalkthrough: (formFields: Array<{ name: string; selector: string; description: string }>) => {
        const builder = createTutorial().welcome('Fill out the form', 'Let\'s walk through each field.');
        
        formFields.forEach((field) => {
            builder.highlight(field.name, field.description, field.selector, 'top');
        });
        
        return builder
            .highlight('Submit', 'When you\'re done, click submit.', '[data-tutorial="submit"]', 'top')
            .complete('Form Complete', 'You now know how to fill out this form.')
            .build();
    },
};

/**
 * Example usage:
 * 
 * const tutorial = createTutorial()
 *   .welcome('Welcome to Token Deployer', 'Let\'s deploy your first token!')
 *   .highlight('Connect Wallet', 'First, connect your wallet', '[data-tutorial="wallet"]')
 *   .highlight('Token Form', 'Fill in your token details', '[data-tutorial="form"]')
 *   .complete('Ready!', 'You\'re all set to deploy tokens!')
 *   .build();
 */
