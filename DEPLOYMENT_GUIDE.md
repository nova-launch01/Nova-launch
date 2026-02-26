# Token Factory Deployment Guide

## Prerequisites

1. Soroban CLI installed
2. Admin identity configured (run `scripts/setup-soroban.sh`)
3. Contract built (run `scripts/build-contract.sh`)
4. Testnet account funded with XLM

## Deployment Steps

### 1. Deploy to Testnet

```bash
cd Nova-launch
./scripts/deploy-testnet.sh
```

This script will:
- Verify admin identity exists
- Create treasury identity if needed
- Deploy the contract to testnet
- Initialize with admin and treasury addresses
- Set fee structure (7 XLM base, 3 XLM metadata)
- Save deployment info to `deployment-testnet.json`
- Run basic smoke test

### 2. Post-Deployment Verification

After deployment, verify the contract state:

```bash
# Get factory state
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  --source admin \
  -- get_state
```

### 3. Test Token Creation

Create a test token to verify functionality:

```bash
# Get admin address
ADMIN_ADDRESS=$(soroban keys address admin)

# Create test token
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  --source admin \
  -- create_token \
  --creator $ADMIN_ADDRESS \
  --name "Test Token" \
  --symbol "TEST" \
  --decimals 7 \
  --initial_supply 1000000 \
  --fee_payment 70000000
```

## Configuration

### Fee Structure

- Base Fee: 70000000 stroops (7 XLM)
- Metadata Fee: 30000000 stroops (3 XLM)
- Total: 100000000 stroops (10 XLM)

### Update Frontend Environment

After deployment, update `frontend/.env`:

```bash
VITE_FACTORY_CONTRACT_ID=<contract_id_from_deployment>
VITE_NETWORK=testnet
```

## Deployment Info

The deployment script generates `deployment-testnet.json` with:

```json
{
  "network": "testnet",
  "contractId": "CONTRACT_ID",
  "admin": "ADMIN_ADDRESS",
  "treasury": "TREASURY_ADDRESS",
  "baseFee": 70000000,
  "metadataFee": 30000000,
  "deployedAt": "2026-02-21T12:00:00Z"
}
```

## Testing Checklist

- [ ] Contract deploys successfully
- [ ] Initialization completes with correct parameters
- [ ] Contract ID is documented
- [ ] Admin address verified
- [ ] Treasury address verified
- [ ] Fee structure set correctly
- [ ] get_state returns expected values
- [ ] Test token creation works
- [ ] Fee collection verified
- [ ] Admin functions accessible
- [ ] Error cases handled properly

## Troubleshooting

### Admin Identity Not Found

```bash
./scripts/setup-soroban.sh
```

### Contract Build Missing

```bash
./scripts/build-contract.sh
```

### Insufficient Balance

Fund your testnet account at: https://laboratory.stellar.org/#account-creator

### Network Issues

Verify network configuration:

```bash
soroban network ls
```

## Admin Functions

### Update Fees

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  --source admin \
  -- update_fees \
  --new_base_fee 80000000 \
  --new_metadata_fee 40000000
```

### Update Treasury

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  --source admin \
  -- update_treasury \
  --new_treasury <NEW_TREASURY_ADDRESS>
```

### Pause/Unpause Factory

```bash
# Pause
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  --source admin \
  -- pause

# Unpause
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  --source admin \
  -- unpause
```

## Monitoring

Track deployment metrics:
- Gas costs
- Transaction hashes
- Token creation count
- Fee collection totals

## Security Notes

- Keep admin keys secure
- Verify all addresses before deployment
- Test on testnet before mainnet
- Monitor treasury balance
- Regular security audits recommended
