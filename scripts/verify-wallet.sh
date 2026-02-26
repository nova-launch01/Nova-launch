#!/bin/bash
set -e

echo "🔍 Wallet Event Handling Verification Script"
echo "=============================================="
echo ""

cd "$(dirname "$0")/../frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Run type check
echo "🔍 Running TypeScript type check..."
if npm run type-check; then
    echo "✅ No TypeScript errors"
else
    echo "❌ TypeScript errors found"
    exit 1
fi
echo ""

# Run wallet tests
echo "🧪 Running wallet tests..."
if npm test -- useWallet.test.ts --run; then
    echo "✅ All wallet tests passed"
else
    echo "❌ Some tests failed"
    exit 1
fi
echo ""

echo "✅ All checks passed!"
echo ""
echo "📋 Manual Testing Checklist:"
echo "  1. Start dev server: npm run dev"
echo "  2. Connect Freighter wallet"
echo "  3. Switch accounts in Freighter → verify UI updates"
echo "  4. Switch network (testnet/mainnet) → verify UI updates"
echo "  5. Refresh page → verify auto-reconnect"
echo "  6. Disconnect wallet → verify cleanup"
echo ""
