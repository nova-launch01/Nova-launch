# BurnNotification Architecture

## Component Hierarchy

```
BurnNotificationContainer
├── BurnNotificationItem (notification 1)
│   ├── Fire Icon
│   ├── Message Content
│   │   ├── Notification Text
│   │   └── Metadata (time, transaction link)
│   └── Dismiss Button
├── BurnNotificationItem (notification 2)
└── BurnNotificationItem (notification 3)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Parent Component                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         useBurnNotifications Hook                      │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  State: notifications[]                          │ │ │
│  │  │  Actions:                                        │ │ │
│  │  │    - addNotification()                           │ │ │
│  │  │    - dismissNotification()                       │ │ │
│  │  │    - clearAllNotifications()                     │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │      BurnNotificationContainer                         │ │
│  │  Props:                                                │ │
│  │    - notifications                                     │ │
│  │    - onDismiss                                         │ │
│  │    - duration (optional)                               │ │
│  │    - maxNotifications (optional)                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Renders Multiple Notifications      │
        └──────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                      ▼
┌───────────────────┐              ┌───────────────────┐
│ Notification 1    │              │ Notification N    │
│ - Auto-dismiss    │              │ - Auto-dismiss    │
│ - Manual dismiss  │              │ - Manual dismiss  │
│ - Animations      │              │ - Animations      │
└───────────────────┘              └───────────────────┘
```

## State Management

### Hook State
```typescript
const [notifications, setNotifications] = useState<BurnNotification[]>([]);
```

### Adding Notification
```
User Action → addNotification() → Generate ID & Timestamp → Update State → Render
```

### Dismissing Notification
```
User Click/Timer → dismissNotification(id) → Filter State → Update → Re-render
```

## Lifecycle

### Notification Lifecycle
```
1. Created
   ↓
2. Added to state (with unique ID)
   ↓
3. Rendered with slide-in animation
   ↓
4. Auto-dismiss timer starts (5s default)
   ↓
5. User can manually dismiss OR timer expires
   ↓
6. Slide-out animation plays (300ms)
   ↓
7. Removed from state
   ↓
8. Component unmounts
```

## Animation Flow

```
Mount
  ↓
Apply 'animate-slide-in' class
  ↓
Slide from right (translateX: 100% → 0%)
Fade in (opacity: 0 → 1)
Duration: 300ms
  ↓
Visible State
  ↓
Dismiss Triggered (manual or auto)
  ↓
Apply 'animate-slide-out' class
  ↓
Slide to right (translateX: 0% → 100%)
Fade out (opacity: 1 → 0)
Duration: 300ms
  ↓
Call onDismiss callback
  ↓
Unmount
```

## Timer Management

```typescript
// Each notification has its own timer
useEffect(() => {
  const timer = setTimeout(() => {
    handleDismiss();
  }, duration);

  // Cleanup on unmount
  return () => clearTimeout(timer);
}, [duration]);
```

## Notification Types & Styling

```
┌─────────────┬──────────────┬─────────────────────────────────┐
│ Type        │ Color        │ Message Format                  │
├─────────────┼──────────────┼─────────────────────────────────┤
│ self        │ Orange       │ "You burned X tokens"           │
│ admin       │ Red          │ "Admin burned X from Y"         │
│ other       │ Yellow       │ "User X burned Y tokens"        │
└─────────────┴──────────────┴─────────────────────────────────┘
```

## Component Props Interface

```typescript
// Container Props
interface BurnNotificationContainerProps {
  notifications: BurnNotification[];
  onDismiss: (id: string) => void;
  duration?: number;              // Default: 5000ms
  maxNotifications?: number;      // Default: 5
}

// Individual Notification Props
interface BurnNotificationProps {
  notification: BurnNotification;
  onDismiss: (id: string) => void;
  duration?: number;
}

// Notification Data
interface BurnNotification {
  id: string;                     // Unique identifier
  type: BurnNotificationType;     // 'self' | 'admin' | 'other'
  amount: string;                 // Token amount
  symbol: string;                 // Token symbol
  address?: string;               // User address (for 'other')
  fromAddress?: string;           // Source address (for 'admin')
  timestamp: number;              // Creation time
  transactionHash?: string;       // Stellar transaction hash
}
```

