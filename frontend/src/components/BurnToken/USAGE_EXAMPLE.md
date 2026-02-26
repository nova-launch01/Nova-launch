# BurnNotification Component Usage

## Overview

The BurnNotification component displays real-time burn events with animations, auto-dismiss functionality, and support for multiple notification types.

## Features

- ✅ Real-time burn event notifications
- ✅ Three notification types: self, admin, and other user burns
- ✅ Auto-dismiss after 5 seconds (configurable)
- ✅ Manual dismiss button
- ✅ Smooth slide-in/slide-out animations
- ✅ Stack multiple notifications
- ✅ Transaction links to Stellar Expert
- ✅ Fully accessible with ARIA attributes
- ✅ Responsive design

## Basic Usage

```tsx
import { BurnNotificationContainer, useBurnNotifications } from '@/components/BurnToken';

function MyComponent() {
  const { notifications, addNotification, dismissNotification } = useBurnNotifications();

  const handleBurn = async () => {
    // After successful burn transaction
    addNotification('self', '100', 'MYTOKEN', {
      transactionHash: 'abc123def456',
    });
  };

  return (
    <div>
      <button onClick={handleBurn}>Burn Tokens</button>
      
      <BurnNotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
```

## Notification Types

### Self Burn
When the current user burns their own tokens:

```tsx
addNotification('self', '100', 'TOKEN', {
  transactionHash: 'abc123',
});
// Displays: "You burned 100 TOKEN"
```

### Admin Burn
When an admin burns tokens from another address:

```tsx
addNotification('admin', '50', 'TOKEN', {
  fromAddress: 'GABCDEFGHIJKLMNOP',
  transactionHash: 'def456',
});
// Displays: "Admin burned 50 TOKEN from GABCDEFG..."
```

### Other User Burn
When watching a token and another user burns:

```tsx
addNotification('other', '25', 'TOKEN', {
  address: 'GXYZABCDEFGHIJKLM',
  transactionHash: 'ghi789',
});
// Displays: "User GXYZABCD... burned 25 TOKEN"
```

## Advanced Usage

### Custom Duration

```tsx
<BurnNotificationContainer
  notifications={notifications}
  onDismiss={dismissNotification}
  duration={10000} // 10 seconds
/>
```

### Limit Maximum Notifications

```tsx
<BurnNotificationContainer
  notifications={notifications}
  onDismiss={dismissNotification}
  maxNotifications={3} // Show only 3 most recent
/>
```

### Clear All Notifications

```tsx
const { clearAllNotifications } = useBurnNotifications();

<button onClick={clearAllNotifications}>
  Clear All
</button>
```

## Integration Example

```tsx
import { useState } from 'react';
import { BurnNotificationContainer, useBurnNotifications } from '@/components/BurnToken';
import { burnTokens } from '@/services/stellar';

function BurnTokenPage() {
  const [amount, setAmount] = useState('');
  const { notifications, addNotification, dismissNotification } = useBurnNotifications();

  const handleBurn = async () => {
    try {
      const result = await burnTokens(amount);
      
      addNotification('self', amount, 'MYTOKEN', {
        transactionHash: result.hash,
      });
    } catch (error) {
      console.error('Burn failed:', error);
    }
  };

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount to burn"
      />
      <button onClick={handleBurn}>Burn</button>

      <BurnNotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
        duration={5000}
        maxNotifications={5}
      />
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS classes and includes three color schemes:

- **Self Burn**: Orange (`bg-orange-500`, `border-orange-600`)
- **Admin Burn**: Red (`bg-red-500`, `border-red-600`)
- **Other Burn**: Yellow (`bg-yellow-500`, `border-yellow-600`)

## Accessibility

The component includes:

- `role="alert"` for screen reader announcements
- `aria-live="polite"` for non-intrusive updates
- `aria-atomic="true"` for complete message reading
- `aria-label` on dismiss buttons
- Keyboard navigation support
- Focus management
- Respects `prefers-reduced-motion`

## Animation Details

- **Slide In**: 300ms ease-out from right
- **Slide Out**: 300ms ease-in to right
- **Auto-dismiss**: Configurable (default 5000ms)
- **Animation Delay**: 300ms before removal

## Testing

The component includes comprehensive tests:

```bash
npm test BurnNotification.test.tsx
npm test BurnNotification.animations.test.tsx
```

## API Reference

### BurnNotificationContainer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `notifications` | `BurnNotification[]` | required | Array of notifications to display |
| `onDismiss` | `(id: string) => void` | required | Callback when notification is dismissed |
| `duration` | `number` | `5000` | Auto-dismiss duration in milliseconds |
| `maxNotifications` | `number` | `5` | Maximum number of visible notifications |

### useBurnNotifications Hook

Returns an object with:

- `notifications`: Array of current notifications
- `addNotification(type, amount, symbol, options?)`: Add a new notification
- `dismissNotification(id)`: Dismiss a specific notification
- `clearAllNotifications()`: Clear all notifications

### BurnNotification Type

```typescript
interface BurnNotification {
  id: string;
  type: 'self' | 'admin' | 'other';
  amount: string;
  symbol: string;
  address?: string;
  fromAddress?: string;
  timestamp: number;
  transactionHash?: string;
}
```

## Browser Support

- Modern browsers with CSS animations support
- Graceful degradation for older browsers
- Respects user motion preferences
