import { IPFS_CONFIG } from '../config/ipfs';
import type { TokenMetadata } from '../types';

interface PinataResponse {
    IpfsHash: string;
}

export class IPFSService {
    async uploadMetadata(image: File, description: string, tokenName: string): Promise<string> {
        if (!IPFS_CONFIG.apiKey || !IPFS_CONFIG.apiSecret) {
            throw new Error('IPFS credentials are not configured');
        }

        const imageHash = await this.uploadImage(image);
        const metadata = {
            name: tokenName,
            description,
            image: `ipfs://${imageHash}`,
        };
        const metadataHash = await this.uploadJson(metadata);

        return `ipfs://${metadataHash}`;
    }

    async getMetadata(uri: string): Promise<TokenMetadata> {
        const response = await fetch(this.toGatewayUrl(uri));

        if (!response.ok) {
            throw new Error('Failed to fetch metadata from IPFS');
        }

        return response.json() as Promise<TokenMetadata>;
    }

    toGatewayUrl(uri: string): string {
        if (!uri.startsWith('ipfs://')) {
            return uri;
        }
        return `${IPFS_CONFIG.pinataGateway}/${uri.replace('ipfs://', '')}`;
    }

    private async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${IPFS_CONFIG.pinataApiUrl}/pinning/pinFileToIPFS`, {
            method: 'POST',
            headers: this.getPinataHeaders(),
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload image to IPFS');
        }

        const data = (await response.json()) as PinataResponse;
        return data.IpfsHash;
    }

    private async uploadJson(payload: Record<string, unknown>): Promise<string> {
        const response = await fetch(`${IPFS_CONFIG.pinataApiUrl}/pinning/pinJSONToIPFS`, {
            method: 'POST',
            headers: {
                ...this.getPinataHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to upload metadata to IPFS');
        }

        const data = (await response.json()) as PinataResponse;
        return data.IpfsHash;
    }

    private getPinataHeaders(): Record<string, string> {
        return {
            pinata_api_key: IPFS_CONFIG.apiKey,
            pinata_secret_api_key: IPFS_CONFIG.apiSecret,
        };
    }
}
