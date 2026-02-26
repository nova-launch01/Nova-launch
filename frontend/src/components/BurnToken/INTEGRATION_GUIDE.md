# BurnNotification Integration Guide

## Quick Integration Steps

### 1. Import the Component

```tsx
import { BurnNotificationContainer, useBurnNotifications } from '@/components/BurnToken';
```

### 2. Add to Your Component

```tsx
function YourComponent() {
  const { notifications, addNotification, dismissNotification } = useBurnNotifications();

  return (
    <>
      {/* Your existing UI */}
      
      {/* Add notification container */}
      <BurnNotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </>
  );
}
```

### 3. Trigger Notifications

```tsx
// After a successful burn transaction
const handleBurn = async () => {
  try {
    const result = await burnTokens(amount);
    
    // Show notification
    addNotification('self', amount, tokenSymbol, {
      transactionHash: result.hash,
    });
  } catch (error) {
    console.error('Burn failed:', error);
  }
};
```

## Integration Scenarios

### Scenario 1: User Burns Their Own Tokens

```tsx
const handleUserBurn = async (amount: string, symbol: string) => {
  const result = await stellarService.burnTokens(amount);
  
  addNotification('self', amount, symbol, {
    transactionHash: result.hash,
  });
};
```

### Scenario 2: Admin Burns Tokens

```tsx
const handleAdminBurn = async (
  amount: string,
  symbol: string,
  fromAddress: string
) => {
  const result = await stellarService.adminBurnTokens(amount, fromAddress);
  
  addNotification('admin', amount, symbol, {
    fromAddress,
    transactionHash: result.hash,
  });
};
```

### Scenario 3: Real-time Event Monitoring

```tsx
useEffect(() => {
  const unsubscribe = stellarService.subscribeToBurnEvents(
    tokenAddress,
    (event) => {
      const type = event.isCurrentUser ? 'self' : 'other';
      
      addNotification(type, event.amount, event.symbol, {
        address: event.address,
        transactionHash: event.hash,
      });
    }
  );
  
  return () => unsubscribe();
}, [tokenAddress]);
```

## Advanced Configuration

### Custom Duration

```tsx
<BurnNotificationContainer
  notifications={notifications}
  onDismiss={dismissNotification}
  duration={10000} // 10 seconds
/>
```

### Limit Notifications

```tsx
<BurnNotificationContainer
  notifications={notifications}
  onDismiss={dismissNotification}
  maxNotifications={3}
/>
```

### Clear All Button

```tsx
const { clearAllNotifications } = useBurnNotifications();

<button onClick={clearAllNotifications}>
  Clear All Notifications
</button>
```

## Best Practices

1. **Place at App Root**: Add the notification container at your app's root level
2. **Single Instance**: Use one container per page/view
3. **Error Handling**: Always wrap burn operations in try-catch
4. **Transaction Hashes**: Always include transaction hashes when available
5. **User Feedback**: Use notifications for all burn operations

## Testing Your Integration

```tsx
// Test component
import { BurnNotificationDemo } from '@/components/BurnToken';

// Add to your dev routes
<Route path="/demo/notifications" element={<BurnNotificationDemo />} />
```

## Troubleshooting

### Notifications Not Appearing
- Check that BurnNotificationContainer is rendered
- Verify notifications array is being updated
- Check z-index conflicts

### Animations Not Working
- Ensure CSS animations are loaded
- Check for CSS conflicts
- Verify browser supports CSS animations

### Auto-dismiss Not Working
- Check that duration prop is set correctly
- Verify no JavaScript errors in console
- Ensure component isn't unmounting prematurely
