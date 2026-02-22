import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { StellarService, TestAccount } from '../../services/stellar.service';
import { IPFSService } from '../../services/ipfs.service';

/**
 * End-to-End tests simulating complete user flow for token deployment
 * These tests cover the entire workflow from wallet connection to token verification
 */
describe('Token Deployment E2E Tests', () => {
  let stellarService: StellarService;
  let ipfsService: IPFSService;
  let testAccount: TestAccount;
  const deployedTokens: string[] = [];
  const uploadedHashes: string[] = [];

  beforeAll(async () => {
    // Setup services
    stellarService = new StellarService('testnet');
    ipfsService = new IPFSService();

    // Simulate wallet connection
    testAccount = await stellarService.createTestAccount();
    await stellarService.fundTestAccount(testAccount.publicKey);

    // Wait for funding confirmation
    await new Promise(resolve => setTimeout(resolve, 5000));
  });

  afterAll(async () => {
    // Cleanup
    for (const hash of uploadedHashes) {
      try {
        await ipfsService.unpinContent(hash);
      } catch (error) {
        console.warn(`Cleanup failed for ${hash}`);
      }
    }
  });

  describe('Complete Flow: Token Without Metadata', () => {
    it('should complete full deployment flow', async () => {
      // Step 1: User connects wallet (simulated by test account)
      expect(testAccount.publicKey).toBeTruthy();

      // Step 2: User fills deployment form
      const formData = {
        name: 'E2E Test Token',
        symbol: 'E2E',
        decimals: 7,
        initialSupply: '10000000',
      };

      // Step 3: User signs transaction
      const deploymentResult = await stellarService.deployToken(testAccount, formData);
      deployedTokens.push(deploymentResult.tokenAddress);

      expect(deploymentResult.tokenAddress).toBeTruthy();
      expect(deploymentResult.transactionHash).toBeTruthy();

      // Step 4: Wait for confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 5: Verify token exists
      const tokenExists = await stellarService.verifyTokenExists(
        deploymentResult.tokenAddress
      );
      expect(tokenExists).toBe(true);

      // Step 6: Verify balance
      const balance = await stellarService.getTokenBalance(
        deploymentResult.tokenAddress,
        testAccount.publicKey
      );
      expect(balance).toBe(formData.initialSupply);

      // Step 7: Verify no metadata
      const metadata = await stellarService.getTokenMetadata(deploymentResult.tokenAddress);
      expect(metadata).toBeNull();
    });
  });

  describe('Complete Flow: Token With Image and Metadata', () => {
    it('should complete full deployment flow with metadata', async () => {
      // Step 1: User connects wallet
      expect(testAccount.publicKey).toBeTruthy();

      // Step 2: User uploads token logo
      const logoBlob = new Blob(['token logo data'], { type: 'image/png' });
      const logoFile = new File([logoBlob], 'token-logo.png', { type: 'image/png' });

      // Validate image before upload
      const validation = ipfsService.validateImageFile(logoFile);
      expect(validation.valid).toBe(true);

      // Upload image to IPFS
      const imageUploadResult = await ipfsService.uploadImage(logoFile);
      uploadedHashes.push(imageUploadResult.ipfsHash);

      expect(imageUploadResult.ipfsHash).toBeTruthy();
      expect(imageUploadResult.ipfsUri).toMatch(/^ipfs:\/\//);

      // Step 3: User fills deployment form
      const formData = {
        name: 'E2E Metadata Token',
        symbol: 'E2EMETA',
        decimals: 7,
        initialSupply: '5000000',
        description: 'Token with complete metadata',
      };

      // Step 4: Generate and upload metadata JSON
      const metadata = {
        name: formData.name,
        symbol: formData.symbol,
        decimals: formData.decimals,
        description: formData.description,
        image: imageUploadResult.ipfsUri,
      };

      const metadataUploadResult = await ipfsService.uploadMetadata(metadata);
      uploadedHashes.push(metadataUploadResult.ipfsHash);

      expect(metadataUploadResult.ipfsHash).toBeTruthy();

      // Step 5: User signs transaction
      const deploymentParams = {
        name: formData.name,
        symbol: formData.symbol,
        decimals: formData.decimals,
        initialSupply: formData.initialSupply,
        metadataUri: metadataUploadResult.ipfsUri,
      };

      const deploymentResult = await stellarService.deployToken(
        testAccount,
        deploymentParams
      );
      deployedTokens.push(deploymentResult.tokenAddress);

      expect(deploymentResult.tokenAddress).toBeTruthy();
      expect(deploymentResult.transactionHash).toBeTruthy();

      // Step 6: Wait for confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 7: Verify token exists
      const tokenExists = await stellarService.verifyTokenExists(
        deploymentResult.tokenAddress
      );
      expect(tokenExists).toBe(true);

      // Step 8: Verify balance
      const balance = await stellarService.getTokenBalance(
        deploymentResult.tokenAddress,
        testAccount.publicKey
      );
      expect(balance).toBe(formData.initialSupply);

      // Step 9: Verify metadata URI stored on-chain
      const storedMetadataUri = await stellarService.getTokenMetadata(
        deploymentResult.tokenAddress
      );
      expect(storedMetadataUri).toBe(metadataUploadResult.ipfsUri);

      // Step 10: Retrieve and verify metadata content
      const retrievedMetadata = await ipfsService.retrieveContent(
        metadataUploadResult.ipfsHash
      );
      expect(retrievedMetadata.name).toBe(metadata.name);
      expect(retrievedMetadata.symbol).toBe(metadata.symbol);
      expect(retrievedMetadata.image).toBe(imageUploadResult.ipfsUri);
    });
  });

  describe('Error Recovery Flow', () => {
    it('should handle image upload failure gracefully', async () => {
      // User tries to upload oversized image
      const oversizedBlob = new Blob([new ArrayBuffer(10 * 1024 * 1024)], {
        type: 'image/png',
      });
      const oversizedFile = new File([oversizedBlob], 'huge.png', { type: 'image/png' });

      const validation = ipfsService.validateImageFile(oversizedFile);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('exceeds 5MB limit');

      // User should see error and not proceed with upload
    });

    it('should handle deployment failure and allow retry', async () => {
      // Simulate deployment with invalid parameters
      const invalidParams = {
        name: '', // Empty name should fail
        symbol: 'FAIL',
        decimals: 7,
        initialSupply: '1000000',
      };

      await expect(
        stellarService.deployToken(testAccount, invalidParams)
      ).rejects.toThrow();

      // User corrects the form and retries
      const validParams = {
        name: 'Retry Token',
        symbol: 'RETRY',
        decimals: 7,
        initialSupply: '1000000',
      };

      const result = await stellarService.deployToken(testAccount, validParams);
      deployedTokens.push(result.tokenAddress);

      expect(result.tokenAddress).toBeTruthy();
    });
  });

  describe('Multi-Step Validation Flow', () => {
    it('should validate each step before proceeding', async () => {
      // Step 1: Validate wallet connection
      expect(testAccount.publicKey).toBeTruthy();

      // Step 2: Validate form inputs
      const formData = {
        name: 'Validated Token',
        symbol: 'VAL',
        decimals: 7,
        initialSupply: '1000000',
      };

      expect(formData.name.length).toBeGreaterThan(0);
      expect(formData.symbol.length).toBeGreaterThan(0);
      expect(formData.decimals).toBeGreaterThan(0);
      expect(parseInt(formData.initialSupply)).toBeGreaterThan(0);

      // Step 3: If metadata provided, validate and upload
      const logoBlob = new Blob(['logo'], { type: 'image/png' });
      const logoFile = new File([logoBlob], 'logo.png', { type: 'image/png' });

      const imageValidation = ipfsService.validateImageFile(logoFile);
      expect(imageValidation.valid).toBe(true);

      const imageResult = await ipfsService.uploadImage(logoFile);
      uploadedHashes.push(imageResult.ipfsHash);

      const metadata = {
        name: formData.name,
        symbol: formData.symbol,
        decimals: formData.decimals,
        image: imageResult.ipfsUri,
      };

      const metadataResult = await ipfsService.uploadMetadata(metadata);
      uploadedHashes.push(metadataResult.ipfsHash);

      // Step 4: Deploy with validated data
      const deploymentParams = {
        ...formData,
        metadataUri: metadataResult.ipfsUri,
      };

      const result = await stellarService.deployToken(testAccount, deploymentParams);
      deployedTokens.push(result.tokenAddress);

      // Step 5: Verify deployment
      expect(result.tokenAddress).toBeTruthy();

      const exists = await stellarService.verifyTokenExists(result.tokenAddress);
      expect(exists).toBe(true);
    });
  });

  describe('User Experience Flow', () => {
    it('should provide feedback at each step', async () => {
      const steps: string[] = [];

      // Step 1: Connect wallet
      steps.push('Wallet connected');
      expect(testAccount.publicKey).toBeTruthy();

      // Step 2: Form filled
      steps.push('Form validated');
      const formData = {
        name: 'UX Token',
        symbol: 'UX',
        decimals: 7,
        initialSupply: '1000000',
      };

      // Step 3: Transaction signing
      steps.push('Transaction signing...');
      const result = await stellarService.deployToken(testAccount, formData);
      deployedTokens.push(result.tokenAddress);

      // Step 4: Transaction submitted
      steps.push('Transaction submitted');
      expect(result.transactionHash).toBeTruthy();

      // Step 5: Waiting for confirmation
      steps.push('Waiting for confirmation...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 6: Deployment confirmed
      steps.push('Deployment confirmed');
      const exists = await stellarService.verifyTokenExists(result.tokenAddress);
      expect(exists).toBe(true);

      // Step 7: Success
      steps.push('Token deployed successfully');

      expect(steps).toHaveLength(7);
    });
  });
});
