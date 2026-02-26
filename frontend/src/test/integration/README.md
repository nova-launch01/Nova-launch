# Integration and E2E Tests

This directory contains integration and end-to-end tests for the Stellar Token Factory.

## Test Structure

- `ipfs.integration.test.ts` - IPFS upload and retrieval tests
- `stellar-testnet.integration.test.ts` - Stellar testnet deployment tests
- `token-deployment.e2e.test.ts` - Complete end-to-end user flow tests

## Setup

### Prerequisites

1. **Stellar Testnet Account**
   - Tests automatically create and fund test accounts using Friendbot
   - No manual setup required

2. **IPFS/Pinata Credentials**
   - Set `VITE_IPFS_API_KEY` and `VITE_IPFS_API_SECRET` in `.env.test`
   - For testing without real uploads, mock the IPFSService

3. **Factory Contract**
   - Deploy the token factory contract to testnet
   - Set `VITE_FACTORY_CONTRACT_ID` in `.env.test`

### Environment Variables

Create a `.env.test` file in the frontend directory:

```env
VITE_FACTORY_CONTRACT_ID=<your-testnet-contract-id>
VITE_NETWORK=testnet
VITE_IPFS_API_KEY=<your-pinata-api-key>
VITE_IPFS_API_SECRET=<your-pinata-api-secret>
```

## Running Tests

### Run All Tests
```bash
npm run test:integration
```

### Run Specific Test Suite
```bash
npm run test:integration -- ipfs.integration.test.ts
npm run test:integration -- stellar-testnet.integration.test.ts
npm run test:e2e
```

### Run with Coverage
```bash
npm run test:integration:coverage
```

### Watch Mode
```bash
npm run test:integration:watch
```

## Test Categories

### IPFS Integration Tests
Tests IPFS upload, retrieval, and validation:
- Image upload (valid/invalid)
- Metadata JSON upload
- Content retrieval
- URI generation
- Error handling

### Stellar Testnet Integration Tests
Tests token deployment on Stellar testnet:
- Token deployment without metadata
- Token deployment with metadata
- On-chain state verification
- Balance verification
- Fee collection
- Error scenarios

### E2E Tests
Tests complete user workflows:
- Full deployment flow without metadata
- Full deployment flow with image and metadata
- Error recovery flows
- Multi-step validation
- User experience feedback

## Cleanup

Tests automatically clean up resources:
- IPFS content is unpinned after tests
- Test accounts are ephemeral (no cleanup needed)

## Troubleshooting

### Tests Timeout
- Increase timeout in vitest.config.ts
- Check network connectivity to testnet
- Verify Friendbot is operational

### IPFS Upload Fails
- Verify Pinata credentials
- Check API rate limits
- Ensure file sizes are within limits

### Contract Deployment Fails
- Verify contract is deployed to testnet
- Check contract ID in environment variables
- Ensure test account has sufficient balance

## CI/CD Integration

These tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Integration Tests
  env:
    VITE_FACTORY_CONTRACT_ID: ${{ secrets.TESTNET_CONTRACT_ID }}
    VITE_IPFS_API_KEY: ${{ secrets.PINATA_API_KEY }}
    VITE_IPFS_API_SECRET: ${{ secrets.PINATA_API_SECRET }}
  run: npm run test:integration
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up resources in afterAll hooks
3. **Timeouts**: Set appropriate timeouts for network operations
4. **Mocking**: Consider mocking external services for faster tests
5. **Assertions**: Verify all acceptance criteria
6. **Error Handling**: Test both success and failure scenarios
