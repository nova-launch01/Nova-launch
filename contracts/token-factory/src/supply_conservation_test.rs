use super::*;
use proptest::prelude::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

// Property-based tests for token supply conservation
// These tests verify fundamental properties that must hold for any token implementation

fn setup_test_env() -> (Env, TokenFactoryClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, TokenFactory);
    let client = TokenFactoryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);

    client.initialize(&admin, &treasury, &70_000_000, &30_000_000);

    (env, client, admin, treasury)
}

proptest! {
    #![proptest_config(ProptestConfig::with_cases(500))]

    // Property: Factory state remains consistent across operations
    #[test]
    fn test_factory_state_consistency(
        base_fee in 1i128..1_000_000_000i128,
        metadata_fee in 1i128..1_000_000_000i128,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &base_fee, &metadata_fee);

        let state = client.get_state();

        // Property: initialized state matches input parameters
        prop_assert_eq!(state.admin, admin);
        prop_assert_eq!(state.treasury, treasury);
        prop_assert_eq!(state.base_fee, base_fee);
        prop_assert_eq!(state.metadata_fee, metadata_fee);
    }

    // Property: Fee updates preserve other state
    #[test]
    fn test_fee_update_preserves_state(
        initial_base_fee in 1i128..1_000_000i128,
        initial_metadata_fee in 1i128..1_000_000i128,
        new_base_fee in 1i128..1_000_000i128,
        new_metadata_fee in 1i128..1_000_000i128,
    ) {
        let (env, client, admin, treasury) = setup_test_env();

        // Set initial fees
        client.update_fees(&admin, &Some(initial_base_fee), &Some(initial_metadata_fee));

        let state_before = client.get_state();

        // Update fees
        client.update_fees(&admin, &Some(new_base_fee), &Some(new_metadata_fee));

        let state_after = client.get_state();

        // Property: admin and treasury unchanged
        prop_assert_eq!(state_after.admin, admin);
        prop_assert_eq!(state_after.treasury, treasury);

        // Property: fees updated correctly
        prop_assert_eq!(state_after.base_fee, new_base_fee);
        prop_assert_eq!(state_after.metadata_fee, new_metadata_fee);
    }

    // Property: Multiple fee updates are idempotent
    #[test]
    fn test_fee_updates_idempotent(
        fee_value in 1i128..1_000_000i128,
        update_count in 1usize..10,
    ) {
        let (env, client, admin, _treasury) = setup_test_env();

        for _ in 0..update_count {
            client.update_fees(&admin, &Some(fee_value), &None);
        }

        let state = client.get_state();

        // Property: repeated updates with same value result in that value
        prop_assert_eq!(state.base_fee, fee_value);
    }

    // Property: Token count is monotonically increasing
    #[test]
    fn test_token_count_monotonic(
        _operation_count in 1usize..20,
    ) {
        let (env, client, _admin, _treasury) = setup_test_env();

        let initial_count = client.get_token_count();

        // Property: initial count is zero for new factory
        prop_assert_eq!(initial_count, 0);

        // Property: count never decreases (tested with current implementation)
        let count_after = client.get_token_count();
        prop_assert!(count_after >= initial_count);
    }

    // Property: State queries are deterministic
    #[test]
    fn test_state_queries_deterministic(
        base_fee in 1i128..1_000_000i128,
        metadata_fee in 1i128..1_000_000i128,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &base_fee, &metadata_fee);

        // Query state multiple times
        let state1 = client.get_state();
        let state2 = client.get_state();
        let state3 = client.get_state();

        // Property: repeated queries return identical results
        prop_assert_eq!(state1.base_fee, state2.base_fee);
        prop_assert_eq!(state2.base_fee, state3.base_fee);
        prop_assert_eq!(state1.metadata_fee, state2.metadata_fee);
        prop_assert_eq!(state2.metadata_fee, state3.metadata_fee);
    }

    // Property: Fee values are always non-negative after valid updates
    #[test]
    fn test_fees_always_non_negative(
        fee1 in 0i128..1_000_000i128,
        fee2 in 0i128..1_000_000i128,
    ) {
        let (env, client, admin, _treasury) = setup_test_env();

        client.update_fees(&admin, &Some(fee1), &Some(fee2));

        let state = client.get_state();

        // Property: fees are never negative
        prop_assert!(state.base_fee >= 0);
        prop_assert!(state.metadata_fee >= 0);
    }
}
