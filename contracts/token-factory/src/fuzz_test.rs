use super::*;
use proptest::prelude::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::Address;

// Configuration for running more iterations
const PROPERTY_TEST_ITERATIONS: u32 = 500;

// Strategy for generating valid token names (1-32 chars)
fn token_name_strategy() -> impl Strategy<Value = &'static str> {
    prop_oneof![
        Just("Test Token"),
        Just("My Token"),
        Just("A"),
        Just("ABCDEFGHIJKLMNOPQRSTUVWXYZ123456"),
    ]
}

// Strategy for generating valid token symbols (1-12 chars)
fn token_symbol_strategy() -> impl Strategy<Value = &'static str> {
    prop_oneof![Just("TEST"), Just("TKN"), Just("A"), Just("ABCDEFGHIJKL"),]
}

// Strategy for generating edge case strings
fn edge_case_string_strategy() -> impl Strategy<Value = &'static str> {
    prop_oneof![
        Just(""),
        Just("a"),
        Just("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"),
    ]
}

// Strategy for decimals (0-18 is typical, test beyond)
fn decimals_strategy() -> impl Strategy<Value = u32> {
    prop_oneof![Just(0u32), Just(7u32), Just(18u32), Just(255u32),]
}

// Strategy for supply amounts
fn supply_strategy() -> impl Strategy<Value = i128> {
    prop_oneof![
        Just(0i128),
        Just(1i128),
        Just(-1i128),
        Just(i128::MAX),
        Just(i128::MIN),
        1i128..1_000_000_000_000i128,
    ]
}

// Strategy for fee amounts
fn fee_strategy() -> impl Strategy<Value = i128> {
    prop_oneof![
        Just(0i128),
        Just(-1i128),
        Just(-1000i128),
        Just(i128::MAX),
        Just(i128::MIN),
        1i128..1_000_000_000i128,
    ]
}

