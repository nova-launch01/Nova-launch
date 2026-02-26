# Tutorial Component

An interactive tutorial system that guides new users through their first token deployment.

## Quick Start

```tsx
import { TutorialOverlay, useTutorial, deploymentTutorialSteps } from './components/Tutorial';

function App() {
    const tutorial = useTutorial(deploymentTutorialSteps);
    
    return (
        <>
            <button onClick={tutorial.start}>Start Tutorial</button>
            <TutorialOverlay
                steps={deploymentTutorialSteps}
                currentStep={tutorial.currentStep}
                onNext={tutorial.next}
                onPrevious={tutorial.previous}
                onSkip={tutorial.skip}
                onComplete={tutorial.complete}
                isActive={tutorial.isActive}
            />
        </>
    );
}
```

## Features

### Core Features
- **Step-by-step guidance**: Clear instructions for each deployment step
- **UI element highlighting**: Visual focus on relevant interface elements
- **Progress indicator**: Shows current position in the tutorial
- **Skip option**: Users can skip the tutorial at any time
- **Completion tracking**: Remembers if user has completed the tutorial
- **Celebration animation**: Engaging completion experience
- **Auto-start**: Automatically starts for first-time users

### Enhanced Features
- **Keyboard navigation**: Arrow keys, Enter, ESC
- **Step counter**: Shows "3 / 6" progress
- **Smooth animations**: Entrance, exit, and transitions
- **Analytics tracking**: Track user behavior (local storage)
- **Progress persistence**: Resume within 24 hours
- **Settings modal**: View stats and reset tutorial
- **Mobile optimization**: Swipe gestures and bottom sheet UI

### Development Tools
- **Tutorial Builder**: Fluent API for creating tutorials
- **Tutorial Recorder**: Capture user interactions
- **Tutorial Debugger**: Visual debugging tool
- **Pre-built Templates**: Common tutorial patterns

## Components

### TutorialOverlay
Main tutorial component with UI highlighting.

### MobileTutorial
Mobile-optimized version with swipe gestures.

### TutorialTooltip
Standalone tooltip for custom flows.

### CompletionCelebration
Success modal with confetti animation.

### TutorialSettings
Settings UI with analytics dashboard.

### TutorialDebugger
Development tool for testing and debugging.

## Hooks

### useTutorial
```tsx
const tutorial = useTutorial(steps);

// Properties
tutorial.isActive
tutorial.currentStep
tutorial.hasCompletedBefore

// Methods
tutorial.start()
tutorial.next()
tutorial.previous()
tutorial.skip()
tutorial.complete()
tutorial.reset()
```

### useTutorialContext
```tsx
const tutorial = useTutorialContext();
// Same API as useTutorial, plus:
tutorial.goToStep(index)
tutorial.setSteps(newSteps)
```

## Utilities

### TutorialBuilder
```tsx
import { createTutorial } from './components/Tutorial';

const tutorial = createTutorial()
    .welcome('Welcome!', 'Let\'s get started')
    .highlight('Button', 'Click here', '[data-tutorial="btn"]')
    .complete('Done!', 'You\'re all set!')
    .build();
```

### TutorialRecorder
```tsx
import { tutorialRecorder } from './components/Tutorial';

tutorialRecorder.start();
// User interacts...
const session = tutorialRecorder.stop();
const steps = tutorialRecorder.generateTutorialSteps(session);
```

### TutorialAnalytics
```tsx
import { tutorialAnalytics } from './components/Tutorial';

const events = tutorialAnalytics.getStoredAnalytics();
const stats = tutorialAnalytics.getStats();
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
    position: 'bottom',
  },
];
```

### Using Templates

```tsx
import { TutorialTemplates } from './components/Tutorial';

// Basic onboarding
const steps = TutorialTemplates.basicOnboarding();

// Feature introduction
const steps = TutorialTemplates.featureIntro('Dark Mode', '[data-tutorial="theme"]');

// Form walkthrough
const steps = TutorialTemplates.formWalkthrough([
    { name: 'Name', selector: '#name', description: 'Enter your name' },
    { name: 'Email', selector: '#email', description: 'Enter your email' },
]);
```

## Storage

Tutorial data is stored in localStorage:
- `stellar_tutorial_completed` - Completion status
- `stellar_tutorial_analytics` - Analytics events
- `stellar_tutorial_progress` - Progress state (24h expiry)

## Accessibility

- Keyboard navigation support (ESC, Arrow keys, Enter)
- ARIA labels and roles
- Focus management
- Screen reader friendly
- High contrast support

## Testing

```bash
# Run all tutorial tests
npm test -- Tutorial

# Run specific tests
npm test -- useTutorial.test.ts
npm test -- tutorialAnalytics.test.ts
npm test -- tutorialProgress.test.ts
```

## Documentation

- **README.md** (this file) - Component overview
- **TUTORIAL_IMPLEMENTATION.md** - Initial implementation details
- **TUTORIAL_QUICK_START.md** - Quick start guide
- **TUTORIAL_FLOW.md** - Visual flow diagrams
- **TUTORIAL_ENHANCEMENTS.md** - Enhancement documentation
- **TUTORIAL_ADVANCED_FEATURES.md** - Advanced features guide
- **TUTORIAL_COMPLETE_SUMMARY.md** - Complete system summary

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Initial load: ~15KB gzipped
- Runtime: Minimal overhead
- Storage: ~1-2KB per session
- Animations: Hardware-accelerated CSS

## Troubleshooting

**Tutorial won't start?**
- Clear localStorage: `localStorage.removeItem('stellar_tutorial_completed')`
- Refresh the page

**Element not highlighting?**
- Check the `data-tutorial` attribute exists
- Verify the selector in `tutorialSteps.ts`

**Want to test again?**
- Use browser DevTools Console: `localStorage.removeItem('stellar_tutorial_completed')`
- Or click "Start Tutorial" button in header

## Development

### Debug Mode
```tsx
import { TutorialDebugger } from './components/Tutorial';

<TutorialDebugger isOpen={true} onClose={() => {}} />
```

### Recording Sessions
```tsx
import { tutorialRecorder } from './components/Tutorial';

// Start recording
tutorialRecorder.start();

// Stop and get session
const session = tutorialRecorder.stop();

// Generate steps
const steps = tutorialRecorder.generateTutorialSteps(session);
```

## API Reference

See individual component files for detailed API documentation:
- `TutorialOverlay.tsx` - Main overlay props
- `useTutorial.ts` - Hook API
- `TutorialBuilder.ts` - Builder methods
- `TutorialRecorder.ts` - Recorder API
- `tutorialAnalytics.ts` - Analytics methods

## Contributing

When adding new features:
1. Add tests
2. Update documentation
3. Test on mobile
4. Verify accessibility
5. Check performance

## License

Part of the Stellar Token Deployer project.

