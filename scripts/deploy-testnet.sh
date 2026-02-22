#!/bin/bash
set -e

echo "Deploying Token Factory to Stellar Testnet..."

# Check if admin identity exists
if ! soroban keys show admin &> /dev/null; then
    echo "Error: Admin identity not found. Run setup-soroban.sh first."
    exit 1
fi

# Check if treasury identity exists
if ! soroban keys show treasury &> /dev/null; then
    echo "Creating treasury identity..."
    soroban keys generate --global treasury
fi

# Get addresses
ADMIN_ADDRESS=$(soroban keys address admin)
TREASURY_ADDRESS=$(soroban keys address treasury)

echo "Admin address: $ADMIN_ADDRESS"
echo "Treasury address: $TREASURY_ADDRESS"

# Deploy contract
echo "Deploying contract..."
CONTRACT_ID=$(soroban contract deploy \
  --wasm contracts/token-factory/target/wasm32-unknown-unknown/release/token_factory.wasm \
  --network testnet \
  --source admin)

echo "Contract deployed!"
echo "Contract ID: $CONTRACT_ID"

# Initialize factory
echo "Initializing factory..."
soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source admin \
  -- initialize \
  --admin $ADMIN_ADDRESS \
  --treasury $TREASURY_ADDRESS \
  --base_fee 70000000 \
  --metadata_fee 30000000

echo "Factory initialized!"

# Save deployment info
cat > deployment-testnet.json <<EOF
{
  "network": "testnet",
  "contractId": "$CONTRACT_ID",
  "admin": "$ADMIN_ADDRESS",
  "treasury": "$TREASURY_ADDRESS",
  "baseFee": 70000000,
  "metadataFee": 30000000,
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo "Deployment info saved to deployment-testnet.json"

# Test deployment
echo "Testing deployment..."
soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source admin \
  -- get_state

echo "Deployment complete!"
