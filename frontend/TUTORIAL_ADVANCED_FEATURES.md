# Tutorial System - Advanced Features

## Overview

This document covers the advanced features added to the tutorial system, including mobile optimization, context API, tutorial builder, recorder, and debugger tools.

## New Components

### 1. TutorialTooltip

A standalone tooltip component for creating custom tutorial flows.

**Features:**
- Auto-positioning (smart placement based on available space)
- Manual position control (top, bottom, left, right)
- Arrow pointer
- Viewport boundary detection
- Responsive to window resize and scroll

**Usage:**
```tsx
import { TutorialTooltip } from './components/Tutorial';

<TutorialTooltip
    title="Welcome"
    content="This is a custom tooltip"
    targetElement={document.querySelector('#my-element')}
    position="auto"
    onNext={handleNext}
    onPrevious={handlePrevious}
    onSkip={handleSkip}
/>
```

### 2. MobileTutorial

Mobile-optimized tutorial using bottom sheet design pattern.

**Features:**
- Bottom sheet UI (native mobile feel)
- Swipe gestures (left/right to navigate)
- Touch-friendly buttons
- Larger text and spacing
- Pull-down handle
- Backdrop dismiss

**Usage:**
```tsx
import { MobileTutorial } from './components/Tutorial';

<MobileTutorial
    steps={steps}
    currentStep={currentStep}
    onNext={handleNext}
    onPrevious={handlePrevious}
    onSkip={handleSkip}
    onComplete={handleComplete}
    isActive={isActive}
/>
```

**Gestures:**
- Swipe left: Next step
- Swipe right: Previous step
- Tap backdrop: Skip tutorial

### 3. TutorialContext & Provider

React Context API for global tutorial state management.

**Features:**
- Centralized state
- Auto-start configuration
- Progress persistence
- Analytics integration
- Step navigation
- Dynamic step updates

**Usage:**
```tsx
import { TutorialProvider, useTutorialContext } from './components/Tutorial';

// Wrap your app
<TutorialProvider
    initialSteps={deploymentTutorialSteps}
    autoStart={true}
    autoStartDelay={1000}
>
    <App />
</TutorialProvider>

// Use in any component
function MyComponent() {
    const tutorial = useTutorialContext();
    
    return (
        <button onClick={tutorial.start}>
            Start Tutorial
        </button>
    );
}
```

**API:**
```typescript
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
```

## Development Tools

### 4. TutorialBuilder

Fluent API for creating tutorials programmatically.

**Features:**
- Chainable methods
- Pre-built templates
- Step manipulation (add, remove, update, insert)
- Clone and modify
- Type-safe

**Usage:**
```typescript
import { createTutorial, TutorialTemplates } from './components/Tutorial';

// Build custom tutorial
const tutorial = createTutorial()
    .welcome('Welcome!', 'Let\'s get started')
    .highlight('Button', 'Click this button', '[data-tutorial="btn"]', 'bottom')
    .waitFor('Action', 'Complete this action', '[data-tutorial="action"]')
    .complete('Done!', 'You\'re all set!')
    .build();

// Use template
const onboarding = TutorialTemplates.basicOnboarding();

// Form walkthrough
const formTutorial = TutorialTemplates.formWalkthrough([
    { name: 'Name', selector: '#name', description: 'Enter your name' },
    { name: 'Email', selector: '#email', description: 'Enter your email' },
]);
```

**Methods:**
- `welcome(title, content)` - Add welcome step
- `highlight(title, content, selector, position)` - Highlight element
- `waitFor(title, content, selector)` - Wait for user action
- `complete(title, content)` - Add completion step
- `custom(step)` - Add custom step
- `build()` - Get tutorial steps
- `count()` - Get step count
- `clear()` - Remove all steps
- `removeStep(index)` - Remove specific step
- `insertStep(index, step)` - Insert step at position
- `updateStep(index, updates)` - Update step
- `clone()` - Clone builder

### 5. TutorialRecorder

Records user interactions to generate tutorials automatically.

