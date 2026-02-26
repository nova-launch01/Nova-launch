# BurnNotification Component

A real-time notification system for displaying burn events in the Stellar token application.

## Components

### BurnNotificationContainer
Main container component that manages and displays multiple burn notifications.

### useBurnNotifications Hook
Custom React hook for managing notification state and operations.

## Features

✅ **Real-time Notifications**: Display burn events as they happen
✅ **Auto-dismiss**: Notifications automatically disappear after 5 seconds (configurable)
✅ **Manual Dismiss**: Users can manually close notifications
✅ **Smooth Animations**: Slide-in and slide-out transitions
✅ **Multiple Types**: Support for self, admin, and other user burns
✅ **Transaction Links**: Direct links to Stellar Expert for transaction details
✅ **Stack Support**: Display multiple notifications simultaneously
✅ **Fully Accessible**: ARIA attributes and keyboard navigation
✅ **Responsive**: Works on all screen sizes
✅ **Type-safe**: Full TypeScript support

## File Structure

```
BurnToken/
├── BurnNotification.tsx          # Main component and hook
├── index.ts                       # Public exports
├── README.md                      # This file
├── USAGE_EXAMPLE.md              # Detailed usage examples
└── __tests__/
    ├── BurnNotification.test.tsx           # Component tests
    └── BurnNotification.animations.test.tsx # Animation tests
```

## Quick Start

```tsx
import { BurnNotificationContainer, useBurnNotifications } from '@/components/BurnToken';

function App() {
  const { notifications, addNotification, dismissNotification } = useBurnNotifications();

  return (
    <>
      <button onClick={() => addNotification('self', '100', 'TOKEN')}>
        Burn Tokens
      </button>
      
      <BurnNotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </>
  );
}
```

## Notification Types

1. **Self Burn** (`type: 'self'`)
   - Orange color scheme
   - Message: "You burned X tokens"
   - Used when the current user burns their own tokens

2. **Admin Burn** (`type: 'admin'`)
   - Red color scheme
   - Message: "Admin burned X tokens from Y"
   - Used when an admin burns tokens from another address

3. **Other User Burn** (`type: 'other'`)
   - Yellow color scheme
   - Message: "User X burned Y tokens"
   - Used when watching a token and another user burns

## Props

### BurnNotificationContainer

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `notifications` | `BurnNotification[]` | Yes | - | Array of notifications to display |
| `onDismiss` | `(id: string) => void` | Yes | - | Callback when notification is dismissed |
| `duration` | `number` | No | `5000` | Auto-dismiss duration in ms |
| `maxNotifications` | `number` | No | `5` | Maximum visible notifications |

## Hook API

### useBurnNotifications()

Returns:
- `notifications`: Current notification array
- `addNotification(type, amount, symbol, options?)`: Add new notification
- `dismissNotification(id)`: Remove specific notification
- `clearAllNotifications()`: Remove all notifications

## Styling

The component uses Tailwind CSS with custom animations defined in `index.css`:

- `animate-slide-in`: Slides in from right (300ms)
- `animate-slide-out`: Slides out to right (300ms)

Color schemes:
- Self: `bg-orange-500` with `border-orange-600`
- Admin: `bg-red-500` with `border-red-600`
- Other: `bg-yellow-500` with `border-yellow-600`

## Accessibility

- Uses `role="alert"` for screen reader announcements
- `aria-live="polite"` for non-intrusive updates
- `aria-atomic="true"` for complete message reading
- Keyboard accessible dismiss buttons
- Respects `prefers-reduced-motion` setting
- Focus management for interactive elements

## Testing

Run tests:
```bash
npm test BurnNotification
```

Test coverage includes:
- Component rendering
- All notification types
- Auto-dismiss functionality
- Manual dismiss
- Multiple notifications
- Animations
- Accessibility
- Hook functionality

## Examples

See [USAGE_EXAMPLE.md](./USAGE_EXAMPLE.md) for detailed examples and integration patterns.

## Dependencies

- React 19.2.0+
- Tailwind CSS
- TypeScript

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance

- Efficient re-renders with React keys
- Automatic cleanup of timers
- Optimized animations
- Maximum notification limit prevents memory issues

## Future Enhancements

Potential improvements:
- Sound notifications (optional)
- Notification grouping
- Persistent notifications option
- Custom notification templates
- Notification history
- Export notification data
