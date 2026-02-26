import { IPFS_CONFIG } from '../config/ipfs';

export interface IPFSUploadResult {
  ipfsHash: string;
  ipfsUri: string;
  pinataUrl: string;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  image?: string;
}

export class IPFSService {
  private apiKey: string;
  private apiSecret: string;

  constructor(apiKey?: string, apiSecret?: string) {
    this.apiKey = apiKey || IPFS_CONFIG.apiKey;
    this.apiSecret = apiSecret || IPFS_CONFIG.apiSecret;
  }

  async uploadImage(file: File): Promise<IPFSUploadResult> {
    // TODO: Implement image upload to Pinata
    throw new Error('Not implemented');
  }

  async uploadMetadata(metadata: TokenMetadata): Promise<IPFSUploadResult> {
    // TODO: Implement metadata JSON upload to Pinata
    throw new Error('Not implemented');
  }

  async retrieveContent(ipfsHash: string): Promise<any> {
    // TODO: Implement content retrieval from IPFS
    throw new Error('Not implemented');
  }

  async unpinContent(ipfsHash: string): Promise<void> {
    // TODO: Implement unpin for cleanup
    throw new Error('Not implemented');
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' };
    }

    return { valid: true };
  }
}