**Features:**
- Click tracking
- Input tracking
- Scroll tracking
- Navigation tracking
- Session export/import
- Auto-generate tutorial steps
- Save/load sessions

**Usage:**
```typescript
import { tutorialRecorder } from './components/Tutorial';

// Start recording
tutorialRecorder.start();

// User interacts with app...

// Stop recording
const session = tutorialRecorder.stop();

// Generate tutorial steps
const steps = tutorialRecorder.generateTutorialSteps(session);

// Export session
const json = tutorialRecorder.exportSession(session);

// Save for later
tutorialRecorder.saveSession(session);

// Load saved sessions
const sessions = tutorialRecorder.getSavedSessions();
```

**Recorded Data:**
```typescript
interface RecordedAction {
    type: 'click' | 'input' | 'scroll' | 'navigate';
    timestamp: number;
    target: {
        selector: string;
        text?: string;
        value?: string;
    };
    position?: { x: number; y: number };
}
```

### 6. TutorialDebugger

Visual debugging tool for development.

**Features:**
- Analytics viewer
- Session recorder UI
- Progress inspector
- Export/import tools
- Clear data options
- Real-time recording status

**Usage:**
```tsx
import { TutorialDebugger } from './components/Tutorial';

function DevTools() {
    const [showDebugger, setShowDebugger] = useState(false);
    
    return (
        <>
            <button onClick={() => setShowDebugger(true)}>
                Debug Tutorial
            </button>
            
            <TutorialDebugger
                isOpen={showDebugger}
                onClose={() => setShowDebugger(false)}
            />
        </>
    );
}
```

**Tabs:**
1. **Analytics** - View all tracked events
2. **Recorder** - Record and export sessions
3. **Progress** - Inspect saved progress

## Advanced Patterns

### Conditional Tutorials

Show different tutorials based on user type:

```typescript
const tutorial = createTutorial();

if (user.isNewUser) {
    tutorial
        .welcome('Welcome!', 'First time here?')
        .highlight('Basics', 'Learn the basics', '[data-tutorial="basics"]');
} else {
    tutorial
        .welcome('What\'s New', 'Check out new features')
        .highlight('New Feature', 'Try this', '[data-tutorial="new"]');
}

const steps = tutorial.build();
```

### Multi-Step Forms

Guide users through complex forms:

```typescript
const formFields = [
    { name: 'Personal Info', selector: '#personal', description: 'Your details' },
    { name: 'Address', selector: '#address', description: 'Where you live' },
    { name: 'Payment', selector: '#payment', description: 'Payment method' },
];

const tutorial = TutorialTemplates.formWalkthrough(formFields);
```

### Feature Announcements

Introduce new features:

```typescript
const featureTutorial = TutorialTemplates.featureIntro(
    'Dark Mode',
    '[data-tutorial="theme-toggle"]'
);
```

### Dynamic Step Updates

Update tutorial steps on the fly:

```typescript
const { setSteps, goToStep } = useTutorialContext();

// Add conditional step
if (userNeedsHelp) {
    const newSteps = [...steps, extraHelpStep];
    setSteps(newSteps);
}

// Jump to specific step
goToStep(3);
```

### Recording User Flows

Capture user interactions for tutorial creation:

```typescript
// Development mode
if (process.env.NODE_ENV === 'development') {
    // Start recording
    tutorialRecorder.start();
    
    // After user completes flow
    const session = tutorialRecorder.stop();
    const steps = tutorialRecorder.generateTutorialSteps(session);
    
    console.log('Generated tutorial:', steps);
}
```

## Mobile Optimization

### Responsive Tutorial

Automatically switch between desktop and mobile:

```tsx
import { TutorialOverlay, MobileTutorial } from './components/Tutorial';

function ResponsiveTutorial(props) {
    const isMobile = window.innerWidth < 768;
    
    return isMobile ? (
        <MobileTutorial {...props} />
    ) : (
        <TutorialOverlay {...props} />
    );
}
```

### Touch Gestures

Mobile tutorial supports:
- Swipe left/right for navigation
- Tap backdrop to dismiss
- Pull-down handle for visual feedback