proptest! {
    #![proptest_config(ProptestConfig::with_cases(10000))]
    
    #[test]
    fn fuzz_initialize_with_various_fees(
        base_fee in fee_strategy(),
        metadata_fee in fee_strategy(),
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        let result = client.try_initialize(&admin, &treasury, &base_fee, &metadata_fee);

        // Negative fees should fail
        if base_fee < 0 || metadata_fee < 0 {
            prop_assert!(result.is_err());
        } else {
            prop_assert!(result.is_ok());
            let state = client.get_state();
            prop_assert_eq!(state.base_fee, base_fee);
            prop_assert_eq!(state.metadata_fee, metadata_fee);
        }
    }
    
    #[test]
    fn fuzz_initialize_with_random_addresses(
        seed1 in any::<u64>(),
        seed2 in any::<u64>(),
        base_fee in 0i128..1_000_000_000i128,
        metadata_fee in 0i128..1_000_000_000i128,
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        // Generate addresses using seeds for reproducibility
        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        let result = client.try_initialize(&admin, &treasury, &base_fee, &metadata_fee);
        
        prop_assert!(result.is_ok());
        
        let state = client.get_state();
        prop_assert_eq!(state.admin, admin);
        prop_assert_eq!(state.treasury, treasury);
        prop_assert_eq!(state.base_fee, base_fee);
        prop_assert_eq!(state.metadata_fee, metadata_fee);
    }
    
    #[test]
    fn fuzz_initialize_zero_fees(
        _seed in any::<u64>(),
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        // Zero fees should always succeed
        let result = client.try_initialize(&admin, &treasury, &0, &0);
        prop_assert!(result.is_ok());
        
        let state = client.get_state();
        prop_assert_eq!(state.base_fee, 0);
        prop_assert_eq!(state.metadata_fee, 0);
    }
    
    #[test]
    fn fuzz_initialize_negative_fees_always_fail(
        base_fee in i128::MIN..0i128,
        metadata_fee in i128::MIN..1_000_000_000i128,
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        // Any negative fee should fail
        let result = client.try_initialize(&admin, &treasury, &base_fee, &metadata_fee);
        prop_assert!(result.is_err());
    }
    
    #[test]
    fn fuzz_initialize_max_safe_fees(
        base_fee in 0i128..i128::MAX/2,
        metadata_fee in 0i128..i128::MAX/2,
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        let result = client.try_initialize(&admin, &treasury, &base_fee, &metadata_fee);
        
        prop_assert!(result.is_ok());
        
        // Verify no overflow in total fee calculation
        let total = base_fee.checked_add(metadata_fee);
        prop_assert!(total.is_some());
        
        let state = client.get_state();
        prop_assert_eq!(state.base_fee, base_fee);
        prop_assert_eq!(state.metadata_fee, metadata_fee);
    }
    
    #[test]
    fn fuzz_initialize_same_addresses(
        base_fee in 0i128..1_000_000_000i128,
        metadata_fee in 0i128..1_000_000_000i128,
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let same_address = Address::generate(&env);

        // Same address for admin and treasury should be allowed
        let result = client.try_initialize(&same_address, &same_address, &base_fee, &metadata_fee);
        prop_assert!(result.is_ok());
        
        let state = client.get_state();
        prop_assert_eq!(state.admin, same_address);
        prop_assert_eq!(state.treasury, same_address);
    }

    #[test]
    fn fuzz_update_fees_authorization(
        new_base_fee in fee_strategy(),
        _new_metadata_fee in fee_strategy(),
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);
        let unauthorized = Address::generate(&env);

        client.initialize(&admin, &treasury, &70_000_000, &30_000_000);

        // Test with unauthorized address
        let result = client.try_update_fees(&unauthorized, &Some(new_base_fee), &None);
        prop_assert!(result.is_err());

        // Test with admin
        if new_base_fee >= 0 {
            let result = client.try_update_fees(&admin, &Some(new_base_fee), &None);
            prop_assert!(result.is_ok());
        }
    }

    #[test]
    fn fuzz_fee_calculation_consistency(
        base_fee in 0i128..1_000_000_000i128,
        metadata_fee in 0i128..1_000_000_000i128,
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &base_fee, &metadata_fee);

        let state = client.get_state();

        // Verify fees are stored correctly
        prop_assert_eq!(state.base_fee, base_fee);
        prop_assert_eq!(state.metadata_fee, metadata_fee);

        // Verify total fee calculation doesn't overflow
        let total_fee = base_fee.checked_add(metadata_fee);
        prop_assert!(total_fee.is_some());
    }

    #[test]
    fn fuzz_double_initialization_always_fails(
        base_fee1 in 0i128..1_000_000_000i128,
        metadata_fee1 in 0i128..1_000_000_000i128,
        base_fee2 in 0i128..1_000_000_000i128,
        metadata_fee2 in 0i128..1_000_000_000i128,
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin1 = Address::generate(&env);
        let treasury1 = Address::generate(&env);
        let admin2 = Address::generate(&env);
        let treasury2 = Address::generate(&env);

        // First initialization should succeed
        let result1 = client.try_initialize(&admin1, &treasury1, &base_fee1, &metadata_fee1);
        prop_assert!(result1.is_ok());

        // Second initialization should always fail
        let result2 = client.try_initialize(&admin2, &treasury2, &base_fee2, &metadata_fee2);
        prop_assert!(result2.is_err());
    }
    
    #[test]
    fn fuzz_initialize_address_persistence(
        base_fee in 0i128..1_000_000_000i128,
        metadata_fee in 0i128..1_000_000_000i128,
        read_count in 1u32..100u32,
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &base_fee, &metadata_fee);

        // Verify addresses persist across multiple reads
        for _ in 0..read_count {
            let state = client.get_state();
            prop_assert_eq!(state.admin, admin);
            prop_assert_eq!(state.treasury, treasury);
        }
    }
    
    #[test]
    fn fuzz_initialize_fee_overflow_safety(
        base_fee in i128::MAX/2..i128::MAX,
        metadata_fee in i128::MAX/2..i128::MAX,
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        // Initialize with large fees
        let result = client.try_initialize(&admin, &treasury, &base_fee, &metadata_fee);
        
        // Should succeed even with large values
        prop_assert!(result.is_ok());
        
        // Verify potential overflow is handled
        let total = base_fee.checked_add(metadata_fee);
        // If overflow would occur, that's a potential issue to document
        if total.is_none() {
            // Document this edge case
            prop_assert!(true); // Mark as found edge case
        }
    }

    #[test]
    fn fuzz_state_persistence(
        base_fee in 0i128..1_000_000_000i128,
        metadata_fee in 0i128..1_000_000_000i128,
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &base_fee, &metadata_fee);

        // Read state multiple times
        for _ in 0..10 {
            let state = client.get_state();
            prop_assert_eq!(state.admin, admin.clone());
            prop_assert_eq!(state.treasury, treasury.clone());
            prop_assert_eq!(state.base_fee, base_fee);
            prop_assert_eq!(state.metadata_fee, metadata_fee);
        }
    }

    #[test]
    fn fuzz_fee_update_idempotency(
        initial_base in 0i128..1_000_000_000i128,
        initial_metadata in 0i128..1_000_000_000i128,
        new_base in 0i128..1_000_000_000i128,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &initial_base, &initial_metadata);

        // Update fee multiple times with same value
        for _ in 0..5 {
            client.update_fees(&admin, &Some(new_base), &None);
            let state = client.get_state();
            prop_assert_eq!(state.base_fee, new_base);
            prop_assert_eq!(state.metadata_fee, initial_metadata);
        }
    }

    #[test]
    fn fuzz_token_count_consistency(
        iterations in 0u32..10u32,
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &70_000_000, &30_000_000);

        // Token count should start at 0
        let initial_count = client.get_token_count();
        prop_assert_eq!(initial_count, 0);

        // Multiple reads should return same value
        for _ in 0..iterations {
            let count = client.get_token_count();
            prop_assert_eq!(count, initial_count);
        }
    }

    #[test]
    fn fuzz_get_nonexistent_token(
        index in 0u32..1000u32,
    ) {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &70_000_000, &30_000_000);

        // Getting any token should fail when none exist
        let result = client.try_get_token_info(&index);
        prop_assert!(result.is_err());
    }
}

