# Test Infrastructure

This directory contains the testing infrastructure for the Stellar Token Deployer frontend application, including property-based testing generators, test helpers, and setup files.

## 📁 Directory Structure

```
src/test/
├── README.md                           # This file
├── setup.ts                            # Test environment setup
├── generators.ts                       # Property-based test generators
├── generator-examples.ts               # Usage examples for generators
├── helpers.ts                          # Test utility functions
├── GENERATORS_README.md                # Detailed generator documentation
├── GENERATOR_QUICK_REFERENCE.md        # Quick reference guide
└── __tests__/                          # Test files (if any)
```

## 🧪 Testing Stack

- **Test Runner**: [Vitest](https://vitest.dev/)
- **Testing Library**: [@testing-library/react](https://testing-library.com/react)
- **Property Testing**: [fast-check](https://github.com/dubzzz/fast-check)
- **DOM Environment**: jsdom

## 🎯 Property-Based Testing

Property-based testing is a testing approach where you define properties that should always hold true, and the testing framework generates hundreds or thousands of test cases to verify those properties.

### Why Property-Based Testing?

1. **Comprehensive Coverage**: Tests thousands of cases automatically
2. **Edge Case Discovery**: Finds edge cases you might not think of
3. **Regression Prevention**: Ensures properties hold across refactors
4. **Documentation**: Properties serve as executable specifications

### Example

```typescript
import * as fc from 'fast-check';
import { validStellarAddress } from './generators';
import { isValidStellarAddress } from '../utils/validation';

// Property: All generated valid addresses should pass validation
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    expect(isValidStellarAddress(address)).toBe(true);
  }),
  { numRuns: 1000 } // Run 1000 times with different inputs
);
```

## 📚 Available Generators

### Stellar Address Generators

| Generator | Description | Example Output |
|-----------|-------------|----------------|
| `validStellarAddress()` | Valid Stellar addresses | `"GXXXXXXX...XXX"` (56 chars) |
| `invalidStellarAddress()` | Invalid addresses (various patterns) | `"invalid"`, `"AXXXX..."`, etc. |
| `invalidStellarAddressWithReason()` | Invalid addresses with categorized reasons | `{ address: "...", reason: "too_short" }` |

### Token Parameter Generators

| Generator | Description | Range/Format |
|-----------|-------------|--------------|
| `validTokenParams()` | Complete token deployment params | Full `TokenDeployParams` object |
| `validTokenName()` | Valid token names | 1-32 alphanumeric + spaces |
| `validTokenSymbol()` | Valid token symbols | 1-12 uppercase letters |
| `validDecimals()` | Valid decimal values | 0-18 |
| `validInitialSupply()` | Valid initial supply | Positive BigInt as string |
| `validDescription()` | Valid descriptions | 0-500 characters |

### Fee Generators

| Generator | Description | Range |
|-----------|-------------|-------|
| `feeAmount(min, max)` | Configurable fee range | Custom min-max |
| `validFeeAmount()` | Valid fees | 5-20 XLM |
| `insufficientFeeAmount()` | Insufficient fees | 0-4 XLM |
| `excessiveFeeAmount()` | Excessive fees | 100-10000 XLM |

### Metadata Generators

| Generator | Description | Formats |
|-----------|-------------|---------|
| `metadataUri()` | Metadata URIs | IPFS CIDv0, CIDv1, HTTP |

### Operation Generators

| Generator | Description | Output |
|-----------|-------------|--------|
| `tokenOperation()` | Single token operation | `TokenOperation` object |
| `tokenOperationSequence(min, max)` | Sequence of operations | Array of operations |

### Utility Generators

| Generator | Description | Format |
|-----------|-------------|--------|
| `transactionHash()` | Transaction hashes | 64-char hex string |
| `timestamp()` | Unix timestamps | Milliseconds since epoch |
| `networkType()` | Network types | `"testnet"` or `"mainnet"` |

## 🚀 Quick Start

### 1. Import Generators

```typescript
import * as fc from 'fast-check';
import { validStellarAddress, validTokenParams } from '@/test/generators';
```

### 2. Write a Property Test

```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should have some property', () => {
    fc.assert(
      fc.property(validStellarAddress(), (address) => {
        // Your test logic here
        expect(address).toHaveLength(56);
      }),
      { numRuns: 1000 }
    );
  });
});
```

### 3. Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- my-feature.test.ts

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## 📖 Documentation

### Comprehensive Guides

1. **[PROPERTY_TESTS_USAGE.md](./PROPERTY_TESTS_USAGE.md)**
   - Complete usage guide
   - Examples for all generators
   - Best practices
   - Advanced patterns
   - Debugging tips

2. **[GENERATORS_README.md](./GENERATORS_README.md)**
   - Detailed generator documentation
   - Implementation details
   - Customization options

3. **[GENERATOR_QUICK_REFERENCE.md](./GENERATOR_QUICK_REFERENCE.md)**
   - Quick reference for all generators
   - Common patterns
   - Cheat sheet

### Implementation Documentation

1. **[PROPERTY_TESTS_IMPLEMENTATION.md](../../PROPERTY_TESTS_IMPLEMENTATION.md)**
   - Requirements verification
   - Implementation details
   - Acceptance criteria

2. **[IMPLEMENTATION_SUMMARY.md](../../IMPLEMENTATION_SUMMARY.md)**
   - Complete project summary
   - Statistics and metrics
   - Quick reference

3. **[PROPERTY_TESTS_CHECKLIST.md](../../PROPERTY_TESTS_CHECKLIST.md)**
   - Visual checklist
   - Coverage breakdown
   - Verification steps

## 🎨 Common Patterns

### Testing Validation Functions

```typescript
// Test that valid inputs pass
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    expect(isValidStellarAddress(address)).toBe(true);
  })
);

// Test that invalid inputs fail
fc.assert(
  fc.property(invalidStellarAddress(), (address) => {
    expect(isValidStellarAddress(address)).toBe(false);
  })
);
```

### Testing Idempotency

```typescript
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    const result1 = processAddress(address);
    const result2 = processAddress(address);
    expect(result1).toEqual(result2);
  })
);
```

### Testing Relationships

```typescript
fc.assert(
  fc.property(
    validTokenParams(),
    feeAmount(5, 20),
    (params, fee) => {
      const result = calculateTotalCost(params, fee);
      expect(result).toBeGreaterThanOrEqual(fee);
    }
  )
);
```

### Combining Generators

```typescript
const customParams = fc.record({
  name: validTokenName(),
  symbol: fc.constantFrom('USD', 'EUR', 'GBP'),
  decimals: fc.constant(7),
  initialSupply: validInitialSupply(),
  adminWallet: validStellarAddress(),
});

fc.assert(
  fc.property(customParams, (params) => {
    // Test with custom parameters
  })
);
```

## 🔧 Configuration

### Test Setup

The `setup.ts` file configures the test environment:

```typescript
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
});
```

### Vitest Configuration

See `vitest.config.ts` in the project root for test runner configuration.

## 📊 Test Coverage

Current test coverage includes:

- ✅ Stellar address validation (1000+ iterations)
- ✅ Token parameter validation (1000+ iterations)
- ✅ Fee calculation (1000+ iterations)
- ✅ Formatting utilities (1000+ iterations)
- ✅ Edge cases (null, undefined, whitespace, boundaries)
- ✅ Performance testing

## 🎯 Best Practices

### 1. Use Descriptive Test Names

```typescript
it('should accept all valid Stellar addresses generated by property test', () => {
  // Test implementation
});
```

### 2. Test Properties, Not Examples

```typescript
// ❌ Bad: Testing specific examples
expect(isValidStellarAddress('GXXXXXXX...')).toBe(true);

// ✅ Good: Testing properties
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    expect(isValidStellarAddress(address)).toBe(true);
  })
);
```

### 3. Use Appropriate Iteration Counts

```typescript
// Standard tests: 1000 runs
{ numRuns: 1000 }

// Expensive tests: 100-500 runs
{ numRuns: 100 }

// Critical tests: 10000+ runs
{ numRuns: 10000 }
```

### 4. Test Edge Cases Explicitly

```typescript
describe('Edge cases', () => {
  it('should handle null and undefined', () => {
    // @ts-expect-error Testing runtime behavior
    expect(isValidStellarAddress(null)).toBe(false);
  });
});
```

### 5. Use Shrinking for Better Errors

fast-check automatically shrinks failing cases to minimal examples, making debugging easier.

## 🐛 Debugging

### Enable Verbose Output

```typescript
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    console.log('Testing:', address);
    // Test logic
  }),
  { verbose: true }
);
```

### Reproduce Failures

```typescript
fc.assert(
  fc.property(validStellarAddress(), (address) => {
    // Test logic
  }),
  { seed: 1234567890 } // Use seed from failure output
);
```

### Use Test UI

```bash
npm run test:ui
```

Opens an interactive UI for debugging tests.

## 📈 Performance

### Optimization Tips

1. **Use appropriate iteration counts**: Don't over-test
2. **Filter early**: Apply filters before expensive operations
3. **Reuse generators**: Define once, use multiple times
4. **Profile slow tests**: Use test UI to identify bottlenecks

### Performance Benchmarks

- Validating 1000 addresses: < 100ms
- Generating 1000 token params: < 50ms
- Running full test suite: < 5s

## 🤝 Contributing

When adding new generators:

1. Add to `generators.ts`
2. Include JSDoc documentation
3. Add usage examples to `generator-examples.ts`
4. Update this README
5. Add property tests using the generator

## 📚 Resources

### External Documentation
- [Vitest Documentation](https://vitest.dev/)
- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [Testing Library Documentation](https://testing-library.com/)
- [Property-Based Testing Guide](https://github.com/dubzzz/fast-check/blob/main/documentation/Guides.md)

### Internal Documentation
- [Property Tests Usage Guide](./PROPERTY_TESTS_USAGE.md)
- [Implementation Summary](../../IMPLEMENTATION_SUMMARY.md)
- [Testing Guide](../../TESTING_GUIDE.md)

## 🎓 Learning Resources

### Property-Based Testing Concepts

1. **Properties**: Statements that should always be true
2. **Generators**: Functions that produce test data
3. **Shrinking**: Finding minimal failing cases
4. **Invariants**: Conditions that never change

### Example Properties

- **Idempotency**: `f(f(x)) === f(x)`
- **Commutativity**: `f(a, b) === f(b, a)`
- **Associativity**: `f(f(a, b), c) === f(a, f(b, c))`
- **Identity**: `f(x, identity) === x`
- **Inverse**: `f(inverse(x)) === identity`

## 🔍 Troubleshooting

### Common Issues

**Issue**: Tests are slow
- **Solution**: Reduce `numRuns` or optimize generators

**Issue**: Tests are flaky
- **Solution**: Check for non-deterministic behavior, use seeds

**Issue**: Can't reproduce failure
- **Solution**: Use the seed from the failure output

**Issue**: Too many false positives
- **Solution**: Refine generator constraints

## 📞 Support

For questions or issues:

1. Check the documentation in this directory
2. Review existing test files for examples
3. Consult the [fast-check documentation](https://github.com/dubzzz/fast-check)
4. Ask the team

---

**Last Updated**: February 2026  
**Maintained By**: Development Team  
**Test Framework**: Vitest + fast-check  
**Coverage Target**: > 90%
