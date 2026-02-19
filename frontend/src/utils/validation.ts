/**
 * Validation utilities for token deployment
 */

export const STELLAR_ADDRESS_REGEX = /^G[A-Z2-7]{55}$/;

/**
 * Validate Stellar address format
 */
export function isValidStellarAddress(address: string): boolean {
    return STELLAR_ADDRESS_REGEX.test(address);
}

/**
 * Validate token name (1-32 characters, alphanumeric + spaces + hyphens)
 */
export function isValidTokenName(name: string): boolean {
    if (!name || name.length < 1 || name.length > 32) {
        return false;
    }
    return /^[a-zA-Z0-9\s-]+$/.test(name);
}

/**
 * Validate token symbol (1-12 characters, uppercase alphanumeric)
 */
export function isValidTokenSymbol(symbol: string): boolean {
    if (!symbol || symbol.length < 1 || symbol.length > 12) {
        return false;
    }
    return /^[A-Z0-9]+$/.test(symbol);
}

/**
 * Validate decimals (0-18)
 */
export function isValidDecimals(decimals: number): boolean {
    return Number.isInteger(decimals) && decimals >= 0 && decimals <= 18;
}

/**
 * Validate initial supply (positive number)
 */
export function isValidSupply(supply: string): boolean {
    try {
        const num = BigInt(supply);
        return num > 0n && num <= BigInt(2 ** 53 - 1);
    } catch {
        return false;
    }
}

/**
 * Validate image file
 */
export function isValidImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'File must be PNG, JPG, or SVG' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 5MB' };
    }

    return { valid: true };
}

/**
 * Validate description length
 */
export function isValidDescription(description: string): boolean {
    return description.length <= 500;
}

/**
 * Validate all token deployment parameters
 */
export function validateTokenParams(params: {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: string;
    adminWallet: string;
}): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!isValidTokenName(params.name)) {
        errors.name = 'Token name must be 1-32 alphanumeric characters';
    }

    if (!isValidTokenSymbol(params.symbol)) {
        errors.symbol = 'Token symbol must be 1-12 uppercase letters';
    }

    if (!isValidDecimals(params.decimals)) {
        errors.decimals = 'Decimals must be between 0 and 18';
    }

    if (!isValidSupply(params.initialSupply)) {
        errors.initialSupply = 'Initial supply must be a positive number';
    }

    if (!isValidStellarAddress(params.adminWallet)) {
        errors.adminWallet = 'Invalid Stellar address format';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}
