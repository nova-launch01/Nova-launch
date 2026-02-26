#!/bin/bash
set -e

# Check if deployment info exists
if [ ! -f "deployment-testnet.json" ]; then
    echo "Error: deployment-testnet.json not found. Deploy contract first."
    exit 1
fi

# Extract contract ID
CONTRACT_ID=$(grep -o '"contractId": "[^"]*' deployment-testnet.json | cut -d'"' -f4)

echo "Updating frontend environment with contract ID: $CONTRACT_ID"

# Create or update .env file
cat > frontend/.env <<EOF
# Factory Contract Configuration
VITE_FACTORY_CONTRACT_ID=$CONTRACT_ID

# Network Configuration
VITE_NETWORK=testnet

# IPFS Configuration (optional for token metadata)
VITE_IPFS_API_KEY=
VITE_IPFS_API_SECRET=
EOF

echo "Frontend .env file updated successfully!"
echo "Location: frontend/.env"