## Event Handling

### User Interactions
```
Click Dismiss Button
  ↓
handleDismiss()
  ↓
setIsExiting(true)
  ↓
Wait 300ms (animation)
  ↓
onDismiss(notification.id)
  ↓
Parent removes from state
```

### Auto-Dismiss
```
Component Mounts
  ↓
setTimeout(handleDismiss, duration)
  ↓
Timer Expires
  ↓
handleDismiss()
  ↓
[Same flow as manual dismiss]
```

## Accessibility Architecture

```
Container
├── aria-live="polite"
├── aria-label="Burn notifications"
└── Each Notification
    ├── role="alert"
    ├── aria-live="polite"
    ├── aria-atomic="true"
    └── Dismiss Button
        └── aria-label="Dismiss notification"
```

## Performance Optimizations

1. **Unique Keys**: Each notification uses unique ID for React reconciliation
2. **Timer Cleanup**: All timers cleaned up on unmount
3. **Max Notifications**: Limits visible notifications to prevent memory issues
4. **Efficient Re-renders**: Only affected notifications re-render
5. **CSS Animations**: Hardware-accelerated transforms

## Integration Points

```
Application
├── Burn Token Page
│   ├── useBurnNotifications()
│   ├── Burn Form
│   │   └── On Success → addNotification('self', ...)
│   └── BurnNotificationContainer
│
├── Admin Dashboard
│   ├── useBurnNotifications()
│   ├── Admin Burn Form
│   │   └── On Success → addNotification('admin', ...)
│   └── BurnNotificationContainer
│
└── Token Watch Page
    ├── useBurnNotifications()
    ├── Event Listener
    │   └── On Burn Event → addNotification('other', ...)
    └── BurnNotificationContainer
```

## File Structure

```
BurnToken/
├── BurnNotification.tsx          # Main component
│   ├── BurnNotificationItem      # Individual notification
│   ├── BurnNotificationContainer # Container component
│   └── useBurnNotifications      # State management hook
│
├── index.ts                       # Public exports
├── BurnNotificationDemo.tsx      # Demo/testing component
│
├── __tests__/
│   ├── BurnNotification.test.tsx           # Unit tests
│   └── BurnNotification.animations.test.tsx # Animation tests
│
└── Documentation/
    ├── README.md                  # Overview
    ├── USAGE_EXAMPLE.md          # Code examples
    ├── INTEGRATION_GUIDE.md      # Integration steps
    ├── ACCEPTANCE_CRITERIA.md    # Requirements checklist
    ├── ARCHITECTURE.md           # This file
    └── COMPONENT_SUMMARY.md      # Implementation summary
```

## CSS Architecture

```css
/* Base Animations */
@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-out {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

/* Utility Classes */
.animate-slide-in { animation: slide-in 0.3s ease-out; }
.animate-slide-out { animation: slide-out 0.3s ease-in; }

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

## Testing Architecture

```
Test Suites
├── Component Tests
│   ├── Rendering
│   ├── User Interactions
│   ├── Props Validation
│   └── Accessibility
│
├── Animation Tests
│   ├── Slide-in
│   ├── Slide-out
│   ├── Timing
│   └── Cleanup
│
└── Hook Tests
    ├── State Management
    ├── Add Notification
    ├── Dismiss Notification
    └── Clear All
```

## Design Patterns Used

1. **Custom Hook Pattern**: `useBurnNotifications` for state management
2. **Compound Component Pattern**: Container + Item components
3. **Render Props Pattern**: Flexible notification rendering
4. **Controlled Component**: Parent controls notification state
5. **Composition**: Small, focused components
6. **Single Responsibility**: Each component has one job

## Future Extensibility

The architecture supports easy addition of:
- Custom notification templates
- Sound notifications
- Notification grouping
- Persistent storage
- Notification history
- Custom animations
- Theme customization
- Internationalization
