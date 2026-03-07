import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG, getNetworkConfig } from '../config/stellar';
import type { TokenInfo, TransactionDetails, AppError, BurnTokenParams, BurnResult, BurnRecord } from '../types';
import { ErrorCode } from '../types';

export class StellarService {
  private network: 'testnet' | 'mainnet';
  private server: StellarSdk.SorobanRpc.Server;
  private horizonServer: StellarSdk.Horizon.Server;
  private networkPassphrase: string;
  private contractClient: StellarSdk.Contract | null = null;

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
    const config = getNetworkConfig(network);
    
    this.server = new StellarSdk.SorobanRpc.Server(config.sorobanRpcUrl);
    this.horizonServer = new StellarSdk.Horizon.Server(config.horizonUrl);
    this.networkPassphrase = config.networkPassphrase;
    
    this.initializeContractClient();
  }

  private initializeContractClient(): void {
    const contractId = STELLAR_CONFIG.factoryContractId;
    if (!contractId) {
      console.warn('Factory contract ID not configured');
      return;
    }

    try {
      this.contractClient = new StellarSdk.Contract(contractId);
    } catch (error) {
      throw this.createError(
        ErrorCode.CONTRACT_ERROR,
        'Failed to initialize contract client',
        error instanceof Error ? error.message : undefined
      );
    }
  }

  switchNetwork(network: 'testnet' | 'mainnet'): void {
    if (this.network === network) return;

    this.network = network;
    const config = getNetworkConfig(network);
    
    this.server = new StellarSdk.SorobanRpc.Server(config.sorobanRpcUrl);
    this.horizonServer = new StellarSdk.Horizon.Server(config.horizonUrl);
    this.networkPassphrase = config.networkPassphrase;
    
    this.initializeContractClient();
  }

  getNetwork(): 'testnet' | 'mainnet' {
    return this.network;
  }

  getContractClient(): StellarSdk.Contract {
    if (!this.contractClient) {
      throw this.createError(
        ErrorCode.CONTRACT_ERROR,
        'Contract client not initialized',
        'Factory contract ID not configured'
      );
    }
    return this.contractClient;
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      StellarSdk.Address.fromString(tokenAddress);
    } catch {
      throw this.createError(ErrorCode.INVALID_INPUT, 'Invalid token address');
    }

    try {
      const txHistory = await this.horizonServer
        .transactions()
        .forAccount(tokenAddress)
        .limit(1)
        .order('asc')
        .call();

      const firstTx = txHistory.records[0];

      return {
        address: tokenAddress,
        name: '',
        symbol: '',
        decimals: 7,
        totalSupply: '0',
        creator: firstTx?.source_account || '',
        metadataUri: undefined,
        deployedAt: firstTx ? new Date(firstTx.created_at).getTime() : Date.now(),
        transactionHash: firstTx?.hash || '',
      };
    } catch (error) {
      throw this.createError(
        ErrorCode.NETWORK_ERROR,
        'Failed to fetch token info',
        error instanceof Error ? error.message : undefined
      );
    }
  }

  async getTransaction(hash: string): Promise<TransactionDetails> {
    try {
      const tx = await this.horizonServer.transactions().transaction(hash).call();
      
      return {
        hash,
        status: tx.successful ? 'success' : 'failed',
        timestamp: new Date(tx.created_at).getTime(),
        fee: tx.fee_charged || '0',
      };
    } catch (error) {
      if (error instanceof StellarSdk.NotFoundError) {
        return {
          hash,
          status: 'pending',
          timestamp: Date.now(),
          fee: '0',
        };
      }
      throw this.createError(
        ErrorCode.NETWORK_ERROR,
        'Failed to fetch transaction',
        error instanceof Error ? error.message : undefined
      );
    }
  }

  private createError(code: string, message: string, details?: string): AppError {
    return { code, message, details };
  }

  /**
   * Burn tokens from the caller's balance
   * @param params - Burn parameters including token address, from address, and amount
   * @returns Burn result with transaction hash and updated balances
   */
  async burnTokens(params: BurnTokenParams): Promise<BurnResult> {
    const { tokenAddress, from, amount } = params;

    try {
      StellarSdk.Address.fromString(tokenAddress);
      StellarSdk.Address.fromString(from);
    } catch {
      throw this.createError(ErrorCode.INVALID_INPUT, 'Invalid address format');
    }

    if (!amount || parseFloat(amount) <= 0) {
      throw this.createError(ErrorCode.INVALID_AMOUNT, 'Burn amount must be greater than zero');
    }

    try {
      const burnAmount = BigInt(Math.floor(parseFloat(amount) * 1e7));
      const contract = this.getContractClient();
      
      const account = await this.server.getAccount(from);
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call(
            'burn',
            StellarSdk.nativeToScVal(tokenAddress, { type: 'address' }),
            StellarSdk.nativeToScVal(from, { type: 'address' }),
            StellarSdk.nativeToScVal(burnAmount, { type: 'i128' })
          )
        )
        .setTimeout(180)
        .build();

      const prepared = await this.server.prepareTransaction(tx);
      const signedXdr = await this.signWithWallet(prepared.toXDR());
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, this.networkPassphrase);
      
      const response = await this.server.sendTransaction(signedTx);
      const result = await this.waitForTransaction(response.hash);
      const burnResult = this.parseBurnResult(result);

      return {
        txHash: response.hash,
        burnedAmount: amount,
        newBalance: burnResult.newBalance,
        newSupply: burnResult.newSupply,
      };
    } catch (error) {
      throw this.handleBurnError(error);
    }
  }

  /**
   * Get burn history for a token
   * @param tokenAddress - Token contract address
   * @returns Array of burn records
   */
  async getBurnHistory(tokenAddress: string): Promise<BurnRecord[]> {
    try {
      StellarSdk.Address.fromString(tokenAddress);
    } catch {
      throw this.createError(ErrorCode.INVALID_INPUT, 'Invalid token address');
    }

    try {
      const events = await this.server.getEvents({
        startLedger: 0,
        filters: [
          {
            type: 'contract',
            contractIds: [STELLAR_CONFIG.factoryContractId],
            topics: [['burn'], [tokenAddress]],
          },
        ],
        limit: 100,
      });

      return events.events?.map((event, index) => this.parseBurnEvent(event, index)) || [];
    } catch (error) {
      throw this.createError(
        ErrorCode.NETWORK_ERROR,
        'Failed to fetch burn history',
        error instanceof Error ? error.message : undefined
      );
    }
  }

  private parseBurnResult(txResult: any): { newBalance: string; newSupply: string } {
    try {
      const returnValue = txResult.returnValue;
      if (returnValue) {
        return {
          newBalance: '0',
          newSupply: '0',
        };
      }
      return { newBalance: '0', newSupply: '0' };
    } catch {
      return { newBalance: '0', newSupply: '0' };
    }
  }

  private parseBurnEvent(event: any, index: number): BurnRecord {
    const timestamp = event.ledgerClosedAt ? new Date(event.ledgerClosedAt).getTime() : Date.now();
    
    return {
      id: `${event.id || index}`,
      timestamp,
      from: '',
      amount: '0',
      isAdminBurn: false,
      txHash: event.txHash || '',
      blockNumber: event.ledger,
    };
  }

  private handleBurnError(error: any): AppError {
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (errorMsg.includes('BurnAmountExceedsBalance')) {
      return this.createError(ErrorCode.INSUFFICIENT_BALANCE, 'Insufficient balance to burn');
    }

    if (errorMsg.includes('InvalidBurnAmount')) {
      return this.createError(ErrorCode.INVALID_AMOUNT, 'Invalid burn amount');
    }

    if (errorMsg.includes('Unauthorized')) {
      return this.createError(ErrorCode.UNAUTHORIZED, 'Not authorized to burn tokens');
    }

    if (errorMsg.includes('rejected')) {
      return this.createError(ErrorCode.WALLET_REJECTED, 'Transaction rejected by wallet');
    }

    return this.createError(ErrorCode.BURN_FAILED, 'Failed to burn tokens', errorMsg);
  }

  private async waitForTransaction(hash: string, timeout = 30000): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const tx = await this.server.getTransaction(hash);
        if (tx.status === 'SUCCESS') {
          return tx;
        }
        if (tx.status === 'FAILED') {
          throw new Error('Transaction failed');
        }
      } catch (error) {
        if (error instanceof Error && !error.message.includes('not found')) {
          throw error;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw this.createError(ErrorCode.TIMEOUT_ERROR, 'Transaction confirmation timeout');
  }

    /**
     * Mint additional tokens to a recipient address
     * @param tokenAddress - The address of the deployed token contract
     * @param recipient - The address to receive the minted tokens
     * @param amount - The amount of tokens to mint (as string to handle large numbers)
     * @param adminAddress - The admin address authorized to mint tokens
     * @returns Transaction hash
     */
    async mintTokens(
        tokenAddress: string,
        recipient: string,
        amount: string,
        adminAddress: string
    ): Promise<string> {
        try {
            // Validate inputs
            if (!tokenAddress || tokenAddress.trim() === '') {
                throw new Error('Token address is required');
            }
            if (!recipient || recipient.trim() === '') {
                throw new Error('Recipient address is required');
            }
            if (!adminAddress || adminAddress.trim() === '') {
                throw new Error('Admin address is required');
            }
            if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
                throw new Error('Invalid amount: must be a positive number');
            }

            // Create contract instance for the token
            const contract = new Contract(tokenAddress);
            
            // Calculate minting fee (assuming similar fee structure to deployment)
            const mintingFee = '1000000'; // 1 XLM in stroops, adjust as needed
            
            // Build contract invocation for mint_tokens
            const operation = contract.call(
                'mint_tokens',
                nativeToScVal(recipient, { type: 'address' }),
                nativeToScVal(amount, { type: 'i128' }),
                nativeToScVal(mintingFee, { type: 'i128' })
            );

            // Get admin account
            const account = await this.server.getAccount(adminAddress);
            
            // Build transaction
            const transaction = new TransactionBuilder(account, {
                fee: BASE_FEE,
                networkPassphrase: this.networkPassphrase,
            })
                .addOperation(operation)
                .setTimeout(30)
                .build();

            // Simulate transaction to validate
            const simulated = await this.server.simulateTransaction(transaction);
            if (SorobanRpc.Api.isSimulationError(simulated)) {
                // Check for authorization errors
                if (simulated.error.includes('unauthorized') || simulated.error.includes('auth')) {
                    throw new Error('Unauthorized: Admin authorization required for minting');
                }
                throw new Error(`Simulation failed: ${simulated.error}`);
            }

            // Prepare transaction
            const prepared = SorobanRpc.assembleTransaction(transaction, simulated).build();

            // Return transaction hash (caller will sign and submit)
            return prepared.hash().toString('hex');
        } catch (error) {
            if (error instanceof Error) {
                // Handle specific error cases
                if (error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
                    throw new Error('Unauthorized: Only the admin can mint tokens');
                }
                if (error.message.includes('Invalid amount')) {
                    throw error;
                }
                throw new Error(`Minting failed: ${error.message}`);
            }
            throw new Error('Minting failed: Unknown error');
        }
    }

    /**
     * Calculate total fee for token deployment
     */
    private calculateTotalFee(params: TokenDeployParams): number {
        const baseFee = 10000000; // 10 XLM base fee
        const metadataFee = params.metadata ? 5000000 : 0; // 5 XLM for metadata
        return baseFee + metadataFee;
    }

    /**
     * Handle and format errors
     */
    private handleError(error: unknown): Error {
        if (error instanceof Error) {
            return error;
        }
        return new Error('An unknown error occurred');
    }
}