## Performance Optimization

### Lazy Loading

Load tutorial components only when needed:

```tsx
import { lazy, Suspense } from 'react';

const TutorialOverlay = lazy(() => 
    import('./components/Tutorial').then(m => ({ default: m.TutorialOverlay }))
);

function App() {
    return (
        <Suspense fallback={null}>
            {showTutorial && <TutorialOverlay {...props} />}
        </Suspense>
    );
}
```

### Memoization

Prevent unnecessary re-renders:

```tsx
import { memo } from 'react';

const MemoizedTutorial = memo(TutorialOverlay, (prev, next) => {
    return prev.currentStep === next.currentStep && 
           prev.isActive === next.isActive;
});
```

## Testing

### Unit Tests

Test tutorial logic:

```typescript
import { TutorialBuilder } from './TutorialBuilder';

describe('TutorialBuilder', () => {
    it('should build tutorial with steps', () => {
        const tutorial = createTutorial()
            .welcome('Welcome', 'Hello')
            .complete('Done', 'Goodbye')
            .build();
        
        expect(tutorial).toHaveLength(2);
    });
});
```

### Integration Tests

Test tutorial flow:

```typescript
import { render, fireEvent } from '@testing-library/react';
import { TutorialProvider } from './TutorialContext';

test('tutorial navigation', () => {
    const { getByText } = render(
        <TutorialProvider initialSteps={steps}>
            <App />
        </TutorialProvider>
    );
    
    fireEvent.click(getByText('Next'));
    expect(getByText('Step 2')).toBeInTheDocument();
});
```

## Best Practices

### 1. Keep Steps Concise
- Max 2-3 sentences per step
- Focus on one action per step
- Use clear, actionable language

### 2. Use Data Attributes
```tsx
<button data-tutorial="submit-button">
    Submit
</button>
```

### 3. Test on Mobile
- Always test swipe gestures
- Verify bottom sheet behavior
- Check touch target sizes

### 4. Record Real Users
- Use recorder in beta testing
- Generate tutorials from actual usage
- Iterate based on recordings

### 5. Provide Skip Option
- Always allow users to skip
- Save progress for resumption
- Don't force completion

## Troubleshooting

### Recorder Not Capturing
- Check if recording is active: `tutorialRecorder.isActive()`
- Verify event listeners are attached
- Check console for errors

### Mobile Gestures Not Working
- Ensure touch events are not prevented
- Check z-index conflicts
- Verify swipe threshold (50px)

### Context Not Available
- Ensure component is wrapped in `TutorialProvider`
- Check provider is at correct level in tree
- Verify imports are correct

## API Reference

### TutorialBuilder
```typescript
class TutorialBuilder {
    welcome(title: string, content: string): this
    highlight(title: string, content: string, selector: string, position?: Position): this
    waitFor(title: string, content: string, selector: string): this
    complete(title: string, content: string): this
    custom(step: TutorialStep): this
    build(): TutorialStep[]
    count(): number
    clear(): this
    removeStep(index: number): this
    insertStep(index: number, step: TutorialStep): this
    updateStep(index: number, updates: Partial<TutorialStep>): this
    clone(): TutorialBuilder
}
```

### TutorialRecorder
```typescript
class TutorialRecorder {
    start(): void
    stop(): RecordedSession | null
    isActive(): boolean
    getCurrentSession(): RecordedSession | null
    exportSession(session: RecordedSession): string
    importSession(json: string): RecordedSession
    generateTutorialSteps(session: RecordedSession): TutorialStep[]
    saveSession(session: RecordedSession): void
    getSavedSessions(): RecordedSession[]
    clearSavedSessions(): void
}
```

## Summary

The advanced tutorial features provide:
- **Mobile optimization** with swipe gestures and bottom sheet UI
- **Context API** for global state management
- **Builder pattern** for programmatic tutorial creation
- **Recorder** for capturing user interactions
- **Debugger** for development and testing
- **Templates** for common tutorial patterns

These tools make it easy to create, test, and deploy sophisticated tutorial experiences across all devices.
