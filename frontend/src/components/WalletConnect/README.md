# ConnectButton Component

A reusable wallet connection button component for Stellar Freighter wallet integration.

## Features

- **State Management**: Handles disconnected, connecting, and connected states
- **Freighter Detection**: Automatically detects if Freighter wallet is installed
- **Error Handling**: Graceful error messages with install links if Freighter is missing
- **Responsive Design**: Different UI for mobile and desktop devices
- **Accessibility**: Full ARIA label support for screen readers and assistive technologies
- **Loading States**: Visual feedback during wallet connection
- **Toast Notifications**: User feedback through toast messages
- **Public Key Display**: Shows abbreviated public key when connected

## Usage

### Basic Usage

```tsx
import { ConnectButton } from "@/components/WalletConnect";

function App() {
  return (
    <Header>
      <ConnectButton />
    </Header>
  );
}
```

### With Callbacks

```tsx
<ConnectButton
  onConnect={(publicKey) => {
    console.log("Wallet connected:", publicKey);
    // Update app state with public key
  }}
  onError={(error) => {
    console.error("Connection failed:", error.message);
  }}
/>
```

### With Custom Styling

```tsx
<ConnectButton className="justify-self-end" />
```

## Component Props

| Prop        | Type                          | Description                                    |
| ----------- | ----------------------------- | ---------------------------------------------- |
| `onConnect` | `(publicKey: string) => void` | Called when wallet is successfully connected   |
| `onError`   | `(error: Error) => void`      | Called when connection fails                   |
| `className` | `string`                      | Additional CSS classes to apply to the wrapper |

## States

### Disconnected

- Displays "Connect Wallet" button
- On click, initiates Freighter wallet connection

### Connecting

- Button becomes disabled
- Shows "Connecting..." text
- Displays loading spinner
- Sets `aria-busy="true"`

### Connected

- Shows abbreviated public key (first 8 + last 8 characters)
- Desktop: Shows full abbreviated key
- Mobile: Shows "Connected" label (key visible in tooltip)
- Displays "Disconnect" button
- Public key is fully visible on hover

### Error

- Shows error message in red banner
- If Freighter not installed, includes install link
- `aria-live="polite"` for screen reader announcement
- Button remains disabled until dismissed

## Accessibility

- ARIA labels on all buttons
- `aria-busy` attribute during loading
- `aria-describedby` linking button to error messages
- `role="alert"` on error messages
- `aria-live="polite"` for dynamic content updates
- Keyboard accessible (full tab navigation)
- Focus indicators via `:focus-ring-2` Tailwind class

## Responsive Design

- **Desktop**: Displays full abbreviated public key (24 characters)
- **Mobile** (Tailwind `sm` breakpoint): Shows "Connected" label, key in tooltip
- Single "Disconnect" button adapts to screen size
- Touch-friendly button sizes

## Wallet Integration

Requires the Freighter wallet extension installed in the browser. The component checks for:

```typescript
window.freighter?.requestPublicKey();
```

Returns:

```typescript
{
  publicKey: string; // Stellar public key
}
```

## Toast Notifications

The component uses the `useToast` hook for notifications:

- **Success**: "Wallet connected: [abbreviated-key]"
- **Error**: Connection error messages
- **Info**: "Wallet disconnected"

## Testing

Run tests with:

```bash
npm run test
```

Key test scenarios:

- Rendering in disconnected state
- Loading state during connection
- Freighter not installed error
- Successful connection with callback
- Disconnection flow
- Responsive display
- Accessibility attributes

## Browser Support

Requires:

- Modern browser with ES2020+ support
- Freighter wallet extension installed
- React 19+

## Example: Full Integration

```tsx
import { useState } from "react";
import { ConnectButton } from "@/components/WalletConnect";
import { Button, Card } from "@/components/UI";

export function TokenDeployer() {
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const handleConnect = (key: string) => {
    setPublicKey(key);
    // Initialize Stellar connection with public key
  };

  const handleError = (error: Error) => {
    console.error("Wallet error:", error);
  };

  return (
    <div>
      <header className="flex justify-between items-center">
        <h1>Stellar Token Factory</h1>
        <ConnectButton onConnect={handleConnect} onError={handleError} />
      </header>

      {publicKey && (
        <Card title="Connected">
          <p>Ready to deploy tokens on Stellar</p>
          <p className="text-sm text-gray-600">Connected as: {publicKey}</p>
        </Card>
      )}
    </div>
  );
}
```

## Files

- `ConnectButton.tsx` - Main component
- `ConnectButton.test.tsx` - Unit tests
- `index.ts` - Export file
- `README.md` - This file
