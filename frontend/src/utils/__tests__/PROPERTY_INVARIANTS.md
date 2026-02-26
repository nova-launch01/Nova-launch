# Property-Based Testing Invariants

This document describes the invariants tested by our property-based tests using fast-check.

## Overview

Property-based tests verify that functions maintain specific invariants across thousands of randomly generated inputs. Each test runs 1000+ iterations to ensure robustness.

## Validation Utilities (`validation.ts`)

### Address Validation (`isValidStellarAddress`)

**Invariants:**
- Valid addresses start with 'G' followed by 55 base32 characters
- Addresses without 'G' prefix always fail
- Addresses with incorrect length (≠ 56) always fail
- Addresses with invalid characters always fail
- Validation is consistent (idempotent)

**Edge Cases:**
- Empty strings
- Special characters
- Lowercase letters
- Numbers outside base32 alphabet

### Token Name Validation (`isValidTokenName`)

**Invariants:**
- Names with 1-32 alphanumeric + space characters pass
- Empty names always fail
- Names > 32 characters always fail
- Names with special characters always fail
- Validation is consistent (idempotent)

**Edge Cases:**
- Minimum length: 1 character
- Maximum length: 32 characters
- Boundary: 33 characters (should fail)
- Special characters: `!@#$%^&*()-_=+`

### Token Symbol Validation (`isValidTokenSymbol`)

**Invariants:**
- Symbols with 1-12 uppercase letters pass
- Lowercase symbols always fail
- Symbols > 12 characters always fail
- Symbols with numbers or special characters fail
- Validation is consistent (idempotent)

**Edge Cases:**
- Minimum length: 1 character
- Maximum length: 12 characters
- Boundary: 13 characters (should fail)
- Mixed case (should fail)

### Decimals Validation (`isValidDecimals`)

**Invariants:**
- Integers 0-18 always pass
- Negative integers always fail
- Integers > 18 always fail
- Non-integers always fail

**Edge Cases:**
- Minimum: 0
- Maximum: 18
- Boundary: -1, 19
- Floating point numbers

### Supply Validation (`isValidSupply`)

**Invariants:**
- Positive integer strings within safe range pass
- Zero and negative values always fail
- Non-numeric strings always fail
- Values exceeding `2^53 - 1` fail

**Edge Cases:**
- Minimum: "1"
- Maximum: "9007199254740991" (2^53 - 1)
- Zero: "0" (should fail)
- Negative: "-1" (should fail)
- Non-numeric: "abc" (should fail)

### Description Validation (`isValidDescription`)

**Invariants:**
- Descriptions ≤ 500 characters pass
- Descriptions > 500 characters fail

**Edge Cases:**
- Empty string (passes)
- 500 characters (passes)
- 501 characters (fails)

### Combined Validation (`validateTokenParams`)

**Invariants:**
- All valid parameters return `valid=true` with no errors
- Invalid parameters return `valid=false` with errors
- Validation is consistent (calling twice gives same result)
- Error object keys match invalid fields

**Edge Cases:**
- All maximum valid values
- All minimum valid values
- Mixed valid/invalid parameters

## Formatting Utilities (`formatting.ts`)

### XLM Formatting (`formatXLM`)

**Invariants:**
- Always returns a string
- Output contains only valid number characters (digits, commas, decimal point)
- Formatting is consistent (idempotent)
- Accepts both string and number inputs

**Edge Cases:**
- Zero
- Very large numbers (1e15)
- Very small decimals (0.0000001)

### Number Formatting (`formatNumber`)

**Invariants:**
- Always returns a string
- Numbers ≥ 1000 include comma separators
- Formatting is consistent (idempotent)

**Edge Cases:**
- Numbers < 1000 (no commas)
- Numbers ≥ 1000 (with commas)
- Very large numbers

### Address Truncation (`truncateAddress`)

**Invariants:**
- Short addresses (≤ startChars + endChars) are not truncated
- Long addresses are always truncated
- Truncated addresses preserve start and end characters
- Truncation is consistent (idempotent)

**Edge Cases:**
- Very short addresses (1-10 chars)
- Very long addresses (50-100 chars)
- Custom start/end character counts

### Stroops ↔ XLM Conversion

**Invariants:**
- Conversion is reversible for integers (within rounding tolerance)
- `stroopsToXLM` always divides by 10,000,000
- `xlmToStroops` always multiplies by 10,000,000
- Conversions never overflow safe integer range
- Accepts both string and number inputs

**Edge Cases:**
- Zero
- Maximum safe integer
- Floating point precision
- Rounding behavior

### File Size Formatting (`formatFileSize`)

**Invariants:**
- Always returns a string with unit (B, KB, or MB)
- Bytes < 1024 show as "B"
- Bytes ≥ 1024 and < 1MB show as "KB"
- Bytes ≥ 1MB show as "MB"
- Formatting is consistent (idempotent)

**Edge Cases:**
- 0 bytes
- 1023 bytes (last B)
- 1024 bytes (first KB)
- 1MB - 1 byte (last KB)
- 1MB (first MB)

### Date Formatting (`formatDate`)

**Invariants:**
- Always returns a string
- Contains expected date components
- Formatting is consistent (idempotent)

**Edge Cases:**
- Unix epoch (0)
- Current time
- Future dates

### Relative Time Formatting (`formatRelativeTime`)

**Invariants:**
- Always returns a string
- Recent timestamps (< 60s) show "Just now"
- Old timestamps show "X days/hours/minutes ago"
- Formatting is consistent (idempotent)

**Edge Cases:**
- Just now (< 60 seconds)
- Minutes ago (60s - 1h)
- Hours ago (1h - 24h)
- Days ago (> 24h)

### Error Message Extraction (`getErrorMessage`)

**Invariants:**
- Always returns a string
- Error objects return their message property
- String errors return themselves
- Unknown errors return default message
- Formatting is consistent (idempotent)

**Edge Cases:**
- Error instances
- String errors
- Null/undefined
- Numbers, booleans
- Objects without message property

## Fee Calculation (`fee-calculation.property.test.ts`)

**Invariants:**
- Base fee is always in range [5, 10] XLM
- Metadata fee is 0 or in range [2, 5] XLM
- Total fee equals base + metadata
- Fee calculation is deterministic (same params → same fees)

**Edge Cases:**
- With metadata
- Without metadata
- Various token parameters

## General Invariants

All utility functions maintain these universal properties:

1. **Type Safety**: Always return expected types
2. **Consistency**: Same input always produces same output (deterministic)
3. **No Crashes**: Never throw on valid inputs
4. **Boundary Respect**: Correctly handle min/max values
5. **Format Preservation**: Output format matches specification

## Test Configuration

- **Iterations per test**: 1000+ (configurable via `numRuns`)
- **Timeout**: < 10 seconds for entire suite
- **Coverage**: All validation and formatting utilities
- **Framework**: Vitest + fast-check

## Running Tests

```bash
# Run all tests
npm test

# Run only property tests
npm test -- validation.property.test.ts
npm test -- formatting.property.test.ts
npm test -- fee-calculation.property.test.ts

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

## Adding New Property Tests

When adding new utility functions:

1. Identify the function's invariants
2. Create property-based tests for each invariant
3. Test edge cases and boundaries
4. Verify consistency (idempotence)
5. Ensure no crashes on random inputs
6. Document invariants in this file

## References

- [fast-check Documentation](https://fast-check.dev/)
- [Property-Based Testing Guide](https://fast-check.dev/docs/introduction/getting-started/)
- [Vitest Documentation](https://vitest.dev/)
