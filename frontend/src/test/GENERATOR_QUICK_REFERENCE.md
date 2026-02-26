# Generator Quick Reference Guide

## 🎯 Quick Start

```typescript
import * as fc from 'fast-check';
import { validStellarAddress, invalidStellarAddress, validTokenParams } from './generators';

// Run a property test with 1000 iterations
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    // Your test logic here
    expect(address).toHaveLength(56);
  }),
  { numRuns: 1000 }
);
```

---

## 📚 Available Generators

### Stellar Address Generators

#### `validStellarAddress()`
Generates valid Stellar addresses (G + 55 base32 characters).

```typescript
fc.sample(validStellarAddress(), 3);
// ['GABC...XYZ', 'G234...567', 'GDEF...ABC']
```

#### `invalidStellarAddress()`
Generates invalid addresses with various patterns (wrong length, prefix, characters, etc.).

```typescript
fc.sample(invalidStellarAddress(), 3);
// ['', 'AABC...', 'Gabc...'] (various invalid patterns)
```

#### `invalidStellarAddressWithReason()`
Generates invalid addresses with categorized reasons.

```typescript
fc.sample(invalidStellarAddressWithReason(), 2);
// [
//   { address: 'ABC', reason: 'too_short' },
//   { address: 'AABC...', reason: 'wrong_prefix' }
// ]
```

---

### Token Parameter Generators

#### `validTokenName()`
Generates 1-32 alphanumeric characters + spaces.

```typescript
fc.sample(validTokenName(), 3);
// ['My Token', 'Token123', 'ABC']
```

#### `validTokenSymbol()`
Generates 1-12 uppercase letters.

```typescript
fc.sample(validTokenSymbol(), 3);
// ['USD', 'MYTOKEN', 'ABC']
```

#### `validDecimals()`
Generates integers 0-18.

```typescript
fc.sample(validDecimals(), 3);
// [7, 18, 0]
```

#### `validInitialSupply()`
Generates positive BigInt as string.

```typescript
fc.sample(validInitialSupply(), 3);
// ['1000000', '500', '9007199254740991']
```

#### `validDescription()`
Generates strings up to 500 characters.

```typescript
fc.sample(validDescription(), 2);
// ['Short description', 'A longer description...']
```

#### `validTokenParams()`
Generates complete token deployment parameters.

```typescript
fc.sample(validTokenParams(), 1);
// [{
//   name: 'My Token',
//   symbol: 'MTK',
//   decimals: 7,
//   initialSupply: '1000000',
//   adminWallet: 'GABC...XYZ',
//   metadata: { image: File, description: '...' }
// }]
```

---

### Fee Generators

#### `feeAmount(min?, max?)`
Generates fee amounts in configurable range (default: 5-20).

```typescript
fc.sample(feeAmount(), 3);
// [10, 15, 7]

fc.sample(feeAmount(100, 200), 3);
// [150, 120, 180]
```

#### `validFeeAmount()`
Generates valid fees (5-20 XLM).

```typescript
fc.sample(validFeeAmount(), 3);
// [10, 15, 7]
```

#### `insufficientFeeAmount()`
Generates insufficient fees (0-4 XLM).

```typescript
fc.sample(insufficientFeeAmount(), 3);
// [2, 0, 4]
```

#### `excessiveFeeAmount()`
Generates excessive fees (100-10000 XLM).

```typescript
fc.sample(excessiveFeeAmount(), 3);
// [500, 2000, 8000]
```

---

### Metadata & URI Generators

#### `metadataUri()`
Generates IPFS or HTTP metadata URIs.

```typescript
fc.sample(metadataUri(), 3);
// [
//   'ipfs://QmABC...XYZ',
//   'ipfs://bafyABC...XYZ',
//   'https://example.com/abc123...'
// ]
```

---

### Operation Generators

#### `tokenOperation()`
Generates a single token operation (deploy, transfer, mint, burn, approve).

```typescript
fc.sample(tokenOperation(), 2);
// [
//   { type: 'deploy', params: {...}, timestamp: 1234567890 },
//   { type: 'transfer', params: {...}, timestamp: 1234567891 }
// ]
```

#### `tokenOperationSequence(minLength?, maxLength?)`
Generates a sequence of operations (default: 1-10).

```typescript
fc.sample(tokenOperationSequence(3, 5), 1);
// [[
//   { type: 'deploy', ... },
//   { type: 'mint', ... },
//   { type: 'transfer', ... }
// ]]
```

---

### Utility Generators

#### `transactionHash()`
Generates 64-character hex transaction hashes.