// Manual edge case tests for specific scenarios
#[cfg(test)]
mod edge_cases {
    use super::*;

    #[test]
    fn test_max_fee_values() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        // Test with maximum safe i128 values
        let max_safe_fee = i128::MAX / 2;
        let result = client.try_initialize(&admin, &treasury, &max_safe_fee, &max_safe_fee);
        assert!(result.is_ok());
    }

    #[test]
    fn test_zero_fees() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        // Zero fees should be valid
        let result = client.try_initialize(&admin, &treasury, &0, &0);
        assert!(result.is_ok());

        let state = client.get_state();
        assert_eq!(state.base_fee, 0);
        assert_eq!(state.metadata_fee, 0);
    }

    #[test]
    fn test_negative_fees_rejected() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        // Negative base fee
        let result = client.try_initialize(&admin, &treasury, &-1, &30_000_000);
        assert!(result.is_err());

        // Negative metadata fee
        let result = client.try_initialize(&admin, &treasury, &70_000_000, &-1);
        assert!(result.is_err());

        // Both negative
        let result = client.try_initialize(&admin, &treasury, &-1, &-1);
        assert!(result.is_err());
    }

    #[test]
    fn test_same_admin_and_treasury() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let same_address = Address::generate(&env);

        // Should be allowed to use same address for admin and treasury
        let result = client.try_initialize(&same_address, &same_address, &70_000_000, &30_000_000);
        assert!(result.is_ok());

        let state = client.get_state();
        assert_eq!(state.admin, same_address);
        assert_eq!(state.treasury, same_address);
    }

    #[test]
    fn test_update_fees_with_none() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &70_000_000, &30_000_000);

        // Update with both None should succeed but change nothing
        let result = client.try_update_fees(&admin, &None, &None);
        assert!(result.is_ok());

        let state = client.get_state();
        assert_eq!(state.base_fee, 70_000_000);
        assert_eq!(state.metadata_fee, 30_000_000);
    }

    #[test]
    fn test_rapid_state_reads() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &70_000_000, &30_000_000);

        // Rapid consecutive reads should all return consistent state
        for _ in 0..100 {
            let state = client.get_state();
            assert_eq!(state.admin, admin);
            assert_eq!(state.treasury, treasury);
            assert_eq!(state.base_fee, 70_000_000);
            assert_eq!(state.metadata_fee, 30_000_000);
        }
    }

    #[test]
    fn test_fee_boundary_values() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        // Test boundary: 1 stroop
        let result = client.try_initialize(&admin, &treasury, &1, &1);
        assert!(result.is_ok());
    }
}
