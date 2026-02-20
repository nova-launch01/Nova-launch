import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isValidStellarAddress } from '../validation';
import {
    validStellarAddress,
    invalidStellarAddress,
    invalidStellarAddressWithReason,
} from '../../test/generators';

const withGuaranteedLowercaseChar = (address: string): string => {
    const firstUppercaseIndex = address.slice(1).search(/[A-Z]/);
    if (firstUppercaseIndex >= 0) {
        const position = firstUppercaseIndex + 1;
        return `${address.slice(0, position)}${address[position].toLowerCase()}${address.slice(position + 1)}`;
    }

    return `g${address.slice(1)}`;
};

/**
 * Comprehensive property-based tests for Stellar address validation
 * This file provides additional edge cases and comprehensive coverage
 * beyond the basic validation.property.test.ts
 */
describe('Stellar Address Validation - Comprehensive Property Tests', () => {
    describe('Valid address properties', () => {
        it('should validate that all generated valid addresses pass validation', () => {
            fc.assert(
                fc.property(validStellarAddress(), (address) => {
                    expect(isValidStellarAddress(address)).toBe(true);
                }),
                { numRuns: 1000 }
            );
        });

        it('should verify valid addresses have correct structure', () => {
            fc.assert(
                fc.property(validStellarAddress(), (address) => {
                    // Must start with G
                    expect(address[0]).toBe('G');
                    
                    // Must be exactly 56 characters
                    expect(address.length).toBe(56);
                    
                    // Must only contain valid base32 characters
                    expect(address).toMatch(/^[A-Z2-7]+$/);
                    
                    // Must not contain invalid base32 characters (0, 1, 8, 9)
                    expect(address).not.toMatch(/[0189]/);
                }),
                { numRuns: 1000 }
            );
        });

        it('should verify all characters are uppercase', () => {
            fc.assert(
                fc.property(validStellarAddress(), (address) => {
                    expect(address).toBe(address.toUpperCase());
                }),
                { numRuns: 1000 }
            );
        });

        it('should verify no whitespace in valid addresses', () => {
            fc.assert(
                fc.property(validStellarAddress(), (address) => {
                    expect(address).not.toMatch(/\s/);
                }),
                { numRuns: 1000 }
            );
        });
    });

    describe('Invalid address patterns', () => {
        it('should reject all generated invalid addresses', () => {
            fc.assert(
                fc.property(invalidStellarAddress(), (address) => {
                    expect(isValidStellarAddress(address)).toBe(false);
                }),
                { numRuns: 1000 }
            );
        });

        it('should reject addresses with wrong length', () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.string({ maxLength: 55 }),
                        fc.string({ minLength: 57, maxLength: 100 })
                    ),
                    (address) => {
                        if (address.length !== 56) {
                            expect(isValidStellarAddress(address)).toBe(false);
                        }
                    }
                ),
                { numRuns: 1000 }
            );
        });

        it('should reject addresses not starting with G', () => {
            fc.assert(
                fc.property(
                    fc
                        .tuple(
                            fc.constantFrom(...'ABCDEFHIJKLMNOPQRSTUVWXYZ234567'.split('')),
                            fc.array(
                                fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('')),
                                { minLength: 55, maxLength: 55 }
                            )
                        )
                        .map(([prefix, rest]) => prefix + rest.join('')),
                    (address) => {
                        expect(isValidStellarAddress(address)).toBe(false);
                    }
                ),
                { numRuns: 1000 }
            );
        });

        it('should reject addresses with lowercase characters', () => {
            fc.assert(
                fc.property(
                    validStellarAddress().map(withGuaranteedLowercaseChar),
                    (address) => {
                        expect(isValidStellarAddress(address)).toBe(false);
                    }
                ),
                { numRuns: 500 }
            );
        });

        it('should reject addresses with invalid base32 characters (0, 1, 8, 9)', () => {
            fc.assert(
                fc.property(
                    fc
                        .tuple(
                            fc.constant('G'),
                            fc.array(
                                fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('')),
                                { minLength: 54, maxLength: 54 }
                            ),
                            fc.constantFrom('0', '1', '8', '9')
                        )
                        .map(([prefix, middle, invalid]) => prefix + middle.join('') + invalid),
                    (address) => {
                        expect(isValidStellarAddress(address)).toBe(false);
                    }
                ),
                { numRuns: 1000 }
            );
        });

        it('should reject addresses with special characters', () => {
            fc.assert(
                fc.property(
                    fc
                        .tuple(
                            fc.constant('G'),
                            fc.array(
                                fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('')),
                                { minLength: 54, maxLength: 54 }
                            ),
                            fc.constantFrom(...'!@#$%^&*()-_=+[]{}|;:,.<>?/~`'.split(''))
                        )
                        .map(([prefix, middle, special]) => prefix + middle.join('') + special),
                    (address) => {
                        expect(isValidStellarAddress(address)).toBe(false);
                    }
                ),
                { numRuns: 1000 }
            );
        });

        it('should categorize invalid addresses by reason', () => {
            fc.assert(
                fc.property(invalidStellarAddressWithReason(), ({ address, reason }) => {
                    expect(isValidStellarAddress(address)).toBe(false);

                    // Verify the reason matches the actual issue
                    switch (reason) {
                        case 'too_short':
                            expect(address.length).toBeLessThan(56);
                            break;
                        case 'too_long':
                            expect(address.length).toBeGreaterThan(56);
                            break;
                        case 'wrong_prefix':
                            if (address.length > 0) {
                                expect(address[0]).not.toBe('G');
                            }
                            break;
                        case 'invalid_chars':
                            expect(address).toMatch(/[^A-Z2-7]/);
                            break;
                        case 'empty':
                            expect(address).toBe('');
                            break;
                    }
                }),
                { numRuns: 1000 }
            );
        });
    });

    describe('Edge cases and boundary conditions', () => {
        it('should reject empty string', () => {
            expect(isValidStellarAddress('')).toBe(false);
        });

        it('should reject null and undefined', () => {
            // @ts-expect-error Testing runtime behavior
            expect(isValidStellarAddress(null)).toBe(false);
            // @ts-expect-error Testing runtime behavior
            expect(isValidStellarAddress(undefined)).toBe(false);
        });

        it('should reject addresses with leading whitespace', () => {
            fc.assert(
                fc.property(
                    validStellarAddress().chain((addr) =>
                        fc.constantFrom(' ', '\t', '\n', '  ').map((ws) => ws + addr)
                    ),
                    (address) => {
                        expect(isValidStellarAddress(address)).toBe(false);
                    }
                ),
                { numRuns: 500 }
            );
        });

        it('should reject addresses with trailing whitespace', () => {
            fc.assert(
                fc.property(
                    validStellarAddress().chain((addr) =>
                        fc.constantFrom(' ', '\t', '\n', '  ').map((ws) => addr + ws)
                    ),
                    (address) => {
                        expect(isValidStellarAddress(address)).toBe(false);
                    }
                ),
                { numRuns: 500 }
            );
        });

        it('should reject addresses with internal whitespace', () => {
            fc.assert(
                fc.property(
                    validStellarAddress().chain((addr) =>
                        fc.integer({ min: 1, max: addr.length - 1 }).map((pos) =>
                            addr.substring(0, pos) + ' ' + addr.substring(pos + 1)
                        )
                    ),
                    (address) => {
                        expect(isValidStellarAddress(address)).toBe(false);
                    }
                ),
                { numRuns: 500 }
            );
        });

        it('should reject addresses with mixed case', () => {
            fc.assert(
                fc.property(
                    validStellarAddress().map(withGuaranteedLowercaseChar),
                    (address) => {
                        expect(isValidStellarAddress(address)).toBe(false);
                    }
                ),
                { numRuns: 500 }
            );
        });

        it('should handle addresses at exact length boundary (56 chars)', () => {
            fc.assert(
                fc.property(validStellarAddress(), (address) => {
                    expect(address.length).toBe(56);
                    expect(isValidStellarAddress(address)).toBe(true);
                }),
                { numRuns: 1000 }
            );
        });

        it('should reject addresses just below length boundary (55 chars)', () => {
            fc.assert(
                fc.property(
                    fc
                        .array(
                            fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('')),
                            { minLength: 55, maxLength: 55 }
                        )
                        .map((chars) => 'G' + chars.slice(0, 54).join('')),
                    (address) => {
                        expect(address.length).toBe(55);
                        expect(isValidStellarAddress(address)).toBe(false);
                    }
                ),
                { numRuns: 500 }
            );
        });

        it('should reject addresses just above length boundary (57 chars)', () => {
            fc.assert(
                fc.property(
                    fc
                        .array(
                            fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('')),
                            { minLength: 56, maxLength: 56 }
                        )
                        .map((chars) => 'G' + chars.join('')),
                    (address) => {
                        expect(address.length).toBe(57);
                        expect(isValidStellarAddress(address)).toBe(false);
                    }
                ),
                { numRuns: 500 }
            );
        });
    });

    describe('Validation consistency', () => {
        it('should be idempotent (same result on multiple calls)', () => {
            fc.assert(
                fc.property(fc.string(), (address) => {
                    const result1 = isValidStellarAddress(address);
                    const result2 = isValidStellarAddress(address);
                    const result3 = isValidStellarAddress(address);
                    expect(result1).toBe(result2);
                    expect(result2).toBe(result3);
                }),
                { numRuns: 1000 }
            );
        });

        it('should be deterministic (same input always gives same output)', () => {
            fc.assert(
                fc.property(fc.string(), (address) => {
                    const results = Array.from({ length: 10 }, () =>
                        isValidStellarAddress(address)
                    );
                    expect(new Set(results).size).toBe(1);
                }),
                { numRuns: 500 }
            );
        });

        it('should never accept invalid addresses as valid', () => {
            fc.assert(
                fc.property(invalidStellarAddress(), (address) => {
                    expect(isValidStellarAddress(address)).not.toBe(true);
                }),
                { numRuns: 1000 }
            );
        });

        it('should never reject valid addresses as invalid', () => {
            fc.assert(
                fc.property(validStellarAddress(), (address) => {
                    expect(isValidStellarAddress(address)).not.toBe(false);
                }),
                { numRuns: 1000 }
            );
        });
    });

    describe('Performance and stress testing', () => {
        it('should handle large batches of validations efficiently', () => {
            const addresses = fc.sample(validStellarAddress(), 1000);
            const startTime = Date.now();
            
            addresses.forEach((address) => {
                isValidStellarAddress(address);
            });
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should validate 1000 addresses in less than 100ms
            expect(duration).toBeLessThan(100);
        });

        it('should handle validation of very long strings efficiently', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1000, maxLength: 10000 }),
                    (longString) => {
                        const startTime = Date.now();
                        isValidStellarAddress(longString);
                        const endTime = Date.now();
                        
                        // Should complete in less than 10ms
                        expect(endTime - startTime).toBeLessThan(10);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Real-world address patterns', () => {
        it('should validate known valid Stellar addresses', () => {
            const knownValidAddresses = [
                'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ',
                'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H',
            ];

            knownValidAddresses.forEach((address) => {
                expect(isValidStellarAddress(address)).toBe(true);
            });
        });

        it('should reject known invalid Stellar addresses', () => {
            const knownInvalidAddresses = [
                'invalid',
                'AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Wrong prefix
                'GXXX', // Too short
                '', // Empty
                'gxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Lowercase
                'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Too long (57)
                'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Too short (55)
                'G0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Contains 0
                'G1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Contains 1
                'G8XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Contains 8
                'G9XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Contains 9
            ];

            knownInvalidAddresses.forEach((address) => {
                expect(isValidStellarAddress(address)).toBe(false);
            });
        });
    });
});