```typescript
fc.sample(transactionHash(), 2);
// ['abc123...def456', '789abc...012def']
```

#### `timestamp()`
Generates Unix timestamps (milliseconds, from 2021-01-01 to now).

```typescript
fc.sample(timestamp(), 3);
// [1609459200000, 1640995200000, 1672531200000]
```

#### `networkType()`
Generates network types ('testnet' or 'mainnet').

```typescript
fc.sample(networkType(), 4);
// ['testnet', 'mainnet', 'testnet', 'mainnet']
```

---

## 🔧 Common Patterns

### Testing Validation Functions

```typescript
import * as fc from 'fast-check';
import { isValidStellarAddress } from '../validation';
import { validStellarAddress, invalidStellarAddress } from './generators';

describe('Address Validation', () => {
  it('accepts all valid addresses', () => {
    fc.assert(
      fc.property(validStellarAddress(), (address) => {
        expect(isValidStellarAddress(address)).toBe(true);
      }),
      { numRuns: 1000 }
    );
  });

  it('rejects all invalid addresses', () => {
    fc.assert(
      fc.property(invalidStellarAddress(), (address) => {
        expect(isValidStellarAddress(address)).toBe(false);
      }),
      { numRuns: 1000 }
    );
  });
});
```

### Testing Idempotency

```typescript
it('returns same result when called multiple times', () => {
  fc.assert(
    fc.property(validStellarAddress(), (address) => {
      const result1 = isValidStellarAddress(address);
      const result2 = isValidStellarAddress(address);
      expect(result1).toBe(result2);
    }),
    { numRuns: 1000 }
  );
});
```

### Testing Invariants

```typescript
it('maintains format invariants', () => {
  fc.assert(
    fc.property(validStellarAddress(), (address) => {
      expect(address).toHaveLength(56);
      expect(address[0]).toBe('G');
      expect(address).toMatch(/^[A-Z2-7]+$/);
    }),
    { numRuns: 1000 }
  );
});
```

### Combining Generators

```typescript
it('handles multiple parameters', () => {
  fc.assert(
    fc.property(
      validTokenName(),
      validTokenSymbol(),
      validDecimals(),
      (name, symbol, decimals) => {
        const params = { name, symbol, decimals };
        // Test with combined parameters
      }
    ),
    { numRuns: 500 }
  );
});
```

### Using fc.oneof for Variants

```typescript
it('handles various fee amounts', () => {
  fc.assert(
    fc.property(
      fc.oneof(
        validFeeAmount(),
        insufficientFeeAmount(),
        excessiveFeeAmount()
      ),
      (fee) => {
        // Test with different fee ranges
      }
    ),
    { numRuns: 1000 }
  );
});
```

---

## ⚙️ Configuration Options

### Number of Runs

```typescript
{ numRuns: 1000 }  // Default: 100, Recommended: 1000+
```

### Seed for Reproducibility

```typescript
{ seed: 42, numRuns: 1000 }  // Same seed = same test cases
```

### Verbose Output

```typescript
{ verbose: true, numRuns: 100 }  // Shows generated values
```

### Custom Timeout

```typescript
{ timeout: 5000, numRuns: 1000 }  // 5 second timeout
```

---

## 📊 Best Practices

1. **Use 1000+ runs** for critical validation logic
2. **Use 100-500 runs** for complex operations or slower tests
3. **Combine generators** to test interactions
4. **Test edge cases** explicitly when needed
5. **Use seeds** for debugging failing tests
6. **Document** what properties you're testing
7. **Keep tests fast** - optimize slow generators
8. **Test invariants** not just specific values

---

## 🐛 Debugging Tips

### See Generated Values

```typescript
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    console.log('Testing:', address);  // Add logging
    expect(isValidStellarAddress(address)).toBe(true);
  }),
  { verbose: true, numRuns: 10 }  // Verbose + fewer runs
);
```

### Reproduce Failures

When a test fails, fast-check shows the seed:
```
Property failed after 1 test
{ seed: 1234567890, path: "0:1:2", endOnFailure: true }
```

Use it to reproduce:
```typescript
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    // Your test
  }),
  { seed: 1234567890, path: "0:1:2" }
);
```

### Sample Values

```typescript
// Generate sample values to inspect
const samples = fc.sample(validStellarAddress(), 10);
console.log(samples);
```

---

## 📖 Further Reading

- [fast-check Documentation](https://fast-check.dev/)
- [Property-Based Testing Guide](https://fast-check.dev/docs/introduction/)
- [Generator Examples](./generator-examples.ts)
- [Property Test Summary](../utils/__tests__/PROPERTY_TESTS_SUMMARY.md)
