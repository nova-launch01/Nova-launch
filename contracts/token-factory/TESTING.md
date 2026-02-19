# Token Factory Contract Testing Guide

Comprehensive documentation for testing the Stellar Token Factory smart contract.

## Table of Contents

1. [Test Environment Setup](#test-environment-setup)
2. [Writing Unit Tests](#writing-unit-tests)
3. [Writing Integration Tests](#writing-integration-tests)
4. [Property-Based Testing](#property-based-testing)
5. [Benchmarking](#benchmarking)
6. [Debugging Tests](#debugging-tests)
7. [Common Issues](#common-issues)

---

## Test Environment Setup

### Prerequisites

- Rust toolchain (1.70+)
- Soroban SDK 21.0.0
- Cargo test runner

### Dependencies

The project uses the following test dependencies (defined in `Cargo.toml`):

```toml
[dev-dependencies]
soroban-sdk = { version = "21.0.0", features = ["testutils"] }
proptest = "1.4"
```

### Running Tests

```bash
# Run all tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run specific test
cargo test test_initialize

# Run ignored tests
cargo test -- --ignored

# Run tests in release mode (faster)
cargo test --release
```

### Test File Structure

```
contracts/token-factory/
├── src/
│   ├── lib.rs           # Contract implementation
│   ├── storage.rs       # Storage helpers
│   ├── types.rs         # Type definitions
│   └── test.rs          # Test suite
└── test_snapshots/      # Test snapshots (auto-generated)
```

---

## Writing Unit Tests

### Basic Test Structure

Every Soroban test follows this pattern:

```rust
#[test]
fn test_function_name() {
    // 1. Setup environment
    let env = Env::default();
    
    // 2. Register contract
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);
    
    // 3. Setup test data
    let admin = Address::generate(&env);
    
    // 4. Execute contract function
    client.initialize(&admin, &treasury, &base_fee, &metadata_fee);
    
    // 5. Assert results
    let state = client.get_state();
    assert_eq!(state.admin, admin);
}
```

### Test Patterns

#### Pattern 1: Happy Path Testing

Test the expected behavior with valid inputs:

```rust
#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let base_fee = 70_000_000; // 7 XLM in stroops
    let metadata_fee = 30_000_000; // 3 XLM in stroops

    // Initialize factory
    client.initialize(&admin, &treasury, &base_fee, &metadata_fee);

    // Verify state
    let state = client.get_state();
    assert_eq!(state.admin, admin);
    assert_eq!(state.treasury, treasury);
    assert_eq!(state.base_fee, base_fee);
    assert_eq!(state.metadata_fee, metadata_fee);
}
```

#### Pattern 2: Error Testing

Test that errors are properly raised:

```rust
#[test]
#[should_panic(expected = "Error(Contract, #6)")]
fn test_cannot_initialize_twice() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);

    client.initialize(&admin, &treasury, &70_000_000, &30_000_000);
    client.initialize(&admin, &treasury, &70_000_000, &30_000_000); // Should panic
}
```

Error codes correspond to the `Error` enum in `types.rs`:
- `#1` = InsufficientFee
- `#2` = Unauthorized
- `#3` = InvalidParameters
- `#4` = TokenNotFound
- `#5` = MetadataAlreadySet
- `#6` = AlreadyInitialized

#### Pattern 3: Authorization Testing

Test authorization requirements using `mock_all_auths`:

```rust
#[test]
fn test_update_fees() {
    let env = Env::default();
    env.mock_all_auths(); // Mock authorization checks
    
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);

    client.initialize(&admin, &treasury, &70_000_000, &30_000_000);

    // Update fees (requires admin auth)
    client.update_fees(&admin, &Some(100_000_000), &None);
    
    let state = client.get_state();
    assert_eq!(state.base_fee, 100_000_000);
}
```

#### Pattern 4: Ignored Tests (Work in Progress)

Use `#[ignore]` for tests that depend on unimplemented features:

```rust
#[test]
#[ignore] // Remove this attribute once create_token function is implemented
fn test_create_token() {
    // Test implementation here
    // TODO: Uncomment once create_token is implemented
}
```

### Helper Functions

#### Test Data Generators

Create reusable test data generators:

```rust
// Helper to create initialized factory
fn setup_factory(env: &Env) -> (TokenFactoryClient, Address, Address) {
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    
    client.initialize(&admin, &treasury, &70_000_000, &30_000_000);
    
    (client, admin, treasury)
}

// Usage
#[test]
fn test_with_helper() {
    let env = Env::default();
    let (client, admin, _treasury) = setup_factory(&env);
    
    // Test logic here
}
```

#### Common Assertions

```rust
// Assert error is raised
#[should_panic(expected = "Error(Contract, #2)")]

// Assert equality
assert_eq!(actual, expected);

// Assert boolean conditions
assert!(condition);
assert!(!condition);

// Assert with custom message
assert_eq!(actual, expected, "Custom error message");
```

---

## Writing Integration Tests

### Multi-Contract Testing

When testing interactions between multiple contracts:

```rust
#[test]
fn test_token_deployment_integration() {
    let env = Env::default();
    env.mock_all_auths();
    
    // Register factory contract
    let factory_id = env.register_contract(None, TokenFactory);
    let factory_client = TokenFactoryClient::new(&env, &factory_id);
    
    // Register token contract (when implemented)
    // let token_id = env.register_contract(None, Token);
    
    // Setup factory
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    factory_client.initialize(&admin, &treasury, &70_000_000, &30_000_000);
    
    // Create token through factory
    // let token_address = factory_client.create_token(...);
    
    // Verify token contract state
    // let token_client = TokenClient::new(&env, &token_address);
    // assert_eq!(token_client.name(), expected_name);
}
```

### Testing State Persistence

```rust
#[test]
fn test_state_persistence() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    
    // Initialize
    client.initialize(&admin, &treasury, &70_000_000, &30_000_000);
    
    // Verify state persists across calls
    let state1 = client.get_state();
    let state2 = client.get_state();
    assert_eq!(state1, state2);
}
```

### Testing Event Emissions

```rust
#[test]
fn test_events() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);
    
    // Perform action that emits events
    // ...
    
    // Verify events (when event system is implemented)
    // let events = env.events().all();
    // assert_eq!(events.len(), 1);
}
```

---

## Property-Based Testing

Property-based testing uses the `proptest` crate to generate random test inputs and verify invariants.

### Setup

Add proptest strategies:

```rust
use proptest::prelude::*;

// Strategy for generating valid fees (0 to 1000 XLM in stroops)
fn fee_strategy() -> impl Strategy<Value = i128> {
    0i128..1_000_000_000_000
}

// Strategy for generating valid decimals
fn decimals_strategy() -> impl Strategy<Value = u32> {
    0u32..=18
}

// Strategy for generating valid supply
fn supply_strategy() -> impl Strategy<Value = i128> {
    1i128..i128::MAX
}
```

### Property Test Example

```rust
proptest! {
    #[test]
    fn test_fee_calculation_properties(
        base_fee in fee_strategy(),
        metadata_fee in fee_strategy(),
        has_metadata in any::<bool>()
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);
        
        client.initialize(&admin, &treasury, &base_fee, &metadata_fee);
        
        // Property: Total fee should always be >= base_fee
        let expected_fee = if has_metadata {
            base_fee + metadata_fee
        } else {
            base_fee
        };
        
        prop_assert!(expected_fee >= base_fee);
        prop_assert!(expected_fee >= 0);
    }
}
```

### Common Properties to Test

1. **Invariants**: Conditions that must always hold
   ```rust
   // Token count should never decrease
   prop_assert!(new_count >= old_count);
   ```

2. **Idempotence**: Calling function multiple times has same effect
   ```rust
   // Getting state multiple times returns same result
   prop_assert_eq!(client.get_state(), client.get_state());
   ```

3. **Reversibility**: Operations can be undone
   ```rust
   // Update fee then revert
   client.update_fees(&admin, &Some(new_fee), &None);
   client.update_fees(&admin, &Some(old_fee), &None);
   prop_assert_eq!(client.get_state().base_fee, old_fee);
   ```

4. **Bounds**: Values stay within expected ranges
   ```rust
   prop_assert!(fee >= 0);
   prop_assert!(decimals <= 18);
   ```

---

## Benchmarking

### Performance Testing

Measure contract execution costs:

```rust
#[test]
fn bench_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    
    // Measure budget before
    env.budget().reset_default();
    
    client.initialize(&admin, &treasury, &70_000_000, &30_000_000);
    
    // Print budget usage
    println!("CPU instructions: {}", env.budget().cpu_instruction_cost());
    println!("Memory bytes: {}", env.budget().memory_bytes_cost());
}
```

### Gas Estimation

```rust
#[test]
fn estimate_create_token_cost() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);
    
    // Setup
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    client.initialize(&admin, &treasury, &70_000_000, &30_000_000);
    
    // Reset budget
    env.budget().reset_default();
    
    // Execute operation
    // client.create_token(...);
    
    // Report costs
    println!("Operation cost:");
    println!("  CPU: {}", env.budget().cpu_instruction_cost());
    println!("  Memory: {}", env.budget().memory_bytes_cost());
}
```

---

## Debugging Tests

### Enable Debug Output

```bash
# Run with output
cargo test -- --nocapture

# Run with environment logging
RUST_LOG=debug cargo test
```

### Debug Prints in Tests

```rust
#[test]
fn test_with_debug() {
    let env = Env::default();
    
    // Print debug information
    println!("Contract ID: {:?}", contract_id);
    println!("Admin: {:?}", admin);
    
    // Use env.logs() for contract logs
    // env.logs().print();
}
```

### Snapshot Testing

Test snapshots are automatically generated in `test_snapshots/` directory. They capture:
- Contract state
- Storage changes
- Event emissions

To update snapshots:
```bash
cargo test -- --ignored
```

### Common Debugging Techniques

1. **Isolate the failure**: Run single test
   ```bash
   cargo test test_initialize -- --exact
   ```

2. **Check error codes**: Match panic messages to Error enum
   ```rust
   // Error(Contract, #6) = AlreadyInitialized
   ```

3. **Verify authorization**: Ensure `mock_all_auths()` is called
   ```rust
   env.mock_all_auths();
   ```

4. **Check storage state**: Query storage directly
   ```rust
   let has_admin = storage::has_admin(&env);
   println!("Has admin: {}", has_admin);
   ```

---

## Common Issues

### Issue 1: Test Panics with "Error(Contract, #X)"

**Problem**: Contract returns an error code

**Solution**: Check the Error enum in `types.rs` to identify the error:
```rust
#[contracterror]
pub enum Error {
    InsufficientFee = 1,
    Unauthorized = 2,
    InvalidParameters = 3,
    TokenNotFound = 4,
    MetadataAlreadySet = 5,
    AlreadyInitialized = 6,
}
```

### Issue 2: Authorization Failures

**Problem**: Test fails with authorization error

**Solution**: Add `env.mock_all_auths()` before calling functions that require auth:
```rust
let env = Env::default();
env.mock_all_auths(); // Add this line
```

### Issue 3: Storage Not Persisting

**Problem**: Data doesn't persist between calls

**Solution**: Ensure you're using the same `env` instance:
```rust
// Wrong - creates new env
let env1 = Env::default();
let env2 = Env::default();

// Correct - reuse same env
let env = Env::default();
```

### Issue 4: Test Ignored by Default

**Problem**: Test doesn't run with `cargo test`

**Solution**: Test has `#[ignore]` attribute. Run with:
```bash
cargo test -- --ignored
```

Or remove the `#[ignore]` attribute when feature is implemented.

### Issue 5: Address Generation Issues

**Problem**: Addresses not behaving as expected

**Solution**: Use `Address::generate(&env)` for test addresses:
```rust
let admin = Address::generate(&env);
let treasury = Address::generate(&env);
```

### Issue 6: Snapshot Mismatches

**Problem**: Test fails due to snapshot differences

**Solution**: Review changes and update snapshots if correct:
```bash
# Review the diff in test_snapshots/
# If changes are expected, update snapshots
cargo test
```

### Issue 7: Budget Exceeded Errors

**Problem**: Contract exceeds CPU or memory budget

**Solution**: 
1. Optimize contract code
2. Increase budget for tests:
```rust
env.budget().reset_unlimited();
```

### Issue 8: Type Conversion Errors

**Problem**: Type mismatches with Soroban types

**Solution**: Use proper conversions:
```rust
// String
let name = String::from_str(&env, "Token Name");

// Numbers - use correct types
let fee: i128 = 70_000_000;
let decimals: u32 = 7;

// Optional values
let metadata: Option<String> = Some(String::from_str(&env, "ipfs://..."));
```

---

## Best Practices

1. **Test Organization**
   - Group related tests together
   - Use descriptive test names: `test_<function>_<scenario>`
   - Keep tests focused on single behavior

2. **Test Coverage**
   - Test happy paths
   - Test error conditions
   - Test edge cases (zero values, max values)
   - Test authorization requirements

3. **Test Maintenance**
   - Remove `#[ignore]` when features are implemented
   - Update tests when contract logic changes
   - Keep test data realistic (use actual XLM amounts)

4. **Performance**
   - Use `--release` for large test suites
   - Profile expensive operations
   - Monitor budget usage

5. **Documentation**
   - Comment complex test setups
   - Explain expected behavior
   - Document TODO items for ignored tests

---

## Additional Resources

- [Soroban Testing Documentation](https://soroban.stellar.org/docs/getting-started/testing)
- [Soroban SDK Testutils](https://docs.rs/soroban-sdk/latest/soroban_sdk/testutils/)
- [Proptest Book](https://proptest-rs.github.io/proptest/)
- [Rust Testing Guide](https://doc.rust-lang.org/book/ch11-00-testing.html)

---

## Quick Reference

### Test Commands
```bash
cargo test                    # Run all tests
cargo test --release          # Run in release mode
cargo test -- --nocapture     # Show output
cargo test -- --ignored       # Run ignored tests
cargo test test_name          # Run specific test
```

### Common Imports
```rust
use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, String};
```

### Test Template
```rust
#[test]
fn test_name() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);
    
    // Test logic
}
```
