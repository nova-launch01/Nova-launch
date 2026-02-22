import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StellarService } from '../stellar';
import { ErrorCode } from '../../types';
import * as StellarSdk from '@stellar/stellar-sdk';

// Mock the Stellar SDK
vi.mock('@stellar/stellar-sdk', async () => {
  const actual = await vi.importActual('@stellar/stellar-sdk');
  return {
    ...actual,
    SorobanRpc: {
      Server: vi.fn(function() { return {}; }),
    },
    Horizon: {
      Server: vi.fn(function() {
        return {
          transactions: vi.fn().mockReturnValue({
            forAccount: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            call: vi.fn().mockResolvedValue({ records: [] }),
            transaction: vi.fn().mockReturnThis(),
          }),
        };
      }),
    },
    Contract: vi.fn(function() { return {}; }),
  };
});

vi.mock('../../config/stellar', () => ({
  STELLAR_CONFIG: {
    network: 'testnet',
    factoryContractId: 'CDUMMYCONTRACTID123456789',
    testnet: {
      networkPassphrase: 'Test SDF Network ; September 2015',
      horizonUrl: 'https://horizon-testnet.stellar.org',
      sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    },
    mainnet: {
      networkPassphrase: 'Public Global Stellar Network ; September 2015',
      horizonUrl: 'https://horizon.stellar.org',
      sorobanRpcUrl: 'https://soroban-mainnet.stellar.org',
    },
  },
  getNetworkConfig: (network: 'testnet' | 'mainnet') => ({
    networkPassphrase: network === 'testnet' 
      ? 'Test SDF Network ; September 2015' 
      : 'Public Global Stellar Network ; September 2015',
    horizonUrl: network === 'testnet' 
      ? 'https://horizon-testnet.stellar.org' 
      : 'https://horizon.stellar.org',
    sorobanRpcUrl: network === 'testnet' 
      ? 'https://soroban-testnet.stellar.org' 
      : 'https://soroban-mainnet.stellar.org',
  }),
}));

describe('StellarService', () => {
  let service: StellarService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new StellarService('testnet');
  });

  describe('initialization', () => {
    it('should initialize with testnet', () => {
      expect(service.getNetwork()).toBe('testnet');
    });

    it('should initialize with mainnet', () => {
      const mainnetService = new StellarService('mainnet');
      expect(mainnetService.getNetwork()).toBe('mainnet');
    });

    it('should create contract client', () => {
      expect(() => service.getContractClient()).not.toThrow();
      expect(StellarSdk.Contract).toHaveBeenCalled();
    });
  });

  describe('network switching', () => {
    it('should switch from testnet to mainnet', () => {
      service.switchNetwork('mainnet');
      expect(service.getNetwork()).toBe('mainnet');
    });

    it('should switch from mainnet to testnet', () => {
      service.switchNetwork('mainnet');
      service.switchNetwork('testnet');
      expect(service.getNetwork()).toBe('testnet');
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid token address', async () => {
      await expect(service.getTokenInfo('invalid')).rejects.toMatchObject({
        code: ErrorCode.INVALID_INPUT,
        message: 'Invalid token address',
      });
    });
  });
});
