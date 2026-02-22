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
import { getDeploymentFeeBreakdown as calculateFeeBreakdown } from '../utils/feeCalculation';
import { WalletService } from './wallet';

export { calculateFeeBreakdown as getDeploymentFeeBreakdown };


export class StellarService {
    private server: rpc.Server;
    private networkPassphrase: string;

    constructor(network: 'testnet' | 'mainnet' = 'testnet') {
        const config = getNetworkConfig(network);
        this.server = new rpc.Server(config.sorobanRpcUrl);
        this.networkPassphrase = config.networkPassphrase;
    }

    async deployToken(params: TokenDeployParams): Promise<DeploymentResult> {
        try {
            const account = await this.getAccount(params.adminWallet);
            const contract = new Contract(STELLAR_CONFIG.factoryContractId);

            const transaction = new TransactionBuilder(account, {
                fee: BASE_FEE,
                networkPassphrase: this.networkPassphrase,
            })
                .addOperation(
                    contract.call(
                        'deploy_token',
                        nativeToScVal(params.name, { type: 'string' }),
                        nativeToScVal(params.symbol, { type: 'string' }),
                        nativeToScVal(params.decimals, { type: 'u32' }),
                        nativeToScVal(params.initialSupply, { type: 'i128' }),
                        nativeToScVal(params.adminWallet, { type: 'address' }),
                    )
                )
                .setTimeout(180)
                .build();

            const simulatedTx = await this.simulateTransaction(transaction);
            const preparedTx = rpc.assembleTransaction(transaction, simulatedTx).build();

            const signedXdr = await this.requestSignature(preparedTx.toXDR());
            const signedTx = TransactionBuilder.fromXDR(signedXdr, this.networkPassphrase);

            const response = await this.submitTransaction(signedTx);
            const result = await this.waitForConfirmation(response.hash);
            const tokenAddress = this.parseTokenAddress(result);

            const hasMetadata = !!(params.metadataUri ?? params.metadata);
            const feeBreakdown = calculateFeeBreakdown(hasMetadata);
            const totalFee = String(feeBreakdown.totalFee * 10_000_000); // XLM to stroops

            return {
                tokenAddress,
                transactionHash: response.hash,
                totalFee,
                timestamp: Date.now(),
            };
        } catch (error) {
            throw error instanceof Error ? error : new Error('Token deployment failed');
        }
    }

    private async getAccount(address: string) {
        try {
            return await this.server.getAccount(address);
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                throw new Error('Account not found');
            }
            throw error;
        }
    }

    private async simulateTransaction(transaction: ReturnType<typeof TransactionBuilder.prototype.build>) {
        const simulatedTx = await this.server.simulateTransaction(transaction);
        
        if (rpc.Api.isSimulationError(simulatedTx)) {
            throw new Error(`Simulation failed: ${simulatedTx.error}`);
        }

        return simulatedTx as rpc.Api.SimulateTransactionSuccessResponse;
    }

    private async requestSignature(xdr: string): Promise<string> {
        const signedTxXdr = await WalletService.signTransaction(xdr, this.networkPassphrase);
        if (!signedTxXdr) {
            throw new Error('Transaction signing failed or was rejected');
        }

        return signedTxXdr;
    }

    private async submitTransaction(transaction: any) {
        const response = await this.server.sendTransaction(transaction);

        if (response.status === 'ERROR') {
            throw new Error('Transaction submission failed');
        }

        return response;
    }

    private async waitForConfirmation(hash: string): Promise<rpc.Api.GetTransactionResponse> {
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            try {
                const response = await this.server.getTransaction(hash);

                if (response.status === 'SUCCESS') {
                    return response;
                }

                if (response.status === 'FAILED') {
                    throw new Error('Transaction failed');
                }

                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
            } catch (error) {
                if (attempts === maxAttempts - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
            }
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
