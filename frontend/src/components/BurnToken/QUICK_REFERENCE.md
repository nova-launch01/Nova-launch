# BurnNotification Quick Reference

## Import

```tsx
import { BurnNotificationContainer, useBurnNotifications } from '@/components/BurnToken';
```

## Basic Setup

```tsx
const { notifications, addNotification, dismissNotification } = useBurnNotifications();

<BurnNotificationContainer
  notifications={notifications}
  onDismiss={dismissNotification}
/>
```

## Add Notifications

### Self Burn
```tsx
addNotification('self', '100', 'TOKEN', {
  transactionHash: 'abc123'
});
```

### Admin Burn
```tsx
addNotification('admin', '50', 'TOKEN', {
  fromAddress: 'GABCD...',
  transactionHash: 'def456'
});
```

### Other User Burn
```tsx
addNotification('other', '25', 'TOKEN', {
  address: 'GXYZ...',
  transactionHash: 'ghi789'
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `notifications` | `BurnNotification[]` | required | Notification array |
| `onDismiss` | `(id: string) => void` | required | Dismiss callback |
| `duration` | `number` | `5000` | Auto-dismiss time (ms) |
| `maxNotifications` | `number` | `5` | Max visible count |

## Hook Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `addNotification` | `type, amount, symbol, options?` | Add new notification |
| `dismissNotification` | `id` | Remove specific notification |
| `clearAllNotifications` | none | Remove all notifications |

## Notification Types

| Type | Color | Message |
|------|-------|---------|
| `'self'` | Orange | "You burned X tokens" |
| `'admin'` | Red | "Admin burned X from Y" |
| `'other'` | Yellow | "User X burned Y tokens" |

## Options Object

```typescript
{
  address?: string;         // User address (for 'other')
  fromAddress?: string;     // Source address (for 'admin')
  transactionHash?: string; // Stellar tx hash
}
```

## Common Patterns

### After Burn Transaction
```tsx
const result = await burnTokens(amount);
addNotification('self', amount, symbol, {
  transactionHash: result.hash
});
```

### With Error Handling
```tsx
try {
  const result = await burnTokens(amount);
  addNotification('self', amount, symbol, {
    transactionHash: result.hash
  });
} catch (error) {
  console.error('Burn failed:', error);
}
```

### Custom Duration
```tsx
<BurnNotificationContainer
  notifications={notifications}
  onDismiss={dismissNotification}
  duration={10000}
/>
```

### Clear All Button
```tsx
<button onClick={clearAllNotifications}>
  Clear All
</button>
```

## Files

- `BurnNotification.tsx` - Main component
- `index.ts` - Exports
- `BurnNotificationDemo.tsx` - Demo
- `__tests__/*.test.tsx` - Tests

## Documentation

- `README.md` - Overview
- `USAGE_EXAMPLE.md` - Examples
- `INTEGRATION_GUIDE.md` - Integration
- `ARCHITECTURE.md` - Architecture
- `QUICK_REFERENCE.md` - This file

## Testing

```bash
npm test BurnNotification
```

## Demo

```tsx
import { BurnNotificationDemo } from '@/components/BurnToken';
<BurnNotificationDemo />
```
