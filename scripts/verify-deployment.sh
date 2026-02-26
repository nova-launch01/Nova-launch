#!/bin/bash
set -e

# Check if deployment info exists
if [ ! -f "deployment-testnet.json" ]; then
    echo "Error: deployment-testnet.json not found. Deploy contract first."
    exit 1
fi

# Extract contract ID
CONTRACT_ID=$(grep -o '"contractId": "[^"]*' deployment-testnet.json | cut -d'"' -f4)

echo "Verifying deployment for contract: $CONTRACT_ID"
echo "================================================"

# Get factory state
echo -e "\n1. Factory State:"
soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source admin \
  -- get_state

# Get admin address
ADMIN_ADDRESS=$(soroban keys address admin)

echo -e "\n2. Testing Token Creation:"
echo "Creating test token..."

# Create test token
TOKEN_ADDRESS=$(soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source admin \
  -- create_token \
  --creator $ADMIN_ADDRESS \
  --name "Verification Test Token" \
  --symbol "VTT" \
  --decimals 7 \
  --initial_supply 1000000 \
  --fee_payment 70000000)

echo "Test token created: $TOKEN_ADDRESS"

echo -e "\n3. Verification Complete!"
echo "================================================"
echo "All checks passed successfully."
