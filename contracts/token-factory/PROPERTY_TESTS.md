# Property-Based Tests for Burn Invariants

This document describes the property-based tests implemented for the token factory's burn functionality using `proptest`.

## Overview

Property-based testing verifies that critical invariants hold across a wide range of randomly generated inputs (1000+ test cases per property). This approach catches edge cases that traditional unit tests might miss.

## Test Configuration

- **Test Cases per Property**: 1000 iterations
- **Framework**: proptest 1.4
- **Execution Target**: < 30 seconds for full suite

## Invariants Tested

### 1. Supply Conservation
**Property**: `total_supply + total_burned = initial_supply` (always)

**Test**: `prop_supply_conservation`

Verifies that tokens are never created or destroyed unexpectedly during burn operations. The sum of remaining supply and burned tokens must always equal the initial supply.

**Input Ranges**:
- Initial supply: 1 to 1,000,000,000
- Burn amounts: 1 to 100,000 (1-10 operations)

### 2. Burn Never Exceeds Balance
**Property**: `burn_amount <= balance` (always)

**Test**: `prop_burn_never_exceeds_balance`

Verifies that the contract correctly rejects burn attempts that exceed the available balance.

**Input Ranges**:
- Balance: 1 to 1,000,000
- Burn attempt: 1 to 2,000,000 (includes invalid attempts)

### 3. Total Burned Monotonicity
**Property**: `total_burned` never decreases

**Test**: `prop_total_burned_monotonic`

Verifies that the total_burned counter only increases across multiple burn operations.

**Input Ranges**:
- Burn amounts: 1 to 10,000 (1-20 operations)
- Initial supply: 1,000,000

### 4. Burn Count Monotonicity
**Property**: `burn_count` never decreases

**Test**: `prop_burn_count_monotonic`

Verifies that the burn operation counter only increases.

**Input Ranges**:
- Burn amounts: 1 to 5,000 (1-30 operations)
- Initial supply: 10,000,000

### 5. Amount Validity
**Property**: `burn_amount > 0` (always)

**Test**: `prop_burn_amount_positive`

Verifies that zero or negative burn amounts are rejected.

**Input Ranges**:
- Amount: -1,000,000 to 1,000,000 (includes negative values)

### 6. Balance Consistency
**Property**: `sum(all_balances) = total_supply` (always)

**Test**: `prop_balance_consistency`

Verifies that the sum of all token holder balances always equals the total supply after burn operations.

**Input Ranges**:
- Initial supply: 1,000 to 10,000,000
- Burn amounts: 1 to 1,000 (1-15 operations)

### 7. Burns Accumulate Correctly
**Property**: `sum(individual_burns) = total_burned`

**Test**: `prop_burns_accumulate_correctly`

Verifies that multiple burn operations correctly accumulate to the total_burned counter.

**Input Ranges**:
- Burn amounts: 1 to 50,000 (2-25 operations)
- Initial supply: 100,000,000

## Edge Case Tests

### Burn Entire Supply
**Test**: `test_burn_entire_supply`

Verifies that burning the entire token supply works correctly:
- `total_supply` becomes 0
- `total_burned` equals initial supply

### Unauthorized Burn
**Test**: `test_burn_unauthorized`

Verifies that only authorized addresses can burn tokens. Should panic with `Error::Unauthorized`.

## Running the Tests

### Run all property tests (once burn is implemented):
```bash
cd contracts/token-factory
cargo test --release prop_ -- --nocapture
```

### Run specific property test:
```bash
cargo test --release prop_supply_conservation -- --nocapture
```

### Run with custom iteration count:
```bash
PROPTEST_CASES=5000 cargo test --release prop_ -- --nocapture
```

### Run edge case tests:
```bash
cargo test --release test_burn_ -- --nocapture
```

## Activation Checklist

Before activating these tests (removing `#[ignore]` attributes):

1. ✅ Implement `create_token` function in contract
2. ✅ Implement `burn` function in contract
3. ✅ Implement `get_token_info_by_address` function
4. ✅ Add `total_burned` field to `TokenInfo` struct
5. ✅ Add `burn_count` field to `TokenInfo` struct
6. ✅ Add `InsufficientBalance` error variant
7. ✅ Add `InvalidAmount` error variant
8. ✅ Uncomment TODO sections in test code
9. ✅ Remove `#[ignore]` attributes
10. ✅ Run full test suite to verify

## Expected Results

When all tests pass:
- ✅ All 7 property tests pass with 1000+ iterations each
- ✅ No false positives detected
- ✅ Execution time < 30 seconds
- ✅ All invariants verified across wide input ranges
- ✅ Edge cases handled correctly

## Troubleshooting

### Tests timeout
- Reduce `PROPTEST_CASES` environment variable
- Use `--release` flag for optimized builds
- Check for infinite loops in contract code

### False positives
- Review property assertions
- Check input range constraints
- Verify test setup is correct

### Shrinking failures
When a test fails, proptest automatically "shrinks" the input to find the minimal failing case. Review the shrunk input to understand the root cause.

## Integration with CI/CD

Add to your CI pipeline:
```yaml
- name: Run property tests
  run: |
    cd contracts/token-factory
    PROPTEST_CASES=1000 cargo test --release prop_ -- --nocapture
```

## References

- [proptest documentation](https://docs.rs/proptest/)
- [Property-based testing guide](https://github.com/proptest-rs/proptest/blob/master/proptest/README.md)
- Soroban SDK testing utilities
