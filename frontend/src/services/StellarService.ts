import {
    Contract,
    TransactionBuilder,
    BASE_FEE,
    scValToNative,
    nativeToScVal,
    rpc,
} from '@stellar/stellar-sdk';
import type { TokenDeployParams, DeploymentResult, FeeBreakdown } from '../types';
import { STELLAR_CONFIG, getNetworkConfig } from '../config/stellar';
import { WalletService } from './wallet';

const BASE_DEPLOY_FEE_STROOPS = 70_000_000n;
const METADATA_FEE_STROOPS = 30_000_000n;

export function getDeploymentFeeBreakdown(hasMetadata: boolean): FeeBreakdown {
    const baseFee = 7;
    const metadataFee = hasMetadata ? 3 : 0;

    return {
        baseFee,
        metadataFee,
        totalFee: baseFee + metadataFee,
    };
}

export class StellarService {
    private server: rpc.Server;
    private networkPassphrase: string;

    constructor(network: 'testnet' | 'mainnet' = 'testnet') {
        const config = getNetworkConfig(network);
        this.server = new rpc.Server(config.sorobanRpcUrl);
        this.networkPassphrase = config.networkPassphrase;
    }

    async deployToken(params: TokenDeployParams): Promise<DeploymentResult> {
        const { name, symbol, decimals, initialSupply, adminWallet } = params;

        if (!STELLAR_CONFIG.factoryContractId) {
            throw new Error('Factory contract ID is not configured');
        }

        // Get source account
        const sourceAccount = await this.server.getAccount(adminWallet);

        // Build contract invocation
        const contract = new Contract(STELLAR_CONFIG.factoryContractId);
        const totalFeeStroops = this.calculateTotalFee(params);

        // Build transaction
        const transaction = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: this.networkPassphrase,
        })
            .addOperation(
                contract.call(
                    'create_token',
                    nativeToScVal(adminWallet, { type: 'address' }),
                    nativeToScVal(name, { type: 'string' }),
                    nativeToScVal(symbol, { type: 'string' }),
                    nativeToScVal(decimals, { type: 'u32' }),
                    nativeToScVal(BigInt(initialSupply), { type: 'i128' }),
                    nativeToScVal(totalFeeStroops, { type: 'i128' })
                )
            )
            .setTimeout(180)
            .build();

        // Simulate transaction
        const simulatedTx = await this.server.simulateTransaction(transaction);
        
        if (rpc.Api.isSimulationError(simulatedTx)) {
            throw new Error(`Simulation failed: ${simulatedTx.error}`);
        }

        // Prepare transaction
        const preparedTx = rpc.assembleTransaction(transaction, simulatedTx).build();

        // Request wallet signature
        const signedXdr = await this.requestSignature(preparedTx.toXDR());
        const signedTx = TransactionBuilder.fromXDR(signedXdr, this.networkPassphrase);

        // Submit to network
        const response = await this.server.sendTransaction(signedTx);

        if (response.status === 'ERROR') {
            throw new Error(`Transaction failed: ${response.errorResult?.toXDR('base64')}`);
        }

        // Wait for confirmation
        const result = await this.waitForConfirmation(response.hash);

        // Parse result
        const tokenAddress = this.parseTokenAddress(result);

        return {
            tokenAddress,
            transactionHash: response.hash,
            totalFee: totalFeeStroops.toString(),
            timestamp: Date.now(),
        };
    }

    private async requestSignature(xdr: string): Promise<string> {
        const signedTxXdr = await WalletService.signTransaction(xdr, this.networkPassphrase);
        if (!signedTxXdr) {
            throw new Error('Transaction signing failed or was rejected');
        }

        return signedTxXdr;
    }

    private calculateTotalFee(params: TokenDeployParams): bigint {
        const hasMetadata = Boolean(params.metadataUri || params.metadata);
        return hasMetadata ? BASE_DEPLOY_FEE_STROOPS + METADATA_FEE_STROOPS : BASE_DEPLOY_FEE_STROOPS;
    }

    private async waitForConfirmation(hash: string): Promise<rpc.Api.GetTransactionResponse> {
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            const response = await this.server.getTransaction(hash);

            if (response.status === 'SUCCESS') {
                return response;
            }

            if (response.status === 'FAILED') {
                throw new Error('Transaction failed');
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
        }

        throw new Error('Transaction confirmation timeout');
    }

    private parseTokenAddress(result: rpc.Api.GetTransactionResponse): string {
        if (result.status !== 'SUCCESS' || !result.returnValue) {
            throw new Error('Failed to parse token address');
        }

        const address = scValToNative(result.returnValue);
        if (typeof address === 'string' && address.length > 0) {
            return address;
        }

        if (address && typeof address === 'object' && 'toString' in address) {
            const normalized = String(address);
            if (normalized && normalized !== '[object Object]') {
                return normalized;
            }
        }

        throw new Error('Failed to parse token address');
    }
}
