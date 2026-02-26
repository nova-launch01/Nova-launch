# Wallet Event Handling

## Overview

The `useWallet` hook provides comprehensive wallet management with automatic event detection and reconnection capabilities.

## Features

✅ **Account Change Detection** - Automatically updates when user switches accounts in Freighter  
✅ **Network Change Detection** - Detects testnet/mainnet switches  
✅ **Auto-reconnection** - Reconnects wallet on page refresh if previously connected  
✅ **Proper Cleanup** - Removes event listeners on disconnect and unmount  
✅ **Error Handling** - Graceful handling of connection failures

## Usage

```typescript
import { useWallet } from './hooks/useWallet';

function App() {
  const { wallet, connect, disconnect, isConnecting, error } = useWallet();

  return (
    <div>
      {wallet.connected ? (
        <div>
          <p>Address: {wallet.address}</p>
          <p>Network: {wallet.network}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

## API

### Return Values

- `wallet: WalletState` - Current wallet state
  - `connected: boolean` - Connection status
  - `address: string | null` - User's public key
  - `network: 'testnet' | 'mainnet'` - Active network
- `connect: () => Promise<void>` - Connect wallet
- `disconnect: () => void` - Disconnect wallet
- `isConnecting: boolean` - Connection in progress
- `error: string | null` - Error message if any

## Event Handling

### Account Changes
When user switches accounts in Freighter, the hook automatically:
1. Detects the change via `WatchWalletChanges`
2. Updates wallet state with new address
3. Maintains connection status

### Network Changes
When user switches between testnet/mainnet:
1. Detects network change
2. Updates wallet state with new network
3. Maintains connection and address

### Disconnection
When user disconnects or locks wallet:
1. Detects empty address
2. Clears wallet state
3. Removes localStorage flag
4. Cleans up event listeners

## Auto-reconnection

On page load/refresh:
1. Checks localStorage for previous connection
2. Verifies Freighter is installed
3. Attempts silent reconnection
4. Sets up event listeners if successful
5. Clears flag if reconnection fails

## Implementation Details

### Event Listener Lifecycle

```
Mount → Check localStorage → Auto-reconnect → Setup Listeners
                                    ↓
Connect → Update State → Setup Listeners
                                    ↓
Account/Network Change → Update State (listeners active)
                                    ↓
Disconnect → Clear State → Cleanup Listeners
                                    ↓
Unmount → Cleanup Listeners
```

### Cleanup Strategy

- Listeners stored in ref to prevent memory leaks
- Cleanup function called on:
  - Manual disconnect
  - Component unmount
  - New listener setup (replaces old)
  - Connection failure

## Testing

All scenarios covered:
- Initial state
- Successful connection
- Disconnection
- Auto-reconnection
- Account changes
- Network changes
- Error handling
- Cleanup on unmount

Run tests:
```bash
npm test useWallet.test.ts
```
