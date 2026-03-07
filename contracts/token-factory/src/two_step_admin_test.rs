//! Two-Step Admin Transfer Tests
//!
//! Tests for hardened governance operations using propose_admin/accept_admin

#[cfg(test)]
mod two_step_admin_tests {
    use soroban_sdk::{testutils::Address as _, Address, Env};

    use crate::{TokenFactory, TokenFactoryClient};

    fn setup() -> (Env, TokenFactoryClient, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, TokenFactory);
        let client = TokenFactoryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let treasury = Address::generate(&env);

        client
            .initialize(&admin, &treasury, &100_000_000, &50_000_000)
            .unwrap();

        (env, client, admin, treasury)
    }

    // ═══════════════════════════════════════════════════════
    //  Happy Path Tests
    // ═══════════════════════════════════════════════════════

    #[test]
    fn test_two_step_transfer_happy_path() {
        let (_env, client, admin, _treasury) = setup();
        let new_admin = Address::generate(&_env);

        // Step 1: Current admin proposes new admin
        client.propose_admin(&admin, &new_admin).unwrap();

        // Step 2: New admin accepts
        client.accept_admin(&new_admin).unwrap();

        // Verify admin changed
        let state = client.get_state();
        assert_eq!(state.admin, new_admin);
    }

    #[test]
    fn test_propose_admin_sets_pending() {
        let (_env, client, admin, _treasury) = setup();
        let new_admin = Address::generate(&_env);

        client.propose_admin(&admin, &new_admin).unwrap();

        // Admin should still be the old one until accepted
        let state = client.get_state();
        assert_eq!(state.admin, admin);
    }

    #[test]
    fn test_accept_admin_clears_pending() {
        let (_env, client, admin, _treasury) = setup();
        let new_admin = Address::generate(&_env);

        client.propose_admin(&admin, &new_admin).unwrap();
        client.accept_admin(&new_admin).unwrap();

        // Attempting to accept again should fail (no pending admin)
        let result = client.try_accept_admin(&new_admin);
        assert!(result.is_err());
    }

    // ═══════════════════════════════════════════════════════
    //  Authorization Tests
    // ═══════════════════════════════════════════════════════

    #[test]
    fn test_propose_admin_unauthorized() {
        let (_env, client, admin, _treasury) = setup();
        let unauthorized = Address::generate(&_env);
        let new_admin = Address::generate(&_env);

        let result = client.try_propose_admin(&unauthorized, &new_admin);
        assert!(result.is_err());

        // Admin should be unchanged
        let state = client.get_state();
        assert_eq!(state.admin, admin);
    }

    #[test]
    fn test_accept_admin_unauthorized() {
        let (_env, client, admin, _treasury) = setup();
        let new_admin = Address::generate(&_env);
        let unauthorized = Address::generate(&_env);

        // Propose transfer
        client.propose_admin(&admin, &new_admin).unwrap();

        // Wrong address tries to accept
        let result = client.try_accept_admin(&unauthorized);
        assert!(result.is_err());

        // Admin should be unchanged
        let state = client.get_state();
        assert_eq!(state.admin, admin);
    }

    #[test]
    fn test_accept_admin_no_pending() {
        let (_env, client, _admin, _treasury) = setup();
        let random_address = Address::generate(&_env);

        // Try to accept without any proposal
        let result = client.try_accept_admin(&random_address);
        assert!(result.is_err());
    }

    // ═══════════════════════════════════════════════════════
    //  Stale Proposal Tests
    // ═══════════════════════════════════════════════════════

    #[test]
    fn test_propose_overwrites_stale_proposal() {
        let (_env, client, admin, _treasury) = setup();
        let first_proposed = Address::generate(&_env);
        let second_proposed = Address::generate(&_env);

        // First proposal
        client.propose_admin(&admin, &first_proposed).unwrap();

        // Second proposal overwrites first
        client.propose_admin(&admin, &second_proposed).unwrap();

        // First proposed admin cannot accept
        let result = client.try_accept_admin(&first_proposed);
        assert!(result.is_err());

        // Second proposed admin can accept
        client.accept_admin(&second_proposed).unwrap();

        let state = client.get_state();
        assert_eq!(state.admin, second_proposed);
    }

    #[test]
    fn test_old_admin_cannot_propose_after_transfer() {
        let (_env, client, admin, _treasury) = setup();
        let new_admin = Address::generate(&_env);
        let third_admin = Address::generate(&_env);

        // Complete transfer
        client.propose_admin(&admin, &new_admin).unwrap();
        client.accept_admin(&new_admin).unwrap();

        // Old admin tries to propose another transfer
        let result = client.try_propose_admin(&admin, &third_admin);
        assert!(result.is_err());
    }

    // ═══════════════════════════════════════════════════════
    //  Edge Cases
    // ═══════════════════════════════════════════════════════

    #[test]
    fn test_propose_admin_to_self_fails() {
        let (_env, client, admin, _treasury) = setup();

        let result = client.try_propose_admin(&admin, &admin);
        assert!(result.is_err());
    }

    #[test]
    fn test_multiple_proposals_before_acceptance() {
        let (_env, client, admin, _treasury) = setup();
        let proposed1 = Address::generate(&_env);
        let proposed2 = Address::generate(&_env);
        let proposed3 = Address::generate(&_env);

        // Multiple proposals
        client.propose_admin(&admin, &proposed1).unwrap();
        client.propose_admin(&admin, &proposed2).unwrap();
        client.propose_admin(&admin, &proposed3).unwrap();

        // Only the last one can accept
        let result1 = client.try_accept_admin(&proposed1);
        assert!(result1.is_err());

        let result2 = client.try_accept_admin(&proposed2);
        assert!(result2.is_err());

        client.accept_admin(&proposed3).unwrap();

        let state = client.get_state();
        assert_eq!(state.admin, proposed3);
    }

    #[test]
    fn test_new_admin_can_immediately_propose_transfer() {
        let (_env, client, admin, _treasury) = setup();
        let new_admin = Address::generate(&_env);
        let third_admin = Address::generate(&_env);

        // First transfer
        client.propose_admin(&admin, &new_admin).unwrap();
        client.accept_admin(&new_admin).unwrap();

        // New admin immediately proposes another transfer
        client.propose_admin(&new_admin, &third_admin).unwrap();
        client.accept_admin(&third_admin).unwrap();

        let state = client.get_state();
        assert_eq!(state.admin, third_admin);
    }

    // ═══════════════════════════════════════════════════════
    //  Backward Compatibility Tests
    // ═══════════════════════════════════════════════════════

    #[test]
    #[allow(deprecated)]
    fn test_old_transfer_admin_still_works() {
        let (_env, client, admin, _treasury) = setup();
        let new_admin = Address::generate(&_env);

        // Old single-step transfer should still work
        client.transfer_admin(&admin, &new_admin).unwrap();

        let state = client.get_state();
        assert_eq!(state.admin, new_admin);
    }

    #[test]
    #[allow(deprecated)]
    fn test_old_transfer_does_not_set_pending() {
        let (_env, client, admin, _treasury) = setup();
        let new_admin = Address::generate(&_env);
        let third_admin = Address::generate(&_env);

        // Use old transfer method
        client.transfer_admin(&admin, &new_admin).unwrap();

        // Try to accept as if there was a pending admin
        let result = client.try_accept_admin(&third_admin);
        assert!(result.is_err());
    }

    // ═══════════════════════════════════════════════════════
    //  Event Emission Tests
    // ═══════════════════════════════════════════════════════

    #[test]
    fn test_propose_admin_emits_event() {
        let (env, client, admin, _treasury) = setup();
        let new_admin = Address::generate(&env);

        client.propose_admin(&admin, &new_admin).unwrap();

        let events = env.events().all();
        assert!(!events.is_empty());
    }

    #[test]
    fn test_accept_admin_emits_transfer_event() {
        let (env, client, admin, _treasury) = setup();
        let new_admin = Address::generate(&env);

        client.propose_admin(&admin, &new_admin).unwrap();
        client.accept_admin(&new_admin).unwrap();

        let events = env.events().all();
        assert!(!events.is_empty());
    }
}
