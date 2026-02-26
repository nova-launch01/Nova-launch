# Tutorial Quick Start Guide

## What Was Built

An interactive tutorial system that automatically guides new users through their first token deployment on Stellar.

## Key Features

✅ **Auto-starts for first-time users** - Tutorial launches automatically after 1 second
✅ **Step-by-step guidance** - 6 clear steps from welcome to completion
✅ **UI highlighting** - Spotlight effect on relevant buttons and forms
✅ **Progress tracking** - Visual dots show current position
✅ **Skip anytime** - Users can skip if they prefer
✅ **Celebration animation** - Fun confetti effect on completion
✅ **Remembers completion** - Won't auto-start again after completion
✅ **Manual restart** - "Start Tutorial" button for returning users

## Files Created

```
frontend/src/components/Tutorial/
├── TutorialOverlay.tsx          # Main tutorial UI
├── CompletionCelebration.tsx    # Success animation
├── useTutorial.ts               # State management
├── tutorialSteps.ts             # Step definitions
├── index.ts                     # Exports
├── README.md                    # Documentation
└── __tests__/
    └── useTutorial.test.ts      # Tests
```

## Files Modified

- `frontend/src/App.tsx` - Integrated tutorial system
- `frontend/src/components/TokenDeployForm/TokenDeployForm.tsx` - Added tutorial targets

## How It Works

### For First-Time Users

1. User opens the app
2. Tutorial automatically starts after 1 second
3. Overlay appears with welcome message
4. User follows 6 steps with visual guidance
5. Completion celebration appears
6. Tutorial marked as complete in localStorage

### For Returning Users

1. Tutorial doesn't auto-start
2. "Start Tutorial" button visible in header
3. Can manually restart tutorial anytime
4. Same experience as first-time users

## Tutorial Steps

1. **Welcome** - Introduction to the app
2. **Connect Wallet** - How to connect Stellar wallet
3. **Token Details** - Filling out the token form
4. **Review & Deploy** - Understanding fees and deployment
5. **View Token** - Post-deployment information
6. **Complete** - Congratulations message

## Testing

Run the tutorial tests:
```bash
npm test -- useTutorial.test.ts
```

## Usage

The tutorial is already integrated and will work automatically. No additional setup needed!

### Manual Control

```typescript
// In any component
import { useTutorial, deploymentTutorialSteps } from './components/Tutorial';

const tutorial = useTutorial(deploymentTutorialSteps);

// Start tutorial
tutorial.start();

// Reset completion (for testing)
tutorial.reset();
```

## Customization

### Change Tutorial Steps

Edit `frontend/src/components/Tutorial/tutorialSteps.ts`:

```typescript
export const deploymentTutorialSteps: TutorialStep[] = [
  {
    id: 'my-step',
    title: 'My Custom Step',
    content: 'Step description here',
    targetSelector: '[data-tutorial="my-element"]',
    position: 'bottom',
  },
  // ... more steps
];
```

### Add New Tutorial Targets

Add `data-tutorial` attribute to any element:

```tsx
<Button data-tutorial="my-button">
  Click Me
</Button>
```

### Styling

Colors and animations are in the component files using Tailwind CSS classes.

## Accessibility

- Keyboard navigation (ESC to close)
- ARIA labels for screen readers
- High contrast colors
- Focus management

## Browser Support

Works on all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Mobile browsers

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

## Next Steps

The tutorial is ready to use! Just run the app and it will automatically guide new users through their first deployment.

```bash
npm run dev
```

Open the app and you'll see the tutorial start automatically!
