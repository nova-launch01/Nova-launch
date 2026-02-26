/**
 * WalletService Integration Example
 * 
 * This file demonstrates how to use the WalletService in a real application.
 * It shows the complete workflow from connection to transaction signing.
 */

import { WalletService } from './wallet';

// ============================================================================
// Example 1: Basic Wallet Connection
// ============================================================================

export async function basicWalletConnection() {
  console.log('=== Basic Wallet Connection ===\n');

  // Step 1: Check if Freighter is installed
  const isInstalled = await WalletService.isInstalled();
  console.log('Freighter installed:', isInstalled);

  if (!isInstalled) {
    console.log('Please install Freighter: https://www.freighter.app/');
    return;
  }

  // Step 2: Connect to wallet
  try {
    const address = await WalletService.connect();
    console.log('Connected address:', address);

    // Step 3: Get network
    const network = await WalletService.getNetwork();
    console.log('Network:', network);

    // Step 4: Get balance
    const balance = await WalletService.getBalance(address);
    console.log('Balance:', balance, 'XLM');

    return { address, network, balance };
  } catch (error) {
    console.error('Connection failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

// ============================================================================
// Example 2: Check Wallet Status Without Prompting
// ============================================================================

export async function checkWalletStatus() {
  console.log('=== Check Wallet Status ===\n');

  // Get address without prompting user
  const address = await WalletService.getPublicKey();

  if (!address) {
    console.log('No wallet connected');
    return null;
  }

  const network = await WalletService.getNetwork();
  console.log('Already connected:', { address, network });

  return { address, network };
}

// ============================================================================
// Example 3: Monitor Wallet Changes
// ============================================================================

export function monitorWalletChanges(
  onWalletChange: (address: string, network: string) => void
) {
  console.log('=== Monitoring Wallet Changes ===\n');

  const cleanup = WalletService.watchChanges(({ address, network }) => {
    console.log('Wallet changed:', { address, network });
    onWalletChange(address, network);
  });

  console.log('Watching for wallet changes...');
  console.log('Call cleanup() to stop watching');

  return cleanup;
}

// ============================================================================
// Example 4: Complete Token Deployment Flow
// ============================================================================

export async function tokenDeploymentFlow() {
  console.log('=== Token Deployment Flow ===\n');

  // Step 1: Ensure wallet is connected
  let address = await WalletService.getPublicKey();
  if (!address) {
    console.log('Wallet not connected, connecting...');
    address = await WalletService.connect();
  }

  // Step 2: Verify sufficient balance
  const balance = await WalletService.getBalance(address);
  const requiredBalance = 10; // 10 XLM for deployment

  console.log(`Balance: ${balance} XLM`);
  console.log(`Required: ${requiredBalance} XLM`);

  if (parseFloat(balance) < requiredBalance) {
    throw new Error(
      `Insufficient balance. You have ${balance} XLM but need at least ${requiredBalance} XLM`
    );
  }

  // Step 3: Get network for transaction
  const network = await WalletService.getNetwork();
  console.log('Deploying on:', network);

  // Step 4: Build transaction (mock)
  const mockTransactionXdr = 'AAAAAgAAAABelb7...(transaction XDR)';
  console.log('Transaction built');

  // Step 5: Sign transaction
  const networkPassphrase =
    network === 'testnet'
      ? 'Test SDF Network ; September 2015'
      : 'Public Global Stellar Network ; September 2015';

  console.log('Requesting signature...');
  const signedXdr = await WalletService.signTransaction(
    mockTransactionXdr,
    networkPassphrase
  );

  if (!signedXdr) {
    throw new Error('Transaction signing was rejected by user');
  }

  console.log('Transaction signed successfully');
  console.log('Signed XDR:', signedXdr.substring(0, 50) + '...');

  // Step 6: Submit to network (mock)
  console.log('Submitting to network...');
  // In real implementation: await submitToNetwork(signedXdr);

  return {
    success: true,
    address,
    network,
    signedXdr,
  };
}

// ============================================================================
// Example 5: Error Handling Patterns
// ============================================================================

export async function errorHandlingExample() {
  console.log('=== Error Handling Example ===\n');

  try {
    await WalletService.connect();
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('not installed')) {
        console.error('❌ Freighter not installed');
        console.log('👉 Install from: https://www.freighter.app/');
      } else if (error.message.includes('rejected')) {
        console.error('❌ User rejected connection');
        console.log('👉 Please approve the connection in Freighter');
      } else if (error.message.includes('Failed to retrieve')) {
        console.error('❌ Could not get wallet address');
        console.log('👉 Make sure Freighter is unlocked');
      } else {
        console.error('❌ Unknown error:', error.message);
      }
    }
  }

  // Balance check with error handling
  try {
    const address = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    await WalletService.getBalance(address);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid')) {
        console.error('❌ Invalid address format');
      } else if (error.message.includes('not found')) {
        console.error('❌ Account not funded');
        console.log('👉 Fund your account on Stellar Laboratory');
      } else if (error.message.includes('Failed to fetch')) {
        console.error('❌ Network error');
        console.log('👉 Check your internet connection');
      }
    }
  }
}

// ============================================================================
// Example 6: React Component Integration
// ============================================================================

export const WalletConnectionComponent = `
import { useState } from 'react';
import { WalletService } from './services/wallet';

function WalletButton() {
  const [wallet, setWallet] = useState({
    connected: false,
    address: '',
    balance: '0',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setError('');

    try {
      // Check installation
      const installed = await WalletService.isInstalled();
      if (!installed) {
        setError('Freighter wallet not installed');
        window.open('https://www.freighter.app/', '_blank');
        return;
      }

      // Connect
      const address = await WalletService.connect();
      const balance = await WalletService.getBalance(address);

      setWallet({
        connected: true,
        address,
        balance,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    WalletService.disconnect();
    setWallet({ connected: false, address: '', balance: '0' });
  };

  return (
    <div>
      {!wallet.connected ? (
        <button onClick={handleConnect} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div>
          <p>Address: {wallet.address.substring(0, 8)}...</p>
          <p>Balance: {wallet.balance} XLM</p>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
`;

// ============================================================================
// Run Examples (for testing)
// ============================================================================

if (import.meta.env.DEV) {
  console.log('WalletService Examples Loaded');
  console.log('Available functions:');
  console.log('- basicWalletConnection()');
  console.log('- checkWalletStatus()');
  console.log('- monitorWalletChanges(callback)');
  console.log('- tokenDeploymentFlow()');
  console.log('- errorHandlingExample()');
}
