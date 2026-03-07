import { describe, expect, it } from 'vitest';
import {
  calculateBurnImpact,
  getBurnWarningMessage,
  isValidBurnAmount,
  isValidTokenAddress,
  isValidUserAddress,
  validateBurnAmount,
} from '../burnValidation';

const VALID_USER_ADDRESS = `G${'A'.repeat(55)}`;
const VALID_TOKEN_ADDRESS = `C${'A'.repeat(55)}`;

describe('burnValidation', () => {
  describe('validateBurnAmount', () => {
    it('should validate correct burn amount', () => {
      const result = validateBurnAmount({
        amount: '100',
        balance: '1000',
        decimals: 7,
        userAddress: VALID_USER_ADDRESS,
        tokenAddress: VALID_TOKEN_ADDRESS,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject amount exceeding balance', () => {
      const result = validateBurnAmount({
        amount: '2000',
        balance: '1000',
        decimals: 7,
        userAddress: VALID_USER_ADDRESS,
        tokenAddress: VALID_TOKEN_ADDRESS,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.amount).toContain('Insufficient balance');
    });

    it('should reject negative amounts', () => {
      const result = validateBurnAmount({
        amount: '-20',
        balance: '1000',
        decimals: 7,
        userAddress: VALID_USER_ADDRESS,
        tokenAddress: VALID_TOKEN_ADDRESS,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.amount).toBe('Burn amount must be greater than zero');
    });

    it('should reject zero amount', () => {
      const result = validateBurnAmount({
        amount: '0',
        balance: '1000',
        decimals: 7,
        userAddress: VALID_USER_ADDRESS,
        tokenAddress: VALID_TOKEN_ADDRESS,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.amount).toBe('Burn amount must be greater than zero');
    });

    it('should reject empty amount', () => {
      const result = validateBurnAmount({
        amount: '  ',
        balance: '1000',
        decimals: 7,
        userAddress: VALID_USER_ADDRESS,
        tokenAddress: VALID_TOKEN_ADDRESS,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.amount).toBe('Burn amount is required');
    });

    it('should reject invalid numeric amount', () => {
      const result = validateBurnAmount({
        amount: 'abc',
        balance: '1000',
        decimals: 7,
        userAddress: VALID_USER_ADDRESS,
        tokenAddress: VALID_TOKEN_ADDRESS,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.amount).toBe('Invalid burn amount');
    });

    it('should reject too many decimal places', () => {
      const result = validateBurnAmount({
        amount: '1.12345678',
        balance: '1000',
        decimals: 7,
        userAddress: VALID_USER_ADDRESS,
        tokenAddress: VALID_TOKEN_ADDRESS,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.amount).toBe('Maximum 7 decimal places allowed');
    });

    it('should reject invalid user and token addresses', () => {
      const result = validateBurnAmount({
        amount: '10',
        balance: '100',
        decimals: 7,
        userAddress: 'invalid-user-address',
        tokenAddress: 'invalid-token-address',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.user).toBe('Invalid user address');
      expect(result.errors.token).toBe('Invalid token address');
    });

    it('should pass when balance is non-numeric but amount is valid', () => {
      const result = validateBurnAmount({
        amount: '10',
        balance: 'not-a-number',
        decimals: 7,
        userAddress: VALID_USER_ADDRESS,
        tokenAddress: VALID_TOKEN_ADDRESS,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('isValidBurnAmount', () => {
    it('should return true for valid amount and balance', () => {
      expect(isValidBurnAmount('10', '100')).toBe(true);
    });

    it('should return false for invalid amount scenarios', () => {
      expect(isValidBurnAmount('0', '100')).toBe(false);
      expect(isValidBurnAmount('-5', '100')).toBe(false);
      expect(isValidBurnAmount('abc', '100')).toBe(false);
      expect(isValidBurnAmount('101', '100')).toBe(false);
      expect(isValidBurnAmount('10', 'abc')).toBe(false);
    });
  });

  describe('calculateBurnImpact', () => {
    it('should calculate burn impact correctly', () => {
      const impact = calculateBurnImpact('100', '1000', '200');

      expect(impact.newSupply).toBe('900');
      expect(impact.newTotalBurned).toBe('300');
      expect(impact.percentOfCurrentSupply).toBe(10);
      expect(impact.percentOfInitialSupply).toBe(25);
    });

    it('should handle zero current supply safely', () => {
      const impact = calculateBurnImpact('10', '0', '0');

      expect(impact.newSupply).toBe('-10');
      expect(impact.newTotalBurned).toBe('10');
      expect(impact.percentOfCurrentSupply).toBe(0);
      expect(impact.percentOfInitialSupply).toBe(0);
    });

    it('should sanitize invalid numeric values', () => {
      const impact = calculateBurnImpact('x', 'y', 'z');

      expect(impact.newSupply).toBe('0');
      expect(impact.newTotalBurned).toBe('0');
      expect(impact.percentOfCurrentSupply).toBe(0);
      expect(impact.percentOfInitialSupply).toBe(0);
    });
  });

  describe('getBurnWarningMessage', () => {
    it('should return warning for > 50%', () => {
      expect(getBurnWarningMessage(51)).toContain('more than 50%');
    });

    it('should return warning for > 25%', () => {
      expect(getBurnWarningMessage(30)).toContain('more than 25%');
    });

    it('should return notice for > 10%', () => {
      expect(getBurnWarningMessage(15)).toContain('more than 10%');
    });

    it('should return null for <= 10%', () => {
      expect(getBurnWarningMessage(10)).toBeNull();
    });
  });

  describe('address validators', () => {
    it('should validate user addresses with G prefix only', () => {
      expect(isValidUserAddress(VALID_USER_ADDRESS)).toBe(true);
      expect(isValidUserAddress(VALID_TOKEN_ADDRESS)).toBe(false);
    });

    it('should validate token addresses with C prefix only', () => {
      expect(isValidTokenAddress(VALID_TOKEN_ADDRESS)).toBe(true);
      expect(isValidTokenAddress(VALID_USER_ADDRESS)).toBe(false);
    });
  });
});
