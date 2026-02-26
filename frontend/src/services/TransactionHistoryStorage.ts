import type { TokenInfo } from "../types";

const STORAGE_KEY = "transaction_history";
const CURRENT_VERSION = "v1";

/**
 * Storage structure:
 * {
 *   "v1": {
 *     "GXXX...": [TokenInfo, TokenInfo, ...],
 *     "GYYY...": [TokenInfo, ...]
 *   }
 * }
 */
interface StorageData {
  [version: string]: {
    [walletAddress: string]: TokenInfo[];
  };
}

/**
 * Error thrown when storage quota is exceeded
 */
export class StorageQuotaExceededError extends Error {
  constructor(message = "LocalStorage quota exceeded") {
    super(message);
    this.name = "StorageQuotaExceededError";
  }
}

/**
 * TransactionHistoryStorage - Manages local storage for deployed token history
 *
 * Features:
 * - Versioned storage structure for future migrations
 * - Handles storage quota exceeded errors
 * - Automatic data migration support
 * - Persists across browser sessions
 */
export class TransactionHistoryStorage {
  private static instance: TransactionHistoryStorage | null = null;

  /**
   * Create a new instance (for testing)
   */
  static createInstance(): TransactionHistoryStorage {
    return new TransactionHistoryStorage();
  }

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): TransactionHistoryStorage {
    if (!TransactionHistoryStorage.instance) {
      TransactionHistoryStorage.instance = new TransactionHistoryStorage();
    }
    return TransactionHistoryStorage.instance;
  }

  /**
   * Load all data from localStorage and run migrations if needed
   */
  private loadData(): StorageData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return this.getDefaultData();
      }

      const data = JSON.parse(raw) as StorageData;

      // Run migrations if needed
      return this.migrateData(data);
    } catch (error) {
      console.error("Failed to load transaction history data:", error);
      // If data is corrupted, return default
      return this.getDefaultData();
    }
  }

  /**
   * Save data to localStorage with quota handling
   */
  private saveData(data: StorageData): void {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        throw new StorageQuotaExceededError(
          "Unable to save token history: storage quota exceeded. Please clear some browser data.",
        );
      }
      throw error;
    }
  }

  /**
   * Check if error is a quota exceeded error
   */
  private isQuotaExceededError(error: unknown): boolean {
    if (error instanceof DOMException) {
      return (
        error.name === "QuotaExceededError" ||
        error.code === 22 ||
        // Some browsers use NS_ERROR_DOM_QUOTA_REACHED
        error.message.includes("quota")
      );
    }
    return false;
  }

  /**
   * Get default data structure
   */
  private getDefaultData(): StorageData {
    return {
      [CURRENT_VERSION]: {},
    };
  }

  /**
   * Migrate data from older versions to current version
   * This can be extended for future schema changes
   */
  private migrateData(data: StorageData): StorageData {
    // If no version exists, we need to migrate from legacy format
    // Legacy format was: tokens_{walletAddress} -> [TokenInfo, ...]
    if (!data[CURRENT_VERSION]) {
      // Check if there's legacy data to migrate
      const migratedData: StorageData = { [CURRENT_VERSION]: {} };

      // Try to find any existing data and migrate it
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("tokens_")) {
          const walletAddress = key.replace("tokens_", "");
          try {
            const legacyData = localStorage.getItem(key);
            if (legacyData) {
              migratedData[CURRENT_VERSION][walletAddress] =
                JSON.parse(legacyData);
            }
          } catch {
            // Skip invalid legacy data
          }
        }
      }

      // Save migrated data
      this.saveData(migratedData);
      return migratedData;
    }

    return data;
  }

  /**
   * Get all tokens for a specific wallet address
   */
  getTokens(walletAddress: string): TokenInfo[] {
    const data = this.loadData();
    const versionedData = data[CURRENT_VERSION];

    if (!versionedData) {
      return [];
    }

    return versionedData[walletAddress] || [];
  }

  /**
   * Add a new token to the history
   */
  addToken(walletAddress: string, token: TokenInfo): void {
    const data = this.loadData();

    if (!data[CURRENT_VERSION]) {
      data[CURRENT_VERSION] = {};
    }

    const walletTokens = data[CURRENT_VERSION][walletAddress] || [];

    // Check if token already exists (by address)
    const existingIndex = walletTokens.findIndex(
      (t) => t.address === token.address,
    );
    if (existingIndex !== -1) {
      // Update existing token
      walletTokens[existingIndex] = token;
    } else {
      // Add new token at the beginning (most recent first)
      walletTokens.unshift(token);
    }

    data[CURRENT_VERSION][walletAddress] = walletTokens;
    this.saveData(data);
  }

  /**
   * Remove a token from history
   */
  removeToken(walletAddress: string, tokenAddress: string): void {
    const data = this.loadData();

    if (!data[CURRENT_VERSION] || !data[CURRENT_VERSION][walletAddress]) {
      return;
    }

    const walletTokens = data[CURRENT_VERSION][walletAddress];
    const filteredTokens = walletTokens.filter(
      (t) => t.address !== tokenAddress,
    );

    data[CURRENT_VERSION][walletAddress] = filteredTokens;
    this.saveData(data);
  }

  /**
   * Clear all tokens for a specific wallet address
   */
  clearWalletHistory(walletAddress: string): void {
    const data = this.loadData();

    if (data[CURRENT_VERSION]) {
      delete data[CURRENT_VERSION][walletAddress];
      this.saveData(data);
    }
  }

  /**
   * Clear all transaction history
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Get storage size in bytes (approximate)
   */
  getStorageSize(): number {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    return new Blob([raw]).size;
  }

  /**
   * Get all wallet addresses that have stored tokens
   */
  getAllWalletAddresses(): string[] {
    const data = this.loadData();
    const versionedData = data[CURRENT_VERSION];

    if (!versionedData) {
      return [];
    }

    return Object.keys(versionedData);
  }

  /**
   * Check if there's data for a wallet
   */
  hasWalletData(walletAddress: string): boolean {
    const tokens = this.getTokens(walletAddress);
    return tokens.length > 0;
  }
}

// Export singleton instance
export const transactionHistoryStorage =
  TransactionHistoryStorage.getInstance();
