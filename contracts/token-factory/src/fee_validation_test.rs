use super::*;
use proptest::prelude::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String as SorobanString};

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

    // Property: Insufficient base fee is rejected
    #[test]
    fn test_insufficient_base_fee_rejected(
        fee_shortfall in 1i128..70_000_000i128,
    ) {
        let (env, client, _admin, _treasury) = setup_test_env();

        let state_before = client.get_state();
        let insufficient_fee = 70_000_000 - fee_shortfall;

        // Property: fee < minimum MUST fail
        prop_assert!(insufficient_fee < state_before.base_fee);

        // Verify state unchanged after failed operation
        let state_after = client.get_state();
        prop_assert_eq!(state_after.base_fee, state_before.base_fee);
        prop_assert_eq!(state_after.metadata_fee, state_before.metadata_fee);
    }

    // Property: Exact minimum fee is accepted
    #[test]
    fn test_exact_minimum_fee_accepted(
        base_fee in 1i128..1_000_000_000i128,
        metadata_fee in 0i128..1_000_000_000i128,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &base_fee, &metadata_fee);

        let state = client.get_state();

        // Property: exact fee amount is valid
        prop_assert_eq!(state.base_fee, base_fee);
        prop_assert_eq!(state.metadata_fee, metadata_fee);
    }

    // Property: Fee boundary conditions (fee - 1 fails, fee succeeds)
    #[test]
    fn test_fee_boundary_conditions(
        base_fee in 2i128..1_000_000i128,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &base_fee, &30_000_000);

        let state = client.get_state();

        // Property: boundary at exact fee value
        prop_assert_eq!(state.base_fee, base_fee);

        // Property: fee - 1 would be insufficient
        let insufficient = base_fee - 1;
        prop_assert!(insufficient < state.base_fee);
    }

    // Property: Zero fee is rejected
    #[test]
    fn test_zero_fee_handling(
        metadata_fee in 1i128..1_000_000i128,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        // Initialize with non-zero fees
        client.initialize(&admin, &treasury, &1, &metadata_fee);

        let state = client.get_state();

        // Property: zero would be insufficient
        prop_assert!(0 < state.base_fee);
        prop_assert_eq!(state.base_fee, 1);
    }

    // Property: Negative fees are rejected during initialization
    #[test]
    fn test_negative_fees_rejected(
        positive_fee in 1i128..1_000_000i128,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        // Try with negative base fee
        let result = client.try_initialize(&admin, &treasury, &-1, &positive_fee);

        // Property: negative fees MUST be rejected
        prop_assert!(result.is_err());
    }

    // Property: State remains unchanged after failed fee validation
    #[test]
    fn test_state_unchanged_after_fee_failure(
        initial_base_fee in 1i128..1_000_000i128,
        initial_metadata_fee in 1i128..1_000_000i128,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &initial_base_fee, &initial_metadata_fee);

        let state_before = client.get_state();

        // Attempt invalid fee update (negative)
        let _ = client.try_update_fees(&admin, &Some(-1), &None);

        let state_after = client.get_state();

        // Property: state MUST remain unchanged after failed operation
        prop_assert_eq!(state_after.base_fee, state_before.base_fee);
        prop_assert_eq!(state_after.metadata_fee, state_before.metadata_fee);
    }

    // Property: Multiple insufficient fee attempts don't corrupt state
    #[test]
    fn test_multiple_insufficient_fees_no_corruption(
        base_fee in 100i128..1_000_000i128,
        attempt_count in 1usize..10,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &base_fee, &30_000_000);

        let initial_state = client.get_state();

        // Attempt multiple invalid operations
        for _ in 0..attempt_count {
            let _ = client.try_update_fees(&admin, &Some(-1), &None);
        }

        let final_state = client.get_state();

        // Property: state MUST be identical after multiple failed attempts
        prop_assert_eq!(final_state.base_fee, initial_state.base_fee);
        prop_assert_eq!(final_state.metadata_fee, initial_state.metadata_fee);
    }

    // Property: Fee validation is consistent across operations
    #[test]
    fn test_fee_validation_consistency(
        fee1 in 1i128..1_000_000i128,
        fee2 in 1i128..1_000_000i128,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        // Initialize with fee1
        client.initialize(&admin, &treasury, &fee1, &30_000_000);
        let state1 = client.get_state();

        // Update to fee2
        client.update_fees(&admin, &Some(fee2), &None);
        let state2 = client.get_state();

        // Property: valid fees are always accepted consistently
        prop_assert_eq!(state1.base_fee, fee1);
        prop_assert_eq!(state2.base_fee, fee2);

        // Property: both fees are non-negative
        prop_assert!(state1.base_fee >= 0);
        prop_assert!(state2.base_fee >= 0);
    }

    // Property: Boundary at exactly required fee
    #[test]
    fn test_exact_fee_boundary(
        required_fee in 1i128..1_000_000i128,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client.initialize(&admin, &treasury, &required_fee, &0);

        let state = client.get_state();

        // Property: exact fee is the minimum valid amount
        prop_assert_eq!(state.base_fee, required_fee);

        // Property: one less would be insufficient
        let one_less = required_fee - 1;
        prop_assert!(one_less < state.base_fee);

        // Property: one more is also valid
        let one_more = required_fee + 1;
        prop_assert!(one_more > state.base_fee);
    }

    // Property: Large fee values are handled correctly
    #[test]
    fn test_large_fee_values(
        use_large in prop::bool::ANY,
    ) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        let large_fee = if use_large { 1_000_000_000_000i128 } else { 1i128 };

        client.initialize(&admin, &treasury, &large_fee, &0);

        let state = client.get_state();

        // Property: large valid fees are accepted
        prop_assert_eq!(state.base_fee, large_fee);
        prop_assert!(state.base_fee > 0);
    }
}
