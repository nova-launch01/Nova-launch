import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StellarService } from '../StellarService';
import type { TokenDeployParams } from '../../types';

// Mock the Stellar SDK
vi.mock('@stellar/stellar-sdk', () => {
    class MockServer {
        getAccount = vi.fn().mockResolvedValue({});
        simulateTransaction = vi.fn().mockResolvedValue({ error: undefined });
        sendTransaction = vi.fn().mockResolvedValue({
            status: 'PENDING',
            hash: 'test-hash',
        });
        getTransaction = vi.fn().mockResolvedValue({
            status: 'SUCCESS',
            returnValue: {},
        });
    }

    class MockContract {
        call = vi.fn();
    }

    class MockTransactionBuilder {
        addOperation = vi.fn().mockReturnThis();
        setTimeout = vi.fn().mockReturnThis();
        build = vi.fn().mockReturnValue({
            toXDR: vi.fn().mockReturnValue('mock-xdr'),
        });
        static fromXDR = vi.fn().mockReturnValue({});
    }

    return {
        Contract: MockContract,
        TransactionBuilder: MockTransactionBuilder,
        BASE_FEE: '100',
        scValToNative: vi.fn().mockReturnValue('GTEST123'),
        nativeToScVal: vi.fn(),
        rpc: {
            Server: MockServer,
            Api: {
                isSimulationError: vi.fn().mockReturnValue(false),
            },
            assembleTransaction: vi.fn().mockReturnValue({
                build: vi.fn().mockReturnValue({
                    toXDR: vi.fn().mockReturnValue('prepared-xdr'),
                }),
            }),
        },
    };
});

// Mock Freighter API
vi.mock('@stellar/freighter-api', () => ({
    signTransaction: vi.fn().mockResolvedValue({
        signedTxXdr: 'signed-xdr',
    }),
}));

describe('StellarService', () => {
    let service: StellarService;
    let mockParams: TokenDeployParams;

    beforeEach(() => {
        service = new StellarService('testnet');
        mockParams = {
            name: 'Test Token',
            symbol: 'TEST',
            decimals: 7,
            initialSupply: '1000000',
            adminWallet: 'GTEST123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABCDEFG',
        };

        // Mock window.freighter
        (global as unknown as { window: { freighter?: { requestPublicKey: () => void } } }).window = {
            freighter: {
                requestPublicKey: vi.fn(),
            },
        };
    });

    describe('deployToken', () => {
        it('should successfully deploy a token without metadata', async () => {
            const result = await service.deployToken(mockParams);

            expect(result).toHaveProperty('tokenAddress');
            expect(result).toHaveProperty('transactionHash');
            expect(result).toHaveProperty('totalFee');
            expect(result).toHaveProperty('timestamp');
            expect(result.transactionHash).toBe('test-hash');
            expect(result.totalFee).toBe('70000000');
        });

        it('should successfully deploy a token with metadata', async () => {
            const paramsWithMetadata = {
                ...mockParams,
                metadata: {
                    image: new File([''], 'test.png'),
                    description: 'Test description',
                },
            };

            const result = await service.deployToken(paramsWithMetadata);

            expect(result).toHaveProperty('tokenAddress');
            expect(result.totalFee).toBe('100000000');
        });

        it('should throw error when Freighter is not available', async () => {
            (global as unknown as { window: { freighter?: unknown } }).window.freighter = undefined;

            await expect(service.deployToken(mockParams)).rejects.toThrow(
                'Wallet not connected'
            );
        });
    });

    describe('constructor', () => {
        it('should initialize with testnet configuration', () => {
            const testnetService = new StellarService('testnet');
            expect(testnetService).toBeInstanceOf(StellarService);
        });

        it('should initialize with mainnet configuration', () => {
            const mainnetService = new StellarService('mainnet');
            expect(mainnetService).toBeInstanceOf(StellarService);
        });
    });
});
