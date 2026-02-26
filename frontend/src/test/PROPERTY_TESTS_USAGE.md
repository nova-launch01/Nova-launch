# Property-Based Testing Usage Guide

## Quick Start

```typescript
import * as fc from 'fast-check';
import { validStellarAddress, invalidStellarAddress, validTokenParams } from './generators';
import { isValidStellarAddress } from '../utils/validation';

// Basic property test
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    expect(isValidStellarAddress(address)).toBe(true);
  }),
  { numRuns: 1000 }
);
```

## Available Generators

### Stellar Address Generators

#### `validStellarAddress()`
Generates valid Stellar addresses (G + 55 base32 chars).

```typescript
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    // address is always valid format
    expect(address).toMatch(/^G[A-Z2-7]{55}$/);
  })
);
```

#### `invalidStellarAddress()`
Generates various invalid address patterns.

```typescript
fc.assert(
  fc.property(invalidStellarAddress(), (address) => {
    expect(isValidStellarAddress(address)).toBe(false);
  })
);
```

#### `invalidStellarAddressWithReason()`
Generates invalid addresses with categorized reasons.

```typescript
fc.assert(
  fc.property(invalidStellarAddressWithReason(), ({ address, reason }) => {
    expect(isValidStellarAddress(address)).toBe(false);
    
    switch (reason) {
      case 'too_short':
        expect(address.length).toBeLessThan(56);
        break;
      case 'too_long':
        expect(address.length).toBeGreaterThan(56);
        break;
      // ... handle other reasons
    }
  })
);
```

### Token Parameter Generators

#### `validTokenParams()`
Generates complete valid token deployment parameters.

```typescript
fc.assert(
  fc.property(validTokenParams(), (params) => {
    const result = validateTokenParams(params);
    expect(result.valid).toBe(true);
  })
);
```

#### `validTokenName()`
Generates valid token names (1-32 alphanumeric + spaces).

```typescript
fc.assert(
  fc.property(validTokenName(), (name) => {
    expect(name.length).toBeGreaterThan(0);
    expect(name.length).toBeLessThanOrEqual(32);
    expect(name).toMatch(/^[a-zA-Z0-9\s]+$/);
  })
);
```

#### `validTokenSymbol()`
Generates valid token symbols (1-12 uppercase letters).

```typescript
fc.assert(
  fc.property(validTokenSymbol(), (symbol) => {
    expect(symbol).toMatch(/^[A-Z]{1,12}$/);
  })
);
```

#### `validDecimals()`
Generates valid decimal values (0-18).

```typescript
fc.assert(
  fc.property(validDecimals(), (decimals) => {
    expect(decimals).toBeGreaterThanOrEqual(0);
    expect(decimals).toBeLessThanOrEqual(18);
  })
);
```

#### `validInitialSupply()`
Generates valid initial supply values.

```typescript
fc.assert(
  fc.property(validInitialSupply(), (supply) => {
    const num = BigInt(supply);
    expect(num).toBeGreaterThan(0n);
  })
);
```

### Fee Generators

#### `feeAmount(min, max)`
Generates fee amounts within a configurable range.

```typescript
// Custom range
fc.assert(
  fc.property(feeAmount(10, 50), (fee) => {
    expect(fee).toBeGreaterThanOrEqual(10);
    expect(fee).toBeLessThanOrEqual(50);
  })
);
```

#### `validFeeAmount()`
Generates valid fees (5-20 XLM).

```typescript
fc.assert(
  fc.property(validFeeAmount(), (fee) => {
    expect(fee).toBeGreaterThanOrEqual(5);
    expect(fee).toBeLessThanOrEqual(20);
  })
);
```

#### `insufficientFeeAmount()`
Generates insufficient fees (0-4 XLM).

```typescript
fc.assert(
  fc.property(insufficientFeeAmount(), (fee) => {
    expect(fee).toBeGreaterThanOrEqual(0);
    expect(fee).toBeLessThan(5);
  })
);
```

#### `excessiveFeeAmount()`
Generates excessive fees (100-10000 XLM).

```typescript
fc.assert(
  fc.property(excessiveFeeAmount(), (fee) => {
    expect(fee).toBeGreaterThanOrEqual(100);
    expect(fee).toBeLessThanOrEqual(10000);
  })
);
```

### Metadata Generators

#### `metadataUri()`
Generates various metadata URI formats (IPFS, HTTP).

```typescript
fc.assert(
  fc.property(metadataUri(), (uri) => {
    const isIPFS = uri.startsWith('ipfs://');
    const isHTTP = uri.startsWith('https://');
    expect(isIPFS || isHTTP).toBe(true);
  })
);
```

#### `validDescription()`
Generates valid descriptions (0-500 chars).

```typescript
fc.assert(
  fc.property(validDescription(), (description) => {
    expect(description.length).toBeLessThanOrEqual(500);
  })
);
```

### Operation Generators

#### `tokenOperation()`
Generates a single token operation.

```typescript
fc.assert(
  fc.property(tokenOperation(), (operation) => {
    expect(['deploy', 'transfer', 'mint', 'burn', 'approve']).toContain(operation.type);
    expect(operation.timestamp).toBeGreaterThan(0);
  })
);
```

#### `tokenOperationSequence(minLength, maxLength)`
Generates a sequence of operations.

