/**
 * IPFS Service for uploading token logos to Pinata
 */

import { IPFS_CONFIG } from '../config/ipfs';
import type { ImageValidationResult } from '../utils/imageValidation';

export interface IPFSUploadResult {
  success: boolean;
  ipfsHash?: string;
  ipfsUrl?: string;
  error?: string;
}

export interface IPFSMetadata {
  name: string;
  keyvalues?: Record<string, string>;
}

export interface IPFSUploadProgress {
  loaded: number;
  total?: number;
  percent: number; // 0-100
  timeElapsedMs: number;
  estimatedRemainingMs?: number;
}

export interface IPFSUploadHandle {
  promise: Promise<IPFSUploadResult>;
  abort: () => void;
}

/**
 * Upload image to IPFS via Pinata
 */
export async function uploadToIPFS(
  file: File,
  validationResult: ImageValidationResult,
  metadata?: IPFSMetadata
): Promise<IPFSUploadResult> {
  try {
    // Validate that the image passed validation
    if (!validationResult.valid) {
      return {
        success: false,
        error: 'Image validation failed: ' + validationResult.errors.join(', '),
      };
    }

    // Check API credentials
    if (!IPFS_CONFIG.apiKey || !IPFS_CONFIG.apiSecret) {
      return {
        success: false,
        error: 'IPFS API credentials not configured. Please set VITE_IPFS_API_KEY and VITE_IPFS_API_SECRET.',
      };
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata if provided
    if (metadata) {
      const pinataMetadata = {
        name: metadata.name,
        keyvalues: {
          ...metadata.keyvalues,
          width: validationResult.metadata?.width.toString() || '',
          height: validationResult.metadata?.height.toString() || '',
          size: validationResult.metadata?.size.toString() || '',
          type: validationResult.metadata?.type || '',
        },
      };
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
    }

    // Upload to Pinata
    const response = await fetch(`${IPFS_CONFIG.pinataApiUrl}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'pinata_api_key': IPFS_CONFIG.apiKey,
        'pinata_secret_api_key': IPFS_CONFIG.apiSecret,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error?.details || `Upload failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;
    const ipfsUrl = `${IPFS_CONFIG.pinataGateway}/${ipfsHash}`;

    return {
      success: true,
      ipfsHash,
      ipfsUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during upload',
    };
  }
}

/**
 * Upload image to IPFS via Pinata with progress and cancellation support.
 * Returns an object with a promise for the final result and an abort() function.
 */
export function uploadToIPFSWithProgress(
  file: File,
  validationResult: ImageValidationResult,
  metadata?: IPFSMetadata,
  onProgress?: (p: IPFSUploadProgress) => void
): IPFSUploadHandle {
  const start = Date.now();

  // Prepare form data
  const formData = new FormData();
  formData.append('file', file);

  if (metadata) {
    const pinataMetadata = {
      name: metadata.name,
      keyvalues: {
        ...metadata.keyvalues,
        width: validationResult.metadata?.width.toString() || '',
        height: validationResult.metadata?.height.toString() || '',
        size: validationResult.metadata?.size.toString() || '',
        type: validationResult.metadata?.type || '',
      },
    };
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
  }

  const xhr = new XMLHttpRequest();

  const promise: Promise<IPFSUploadResult> = new Promise((resolve) => {
    try {
      if (!IPFS_CONFIG.apiKey || !IPFS_CONFIG.apiSecret) {
        resolve({ success: false, error: 'IPFS API credentials not configured. Please set VITE_IPFS_API_KEY and VITE_IPFS_API_SECRET.' });
        return;
      }

      xhr.open('POST', `${IPFS_CONFIG.pinataApiUrl}/pinning/pinFileToIPFS`);
      xhr.setRequestHeader('pinata_api_key', IPFS_CONFIG.apiKey);
      xhr.setRequestHeader('pinata_secret_api_key', IPFS_CONFIG.apiSecret);

      xhr.upload.onprogress = (ev) => {
        const now = Date.now();
        const timeElapsedMs = now - start;
        const loaded = ev.loaded;
        const total = ev.lengthComputable ? ev.total : undefined;
        const percent = total ? Math.min(100, Math.round((loaded / total) * 100)) : Math.round((loaded / (file.size || 1)) * 100);

        let estimatedRemainingMs: number | undefined;
        if (total && loaded > 0 && timeElapsedMs > 0) {
          const speed = loaded / (timeElapsedMs / 1000); // bytes/sec
          const remainingBytes = total - loaded;
          estimatedRemainingMs = Math.round((remainingBytes / (speed || 1)) * 1000);
        }

        onProgress?.({ loaded, total, percent, timeElapsedMs, estimatedRemainingMs });
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const ipfsHash = data.IpfsHash;
            const ipfsUrl = `${IPFS_CONFIG.pinataGateway}/${ipfsHash}`;
            resolve({ success: true, ipfsHash, ipfsUrl });
          } catch (e) {
            resolve({ success: false, error: 'Invalid JSON response from IPFS provider' });
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText || '{}');
            resolve({ success: false, error: data.error?.details || `Upload failed with status ${xhr.status}` });
          } catch (e) {
            resolve({ success: false, error: `Upload failed with status ${xhr.status}` });
          }
        }
      };

      xhr.onerror = () => {
        resolve({ success: false, error: 'Network error occurred during upload' });
      };

      xhr.onabort = () => {
        resolve({ success: false, error: 'Upload canceled by user' });
      };

      xhr.send(formData);
    } catch (error) {
      resolve({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred during upload' });
    }
  });

  return {
    promise,
    abort: () => {
      try {
        xhr.abort();
      } catch (e) {
        // ignore
      }
    },
  };
}

/**
 * Unpin file from IPFS (cleanup)
 */
export async function unpinFromIPFS(ipfsHash: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!IPFS_CONFIG.apiKey || !IPFS_CONFIG.apiSecret) {
      return {
        success: false,
        error: 'IPFS API credentials not configured',
      };
    }

    const response = await fetch(`${IPFS_CONFIG.pinataApiUrl}/pinning/unpin/${ipfsHash}`, {
      method: 'DELETE',
      headers: {
        'pinata_api_key': IPFS_CONFIG.apiKey,
        'pinata_secret_api_key': IPFS_CONFIG.apiSecret,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error?.details || `Unpin failed with status ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during unpin',
    };
  }
}

/**
 * Test IPFS connection
 */
export async function testIPFSConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!IPFS_CONFIG.apiKey || !IPFS_CONFIG.apiSecret) {
      return {
        success: false,
        error: 'IPFS API credentials not configured',
      };
    }

    const response = await fetch(`${IPFS_CONFIG.pinataApiUrl}/data/testAuthentication`, {
      method: 'GET',
      headers: {
        'pinata_api_key': IPFS_CONFIG.apiKey,
        'pinata_secret_api_key': IPFS_CONFIG.apiSecret,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Authentication failed with status ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    };
  }
}
