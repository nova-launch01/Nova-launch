# Tutorial Component

An interactive tutorial system that guides new users through their first token deployment.

## Features

- **Step-by-step guidance**: Clear instructions for each deployment step
- **UI element highlighting**: Visual focus on relevant interface elements
- **Progress indicator**: Shows current position in the tutorial
- **Skip option**: Users can skip the tutorial at any time
- **Completion tracking**: Remembers if user has completed the tutorial
- **Celebration animation**: Engaging completion experience
- **Auto-start**: Automatically starts for first-time users

## Components

### TutorialOverlay

The main tutorial component that displays step-by-step instructions with UI highlighting.

```tsx
<TutorialOverlay
  steps={deploymentTutorialSteps}
  currentStep={tutorial.currentStep}
  onNext={tutorial.next}
  onPrevious={tutorial.previous}
  onSkip={tutorial.skip}
  onComplete={handleTutorialComplete}
  isActive={tutorial.isActive}
/>
```

### CompletionCelebration

A celebration modal shown when the tutorial is completed.

```tsx
<CompletionCelebration 
  isOpen={showCelebration} 
  onClose={handleCelebrationClose} 
/>
```

### useTutorial Hook

Manages tutorial state and progression.

```tsx
const tutorial = useTutorial(deploymentTutorialSteps);

// Available methods:
tutorial.start();      // Start the tutorial
tutorial.next();       // Go to next step
tutorial.previous();   // Go to previous step
tutorial.skip();       // Skip tutorial
tutorial.complete();   // Complete tutorial
tutorial.reset();      // Reset completion status
```

## Tutorial Steps

Defined in `tutorialSteps.ts`:

1. **Welcome**: Introduction to the tutorial
2. **Connect Wallet**: Guide to wallet connection
3. **Token Details**: Explain token form fields
4. **Review & Deploy**: Review and deployment process
5. **View Token**: Post-deployment information
6. **Complete**: Final congratulations

## Adding Tutorial Targets

To highlight UI elements, add `data-tutorial` attributes:

```tsx
<Button data-tutorial="connect-wallet">
  Connect Wallet
</Button>

<div data-tutorial="token-form">
  {/* Form content */}
</div>
```

## Customization

### Creating New Tutorial Steps

```typescript
const customSteps: TutorialStep[] = [
  {
    id: 'step-1',
    title: 'Step Title',
    content: 'Step description',
    targetSelector: '[data-tutorial="element-id"]',
    position: 'bottom', // 'top' | 'bottom' | 'left' | 'right'
  },
];
```

### Styling

The tutorial uses Tailwind CSS classes and can be customized by modifying:
- `TutorialOverlay.tsx`: Tooltip and highlight styles
- `CompletionCelebration.tsx`: Celebration modal styles

## Storage

Tutorial completion is stored in localStorage:
- Key: `stellar_tutorial_completed`
- Value: `'true'` when completed

## Accessibility

- Keyboard navigation support (Escape to close)
- ARIA labels and roles
- Focus management
- Screen reader friendly

## Usage Example

```tsx
import {
  TutorialOverlay,
  CompletionCelebration,
  useTutorial,
  deploymentTutorialSteps,
} from './components/Tutorial';

function App() {
  const [showCelebration, setShowCelebration] = useState(false);
  const tutorial = useTutorial(deploymentTutorialSteps);

  const handleTutorialComplete = () => {
    tutorial.complete();
    setShowCelebration(true);
  };

  useEffect(() => {
    // Auto-start for first-time users
    if (!tutorial.hasCompletedBefore) {
      setTimeout(() => tutorial.start(), 1000);
    }
  }, []);

  return (
    <>
      {/* Your app content */}
      
      <TutorialOverlay
        steps={deploymentTutorialSteps}
        currentStep={tutorial.currentStep}
        onNext={tutorial.next}
        onPrevious={tutorial.previous}
        onSkip={tutorial.skip}
        onComplete={handleTutorialComplete}
        isActive={tutorial.isActive}
      />
      
      <CompletionCelebration 
        isOpen={showCelebration} 
        onClose={() => setShowCelebration(false)} 
      />
    </>
  );
}
```