```typescript
// Generate 5-10 operations
fc.assert(
  fc.property(tokenOperationSequence(5, 10), (operations) => {
    expect(operations.length).toBeGreaterThanOrEqual(5);
    expect(operations.length).toBeLessThanOrEqual(10);
    
    // Verify operations are ordered by timestamp
    for (let i = 1; i < operations.length; i++) {
      expect(operations[i].timestamp).toBeGreaterThanOrEqual(operations[i-1].timestamp);
    }
  })
);
```

### Utility Generators

#### `transactionHash()`
Generates 64-character hex transaction hashes.

```typescript
fc.assert(
  fc.property(transactionHash(), (hash) => {
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  })
);
```

#### `timestamp()`
Generates Unix timestamps (milliseconds).

```typescript
fc.assert(
  fc.property(timestamp(), (ts) => {
    expect(ts).toBeGreaterThan(1609459200000); // After 2021-01-01
    expect(ts).toBeLessThanOrEqual(Date.now());
  })
);
```

#### `networkType()`
Generates network types.

```typescript
fc.assert(
  fc.property(networkType(), (network) => {
    expect(['testnet', 'mainnet']).toContain(network);
  })
);
```

## Advanced Usage

### Combining Generators

```typescript
// Generate token params with specific constraints
const customTokenParams = fc.record({
  name: validTokenName(),
  symbol: fc.constantFrom('USD', 'EUR', 'GBP'), // Limited symbols
  decimals: fc.constant(7), // Fixed decimals
  initialSupply: fc.bigInt({ min: 1000000n, max: 10000000n }).map(n => n.toString()),
  adminWallet: validStellarAddress(),
});

fc.assert(
  fc.property(customTokenParams, (params) => {
    expect(['USD', 'EUR', 'GBP']).toContain(params.symbol);
    expect(params.decimals).toBe(7);
  })
);
```

### Filtering Generated Values

```typescript
// Generate only short token names
fc.assert(
  fc.property(
    validTokenName().filter(name => name.length <= 10),
    (name) => {
      expect(name.length).toBeLessThanOrEqual(10);
    }
  )
);
```

### Chaining Generators

```typescript
// Generate address with whitespace
fc.assert(
  fc.property(
    validStellarAddress().chain(addr =>
      fc.constantFrom(` ${addr}`, `${addr} `, `\t${addr}`)
    ),
    (address) => {
      expect(isValidStellarAddress(address)).toBe(false);
    }
  )
);
```

### Custom Iteration Counts

```typescript
// Run more iterations for critical tests
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    expect(isValidStellarAddress(address)).toBe(true);
  }),
  { numRuns: 10000 } // 10x more iterations
);

// Run fewer iterations for expensive tests
fc.assert(
  fc.property(tokenOperationSequence(100, 1000), (operations) => {
    // Expensive validation
  }),
  { numRuns: 100 } // Fewer iterations
);
```

## Best Practices

### 1. Use Descriptive Test Names

```typescript
describe('Token validation', () => {
  it('should accept all valid token names generated by property test', () => {
    fc.assert(fc.property(validTokenName(), (name) => {
      expect(isValidTokenName(name)).toBe(true);
    }));
  });
});
```

### 2. Test Invariants

```typescript
// Test that validation is idempotent
fc.assert(
  fc.property(fc.string(), (input) => {
    const result1 = isValidStellarAddress(input);
    const result2 = isValidStellarAddress(input);
    expect(result1).toBe(result2);
  })
);
```

### 3. Test Relationships

```typescript
// Test that valid addresses are never rejected
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    expect(isValidStellarAddress(address)).toBe(true);
  })
);

// Test that invalid addresses are always rejected
fc.assert(
  fc.property(invalidStellarAddress(), (address) => {
    expect(isValidStellarAddress(address)).toBe(false);
  })
);
```

### 4. Use Shrinking for Better Error Messages

fast-check automatically shrinks failing cases to minimal examples:

```typescript
fc.assert(
  fc.property(validTokenName(), (name) => {
    // If this fails, fast-check will find the smallest failing name
    expect(name.length).toBeGreaterThan(0);
  })
);
```

### 5. Test Edge Cases Explicitly

```typescript
describe('Edge cases', () => {
  it('should handle null and undefined', () => {
    // @ts-expect-error Testing runtime behavior
    expect(isValidStellarAddress(null)).toBe(false);
    // @ts-expect-error Testing runtime behavior
    expect(isValidStellarAddress(undefined)).toBe(false);
  });
});
```

## Performance Tips

1. **Use appropriate iteration counts**: 1000 runs for most tests, 100-500 for expensive tests
2. **Filter early**: Apply filters before expensive operations
3. **Reuse generators**: Define generators once, use multiple times
4. **Avoid unnecessary computations**: Use `fc.constant()` for fixed values
5. **Profile slow tests**: Use `npm run test:ui` to identify bottlenecks

## Debugging

### Enable Verbose Output

```typescript
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    console.log('Testing address:', address);
    expect(isValidStellarAddress(address)).toBe(true);
  }),
  { verbose: true }
);
```

### Reproduce Specific Failures

```typescript
// fast-check provides a seed for reproducing failures
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    expect(isValidStellarAddress(address)).toBe(true);
  }),
  { seed: 1234567890 } // Use seed from failure output
);
```

## Resources

- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [Property-Based Testing Guide](https://github.com/dubzzz/fast-check/blob/main/documentation/Guides.md)
- [Generator Examples](./generator-examples.ts)
- [Test Helpers](./helpers.ts)
