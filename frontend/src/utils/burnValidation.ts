/**
 * Burn validation utilities for token burn operations.
 */

export interface BurnValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface BurnValidationParams {
  amount: string;
  balance: string;
  decimals: number;
  userAddress: string;
  tokenAddress: string;
}

export interface BurnImpact {
  newSupply: string;
  newTotalBurned: string;
  percentOfCurrentSupply: number;
  percentOfInitialSupply: number;
}

const USER_ADDRESS_REGEX = /^G[A-Z2-7]{55}$/;
const TOKEN_ADDRESS_REGEX = /^C[A-Z2-7]{55}$/;

/**
 * Validates burn parameters before submitting a burn transaction.
 */
export function validateBurnAmount(
  params: BurnValidationParams
): BurnValidationResult {
  const errors: Record<string, string> = {};
  const normalizedAmount = params.amount.trim();

  if (!params.amount || normalizedAmount === '') {
    errors.amount = 'Burn amount is required';
  } else {
    const amount = Number.parseFloat(normalizedAmount);
    if (Number.isNaN(amount)) {
      errors.amount = 'Invalid burn amount';
    } else {
      if (amount <= 0) {
        errors.amount = 'Burn amount must be greater than zero';
      }

      const balance = Number.parseFloat(params.balance);
      if (!Number.isNaN(balance) && amount > balance) {
        errors.amount = `Insufficient balance. You have ${params.balance} tokens`;
      }

      const decimalPlaces = (normalizedAmount.split('.')[1] || '').length;
      if (decimalPlaces > params.decimals) {
        errors.amount = `Maximum ${params.decimals} decimal places allowed`;
      }
    }
  }

  if (!isValidUserAddress(params.userAddress)) {
    errors.user = 'Invalid user address';
  }

  if (!isValidTokenAddress(params.tokenAddress)) {
    errors.token = 'Invalid token address';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Performs a lightweight burn amount check for immediate UI state updates.
 */
export function isValidBurnAmount(amount: string, balance: string): boolean {
  const amt = Number.parseFloat(amount);
  const bal = Number.parseFloat(balance);

  return !Number.isNaN(amt) && !Number.isNaN(bal) && amt > 0 && amt <= bal;
}

/**
 * Calculates supply impact metrics for a burn operation.
 */
export function calculateBurnImpact(
  burnAmount: string,
  currentSupply: string,
  totalBurned: string
): BurnImpact {
  const burn = Number.parseFloat(burnAmount);
  const supply = Number.parseFloat(currentSupply);
  const burned = Number.parseFloat(totalBurned);

  const sanitizedBurn = Number.isFinite(burn) ? burn : 0;
  const sanitizedSupply = Number.isFinite(supply) ? supply : 0;
  const sanitizedBurned = Number.isFinite(burned) ? burned : 0;

  const newSupply = sanitizedSupply - sanitizedBurn;
  const newTotalBurned = sanitizedBurned + sanitizedBurn;

  const percentOfSupply = sanitizedSupply > 0
    ? (sanitizedBurn / sanitizedSupply) * 100
    : 0;

  const initialSupply = sanitizedSupply + sanitizedBurned;
  const percentOfTotal = initialSupply > 0
    ? (newTotalBurned / initialSupply) * 100
    : 0;

  return {
    newSupply: newSupply.toString(),
    newTotalBurned: newTotalBurned.toString(),
    percentOfCurrentSupply: percentOfSupply,
    percentOfInitialSupply: percentOfTotal,
  };
}

/**
 * Returns threshold-based warnings for large burn percentages.
 */
export function getBurnWarningMessage(percentOfSupply: number): string | null {
  if (percentOfSupply > 50) {
    return 'Warning: You are burning more than 50% of the current supply!';
  }

  if (percentOfSupply > 25) {
    return 'Warning: You are burning more than 25% of the current supply.';
  }

  if (percentOfSupply > 10) {
    return 'Notice: You are burning more than 10% of the current supply.';
  }

  return null;
}

/**
 * Validates the connected user Stellar account address.
 */
export function isValidUserAddress(address: string): boolean {
  return USER_ADDRESS_REGEX.test(address);
}

/**
 * Validates token contract address used for the burn call.
 */
export function isValidTokenAddress(address: string): boolean {
  return TOKEN_ADDRESS_REGEX.test(address);
}
