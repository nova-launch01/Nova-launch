# Deployment Checklist

## Pre-Deployment Checks

### Environment Setup
- [ ] Soroban CLI installed (`soroban --version`)
- [ ] Rust toolchain installed (`rustc --version`)
- [ ] Admin identity configured (`soroban keys show admin`)
- [ ] Admin account funded on testnet (minimum 100 XLM recommended)
- [ ] Treasury identity exists or will be auto-created

### Contract Build
- [ ] Contract builds successfully (`./scripts/build-contract.sh`)
- [ ] WASM file exists at `contracts/token-factory/target/wasm32-unknown-unknown/release/token_factory.wasm`
- [ ] Contract tests pass (`cd contracts/token-factory && cargo test`)

### Script Validation
- [ ] All scripts have execute permissions (`ls -l scripts/*.sh`)
- [ ] Bash syntax valid for all scripts
- [ ] No shellcheck warnings (if available)

## Deployment Process

### Step 1: Deploy Contract
```bash
./scripts/deploy-testnet.sh
```

Expected output:
- ✓ Admin address displayed
- ✓ Treasury address displayed (created if needed)
- ✓ Contract deployed with ID
- ✓ Factory initialized
- ✓ `deployment-testnet.json` created
- ✓ Basic smoke test passed

### Step 2: Verify Deployment
```bash
./scripts/verify-deployment.sh
```

Expected output:
- ✓ Factory state retrieved
- ✓ Test token created successfully
- ✓ All checks passed

### Step 3: Update Frontend
```bash
./scripts/update-frontend-env.sh
```

Expected output:
- ✓ `frontend/.env` created/updated with contract ID

## Post-Deployment Verification

### Contract State Check
- [ ] Admin address matches expected value
- [ ] Treasury address matches expected value
- [ ] Base fee = 70000000 stroops (7 XLM)
- [ ] Metadata fee = 30000000 stroops (3 XLM)
- [ ] Factory is not paused
- [ ] Token count = 0 (or 1 if test token created)

### Functional Tests
- [ ] Can create token with base fee
- [ ] Can create token with metadata
- [ ] Fee collection works correctly
- [ ] Admin functions accessible
- [ ] Non-admin functions restricted
- [ ] Error cases handled properly

### Documentation
- [ ] Contract ID documented in `deployment-testnet.json`
- [ ] Admin address documented
- [ ] Treasury address documented
- [ ] Deployment timestamp recorded
- [ ] Transaction hash saved (if available)

### Frontend Integration
- [ ] `frontend/.env` contains correct contract ID
- [ ] Frontend can connect to contract
- [ ] Token deployment form works
- [ ] Fee calculation displays correctly
- [ ] Transaction submission succeeds

## Rollback Plan

If deployment fails or issues are found:

1. **Contract Issues**
   - Redeploy with fixes: `./scripts/deploy-testnet.sh`
   - Old contract remains on chain but is not used

2. **Configuration Issues**
   - Update fees: Use `update_fees` function
   - Update treasury: Use `update_treasury` function
   - Pause factory: Use `pause` function

3. **Frontend Issues**
   - Update `frontend/.env` with correct contract ID
   - Restart development server

## Security Checklist

- [ ] Admin keys stored securely
- [ ] Treasury keys stored securely
- [ ] Contract ID shared only with authorized parties
- [ ] Fee structure reviewed and approved
- [ ] Admin functions tested and working
- [ ] Pause mechanism tested
- [ ] No sensitive data in logs or output

## Monitoring

After deployment, monitor:
- [ ] Transaction success rate
- [ ] Gas costs per operation
- [ ] Fee collection totals
- [ ] Token creation count
- [ ] Error rates
- [ ] User feedback

## Sign-off

- [ ] Deployment completed by: _______________
- [ ] Date: _______________
- [ ] Contract ID: _______________
- [ ] Verified by: _______________
- [ ] Date: _______________

## Notes

Add any deployment-specific notes, issues encountered, or special configurations:

```
[Your notes here]
```
