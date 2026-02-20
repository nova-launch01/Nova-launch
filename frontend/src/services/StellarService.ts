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


export class StellarService {
    private server: rpc.Server;
    private networkPassphrase: string;

    constructor(network: 'testnet' | 'mainnet' = 'testnet') {
        const config = getNetworkConfig(network);
        this.server = new rpc.Server(config.sorobanRpcUrl);
        this.networkPassphrase = config.networkPassphrase;
    }

    async deployToken(params: TokenDeployParams): Promise<DeploymentResult> {

                )
                .setTimeout(180)
                .build();

            // Simulate transaction
            const simulatedTx = await this.simulateTransaction(transaction);
            
            // Prepare transaction
            const preparedTx = rpc.assembleTransaction(transaction, simulatedTx).build();

            // Request wallet signature
            const signedXdr = await this.requestSignature(preparedTx.toXDR());
            const signedTx = TransactionBuilder.fromXDR(signedXdr, this.networkPassphrase);

            // Submit to network
            const response = await this.submitTransaction(signedTx);

            // Wait for confirmation
            const result = await this.waitForConfirmation(response.hash);

            // Parse result
            const tokenAddress = this.parseTokenAddress(result);

            return {
                tokenAddress,
                transactionHash: response.hash,
                totalFee,
                timestamp: Date.now(),
            };
        } catch (error) {
            const stellarError = parseStellarError(error);
            logStellarError(stellarError, { params });
            throw stellarError;
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


    }

    private async requestSignature(xdr: string): Promise<string> {
        const signedTxXdr = await WalletService.signTransaction(xdr, this.networkPassphrase);
        if (!signedTxXdr) {
            throw new Error('Transaction signing failed or was rejected');
        }

        return signedTxXdr;
    }


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
